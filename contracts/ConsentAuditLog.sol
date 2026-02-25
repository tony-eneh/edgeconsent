// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Types.sol";

/// @title ConsentAuditLog
/// @notice Immutable, on-chain audit trail for consent evaluation decisions.
/// @dev Called by the PEG gateway after each access evaluation to create
///      a permanent, queryable record of every consent check — who requested
///      what, for what purpose, and whether it was allowed or denied.

contract ConsentAuditLog {
    // ── Events ──────────────────────────────────────────────

    /// @notice Emitted for every consent evaluation logged.
    /// @param requester The data processor who requested access.
    /// @param resourceId The data resource that was targeted.
    /// @param purpose The stated purpose of the access request.
    /// @param action The action requested (READ, EXPORT, etc.)
    /// @param allowed Whether the request was granted or denied.
    /// @param timestamp Block timestamp when the decision was logged.
    event ConsentChecked(
        address indexed requester,
        uint256 indexed resourceId,
        Purpose purpose,
        Action action,
        bool allowed,
        uint256 timestamp
    );

    /// @notice Emitted when an emergency (break-glass) access is logged.
    event EmergencyAccessLogged(
        address indexed requester,
        uint256 indexed resourceId,
        string reason,
        uint256 timestamp
    );

    // ── Counters ────────────────────────────────────────────

    uint256 public totalLogs;
    uint256 public totalAllowed;
    uint256 public totalDenied;

    // ── Logging Functions ───────────────────────────────────

    /// @notice Log a consent evaluation decision.
    /// @dev Called by the PEG gateway after checkAccess/checkAccessAndEmit.
    function logConsentCheck(
        address requester,
        uint256 resourceId,
        Purpose purpose,
        Action action,
        bool allowed
    ) external {
        totalLogs++;
        if (allowed) {
            totalAllowed++;
        } else {
            totalDenied++;
        }

        emit ConsentChecked(
            requester,
            resourceId,
            purpose,
            action,
            allowed,
            block.timestamp
        );
    }

    /// @notice Log an emergency (break-glass) access event.
    /// @dev Emergency access bypasses normal consent evaluation but
    ///      MUST be logged for post-hoc audit and accountability.
    function logEmergencyAccess(
        address requester,
        uint256 resourceId,
        string calldata reason
    ) external {
        totalLogs++;
        totalAllowed++;

        emit EmergencyAccessLogged(
            requester,
            resourceId,
            reason,
            block.timestamp
        );
    }

    // ── View Functions ──────────────────────────────────────

    /// @notice Get aggregate statistics.
    function getStats()
        external
        view
        returns (uint256 total, uint256 allowed, uint256 denied)
    {
        return (totalLogs, totalAllowed, totalDenied);
    }
}
