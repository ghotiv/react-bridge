import React from 'react';
import { Avatar, Spin } from 'antd';
import styled from 'styled-components';
import { useAppKitAccount } from '@reown/appkit/react';
import { usePortfolio } from '../hooks/usePortfolio';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 140px);
  
  @media (max-width: 768px) {
    padding: 16px;
    min-height: calc(100vh - 180px);
  }
`;

const PortfolioCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 20px;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 24px 0;
  color: #212529;
  
  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 20px;
  }
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 16px;
`;

const HeaderCell = styled.div`
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
  
  &:last-child {
    text-align: right;
  }
`;

const AssetRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f8f9fa;
  align-items: center;
  
  &:hover {
    background: #f8f9fa;
    margin: 0 -12px;
    padding: 16px 12px;
    border-radius: 12px;
  }
  
  @media (max-width: 768px) {
    padding: 12px 0;
  }
`;

const AssetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TokenIcon = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
`;

const ChainBadge = styled(Avatar)`
  position: absolute;
  bottom: -4px;
  right: -4px;
  border: 2px solid white;
`;

const AssetDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const TokenSymbol = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #212529;
`;

const ChainName = styled.div`
  font-size: 13px;
  color: #6c757d;
`;

const BalanceInfo = styled.div`
  text-align: right;
`;

const USDValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #212529;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const TokenAmount = styled.div`
  font-size: 13px;
  color: #6c757d;
  margin-top: 2px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
`;

const Portfolio: React.FC = () => {
  const { isConnected } = useAppKitAccount();
  const { assets, loading } = usePortfolio();

  if (!isConnected) {
    return (
      <PageContainer>
        <PortfolioCard>
          <EmptyState>
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>Please connect your wallet</p>
            <p style={{ fontSize: '14px' }}>Connect your wallet to view your portfolio</p>
          </EmptyState>
        </PortfolioCard>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer>
        <PortfolioCard>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px', color: '#6c757d' }}>Loading portfolio...</p>
          </div>
        </PortfolioCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PortfolioCard>
        <Title>Portfolio</Title>

        {assets.length === 0 ? (
          <EmptyState>
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>No assets found</p>
            <p style={{ fontSize: '14px' }}>Your assets will appear here</p>
          </EmptyState>
        ) : (
          <>
            <TableHeader>
              <HeaderCell>Network</HeaderCell>
              <HeaderCell>Balance</HeaderCell>
            </TableHeader>

            {assets.map((asset, index) => (
              <AssetRow key={`${asset.chainId}-${asset.symbol}-${index}`}>
                <AssetInfo>
                  <TokenIcon>
                    <Avatar 
                      src={asset.tokenLogo} 
                      size={40}
                      style={{ backgroundColor: '#f0f0f0' }}
                    />
                    <ChainBadge 
                      src={asset.chainLogo} 
                      size={20}
                    />
                  </TokenIcon>
                  <AssetDetails>
                    <TokenSymbol>{asset.symbol}</TokenSymbol>
                    <ChainName>{asset.chain}</ChainName>
                  </AssetDetails>
                </AssetInfo>

                <BalanceInfo>
                  <USDValue>{asset.balance}</USDValue>
                  <TokenAmount>{asset.symbol}</TokenAmount>
                </BalanceInfo>
              </AssetRow>
            ))}
          </>
        )}
      </PortfolioCard>
    </PageContainer>
  );
};

export default Portfolio;
