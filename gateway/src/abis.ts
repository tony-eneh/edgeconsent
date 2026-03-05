export type ContractAbi = readonly unknown[];
export const SubjectAttributeRegistryAbi: ContractAbi = [
    {
        "inputs":  [

                   ],
        "stateMutability":  "nonpayable",
        "type":  "constructor"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "oldAdmin",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "newAdmin",
                           "type":  "address"
                       }
                   ],
        "name":  "AdminChanged",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "subject",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "by",
                           "type":  "address"
                       }
                   ],
        "name":  "SubjectDeactivated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "subject",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "enum Role",
                           "name":  "role",
                           "type":  "uint8"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "orgId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "jurisdictionId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bool",
                           "name":  "isActive",
                           "type":  "bool"
                       }
                   ],
        "name":  "SubjectRegistered",
        "type":  "event"
    },
    {
        "inputs":  [

                   ],
        "name":  "admin",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "subject",
                           "type":  "address"
                       }
                   ],
        "name":  "deactivateSubject",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "subject",
                           "type":  "address"
                       }
                   ],
        "name":  "getSubjectAttrs",
        "outputs":  [
                        {
                            "components":  [
                                               {
                                                   "internalType":  "enum Role",
                                                   "name":  "role",
                                                   "type":  "uint8"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "orgId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "jurisdictionId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "bool",
                                                   "name":  "isActive",
                                                   "type":  "bool"
                                               }
                                           ],
                            "internalType":  "struct SubjectAttrs",
                            "name":  "",
                            "type":  "tuple"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "subject",
                           "type":  "address"
                       }
                   ],
        "name":  "isSubjectActive",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "jurisdictionId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "registerSelf",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "newAdmin",
                           "type":  "address"
                       }
                   ],
        "name":  "setAdmin",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "subject",
                           "type":  "address"
                       },
                       {
                           "internalType":  "enum Role",
                           "name":  "role",
                           "type":  "uint8"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "orgId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "jurisdictionId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bool",
                           "name":  "isActive",
                           "type":  "bool"
                       }
                   ],
        "name":  "setSubjectAttributes",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    }
] as const;

export const DataResourceRegistryAbi: ContractAbi = [
    {
        "inputs":  [

                   ],
        "stateMutability":  "nonpayable",
        "type":  "constructor"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "oldAdmin",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "newAdmin",
                           "type":  "address"
                       }
                   ],
        "name":  "AdminChanged",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "resourceId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "by",
                           "type":  "address"
                       }
                   ],
        "name":  "ResourceDeactivated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "resourceId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "enum DataCategory",
                           "name":  "category",
                           "type":  "uint8"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint8",
                           "name":  "sensitivityLevel",
                           "type":  "uint8"
                       }
                   ],
        "name":  "ResourceRegistered",
        "type":  "event"
    },
    {
        "inputs":  [

                   ],
        "name":  "admin",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "resourceId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "deactivateResource",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "resourceId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getResource",
        "outputs":  [
                        {
                            "components":  [
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "id",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "enum DataCategory",
                                                   "name":  "category",
                                                   "type":  "uint8"
                                               },
                                               {
                                                   "internalType":  "uint8",
                                                   "name":  "sensitivityLevel",
                                                   "type":  "uint8"
                                               },
                                               {
                                                   "internalType":  "address",
                                                   "name":  "owner",
                                                   "type":  "address"
                                               },
                                               {
                                                   "internalType":  "bool",
                                                   "name":  "exists",
                                                   "type":  "bool"
                                               }
                                           ],
                            "internalType":  "struct DataResource",
                            "name":  "",
                            "type":  "tuple"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       }
                   ],
        "name":  "getResourcesByOwner",
        "outputs":  [
                        {
                            "internalType":  "uint256[]",
                            "name":  "",
                            "type":  "uint256[]"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "nextResourceId",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       },
                       {
                           "internalType":  "enum DataCategory",
                           "name":  "category",
                           "type":  "uint8"
                       },
                       {
                           "internalType":  "uint8",
                           "name":  "sensitivityLevel",
                           "type":  "uint8"
                       }
                   ],
        "name":  "registerResource",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "resourceId",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "resourceId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "resourceExists",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "newAdmin",
                           "type":  "address"
                       }
                   ],
        "name":  "setAdmin",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    }
] as const;

