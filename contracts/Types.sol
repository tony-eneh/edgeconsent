// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title EdgeConsent Shared Types
/// @notice Enums and structs shared across EdgeConsent contracts
/// @dev Adapted from ClaimGuard Types.sol for the consent management domain

// ──────────────────────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────────────────────

/// @notice Roles in the consent ecosystem
enum Role {
    NONE,           // 0 — wildcard / unspecified
    DATA_SUBJECT,   // 1 — patient, citizen, data owner
    PROVIDER,       // 2 — hospital, clinic, data collector
    RESEARCHER,     // 3 — academic or commercial researcher
    INSURER,        // 4 — insurance company
    REGULATOR,      // 5 — government auditor, DPA
    PROCESSOR,      // 6 — third-party data processor
    EMERGENCY       // 7 — emergency access (break-glass)
}

/// @notice Types of data resources subject to consent
enum DataCategory {
    NONE,           // 0 — wildcard
    DEMOGRAPHIC,    // 1 — name, age, address
    MEDICAL,        // 2 — diagnoses, prescriptions
    GENOMIC,        // 3 — genetic data
    BEHAVIORAL,     // 4 — app usage, lifestyle
    FINANCIAL,      // 5 — billing, payment history
    BIOMETRIC,      // 6 — fingerprints, facial recognition
    LOCATION        // 7 — GPS, movement patterns
}

/// @notice Purpose for which data access is requested
enum Purpose {
    NONE,           // 0 — wildcard
    TREATMENT,      // 1 — direct patient care
    RESEARCH,       // 2 — academic / clinical research
    BILLING,        // 3 — payment processing
    INSURANCE,      // 4 — claims / underwriting
    MARKETING,      // 5 — promotional use
    AUDIT,          // 6 — regulatory audit
    EMERGENCY       // 7 — emergency / break-glass
}

/// @notice Actions that can be performed on data
enum Action {
    NONE,           // 0 — wildcard
    READ,           // 1
    EXPORT,         // 2
    AGGREGATE,      // 3 — statistical / anonymized use
    SHARE,          // 4 — share with third party
    DELETE          // 5 — right to erasure
}

// ──────────────────────────────────────────────────────────────
// Structs
// ──────────────────────────────────────────────────────────────

/// @notice Attributes of a data processor / requester
struct SubjectAttrs {
    Role role;
    uint256 orgId;
    uint256 jurisdictionId;
    bool isActive;
}

/// @notice A registered data resource owned by a data subject
struct DataResource {
    uint256 id;
    DataCategory category;
    uint8 sensitivityLevel;   // 0 = public, 1 = low, 2 = medium, 3 = high, 4 = critical
    address owner;            // the data subject who owns this data
    bool exists;
}

/// @notice A consent policy rule created by a data subject
struct ConsentRule {
    uint256 id;

    // Subject filters (zero = wildcard)
    Role allowedRole;
    uint256 allowedOrgId;
    uint256 allowedJurisdictionId;

    // Resource filters
    DataCategory allowedCategory;
    uint8 maxSensitivityLevel;

    // Purpose & action filters
    Purpose allowedPurpose;
    Action allowedAction;

    // Temporal constraints
    uint64 notBefore;         // unix timestamp; 0 = unbounded
    uint64 notAfter;          // unix timestamp; 0 = unbounded

    // Rule metadata
    bool isAllow;             // true = allow, false = deny
    bool isActive;
    address consentGiver;     // the data subject who created this rule
}

/// @notice Access request struct for the PEG gateway
struct AccessRequest {
    address requester;
    uint256 resourceId;
    Purpose purpose;
    Action action;
}
