// Helper function to extract chain ID from CAIP format
export const getChainIdFromCAIP = (networkId: string | undefined): number | undefined => {
  if (!networkId) return undefined;
  if (typeof networkId === 'number') return networkId;
  if (typeof networkId === 'string') {
    // Handle CAIP format like "eip155:1" or just "1"
    const parts = networkId.split(':');
    const chainId = parts.length > 1 ? parts[1] : parts[0];
    const numericId = parseInt(chainId, 10);
    return isNaN(numericId) ? undefined : numericId;
  }
  return undefined;
};

// Type guard for window.ethereum
export const isEthereumWindow = (obj: any): obj is { request: Function } => {
  return obj && typeof obj.request === 'function';
};

export default {
  getChainIdFromCAIP,
  isEthereumWindow,
};
