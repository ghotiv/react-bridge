import React from 'react';
import { Card, Row, Col, Typography, Space, Tag, Button } from 'antd';
import { 
  GlobalOutlined, 
  CheckCircleOutlined, 
  LinkOutlined,
  RocketOutlined 
} from '@ant-design/icons';
import styled from 'styled-components';
import { useAppKitAccount, useAppKitState } from '@reown/appkit/react';
import { WalletButton } from '../components/WalletButton';
import { getChainIdFromCAIP } from '../utils/network';
import { NetworkSwitcher, NetworkInfo, ZkSyncSepoliaSwitch, PolygonAmoySwitch } from '../components/NetworkSwitcher';

const { Title, Text, Paragraph } = Typography;

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
`;

const NetworkCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const StatusBadge = styled.div<{ connected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.connected ? '#dcfce7' : '#fef3c7'};
  color: ${props => props.connected ? '#166534' : '#92400e'};
  border: 1px solid ${props => props.connected ? '#bbf7d0' : '#fde68a'};
`;

interface NetworkConfig {
  id: number;
  name: string;
  symbol: string;
  logo: string;
  color: string;
  description: string;
  features: string[];
  explorerUrl: string;
  faucetUrl?: string;
  isSpecial?: boolean;
}

const NETWORKS: NetworkConfig[] = [
  {
    id: 11155111,
    name: 'Ethereum Sepolia',
    symbol: 'ETH',
    logo: 'https://owlto.finance/icon/chain/Ethereum.png',
    color: '#627EEA',
    description: '以太坊官方测试网，最稳定的测试环境',
    features: ['EVM 兼容', 'Gas 费较高', '最成熟的生态'],
    explorerUrl: 'https://sepolia.etherscan.io',
    faucetUrl: 'https://sepoliafaucet.com/'
  },
  {
    id: 84532,
    name: 'Base Sepolia',
    symbol: 'ETH',
    logo: 'https://owlto.finance/icon/chain/Base.png',
    color: '#0052FF',
    description: 'Coinbase 推出的 L2 网络测试网',
    features: ['低 Gas 费', '快速确认', 'Coinbase 支持'],
    explorerUrl: 'https://sepolia.basescan.org',
    faucetUrl: 'https://bridge.base.org/deposit'
  },
  {
    id: 300,
    name: 'zkSync Era Sepolia',
    symbol: 'ETH',
    logo: 'https://owlto.finance/icon/chain/zkSync.png',
    color: '#8C8DFC',
    description: '零知识证明技术的 L2 扩容方案',
    features: ['零知识证明', '极低费用', '高 TPS'],
    explorerUrl: 'https://sepolia.explorer.zksync.io',
    faucetUrl: 'https://portal.zksync.io/faucet',
    isSpecial: true
  },
  {
    id: 80002,
    name: 'Polygon Amoy',
    symbol: 'MATIC',
    logo: 'https://owlto.finance/icon/chain/Polygon.png',
    color: '#8247E5',
    description: 'Polygon 新一代测试网络',
    features: ['高性能', 'MATIC 代币', '侧链架构'],
    explorerUrl: 'https://amoy.polygonscan.com',
    faucetUrl: 'https://faucet.polygon.technology/',
    isSpecial: true
  },
  {
    id: 97,
    name: 'BSC Testnet',
    symbol: 'BNB',
    logo: 'https://owlto.finance/icon/chain/BNB.png',
    color: '#F3BA2F',
    description: '币安智能链测试网络',
    features: ['BNB 代币', '快速出块', '低手续费'],
    explorerUrl: 'https://testnet.bscscan.com',
    faucetUrl: 'https://testnet.bnbchain.org/faucet-smart'
  }
];

