import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { avalancheFuji } from 'wagmi/chains';

// Get project ID from environment variables with fallback
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id-development-only';

// Validate project ID
if (!projectId || projectId === 'demo-project-id-development-only') {
  console.warn('⚠️  WalletConnect Project ID is not set or using demo ID. Please get a valid project ID from https://cloud.walletconnect.com');
}

export const config = getDefaultConfig({
  appName: 'HerbTrace - Ayurvedic Herb Traceability',
  projectId,
  chains: [avalancheFuji],
  ssr: false, // Disable SSR for wallet connections to avoid hydration issues
});

export const AVALANCHE_FUJI_CHAIN_ID = 43113;

export const contractConfig = {
  address: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x5635517478f22Ca57a6855b9fcd7d897D977E958') as `0x${string}`,
  abi: [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "herbId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "collector",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "HerbAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "herbId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "newStatus",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "StatusUpdated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "herbId",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "collector",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "geoTag",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "status",
          "type": "string"
        }
      ],
      "name": "addHerb",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "herbId",
          "type": "string"
        }
      ],
      "name": "getHerbHistory",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "herbId",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "collector",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "geoTag",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "status",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct HerbTraceability.Herb[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "herbId",
          "type": "string"
        }
      ],
      "name": "getLatestStatus",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "herbId",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "collector",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "geoTag",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "status",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct HerbTraceability.Herb",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "herbId",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "newStatus",
          "type": "string"
        }
      ],
      "name": "updateStatus",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "status",
          "type": "string"
        }
      ],
      "name": "isValidStatus",
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
      "inputs": [],
      "name": "getAllHerbIds",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const,
};