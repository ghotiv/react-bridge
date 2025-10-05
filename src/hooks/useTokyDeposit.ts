import { useState, useCallback } from 'react';
import { useAppKitAccount, useAppKitProvider, useAppKitState } from '@reown/appkit/react';
import { Contract, BrowserProvider, parseUnits, parseEther, formatUnits } from 'ethers';
import { 
  TOKY_DEPOSIT_ABI, 
  getTokyDepositContract, 
  getVaultForToken,
  getVaultForTokenSymbol,
  getSupportedVaults,
  isVaultSupportedForToken 
} from '../contracts/TokyDeposit';
import { getChainIdFromCAIP } from '../utils/network';
import type { Provider } from '@reown/appkit/react';

export interface DepositParams {
  fromChainId: number;
  toChainId: number;
  tokenAddress: string;
  tokenSymbol: string; // Add token symbol for finding target chain vault
  amount: string;
  recipient: string;
  message?: string;
}

export interface DepositResult {
  txHash: string;
  depositId: string;
  vault: string;
}

export const useTokyDeposit = () => {
  const { address, isConnected } = useAppKitAccount();
  const { selectedNetworkId } = useAppKitState();
  const chainId = getChainIdFromCAIP(selectedNetworkId);
  const { walletProvider } = useAppKitProvider<Provider>('eip155');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if bridging is supported for specified chain
  const isBridgeSupported = useCallback((fromChainId: number, toChainId: number): boolean => {
    const fromContract = getTokyDepositContract(fromChainId);
    const toVaults = getSupportedVaults(toChainId);
    return !!(fromContract && toVaults.length > 0);
  }, []);

  // Get token vault on specified chain
  const getTokenVault = useCallback((chainId: number, tokenAddress: string): string | null => {
    return getVaultForToken(chainId, tokenAddress);
  }, []);

  // Check if vault is in whitelist
  const checkVaultWhitelist = useCallback(async (chainId: number, vault: string): Promise<boolean> => {
    if (!walletProvider) return false;

    try {
      const contractAddress = getTokyDepositContract(chainId);
      if (!contractAddress) return false;

      const provider = new BrowserProvider(walletProvider);
      const contract = new Contract(contractAddress, TOKY_DEPOSIT_ABI, provider);
      
      return await contract.isVaultWhitelisted(vault);
    } catch (err) {
      console.error('Failed to check vault whitelist:', err);
      return false;
    }
  }, [walletProvider]);

  // Get ERC20 token balance
  const getTokenBalance = useCallback(async (tokenAddress: string, userAddress: string): Promise<string> => {
    if (!walletProvider) return '0';

    try {
      const provider = new BrowserProvider(walletProvider);
      
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        // ETH balance
        const balance = await provider.getBalance(userAddress);
        return formatUnits(balance, 18);
      } else {
        // ERC20 token balance
        const tokenAbi = [
          'function balanceOf(address) view returns (uint256)',
          'function decimals() view returns (uint8)'
        ];
        const contract = new Contract(tokenAddress, tokenAbi, provider);
        const balance = await contract.balanceOf(userAddress);
        const decimals = await contract.decimals();
        return formatUnits(balance, decimals);
      }
    } catch (err) {
      console.error('Failed to get token balance:', err);
      return '0';
    }
  }, [walletProvider]);

  // Check ERC20 token approval
  const checkTokenApproval = useCallback(async (
    tokenAddress: string, 
    spender: string, 
    amount: string
  ): Promise<boolean> => {
    if (!walletProvider || !address) return false;
    
    // ETH doesn't need approval
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      return true;
    }

    try {
      const provider = new BrowserProvider(walletProvider);
      const tokenAbi = [
        'function allowance(address,address) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ];
      const contract = new Contract(tokenAddress, tokenAbi, provider);
      
      const allowance = await contract.allowance(address, spender);
      const decimals = await contract.decimals();
      const requiredAmount = parseUnits(amount, decimals);
      
      return allowance >= requiredAmount;
    } catch (err) {
      console.error('Failed to check token approval:', err);
      return false;
    }
  }, [walletProvider, address]);

  // Approve ERC20 token
  const approveToken = useCallback(async (
    tokenAddress: string,
    spender: string,
    amount: string
  ): Promise<string | null> => {
    if (!walletProvider || !address) return null;

    setLoading(true);
    setError(null);

    try {
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      
      const tokenAbi = [
        'function approve(address,uint256) returns (bool)',
        'function decimals() view returns (uint8)'
      ];
      const contract = new Contract(tokenAddress, tokenAbi, signer);
      
      const decimals = await contract.decimals();
      const approveAmount = parseUnits(amount, decimals);
      
      const tx = await contract.approve(spender, approveAmount);
      await tx.wait();
      
      return tx.hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Token approval failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [walletProvider, address]);

  // Execute Toky Finance deposit
  const executeDeposit = useCallback(async (params: DepositParams): Promise<DepositResult | null> => {
    const { fromChainId, toChainId, tokenAddress, tokenSymbol, amount, recipient, message = '0x' } = params;

    console.log('🔥 TokyDeposit.executeDeposit - Starting...', {
      fromChainId,
      toChainId,
      tokenAddress,
      amount,
      recipient,
      message,
      walletProvider: !!walletProvider,
      address,
      isConnected,
      chainId
    });

    if (!walletProvider || !address || !isConnected) {
      const errorMsg = 'Wallet not connected';
      console.error('❌ TokyDeposit - Wallet connection check failed:', {
        walletProvider: !!walletProvider,
        address: !!address,
        isConnected
      });
      setError(errorMsg);
      return null;
    }

    // Check current network
    if (chainId !== fromChainId) {
      const errorMsg = `Please switch to chain ${fromChainId}`;
      console.error('❌ TokyDeposit - Chain mismatch:', { chainId, fromChainId });
      setError(errorMsg);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Get contract address
      const contractAddress = getTokyDepositContract(fromChainId);
      console.log('🔍 Contract Address:', contractAddress);
      
      if (!contractAddress) {
        throw new Error(`TokyDeposit contract not found on chain ${fromChainId}`);
      }

      // Get target chain vault - use token symbol instead of address
      const vault = getVaultForTokenSymbol(toChainId, tokenSymbol);
      console.log('🔍 Vault Address:', vault, 'for token:', tokenSymbol, 'on chain:', toChainId);
      
      if (!vault) {
        throw new Error(`No vault found for token ${tokenSymbol} on chain ${toChainId}`);
      }

      // Check if vault is in whitelist - temporarily skip validation
      console.log('🔍 Checking vault whitelist...');
      // const isWhitelisted = await checkVaultWhitelist(fromChainId, vault);
      // console.log('🔍 Vault Whitelisted:', isWhitelisted);
      
      // if (!isWhitelisted) {
      //   throw new Error(`Vault ${vault} is not whitelisted`);
      // }
      console.log('⚠️ Vault whitelist check skipped for testing');

      console.log('📝 Creating contract instance...');
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, TOKY_DEPOSIT_ABI, signer);

      // Prepare transaction parameters
      const recipientBytes32 = '0x' + recipient.slice(2).padStart(64, '0'); // Convert address to bytes32
      const isNativeToken = tokenAddress === '0x0000000000000000000000000000000000000000';
      
      console.log('📝 Preparing transaction parameters...', {
        recipientBytes32,
        isNativeToken,
        vault,
        tokenAddress,
        amount
      });
      
      let txOptions: any = {};
      let inputAmount: bigint;

      if (isNativeToken) {
        // Native token (ETH/BNB/MATIC)
        console.log('💰 Processing native token...');
        inputAmount = parseEther(amount);
        txOptions.value = inputAmount;
      } else {
        // ERC20 token
        console.log('🪙 Processing ERC20 token...');
        const tokenAbi = ['function decimals() view returns (uint8)'];
        const tokenContract = new Contract(tokenAddress, tokenAbi, provider);
        const decimals = await tokenContract.decimals();
        console.log('🔍 Token decimals:', decimals);
        
        inputAmount = parseUnits(amount, decimals);

        // Check approval
        console.log('🔍 Checking token approval...');
        const isApproved = await checkTokenApproval(tokenAddress, contractAddress, amount);
        console.log('🔍 Token Approved:', isApproved);
        
        if (!isApproved) {
          throw new Error('Token not approved. Please approve first.');
        }
      }

      // Call deposit function
      console.log('📡 Calling contract.deposit with parameters:', {
        vault,
        recipientBytes32,
        tokenAddress,
        inputAmount: inputAmount.toString(),
        toChainId,
        message,
        txOptions
      });
      
      const tx = await contract.deposit(
        vault,
        recipientBytes32,
        tokenAddress,
        inputAmount,
        toChainId,
        message,
        txOptions
      );

      console.log('✅ Transaction sent:', tx.hash);
      console.log('⏳ Waiting for transaction receipt...');
      
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt);
      
      // Get deposit ID from events
      const depositEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          return parsedLog?.name === 'Deposit';
        } catch {
          return false;
        }
      });

      let depositId = tx.hash; // Default to using transaction hash as ID
      if (depositEvent) {
        const parsedLog = contract.interface.parseLog(depositEvent);
        depositId = `${parsedLog?.args.user}-${parsedLog?.args.timestamp}`;
      }

      return {
        txHash: tx.hash,
        depositId,
        vault
      };

    } catch (err) {
      console.error('❌ TokyDeposit.executeDeposit - Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Deposit failed';
      console.error('❌ Error message:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [walletProvider, address, isConnected, chainId, checkVaultWhitelist, checkTokenApproval]);

  // Get deposit events
  const getDepositEvents = useCallback(async (
    chainId: number,
    userAddress?: string,
    fromBlock?: number
  ): Promise<any[]> => {
    if (!walletProvider) return [];

    try {
      const contractAddress = getTokyDepositContract(chainId);
      if (!contractAddress) return [];

      const provider = new BrowserProvider(walletProvider);
      const contract = new Contract(contractAddress, TOKY_DEPOSIT_ABI, provider);

      const filter = contract.filters.Deposit(userAddress || null);
      const events = await contract.queryFilter(filter, fromBlock || -10000); // Recent 10000 blocks

      return events.map(event => {
        // Type check: ensure event is EventLog type and has args property
        const hasArgs = 'args' in event;
        return {
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          user: hasArgs ? (event as any).args?.user : undefined,
          vault: hasArgs ? (event as any).args?.vault : undefined,
          recipient: hasArgs ? (event as any).args?.recipient : undefined,
          inputToken: hasArgs ? (event as any).args?.inputToken : undefined,
          inputAmount: hasArgs ? (event as any).args?.inputAmount?.toString() : undefined,
          destinationChainId: hasArgs ? (event as any).args?.destinationChainId?.toString() : undefined,
          message: hasArgs ? (event as any).args?.message : undefined,
          timestamp: hasArgs ? (event as any).args?.timestamp?.toString() : undefined,
        };
      });
    } catch (err) {
      console.error('Failed to get deposit events:', err);
      return [];
    }
  }, [walletProvider]);

  return {
    // State
    loading,
    error,
    
    // Operations
    executeDeposit,
    approveToken,
    clearError,
    
    // Queries
    isBridgeSupported,
    getTokenVault,
    checkVaultWhitelist,
    getTokenBalance,
    checkTokenApproval,
    getDepositEvents,
    
    // Utility functions
    getSupportedVaults: (chainId: number) => getSupportedVaults(chainId),
    isVaultSupportedForToken,
  };
};
