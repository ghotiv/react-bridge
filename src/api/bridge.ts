import axios from 'axios';
import { BridgeTransaction, BridgeStats, ChainInfo, TokenGroup, TransactionPair } from '../types/bridge';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:303';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const bridgeApi = {

  // Get user transactions
  async getUserTransactions(
    userAddress: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    transactions: BridgeTransaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await api.get('/api/bridge/transactions', {
      params: {
        userAddress,
        page,
        limit,
      },
    });
    return response.data;
  },

  // Get bridge statistics
  async getBridgeStats(): Promise<BridgeStats> {
    const response = await api.get('/api/bridge/stats');
    return response.data;
  },

  // Get vault address
  async getVaultAddress(): Promise<string> {
    const response = await api.get('/get_vault_address');
    return response.data;
  },

  // Get token groups
  async getTokenGroups(): Promise<TokenGroup[]> {
    const response = await api.get('/get_token_groups');
    return response.data;
  },

  // Get chains by token group
  async getChainsByTokenGroup(tokenGroup: string): Promise<ChainInfo[]> {
    const response = await api.get('/get_chains_by_token_group', {
      params: {
        token_group: tokenGroup,
      },
    });
    return response.data;
  },

  // Get deposit arguments
  async getDepositArgs(
    tokenGroup: string,
    fromChainId: number,
    dstChainId: number,
    numInput: string,
    recipient: string
  ): Promise<{
    vault: string;
    recipient: string;
    inputToken: string;
    inputAmount: number;
    destinationChainId: number;
    message: string;
  }> {
    const response = await api.get('/get_deposit_args', {
      params: {
        token_group: tokenGroup,
        from_chain_id: fromChainId,
        dst_chain_id: dstChainId,
        num_input: numInput,
        recipient: recipient,
      },
    });
    return response.data;
  },

  // Get transaction pairs by address
  async getTransactionPairs(
    addr: string,
    limit: number = 20,
    offset: number = 0,
    status?: number
  ): Promise<TransactionPair[]> {
    const params: Record<string, unknown> = {
      addr: addr,
      limit: limit,
      offset: offset,
    };
    
    if (status !== undefined) {
      params.status = status;
    }
    
    const response = await api.get('/get_txls_pair', {
      params: params,
    });
    return response.data;
  },
};