const NetworkTest: React.FC = () => {
  const { isConnected } = useAppKitAccount();
  const { selectedNetworkId } = useAppKitState();
  const chainId = getChainIdFromCAIP(selectedNetworkId);

  const getNetworkSwitcher = (networkId: number) => {
    switch (networkId) {
      case 300:
        return <ZkSyncSepoliaSwitch />;
      case 80002:
        return <PolygonAmoySwitch />;
      default:
        return (
          <NetworkSwitcher 
            targetChainId={networkId}
            chainName={NETWORKS.find(n => n.id === networkId)?.name || ''}
          />
        );
    }
  };

  return (
    <PageContainer>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 32
      }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#1e293b' }}>
            🌐 测试网络中心
          </Title>
          <Text style={{ color: '#64748b', fontSize: 16 }}>
            Quickly switch to different testnets and experience Toky Finance bridging functionality
          </Text>
        </div>
        <WalletButton />
      </div>

      {/* Current Network Status */}
      <Card style={{ marginBottom: 32, borderRadius: 16 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>当前网络状态</Title>
            <NetworkInfo />
          </div>
          
          {isConnected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <RocketOutlined style={{ color: '#6366f1', fontSize: 24 }} />
              <Text style={{ color: '#10b981', fontWeight: 600 }}>
                钱包已连接
              </Text>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      {isConnected && (
        <Card style={{ marginBottom: 32, borderRadius: 16 }}>
          <Title level={4} style={{ marginBottom: 16 }}>🚀 快速切换</Title>
          <Space size="large" wrap>
            <div>
              <Text strong style={{ color: '#8C8DFC' }}>推荐体验 zkSync:</Text>
              <div style={{ marginTop: 8 }}>
                <ZkSyncSepoliaSwitch />
              </div>
            </div>
            <div>
              <Text strong style={{ color: '#8247E5' }}>或试试 Polygon:</Text>
              <div style={{ marginTop: 8 }}>
                <PolygonAmoySwitch />
              </div>
            </div>
          </Space>
        </Card>
      )}

      {/* Networks Grid */}
      <Title level={3} style={{ marginBottom: 24 }}>支持的测试网络</Title>
      
      <Row gutter={[24, 24]}>
        {NETWORKS.map((network) => {
          const isConnectedToThis = chainId === network.id;
          
          return (
            <Col xs={24} sm={12} lg={8} key={network.id}>
              <NetworkCard
                style={{ 
                  borderColor: isConnectedToThis ? network.color : undefined,
                  borderWidth: isConnectedToThis ? 2 : 1,
                }}
              >
                <div style={{ marginBottom: 16 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img 
                        src={network.logo} 
                        alt={network.name}
                        style={{ width: 32, height: 32, borderRadius: '50%' }}
                      />
                      <div>
                        <Title level={5} style={{ margin: 0, color: network.color }}>
                          {network.name}
                          {network.isSpecial && (
                            <Tag color="gold" style={{ marginLeft: 8, fontSize: 10 }}>
                              推荐
                            </Tag>
                          )}
                        </Title>
                        <Text style={{ fontSize: 12, color: '#64748b' }}>
                          Chain ID: {network.id}
                        </Text>
                      </div>
                    </div>
                    
                    <StatusBadge connected={isConnectedToThis}>
                      {isConnectedToThis ? (
                        <>
                          <CheckCircleOutlined />
                          已连接
                        </>
                      ) : (
                        <>
                          <GlobalOutlined />
                          未连接
                        </>
                      )}
                    </StatusBadge>
                  </div>

                  <Paragraph style={{ 
                    fontSize: 14, 
                    color: '#64748b',
                    marginBottom: 16
                  }}>
                    {network.description}
                  </Paragraph>

                  <div style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>
                      特性:
                    </Text>
                    <div style={{ marginTop: 6 }}>
                      {network.features.map((feature, index) => (
                        <Tag 
                          key={index}
                          style={{ 
                            marginBottom: 4,
                            fontSize: 11,
                            background: `${network.color}15`,
                            color: network.color,
                            border: `1px solid ${network.color}30`
                          }}
                        >
                          {feature}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: 16
                }}>
                  {isConnected && !isConnectedToThis && (
                    <div style={{ marginBottom: 12 }}>
                      {getNetworkSwitcher(network.id)}
                    </div>
                  )}
                  
                  <Space>
                    <Button 
                      type="link" 
                      size="small"
                      icon={<LinkOutlined />}
                      href={network.explorerUrl}
                      target="_blank"
                      style={{ padding: 0, fontSize: 12 }}
                    >
                      区块浏览器
                    </Button>
                    
                    {network.faucetUrl && (
                      <Button 
                        type="link" 
                        size="small"
                        href={network.faucetUrl}
                        target="_blank"
                        style={{ padding: 0, fontSize: 12, color: network.color }}
                      >
                        获取测试币
                      </Button>
                    )}
                  </Space>
                </div>
              </NetworkCard>
            </Col>
          );
        })}
      </Row>

      {/* Help Section */}
      <Card style={{ marginTop: 32, borderRadius: 16, background: '#f8fafc' }}>
        <Title level={4}>💡 使用提示</Title>
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <div>
              <Text strong>1. 连接钱包</Text>
              <br />
              <Text style={{ color: '#64748b', fontSize: 13 }}>
                首先点击右上角连接你的 MetaMask 钱包
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div>
              <Text strong>2. 切换网络</Text>
              <br />
              <Text style={{ color: '#64748b', fontSize: 13 }}>
                点击对应网络的切换按钮，自动添加并切换网络
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div>
              <Text strong>3. 获取测试币</Text>
              <br />
              <Text style={{ color: '#64748b', fontSize: 13 }}>
                通过水龙头链接获取各网络的测试代币
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div>
              <Text strong>4. 开始桥接</Text>
              <br />
              <Text style={{ color: '#64748b', fontSize: 13 }}>
                前往桥接页面体验跨链转账功能
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </PageContainer>
  );
};

export default NetworkTest;
