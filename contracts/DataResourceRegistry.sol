// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Types.sol";

/// @title DataResourceRegistry
/// @notice Registers data resources owned by data subjects.
/// @dev Data subjects register their own data resources (e.g., medical records,
///      genomic profiles). Each resource has a category, sensitivity level,
///      and an owner address. Resources can also be registered by admin on
///      behalf of a data subject (e.g., during onboarding).

contract DataResourceRegistry {
    address public admin;

    uint256 public nextResourceId = 1;

    mapping(uint256 => DataResource) private _resources;

    /// @dev owner address => array of resource IDs they own
    mapping(address => uint256[]) private _resourcesByOwner;

    // ── Events ──────────────────────────────────────────────

    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);

    event ResourceRegistered(
        uint256 indexed resourceId,
        address indexed owner,
        DataCategory category,
        uint8 sensitivityLevel
    );

    event ResourceDeactivated(uint256 indexed resourceId, address indexed by);

    // ── Modifiers ───────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "DataReg: only admin");
        _;
    }

    modifier onlyOwnerOrAdmin(uint256 resourceId) {
        DataResource storage r = _resources[resourceId];
        require(r.exists, "DataReg: not found");
        require(
            msg.sender == r.owner || msg.sender == admin,
            "DataReg: not owner or admin"
        );
        _;
    }

    // ── Constructor ─────────────────────────────────────────

    constructor() {
        admin = msg.sender;
        emit AdminChanged(address(0), msg.sender);
    }

    // ── Admin functions ─────────────────────────────────────

    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "DataReg: zero addr");
        emit AdminChanged(admin, newAdmin);
        admin = newAdmin;
    }

    // ── Registration ────────────────────────────────────────

    /// @notice Register a new data resource for a data subject.
    /// @param owner The data subject who owns this resource.
    /// @param category The type of data (medical, genomic, etc.)
    /// @param sensitivityLevel 0=public, 1=low, 2=medium, 3=high, 4=critical
    /// @return resourceId The ID of the newly registered resource.
    function registerResource(
        address owner,
        DataCategory category,
        uint8 sensitivityLevel
    ) external returns (uint256 resourceId) {
        require(owner != address(0), "DataReg: zero owner");
        require(category != DataCategory.NONE, "DataReg: category=NONE");
        require(sensitivityLevel <= 4, "DataReg: sensitivity 0-4");
        // Only the data subject or admin can register resources
        require(
            msg.sender == owner || msg.sender == admin,
            "DataReg: not owner or admin"
        );

        resourceId = nextResourceId++;

        _resources[resourceId] = DataResource({
            id: resourceId,
            category: category,
            sensitivityLevel: sensitivityLevel,
            owner: owner,
            exists: true
        });

        _resourcesByOwner[owner].push(resourceId);

        emit ResourceRegistered(resourceId, owner, category, sensitivityLevel);
    }

    /// @notice Deactivate a resource (owner or admin only).
    function deactivateResource(
        uint256 resourceId
    ) external onlyOwnerOrAdmin(resourceId) {
        _resources[resourceId].exists = false;
        emit ResourceDeactivated(resourceId, msg.sender);
    }

    // ── View functions ──────────────────────────────────────

    /// @notice Get full resource metadata.
    function getResource(
        uint256 resourceId
    ) external view returns (DataResource memory) {
        return _resources[resourceId];
    }

    /// @notice Get all resource IDs owned by a data subject.
    function getResourcesByOwner(
        address owner
    ) external view returns (uint256[] memory) {
        return _resourcesByOwner[owner];
    }

    /// @notice Check if a resource exists.
    function resourceExists(uint256 resourceId) external view returns (bool) {
        return _resources[resourceId].exists;
    }
}
