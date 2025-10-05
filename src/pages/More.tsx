import React from 'react';
import { Avatar, Button, message } from 'antd';
import { 
  PoweroffOutlined, 
  TrophyOutlined, 
  CodeOutlined, 
  CustomerServiceOutlined,
  TwitterOutlined,
  SendOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { useAppKitAccount, useDisconnect } from '@reown/appkit/react';

const PageContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 140px);
  
  @media (max-width: 768px) {
    padding: 16px;
    min-height: calc(100vh - 180px);
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 24px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.div`
  font-size: 13px;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 16px;
  margin-bottom: 16px;
`;

const WalletDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const WalletAddress = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #212529;
  font-family: monospace;
`;

const CopyButton = styled(Button)`
  border: 1px solid #dee2e6;
  color: #6c757d;
  
  &:hover {
    border-color: #00a389;
    color: #00a389;
  }
`;

const DisconnectButton = styled(Button)`
  background: #ff6b35;
  border: none;
  color: white;
  border-radius: 12px;
  font-weight: 600;
  
  &:hover:not(:disabled) {
    background: #ff8555;
    color: white;
  }
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const MenuItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MenuIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #495057;
`;

const MenuText = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #212529;
`;

const MenuArrow = styled.div`
  color: #adb5bd;
  font-size: 18px;
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  padding-top: 8px;
`;

const SocialIcon = styled.a`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #495057;
  font-size: 22px;
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
    color: #212529;
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
`;

const More: React.FC = () => {
  const { isConnected, address } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  console.log('More page - isConnected:', isConnected, 'address:', address);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      message.success('Address copied to clipboard!');
    } catch {
      message.error('Failed to copy address');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  if (!isConnected || !address) {
    return (
      <PageContainer>
        <Section>
          <EmptyState>
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>Please connect your wallet</p>
            <p style={{ fontSize: '14px' }}>Connect your wallet to access settings</p>
          </EmptyState>
        </Section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Wallet Section */}
      <Section>
        <SectionTitle>Connected EVM wallet</SectionTitle>
        <WalletInfo>
          <WalletDetails>
            <Avatar 
              style={{ 
                backgroundColor: '#6366f1',
                width: 40,
                height: 40,
              }}
            >
              {address ? address.slice(2, 4).toUpperCase() : 'W'}
            </Avatar>
            <WalletAddress>{address ? formatAddress(address) : 'Not connected'}</WalletAddress>
          </WalletDetails>
          <div style={{ display: 'flex', gap: '8px' }}>
            <CopyButton 
              icon={<CopyOutlined />}
              onClick={copyAddress}
              title="Copy address"
            />
            <DisconnectButton 
              icon={<PoweroffOutlined />}
              onClick={handleDisconnect}
            >
              Disconnect
            </DisconnectButton>
          </div>
        </WalletInfo>
      </Section>

      {/* Explore Section */}
      <Section>
        <SectionTitle>Explore Toky Finance</SectionTitle>
        
        <MenuItem onClick={() => window.open('https://toky.finance', '_blank')}>
          <MenuItemLeft>
            <MenuIcon>
              <TrophyOutlined />
            </MenuIcon>
            <MenuText>Toky Community</MenuText>
          </MenuItemLeft>
          <MenuArrow>›</MenuArrow>
        </MenuItem>

        <MenuItem onClick={() => window.open('https://docs.toky.finance', '_blank')}>
          <MenuItemLeft>
            <MenuIcon>
              <CodeOutlined />
            </MenuIcon>
            <MenuText>Documentation</MenuText>
          </MenuItemLeft>
          <MenuArrow>›</MenuArrow>
        </MenuItem>
      </Section>

      {/* Help Section */}
      <Section>
        <SectionTitle>Get Help</SectionTitle>
        
        <MenuItem onClick={() => window.open('https://support.toky.finance', '_blank')}>
          <MenuItemLeft>
            <MenuIcon>
              <CustomerServiceOutlined />
            </MenuIcon>
            <MenuText>Customer Support</MenuText>
          </MenuItemLeft>
          <MenuArrow>›</MenuArrow>
        </MenuItem>
      </Section>

      {/* Social Links */}
      <Section>
        <SocialLinks>
          <SocialIcon href="https://twitter.com/tokyfinance" target="_blank" rel="noopener noreferrer">
            <TwitterOutlined />
          </SocialIcon>
          <SocialIcon href="https://t.me/tokyfinance" target="_blank" rel="noopener noreferrer">
            <SendOutlined />
          </SocialIcon>
          <SocialIcon href="https://discord.gg/tokyfinance" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </SocialIcon>
        </SocialLinks>
      </Section>
    </PageContainer>
  );
};

export default More;
