import React from 'react';
import { Button, message, Modal } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { useAppKitAccount, useAppKitState } from '@reown/appkit/react';
import styled from 'styled-components';
import { getChainIdFromCAIP, isEthereumWindow } from '../utils/network';

const NetworkButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  border-radius: 12px;
  height: 40px;
  padding: 0 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  color: white;
  
  &:hover {
    background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
    color: white;
    transform: translateY(-1px);
  }
`;

interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

const ZKSYNC_SEPOLIA_CONFIG: NetworkConfig = {
  chainId: '0x12C', // 300 in hex
  chainName: 'zkSync Era Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.ankr.com/zksync_era_sepolia'],
  blockExplorerUrls: ['https://sepolia.explorer.zksync.io'],
};

const POLYGON_AMOY_CONFIG: NetworkConfig = {
  chainId: '0x13882', // 80002 in hex
  chainName: 'Polygon Amoy',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc-amoy.polygon.technology'],
  blockExplorerUrls: ['https://amoy.polygonscan.com'],
};

const NETWORK_CONFIGS = {
  300: ZKSYNC_SEPOLIA_CONFIG,
  80002: POLYGON_AMOY_CONFIG,
};

interface NetworkSwitcherProps {
  targetChainId: number;
  chainName: string;
  onSwitchSuccess?: () => void;
}

export const NetworkSwitcher: React.FC<NetworkSwitcherProps> = ({
  targetChainId,
  chainName,
  onSwitchSuccess,
}) => {
  const { isConnected } = useAppKitAccount();
  const { selectedNetworkId } = useAppKitState();
  const chainId = getChainIdFromCAIP(selectedNetworkId);

  const switchNetwork = async () => {
    if (!isConnected) {
      message.error('Please connect wallet first');
      return;
    }

    if (!window.ethereum || !isEthereumWindow(window.ethereum)) {
      // Check if on mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        message.error('Please open this page in your wallet app (MetaMask, Trust Wallet, etc.) or use WalletConnect.');
      } else {
        message.error('Wallet provider not available. Please install MetaMask or another Web3 wallet.');
      }
      return;
    }

    try {
      // First try to switch to target network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });

      message.success(`Switched to ${chainName} network`);
      onSwitchSuccess?.();
    } catch (switchError: unknown) {
      // If network doesn't exist, try to add network
      const err = switchError as { code?: number; message?: string };
      if (err.code === 4902) {
        try {
          const networkConfig = NETWORK_CONFIGS[targetChainId as keyof typeof NETWORK_CONFIGS];
          
          if (!networkConfig) {
            message.error('Unsupported network configuration');
            return;
          }

          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });

          message.success(`Added and switched to ${chainName} network`);
          onSwitchSuccess?.();
        } catch (addError) {
          console.error('Failed to add network:', addError);
          message.error('Failed to add network, please add manually');
        }
      } else {
        console.error('Failed to switch network:', err);
        message.error('Failed to switch network, please switch manually');
      }
    }
  };

  const showNetworkGuide = () => {
    const config = NETWORK_CONFIGS[targetChainId as keyof typeof NETWORK_CONFIGS];
    
    if (!config) {
      message.error('Network configuration does not exist');
      return;
    }

    Modal.info({
      title: `Add ${chainName} Network`,
      width: 600,
      content: (
        <div style={{ margin: '20px 0' }}>
          <p style={{ marginBottom: 16, color: '#666' }}>
            Please manually add the following network configuration in MetaMask:
          </p>
          
          <div style={{ 
            background: '#f8fafc', 
            padding: 16, 
            borderRadius: 8,
            fontFamily: 'monospace',
            fontSize: 13
          }}>
            <div style={{ marginBottom: 8 }}>
              <strong>Network Name:</strong> {config.chainName}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>RPC URL:</strong> {config.rpcUrls[0]}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Chain ID:</strong> {parseInt(config.chainId, 16)}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Currency Symbol:</strong> {config.nativeCurrency.symbol}
            </div>
            <div>
              <strong>Block Explorer:</strong> {config.blockExplorerUrls[0]}
            </div>
          </div>

          <p style={{ marginTop: 16, fontSize: 12, color: '#999' }}>
            💡 After adding, click the button below to retry automatic switching
          </p>
        </div>
      ),
      okText: 'I understand',
    });
  };

  // Check if already on target network
  if (chainId === targetChainId) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8,
        padding: '8px 12px',
        background: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: 8,
        color: '#0ea5e9',
        fontSize: 14,
        fontWeight: 500
      }}>
        ✅ Connected to {chainName}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <NetworkButton 
        icon={<SwapOutlined />}
        onClick={switchNetwork}
        size="large"
      >
        Switch to {chainName}
      </NetworkButton>
      
      <Button 
        type="link" 
        size="small"
        onClick={showNetworkGuide}
        style={{ color: '#6366f1' }}
      >
        Manual Config
      </Button>
    </div>
  );
};

// Predefined network switcher components
export const ZkSyncSepoliaSwitch: React.FC<{ onSwitchSuccess?: () => void }> = ({ onSwitchSuccess }) => (
  <NetworkSwitcher 
    targetChainId={300} 
    chainName="zkSync Era Sepolia" 
    onSwitchSuccess={onSwitchSuccess}
  />
);

export const PolygonAmoySwitch: React.FC<{ onSwitchSuccess?: () => void }> = ({ onSwitchSuccess }) => (
  <NetworkSwitcher 
    targetChainId={80002} 
    chainName="Polygon Amoy" 
    onSwitchSuccess={onSwitchSuccess}
  />
);

// Generic network information display component
export const NetworkInfo: React.FC = () => {
  const { isConnected } = useAppKitAccount();
  const { selectedNetworkId } = useAppKitState();
  const chainId = getChainIdFromCAIP(selectedNetworkId);

  if (!isConnected) {
    return (
      <div style={{ color: '#ef4444', fontSize: 14 }}>
        Wallet not connected
      </div>
    );
  }

  const getNetworkName = (id: number) => {
    switch (id) {
      case 11155111: return 'Ethereum Sepolia';
      case 84532: return 'Base Sepolia';
      case 300: return 'zkSync Era Sepolia';
      case 80002: return 'Polygon Amoy';
      case 97: return 'BSC Testnet';
      default: return `Unknown network (${id})`;
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 8,
      fontSize: 14,
      color: '#64748b'
    }}>
      <span>Current Network:</span>
      <span style={{ 
        fontWeight: 600, 
        color: chainId === 300 ? '#10b981' : '#6366f1' 
      }}>
        {getNetworkName(chainId || 0)}
      </span>
    </div>
  );
};

export default NetworkSwitcher;
