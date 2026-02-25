// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Types.sol";

/// @title SubjectAttributeRegistry
/// @notice Manages processor/requester identity attributes for ConsentChain.
/// @dev Admin registers data processors with their role, org, and jurisdiction.
///      Data subjects self-register by calling registerSelf().

contract SubjectAttributeRegistry {
    address public admin;

    mapping(address => SubjectAttrs) private _subjects;

    // ── Events ──────────────────────────────────────────────

    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);

    event SubjectRegistered(
        address indexed subject,
        Role role,
        uint256 orgId,
        uint256 jurisdictionId,
        bool isActive
    );

    event SubjectDeactivated(address indexed subject, address indexed by);

    // ── Modifiers ───────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "SubjectReg: only admin");
        _;
    }

    // ── Constructor ─────────────────────────────────────────

    constructor() {
        admin = msg.sender;
        emit AdminChanged(address(0), msg.sender);
    }

    // ── Admin functions ─────────────────────────────────────

    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "SubjectReg: zero addr");
        emit AdminChanged(admin, newAdmin);
        admin = newAdmin;
    }

    /// @notice Register or update a processor's attributes (admin only).
    /// @dev Used to onboard hospitals, researchers, insurers, regulators, etc.
    function setSubjectAttributes(
        address subject,
        Role role,
        uint256 orgId,
        uint256 jurisdictionId,
        bool isActive
    ) external onlyAdmin {
        require(subject != address(0), "SubjectReg: zero addr");
        require(role != Role.NONE, "SubjectReg: role=NONE");

        _subjects[subject] = SubjectAttrs({
            role: role,
            orgId: orgId,
            jurisdictionId: jurisdictionId,
            isActive: isActive
        });

        emit SubjectRegistered(subject, role, orgId, jurisdictionId, isActive);
    }

    /// @notice Data subjects can self-register with the DATA_SUBJECT role.
    function registerSelf(uint256 jurisdictionId) external {
        require(
            _subjects[msg.sender].role == Role.NONE,
            "SubjectReg: already registered"
        );

        _subjects[msg.sender] = SubjectAttrs({
            role: Role.DATA_SUBJECT,
            orgId: 0,
            jurisdictionId: jurisdictionId,
            isActive: true
        });

        emit SubjectRegistered(
            msg.sender,
            Role.DATA_SUBJECT,
            0,
            jurisdictionId,
            true
        );
    }

    /// @notice Deactivate a subject (admin only).
    function deactivateSubject(address subject) external onlyAdmin {
        require(_subjects[subject].role != Role.NONE, "SubjectReg: not found");
        require(_subjects[subject].isActive, "SubjectReg: already inactive");
        _subjects[subject].isActive = false;
        emit SubjectDeactivated(subject, msg.sender);
    }

    // ── View functions ──────────────────────────────────────

    /// @notice Get full attribute struct for a subject.
    function getSubjectAttrs(
        address subject
    ) external view returns (SubjectAttrs memory) {
        return _subjects[subject];
    }

    /// @notice Check if a subject is active.
    function isSubjectActive(address subject) external view returns (bool) {
        return _subjects[subject].isActive;
    }
}
