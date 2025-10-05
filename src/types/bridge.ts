export interface Chain {
  id: number;
  name: string;
  symbol: string;
  logo: string;
  rpcUrl: string;
  blockExplorerUrl: string;
}

export interface ChainInfo {
  chain_id: number;
  contract_deposit: string;
  alias_name: string;
  rpc_url: string;
  chain_logo_url: string;
}

export interface TokenGroup {
  token_group: string;
  token_logo_url: string;
}

export interface TransactionPair {
  txl_related_id: number;
  num_from: number;
  chain_id_from: number;
  token_db_id: number;
  addr_from: string;
  tx_hash_from: string;
  chain_alias_name_from: string;
  chain_logo_url_from: string;
  block_explorer_from: string;
  explorer_template_from: string;
  decimals_from: number;
  token_group: string;
  num_human_from: number;
  tx_url_from: string;
  tx_time: string;
  status: number;
  // Optional to field (only complete Toky Finance transactions have this)
  num_to?: number;
  chain_id_to?: number;
  addr_to?: string;
  tx_hash_to?: string;
  chain_alias_name_to?: string;
  chain_logo_url_to?: string;
  block_explorer_to?: string;
  explorer_template_to?: string;
  decimals_to?: number;
  num_human_to?: number;
  tx_url_to?: string;
}

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  logo: string;
  addresses: Record<number, string>;
}

export interface BridgeTransaction {
  id: string;
  fromChain: Chain;
  toChain: Chain;
  token: Token;
  amount: string;
  fromTxHash: string;
  toTxHash?: string;
  status: 'pending' | 'bridging' | 'completed' | 'failed';
  timestamp: number;
  estimatedTime: number;
  actualTime?: number;
  fees: {
    gas: string;
    bridge: string;
    total: string;
  };
  fromAddress: string;
  toAddress: string;
}

export interface BridgeState {
  fromChain: Chain | null;
  toChain: Chain | null;
  token: Token | null;
  amount: string;
  recipient: string;
  isLoading: boolean;
  error: string | null;
}

export interface TransactionFilters {
  status?: 'all' | 'pending' | 'bridging' | 'completed' | 'failed';
  chain?: number;
  token?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface BridgeStats {
  totalVolume: string;
  totalTransactions: number;
  avgTime: number;
  successRate: number;
  supportedChains: number;
  supportedTokens: number;
}
