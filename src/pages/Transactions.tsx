import React, { useState, useEffect } from 'react';
import { Avatar, Spin, Table, Button } from 'antd';
import { CheckCircleOutlined, ArrowRightOutlined, ExportOutlined, RedoOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { useAppKitAccount } from '@reown/appkit/react';
import type { ColumnsType } from 'antd/es/table';
import type { BridgeTransaction } from '../types/bridge';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 140px);
  
  @media (max-width: 768px) {
    max-width: 800px;
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
    grid-template-columns: 1fr 1.5fr auto;
    gap: 8px;
    padding: 12px 0;
  }
`;

const MobileActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusIcon = styled.div<{ $status: string | null }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$status) {
      case 'completed': return '#ff6b35';
      case 'pending': return '#ffc107';
      case 'bridging': return '#ffc107';
      case 'failed': return '#dc3545';
      case null:
      case undefined:
      default: return '#ffc107';
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

const RouteCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useAppKitAccount();
  const { transactions, loading } = useTransactions();
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const displayedTransactions = showAll ? transactions : transactions.slice(0, 3);

  const formatDate = (timestamp: number) => {
    // Check if timestamp is in seconds or milliseconds
    const timestampMs = timestamp > 10000000000 ? timestamp : timestamp * 1000;
    const date = new Date(timestampMs);
    
    if (isMobile) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
    
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    return `${day} ${month}`;
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined />;
      case 'pending':
      case 'bridging':
      case null:
      case undefined:
        return '⏱';
      case 'failed':
        return '✕';
      default:
        return '⏱';
    }
  };

  // Desktop table columns
  const columns: ColumnsType<BridgeTransaction> = [
    {
      title: '',
      key: 'status',
      width: 60,
      render: (_, record) => (
        <div style={{ fontSize: '18px', textAlign: 'center' }}>
          {record.status === 'completed' ? '✅' : 
           record.status === 'failed' ? '❌' : '⏱️'}
        </div>
      ),
    },
    {
      title: 'From',
      key: 'from',
      render: (_, record) => (
        <RouteCell>
          <Avatar src={record.fromChain.logo} size={24} style={{ backgroundColor: '#f0f0f0' }} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{record.fromChain.name}</span>
          {record.fromTxHash && record.fromChain.blockExplorerUrl && (
            <a 
              href={`${record.fromChain.blockExplorerUrl}/tx/${record.fromTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: '4px', color: '#1890ff' }}
              onClick={(e) => e.stopPropagation()}
            >
              <ExportOutlined style={{ fontSize: '12px' }} />
            </a>
          )}
        </RouteCell>
      ),
    },
    {
      title: 'To',
      key: 'to',
      render: (_, record) => (
        <RouteCell>
          <Avatar src={record.toChain.logo} size={24} style={{ backgroundColor: '#f0f0f0' }} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{record.toChain.name}</span>
          {record.toTxHash && record.toChain.blockExplorerUrl && (
            <a 
              href={`${record.toChain.blockExplorerUrl}/tx/${record.toTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: '4px', color: '#1890ff' }}
              onClick={(e) => e.stopPropagation()}
            >
              <ExportOutlined style={{ fontSize: '12px' }} />
            </a>
          )}
        </RouteCell>
      ),
    },
    {
      title: 'Amount',
      key: 'amount',
      render: (_, record) => (
        <div style={{ fontWeight: 600 }}>
          {record.amount} {record.token?.symbol || 'ETH'}
        </div>
      ),
    },
    {
      title: 'Time',
      key: 'time',
      render: (_, record) => {
        // Check if timestamp is in seconds or milliseconds
        const timestampMs = record.timestamp > 10000000000 ? record.timestamp : record.timestamp * 1000;
        const date = new Date(timestampMs);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return (
          <div>
            {`${year}-${month}-${day} ${hours}:${minutes}`}
          </div>
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Button
          type="link"
          icon={<RedoOutlined />}
          onClick={() => {
            // Navigate to bridge page with transaction parameters
            navigate('/bridge', {
              state: {
                fromChain: record.fromChain,
                toChain: record.toChain,
                token: record.token,
                amount: record.amount
              }
            });
          }}
        >
          Bridge Again
        </Button>
      ),
    },
  ];

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

  // Mobile view (simplified list)
  if (isMobile) {
    return (
      <PageContainer>
        <HistoryCard>
          <Title>Transactions</Title>

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
                <HeaderCell style={{ textAlign: 'right' }}>Action</HeaderCell>
              </TableHeader>

              {displayedTransactions.map((tx, index) => (
                <TransactionRow key={index}>
                  <div>
                    <StatusBadge style={{ marginBottom: '4px' }}>
                      <StatusIcon $status={tx.status}>
                        {getStatusIcon(tx.status)}
                      </StatusIcon>
                    </StatusBadge>
                    <DateText style={{ fontSize: '12px', color: '#6c757d' }}>
                      {formatDate(tx.timestamp)}
                    </DateText>
                  </div>

                  <div>
                    <AmountText>
                      {tx.amount} {tx.token?.symbol || 'TOKEN'}
                    </AmountText>
                    <ChainRoute style={{ marginTop: '4px' }}>
                      <ChainIcon 
                        src={tx.fromChain.logo} 
                        size={20}
                        style={{ backgroundColor: '#f0f0f0' }}
                      />
                      <ArrowRightOutlined style={{ fontSize: '12px', color: '#6c757d' }} />
                      <ChainIcon 
                        src={tx.toChain.logo} 
                        size={20}
                        style={{ backgroundColor: '#f0f0f0' }}
                      />
                    </ChainRoute>
                  </div>

                  <MobileActions>
                    <Button
                      type="primary"
                      size="small"
                      icon={<RedoOutlined />}
                      onClick={() => {
                        navigate('/bridge', {
                          state: {
                            fromChain: tx.fromChain,
                            toChain: tx.toChain,
                            token: tx.token,
                            amount: tx.amount
                          }
                        });
                      }}
                      style={{
                        background: '#ff6b35',
                        borderColor: '#ff6b35',
                        fontSize: '12px',
                        height: '32px',
                        padding: '0 12px'
                      }}
                    >
                      Again
                    </Button>
                  </MobileActions>
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
  }

  // Desktop view (full table)
  return (
    <PageContainer>
      <HistoryCard>
        <Title>Transactions</Title>
        {transactions.length === 0 ? (
          <EmptyState>
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>No transactions yet</p>
            <p style={{ fontSize: '14px' }}>Your bridge transactions will appear here</p>
          </EmptyState>
        ) : (
          <Table
            columns={columns}
            dataSource={transactions}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: undefined
            }}
            rowKey={(record) => record.fromTxHash || Math.random().toString()}
          />
        )}
      </HistoryCard>
    </PageContainer>
  );
};

export default Transactions;