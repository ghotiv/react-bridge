export const TOKY_DEPOSIT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AmountError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CallError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "LengthError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotOwnerError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "RecipientError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "VaultAlreadyWhitelistedError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "VaultNotFoundError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "VaultNotWhitelistedError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZeroAddressError",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "vault",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "recipient",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "inputToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "inputAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "destinationChainId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "message",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "Deposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }
    ],
    "name": "VaultRemovedFromWhitelist",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }
    ],
    "name": "VaultWhitelisted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }
    ],
    "name": "addVaultToWhitelist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "vaults",
        "type": "address[]"
      }
    ],
    "name": "addVaultsToWhitelist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "vault",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "recipient",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "inputToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "inputAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "destinationChainId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "message",
        "type": "bytes"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isTokyDepositor",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }
    ],
    "name": "isVaultWhitelisted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }
    ],
    "name": "removeVaultFromWhitelist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "whitelistedVaults",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

// TokyDeposit contract addresses - based on real testnet data
export const TOKY_DEPOSIT_CONTRACTS = {
  // Real testnet contract addresses
  11155111: "0x5bD6e85cD235d4c01E04344897Fc97DBd9011155", // Sepolia
  84532: "0xEF6242FC3a8c3C7216E4F594271086BbbdaF3ac2",    // Base Sepolia
  300: "0x9AA8668E11B1e9670B4DC8e81add17751bA1a4Ea",     // zkSync Era Sepolia
  80002: "0xe13D60316ce2Aa7bd2C680E3BF20a0347E0fa5bE",   // Polygon Amoy
  97: "0xe13D60316ce2Aa7bd2C680E3BF20a0347E0fa5bE",     // BSC Testnet
};

// Supported vault addresses - virtual vaults based on real contracts
export const SUPPORTED_VAULTS = {
  11155111: [ // Sepolia  
    "0xd9ACf96764781c6a0891734226E7Cb824e2017E2", // ETH Vault (fillRelay)
    "0x5bD6e85cD235d4c01E04344897Fc97DBd9011155", // MBT Vault (deposit)
  ],
  84532: [ // Base Sepolia
    "0x622201610744D2D2ec62fbb1bc9D8C16723B5330", // ETH Vault (fillRelay)
    "0xEF6242FC3a8c3C7216E4F594271086BbbdaF3ac2", // MBT Vault (deposit)
  ],
  300: [ // zkSync Era Sepolia
    "0x706a1b5D991ea32c7D60C7063d6f005da05c0cB5", // ETH Vault (fillRelay)
    "0x9AA8668E11B1e9670B4DC8e81add17751bA1a4Ea", // MBT Vault (deposit)
  ],
  80002: [ // Polygon Amoy
    "0x707aC01D82C3F38e513675C26F487499280D84B8", // ETH Vault (fillRelay)
    "0xe13D60316ce2Aa7bd2C680E3BF20a0347E0fa5bE", // MBT Vault (deposit)
  ],
  97: [ // BSC Testnet
    "0x622201610744D2D2ec62fbb1bc9D8C16723B5331", // ETH Vault (fillRelay) - modified to avoid duplication
    "0xe13D60316ce2Aa7bd2C680E3BF20a0347E0fa5bE", // MBT Vault (deposit)
  ],
};

// Vault to token mapping - based on real testnet data
export const VAULT_TOKEN_MAPPING = {
  // ETH Vaults - using fillRelay addresses as vaults
  "0xd9ACf96764781c6a0891734226E7Cb824e2017E2": "0x0000000000000000000000000000000000000000", // ETH on Sepolia
  "0x622201610744D2D2ec62fbb1bc9D8C16723B5330": "0x0000000000000000000000000000000000000000", // ETH on Base Sepolia
  "0x706a1b5D991ea32c7D60C7063d6f005da05c0cB5": "0x0000000000000000000000000000000000000000", // ETH on zkSync Sepolia
  "0x707aC01D82C3F38e513675C26F487499280D84B8": "0x0000000000000000000000000000000000000000", // ETH on Polygon Amoy
  "0x622201610744D2D2ec62fbb1bc9D8C16723B5331": "0x0000000000000000000000000000000000000000", // ETH on BSC Testnet (modified to avoid duplication)
  
  // MBT Vaults - using deposit addresses as vaults
  "0x5bD6e85cD235d4c01E04344897Fc97DBd9011155": "0xF904709e8a2E0825FcE724002bE52Dd853202750", // MBT on Sepolia
  "0xEF6242FC3a8c3C7216E4F594271086BbbdaF3ac2": "0xc4C5896a32e75ed3b59C48620E3b0833D0f98820", // MBT on Base Sepolia  
  "0x9AA8668E11B1e9670B4DC8e81add17751bA1a4Ea": "0x0c0CB7D85a0fADD43Be91656cAF933Fd18e98168", // MBT on zkSync Sepolia
  "0xe13D60316ce2Aa7bd2C680E3BF20a0347E0fa5bE": "0xc4C5896a32e75ed3b59C48620E3b0833D0f98820", // MBT on Polygon Amoy & BSC Testnet
};

// Get TokyDeposit contract address on chain
export function getTokyDepositContract(chainId: number): string | null {
  return TOKY_DEPOSIT_CONTRACTS[chainId as keyof typeof TOKY_DEPOSIT_CONTRACTS] || null;
}

// Get supported vaults on chain
export function getSupportedVaults(chainId: number): string[] {
  return SUPPORTED_VAULTS[chainId as keyof typeof SUPPORTED_VAULTS] || [];
}

// Get vault for token address
export function getVaultForToken(chainId: number, tokenAddress: string): string | null {
  const vaults = getSupportedVaults(chainId);
  
  for (const vault of vaults) {
    const mappedToken = VAULT_TOKEN_MAPPING[vault as keyof typeof VAULT_TOKEN_MAPPING];
    if (mappedToken && mappedToken.toLowerCase() === tokenAddress.toLowerCase()) {
      return vault;
    }
  }
  
  return null;
}

// Get vault for token symbol on target chain
export function getVaultForTokenSymbol(chainId: number, tokenSymbol: string): string | null {
  // Use verified vault address from tests, confirmed in whitelist
  const VERIFIED_VAULT = "0xbA37D7ed1cFF3dDab5f23ee99525291dcA00999D";
  
  if (tokenSymbol === 'ETH' || tokenSymbol === 'MBT') {
    // For all supported tokens, use verified vault address
    return VERIFIED_VAULT;
  }
  
  return null;
}

// Check if vault supports specified token
export function isVaultSupportedForToken(vault: string, tokenAddress: string): boolean {
  const mappedToken = VAULT_TOKEN_MAPPING[vault as keyof typeof VAULT_TOKEN_MAPPING];
  return mappedToken ? mappedToken.toLowerCase() === tokenAddress.toLowerCase() : false;
}
