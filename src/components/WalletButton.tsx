import { useAppKitAccount } from '@reown/appkit/react';
import { Button } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const StyledWalletButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  border-radius: 12px;
  height: 40px;
  padding: 0 16px;
  
  &.connected {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: white;
    }
  }
  
  &.disconnected {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border: none;
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
      color: white;
    }
  }
`;

const AddressText = styled.span`
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 13px;
`;

export const WalletButton = () => {
  const { address, isConnected } = useAppKitAccount();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <appkit-button />
  );
};
