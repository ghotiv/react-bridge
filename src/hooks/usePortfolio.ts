import { useState, useEffect, useCallback } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { networks } from '../config';
import { ethers } from 'ethers';

export interface PortfolioAsset {
  symbol: string;
  chain: string;
  chainId: number;
  chainLogo: string;
  tokenLogo: string;
  balance: string;
  balanceWei: bigint;
  decimals: number;
  isNative: boolean;
}

export const usePortfolio = () => {
  const { address, isConnected } = useAppKitAccount();
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!isConnected || !address) {
      setAssets([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const assetPromises = networks.map(async (network) => {
        try {
          // Create provider for this network
          const provider = new ethers.JsonRpcProvider(
            typeof network.rpcUrls === 'object' && 'default' in network.rpcUrls
              ? (network.rpcUrls.default.http[0] || network.rpcUrls.default.webSocket?.[0])
              : Array.isArray(network.rpcUrls) 
              ? network.rpcUrls[0]
              : network.rpcUrls
          );

          // Get native token balance (ETH, BNB, MATIC, etc.)
          const balanceWei = await provider.getBalance(address);
          
          // Skip if balance is 0
          if (balanceWei === 0n) {
            return null;
          }

          const asset: PortfolioAsset = {
            symbol: network.nativeCurrency.symbol,
            chain: network.name,
            chainId: typeof network.id === 'number' ? network.id : parseInt(String(network.id)),
            chainLogo: network.imageUrl || network.imageId || '/chains/unknown.svg',
            tokenLogo: network.imageUrl || network.imageId || '/tokens/unknown.svg', // Use chain logo for native token
            balance: parseFloat(ethers.formatEther(balanceWei)).toFixed(6),
            balanceWei,
            decimals: network.nativeCurrency.decimals,
            isNative: true
          };

          return asset;
        } catch (error) {
          console.error(`Failed to fetch balance for ${network.name}:`, error);
          return null;
        }
      });

      const results = await Promise.all(assetPromises);
      const validAssets = results.filter((asset): asset is PortfolioAsset => asset !== null);
      
      // Sort by balance (highest first)
      validAssets.sort((a, b) => {
        return Number(b.balanceWei - a.balanceWei);
      });

      setAssets(validAssets);
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    loading,
    error,
    refetch: fetchAssets
  };
};

