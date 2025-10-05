import React, { useState } from 'react';
import { Avatar, Empty, Spin } from 'antd';
import { CheckCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useTransactions } from '../hooks/useTransactions';
import { useAppKitAccount } from '@reown/appkit/react';

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

const HistoryCard = styled.div`
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
  grid-template-columns: 1fr 2fr 1.5fr;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1.5fr 1fr;
    gap: 8px;
    font-size: 13px;
  }
`;

const HeaderCell = styled.div`
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
`;

const TransactionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1.5fr;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f8f9fa;
  align-items: center;
  
  &:hover {
    background: #f8f9fa;
    margin: 0 -12px;
    padding: 16px 12px;
    border-radius: 12px;
    cursor: pointer;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1.5fr 1fr;
    gap: 8px;
    padding: 12px 0;
  }
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusIcon = styled.div<{ status: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#ff6b35';
      case 'pending': return '#ffc107';
      case 'failed': return '#dc3545';
      default: return '#6c757d';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
`;

const DateText = styled.div`
  font-size: 14px;
  color: #212529;
  font-weight: 500;
`;

const AmountText = styled.div`
  font-size: 15px;
  color: #212529;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const ChainRoute = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChainIcon = styled(Avatar)`
  flex-shrink: 0;
`;

const ViewFullButton = styled.button`
  width: 100%;
  padding: 16px;
  border: none;
  background: transparent;
  color: #212529;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  border-radius: 12px;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

const Transactions: React.FC = () => {
  const { isConnected } = useAppKitAccount();
  const { transactions, loading } = useTransactions();
  const [showAll, setShowAll] = useState(false);

  const displayedTransactions = showAll ? transactions : transactions.slice(0, 3);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    return `${day} ${month}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined />;
      case 'pending':
        return '⏱';
      case 'failed':
        return '✕';
      default:
        return '•';
    }
  };

  if (!isConnected) {
    return (
      <PageContainer>
        <HistoryCard>
          <EmptyState>
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>Please connect your wallet</p>
            <p style={{ fontSize: '14px' }}>Connect your wallet to view transaction history</p>
          </EmptyState>
        </HistoryCard>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer>
        <HistoryCard>
          <LoadingState>
            <Spin size="large" />
            <p style={{ marginTop: '16px', color: '#6c757d' }}>Loading transactions...</p>
          </LoadingState>
        </HistoryCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HistoryCard>
        <Title>History</Title>

        {transactions.length === 0 ? (
          <EmptyState>
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>No transactions yet</p>
            <p style={{ fontSize: '14px' }}>Your bridge transactions will appear here</p>
          </EmptyState>
        ) : (
          <>
            <TableHeader>
              <HeaderCell>Date</HeaderCell>
              <HeaderCell>Amount</HeaderCell>
              <HeaderCell>From/To</HeaderCell>
            </TableHeader>

            {displayedTransactions.map((tx, index) => (
              <TransactionRow key={index}>
                <StatusBadge>
                  <StatusIcon status={tx.status}>
                    {getStatusIcon(tx.status)}
                  </StatusIcon>
                  <DateText>{formatDate(tx.timestamp)}</DateText>
                </StatusBadge>

                <AmountText>
                  {tx.amount} {tx.token?.symbol || 'TOKEN'}
                </AmountText>

                <ChainRoute>
                  <ChainIcon 
                    src={tx.fromChain.logo} 
                    size={24}
                    style={{ backgroundColor: '#f0f0f0' }}
                  />
                  <ArrowRightOutlined style={{ fontSize: '14px', color: '#6c757d' }} />
                  <ChainIcon 
                    src={tx.toChain.logo} 
                    size={24}
                    style={{ backgroundColor: '#f0f0f0' }}
                  />
                </ChainRoute>
              </TransactionRow>
            ))}

            {transactions.length > 3 && !showAll && (
              <ViewFullButton onClick={() => setShowAll(true)}>
                View Full History
              </ViewFullButton>
            )}
          </>
        )}
      </HistoryCard>
    </PageContainer>
  );
};

export default Transactions;
