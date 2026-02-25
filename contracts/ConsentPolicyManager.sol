// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Types.sol";
import "./SubjectAttributeRegistry.sol";
import "./DataResourceRegistry.sol";

/// @title ConsentPolicyManager
/// @notice Core ABAC consent engine — data subjects create, revoke, and
///         manage fine-grained consent rules. The checkAccess function
///         evaluates whether a requester can perform an action on a
///         resource for a stated purpose.
/// @dev Key difference from ClaimGuard's AccessPolicyManager:
///      - Consent rules are per-data-subject (each patient owns their rules)
///      - Purpose is a first-class field in the evaluation
///      - Data subjects create/revoke their OWN rules (not admin-only)
///      - Deny rules take precedence over allow rules (deny-overrides)

contract ConsentPolicyManager {
    address public admin;

    SubjectAttributeRegistry public subjectRegistry;
    DataResourceRegistry public dataRegistry;

    uint256 public nextRuleId = 1;

    /// @dev ruleId => ConsentRule
    mapping(uint256 => ConsentRule) private _rules;

    /// @dev data subject address => array of rule IDs they created
    mapping(address => uint256[]) private _rulesBySubject;

    // ── Events ──────────────────────────────────────────────

    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);

    event ConsentRuleCreated(
        uint256 indexed ruleId,
        address indexed consentGiver,
        Role allowedRole,
        Purpose allowedPurpose,
        Action allowedAction,
        DataCategory allowedCategory,
        bool isAllow
    );

    event ConsentRuleRevoked(
        uint256 indexed ruleId,
        address indexed revokedBy
    );

    event AccessEvaluated(
        address indexed requester,
        uint256 indexed resourceId,
        Purpose purpose,
        Action action,
        bool allowed
    );

    // ── Modifiers ───────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "ConsentMgr: only admin");
        _;
    }

    // ── Constructor ─────────────────────────────────────────

    constructor(address subjectRegistry_, address dataRegistry_) {
        require(subjectRegistry_ != address(0), "ConsentMgr: subj reg zero");
        require(dataRegistry_ != address(0), "ConsentMgr: data reg zero");
        admin = msg.sender;
        emit AdminChanged(address(0), msg.sender);
        subjectRegistry = SubjectAttributeRegistry(subjectRegistry_);
        dataRegistry = DataResourceRegistry(dataRegistry_);
    }

    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "ConsentMgr: zero addr");
        emit AdminChanged(admin, newAdmin);
        admin = newAdmin;
    }

    // ── Consent Rule Management ─────────────────────────────

    /// @notice Create a consent rule. Caller must be the data subject (consent giver).
    /// @dev The consent giver's address is recorded as consentGiver.
    ///      Zero values in filter fields act as wildcards.
    function createConsentRule(
        Role allowedRole,
        uint256 allowedOrgId,
        uint256 allowedJurisdictionId,
        DataCategory allowedCategory,
        uint8 maxSensitivityLevel,
        Purpose allowedPurpose,
        Action allowedAction,
        uint64 notBefore,
        uint64 notAfter,
        bool isAllow
    ) external returns (uint256 ruleId) {
        // Verify caller is a registered, active data subject
        SubjectAttrs memory callerAttrs = subjectRegistry.getSubjectAttrs(msg.sender);
        require(callerAttrs.isActive, "ConsentMgr: caller not active");
        require(
            callerAttrs.role == Role.DATA_SUBJECT,
            "ConsentMgr: caller not data subject"
        );

        // Validate temporal constraints
        if (notAfter != 0) {
            require(notAfter > notBefore, "ConsentMgr: invalid time window");
        }

        require(maxSensitivityLevel <= 4, "ConsentMgr: sensitivity 0-4");

        ruleId = nextRuleId++;

        _rules[ruleId] = ConsentRule({
            id: ruleId,
            allowedRole: allowedRole,
            allowedOrgId: allowedOrgId,
            allowedJurisdictionId: allowedJurisdictionId,
            allowedCategory: allowedCategory,
            maxSensitivityLevel: maxSensitivityLevel,
            allowedPurpose: allowedPurpose,
            allowedAction: allowedAction,
            notBefore: notBefore,
            notAfter: notAfter,
            isAllow: isAllow,
            isActive: true,
            consentGiver: msg.sender
        });

        _rulesBySubject[msg.sender].push(ruleId);

        emit ConsentRuleCreated(
            ruleId,
            msg.sender,
            allowedRole,
            allowedPurpose,
            allowedAction,
            allowedCategory,
            isAllow
        );
    }

    /// @notice Revoke a consent rule. Only the original consent giver or admin can revoke.
    function revokeConsentRule(uint256 ruleId) external {
        ConsentRule storage rule = _rules[ruleId];
        require(rule.id != 0, "ConsentMgr: rule not found");
        require(rule.isActive, "ConsentMgr: already revoked");
        require(
            msg.sender == rule.consentGiver || msg.sender == admin,
            "ConsentMgr: not authorized"
        );

        rule.isActive = false;
        emit ConsentRuleRevoked(ruleId, msg.sender);
    }

    // ── Access Evaluation ───────────────────────────────────

    /// @notice Core ABAC evaluation: can `requester` perform `action` on
    ///         `resourceId` for the stated `purpose`?
    /// @dev Evaluation logic:
    ///      1. Look up the resource owner (data subject)
    ///      2. Scan ALL consent rules created by that data subject
    ///      3. Deny rules take precedence (deny-overrides strategy)
    ///      4. If any active deny rule matches → denied
    ///      5. If any active allow rule matches → allowed
    ///      6. Default → denied (closed-world assumption)
    function checkAccess(
        address requester,
        uint256 resourceId,
        Purpose purpose,
        Action action
    ) public view returns (bool) {
        // 1. Load resource and requester attributes
        DataResource memory resource = dataRegistry.getResource(resourceId);
        if (!resource.exists) return false;

        SubjectAttrs memory reqAttrs = subjectRegistry.getSubjectAttrs(requester);
        if (!reqAttrs.isActive || reqAttrs.role == Role.NONE) return false;

        // 2. Scan all rules from the resource owner (data subject)
        address owner = resource.owner;
        uint256[] storage ruleIds = _rulesBySubject[owner];

        bool hasMatchingAllow = false;

        for (uint256 i = 0; i < ruleIds.length; i++) {
            ConsentRule storage rule = _rules[ruleIds[i]];

            if (!rule.isActive) continue;

            // Check if rule matches the request
            if (!_ruleMatches(rule, reqAttrs, resource, purpose, action)) continue;

            // Deny-overrides: any matching deny rule immediately denies
            if (!rule.isAllow) return false;

            // Found a matching allow rule
            hasMatchingAllow = true;
        }

        // 3. If we found at least one allow and no deny → granted
        return hasMatchingAllow;
    }

    /// @notice Evaluate access and emit an event (for the audit trail via PEG).
    function checkAccessAndEmit(
        address requester,
        uint256 resourceId,
        Purpose purpose,
        Action action
    ) external returns (bool) {
        bool allowed = checkAccess(requester, resourceId, purpose, action);
        emit AccessEvaluated(requester, resourceId, purpose, action, allowed);
        return allowed;
    }

    // ── Internal Matching Logic ─────────────────────────────

    /// @dev Check whether a single consent rule matches the given request.
    function _ruleMatches(
        ConsentRule storage rule,
        SubjectAttrs memory reqAttrs,
        DataResource memory resource,
        Purpose purpose,
        Action action
    ) internal view returns (bool) {
        // Role filter (NONE = wildcard)
        if (rule.allowedRole != Role.NONE && rule.allowedRole != reqAttrs.role)
            return false;

        // Org filter (0 = wildcard)
        if (rule.allowedOrgId != 0 && rule.allowedOrgId != reqAttrs.orgId)
            return false;

        // Jurisdiction filter (0 = wildcard)
        if (
            rule.allowedJurisdictionId != 0 &&
            rule.allowedJurisdictionId != reqAttrs.jurisdictionId
        ) return false;

        // Data category filter (NONE = wildcard)
        if (
            rule.allowedCategory != DataCategory.NONE &&
            rule.allowedCategory != resource.category
        ) return false;

        // Sensitivity ceiling
        if (resource.sensitivityLevel > rule.maxSensitivityLevel) return false;

        // Purpose filter (NONE = wildcard)
        if (
            rule.allowedPurpose != Purpose.NONE &&
            rule.allowedPurpose != purpose
        ) return false;

        // Action filter (NONE = wildcard)
        if (rule.allowedAction != Action.NONE && rule.allowedAction != action)
            return false;

        // Temporal bounds
        uint64 nowTs = uint64(block.timestamp);
        if (rule.notBefore != 0 && nowTs < rule.notBefore) return false;
        if (rule.notAfter != 0 && nowTs > rule.notAfter) return false;

        return true;
    }

    // ── View Functions ──────────────────────────────────────

    /// @notice Get a consent rule by ID.
    function getRule(uint256 ruleId) external view returns (ConsentRule memory) {
        return _rules[ruleId];
    }

    /// @notice Get all rule IDs created by a data subject.
    function getRulesBySubject(
        address subject
    ) external view returns (uint256[] memory) {
        return _rulesBySubject[subject];
    }

    /// @notice Get the total number of rules created.
    function totalRules() external view returns (uint256) {
        return nextRuleId - 1;
    }
}