export const ConsentPolicyManagerAbi: ContractAbi = [
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "subjectRegistry_",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "dataRegistry_",
                           "type":  "address"
                       }
                   ],
        "stateMutability":  "nonpayable",
        "type":  "constructor"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "requester",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "resourceId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "enum Purpose",
                           "name":  "purpose",
                           "type":  "uint8"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "enum Action",
                           "name":  "action",
                           "type":  "uint8"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bool",
                           "name":  "allowed",
                           "type":  "bool"
                       }
                   ],
        "name":  "AccessEvaluated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "oldAdmin",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "newAdmin",
                           "type":  "address"
                       }
                   ],
        "name":  "AdminChanged",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "ruleId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "consentGiver",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "enum Role",
                           "name":  "allowedRole",
                           "type":  "uint8"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "enum Purpose",
                           "name":  "allowedPurpose",
                           "type":  "uint8"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "enum Action",
                           "name":  "allowedAction",
                           "type":  "uint8"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "enum DataCategory",
                           "name":  "allowedCategory",
                           "type":  "uint8"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bool",
                           "name":  "isAllow",
                           "type":  "bool"
                       }
                   ],
        "name":  "ConsentRuleCreated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "ruleId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "revokedBy",
                           "type":  "address"
                       }
                   ],
        "name":  "ConsentRuleRevoked",
        "type":  "event"
    },
    {
        "inputs":  [

                   ],
        "name":  "admin",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "requester",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "resourceId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "enum Purpose",
                           "name":  "purpose",
                           "type":  "uint8"
                       },
                       {
                           "internalType":  "enum Action",
                           "name":  "action",
                           "type":  "uint8"
                       }
                   ],
        "name":  "checkAccess",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "requester",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "resourceId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "enum Purpose",
                           "name":  "purpose",
                           "type":  "uint8"
                       },
                       {
                           "internalType":  "enum Action",
                           "name":  "action",
                           "type":  "uint8"
                       }
                   ],
        "name":  "checkAccessAndEmit",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "enum Role",
                           "name":  "allowedRole",
                           "type":  "uint8"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "allowedOrgId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "allowedJurisdictionId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "enum DataCategory",
                           "name":  "allowedCategory",
                           "type":  "uint8"
                       },
                       {
                           "internalType":  "uint8",
                           "name":  "maxSensitivityLevel",
                           "type":  "uint8"
                       },
                       {
                           "internalType":  "enum Purpose",
                           "name":  "allowedPurpose",
                           "type":  "uint8"
                       },
                       {
                           "internalType":  "enum Action",
                           "name":  "allowedAction",
                           "type":  "uint8"
                       },
                       {
                           "internalType":  "uint64",
                           "name":  "notBefore",
                           "type":  "uint64"
                       },
                       {
                           "internalType":  "uint64",
                           "name":  "notAfter",
                           "type":  "uint64"
                       },
                       {
                           "internalType":  "bool",
                           "name":  "isAllow",
                           "type":  "bool"
                       }
                   ],
        "name":  "createConsentRule",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "ruleId",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "dataRegistry",
        "outputs":  [
                        {
                            "internalType":  "contract DataResourceRegistry",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "ruleId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getRule",
        "outputs":  [
                        {
                            "components":  [
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "id",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "enum Role",
                                                   "name":  "allowedRole",
                                                   "type":  "uint8"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "allowedOrgId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "allowedJurisdictionId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "enum DataCategory",
                                                   "name":  "allowedCategory",
                                                   "type":  "uint8"
                                               },
                                               {
                                                   "internalType":  "uint8",
                                                   "name":  "maxSensitivityLevel",
                                                   "type":  "uint8"
                                               },
                                               {
                                                   "internalType":  "enum Purpose",
                                                   "name":  "allowedPurpose",
                                                   "type":  "uint8"
                                               },
                                               {
                                                   "internalType":  "enum Action",
                                                   "name":  "allowedAction",
                                                   "type":  "uint8"
                                               },
                                               {
                                                   "internalType":  "uint64",
                                                   "name":  "notBefore",
                                                   "type":  "uint64"
                                               },
                                               {
                                                   "internalType":  "uint64",
                                                   "name":  "notAfter",
                                                   "type":  "uint64"
                                               },
                                               {
                                                   "internalType":  "bool",
                                                   "name":  "isAllow",
                                                   "type":  "bool"
                                               },
                                               {
                                                   "internalType":  "bool",
                                                   "name":  "isActive",
                                                   "type":  "bool"
                                               },
                                               {
                                                   "internalType":  "address",
                                                   "name":  "consentGiver",
                                                   "type":  "address"
                                               }
                                           ],
                            "internalType":  "struct ConsentRule",
                            "name":  "",
                            "type":  "tuple"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "subject",
                           "type":  "address"
                       }
                   ],
        "name":  "getRulesBySubject",
        "outputs":  [
                        {
                            "internalType":  "uint256[]",
                            "name":  "",
                            "type":  "uint256[]"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "nextRuleId",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "ruleId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "revokeConsentRule",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "newAdmin",
                           "type":  "address"
                       }
                   ],
        "name":  "setAdmin",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "subjectRegistry",
        "outputs":  [
                        {
                            "internalType":  "contract SubjectAttributeRegistry",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "totalRules",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    }
] as const;

export const ConsentAuditLogAbi: ContractAbi = [
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "requester",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "resourceId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "enum Purpose",
                           "name":  "purpose",
                           "type":  "uint8"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "enum Action",
                           "name":  "action",
                           "type":  "uint8"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bool",
                           "name":  "allowed",
                           "type":  "bool"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "timestamp",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ConsentChecked",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "requester",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "resourceId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "reason",
                           "type":  "string"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "timestamp",
                           "type":  "uint256"
                       }
                   ],
        "name":  "EmergencyAccessLogged",
        "type":  "event"
    },
    {
        "inputs":  [

                   ],
        "name":  "getStats",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "total",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "allowed",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "denied",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "requester",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "resourceId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "enum Purpose",
                           "name":  "purpose",
                           "type":  "uint8"
                       },
                       {
                           "internalType":  "enum Action",
                           "name":  "action",
                           "type":  "uint8"
                       },
                       {
                           "internalType":  "bool",
                           "name":  "allowed",
                           "type":  "bool"
                       }
                   ],
        "name":  "logConsentCheck",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "requester",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "resourceId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "string",
                           "name":  "reason",
                           "type":  "string"
                       }
                   ],
        "name":  "logEmergencyAccess",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "totalAllowed",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "totalDenied",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "totalLogs",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    }
] as const;

export const contractAbis = {
  subjectRegistry: SubjectAttributeRegistryAbi,
  dataRegistry: DataResourceRegistryAbi,
  consentManager: ConsentPolicyManagerAbi,
  auditLog: ConsentAuditLogAbi,
} as const;
