// Gas configuration utilities for Avalanche Fuji testnet
import { PublicClient } from 'viem';

export const GAS_CONFIG = {
  // Gas limits for different functions
  ADD_HERB: 500000n,
  UPDATE_STATUS: 300000n,
  
  // Standard gas price for Avalanche Fuji (30 gwei)
  GAS_PRICE: 30000000000n,
  
  // Fallback gas limit if estimation fails
  FALLBACK_GAS_LIMIT: 400000n,
} as const;

/**
 * Get gas configuration for a specific contract function with automatic nonce handling
 * @param functionName - Name of the contract function
 * @param account - User's wallet address
 * @param publicClient - Wagmi public client for nonce fetching
 * @returns Gas configuration object with nonce
 */
export async function getGasConfigWithNonce(
  functionName: 'addHerb' | 'updateStatus',
  account?: `0x${string}`,
  publicClient?: PublicClient
) {
  const gasLimits = {
    addHerb: GAS_CONFIG.ADD_HERB,
    updateStatus: GAS_CONFIG.UPDATE_STATUS,
  };

  const baseConfig = {
    gas: gasLimits[functionName] || GAS_CONFIG.FALLBACK_GAS_LIMIT,
    gasPrice: GAS_CONFIG.GAS_PRICE,
  };

  // Add nonce if account and publicClient are available
  if (account && publicClient) {
    try {
      const nonce = await publicClient.getTransactionCount({
        address: account,
        blockTag: 'pending', // Use pending to get the most up-to-date nonce
      });
      return {
        ...baseConfig,
        nonce,
      };
    } catch (error) {
      console.warn('Failed to fetch nonce, proceeding without explicit nonce:', error);
    }
  }

  return baseConfig;
}

/**
 * Get gas configuration for a specific contract function (legacy method)
 * @param functionName - Name of the contract function
 * @returns Gas configuration object
 */
export function getGasConfig(functionName: 'addHerb' | 'updateStatus') {
  const gasLimits = {
    addHerb: GAS_CONFIG.ADD_HERB,
    updateStatus: GAS_CONFIG.UPDATE_STATUS,
  };

  return {
    gas: gasLimits[functionName] || GAS_CONFIG.FALLBACK_GAS_LIMIT,
    gasPrice: GAS_CONFIG.GAS_PRICE,
  };
}

/**
 * Format gas price for display (convert wei to gwei)
 * @param gasPrice - Gas price in wei
 * @returns Gas price in gwei as string
 */
export function formatGasPrice(gasPrice: bigint): string {
  return (Number(gasPrice) / 1e9).toFixed(2) + ' gwei';
}

/**
 * Estimate gas cost in AVAX
 * @param gasLimit - Gas limit
 * @param gasPrice - Gas price in wei
 * @returns Estimated cost in AVAX
 */
export function estimateGasCost(gasLimit: bigint, gasPrice: bigint): string {
  const costInWei = gasLimit * gasPrice;
  const costInAvax = Number(costInWei) / 1e18;
  return costInAvax.toFixed(6);
}

/**
 * Reset wallet nonce by fetching the latest nonce from the blockchain
 * This can help resolve "nonce too low" issues
 * @param account - User's wallet address
 * @param publicClient - Wagmi public client
 * @returns Current nonce from blockchain
 */
export async function resetNonce(
  account: `0x${string}`,
  publicClient: PublicClient
): Promise<number> {
  try {
    const nonce = await publicClient.getTransactionCount({
      address: account,
      blockTag: 'pending',
    });
    console.log(`Current nonce for ${account}: ${nonce}`);
    return nonce;
  } catch (error) {
    console.error('Failed to fetch current nonce:', error);
    throw error;
  }
}