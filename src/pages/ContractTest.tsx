import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Typography, 
  Space, 
  Alert,
  message,
  Modal,
  Descriptions,
  Tag,
  Divider,
  Row,
  Col,
  Input,
  Select,
} from 'antd';
import { 
  ExperimentOutlined,
  CodeOutlined,
  SendOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { useAppKitAccount, useAppKitState } from '@reown/appkit/react';
import { getChainIdFromCAIP } from '../utils/network';
import { WalletButton } from '../components/WalletButton';
import { NetworkSwitcher, NetworkInfo } from '../components/NetworkSwitcher';
import { getTokyDepositContract, TOKY_DEPOSIT_ABI } from '../contracts/TokyDeposit';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const PageContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  min-height: calc(100vh - 80px);
`;

const TestCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  margin-bottom: 24px;
  
  .ant-card-body {
    padding: 32px;
  }
`;

const ParameterCard = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
`;

const ContractTest: React.FC = () => {
  const { isConnected, address } = useAppKitAccount();
  const { selectedNetworkId } = useAppKitState();
  const chainId = getChainIdFromCAIP(selectedNetworkId);
  const [loading, setLoading] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  // 基于图片中的参数设置默认值
  const [testParams, setTestParams] = useState({
    vault: "0xbA37D7ed1cFF3dDab5f23ee99525291dcA00999D",
    recipient: "0x000000000000000000000000d45f62ae86e01da43a162aa3cd320fca3c1b178d",
    inputToken: "0x0c0CB7D85a0fADD43Be91656cAF933Fd18e98168", // MBT Token
    inputAmount: "1000000000000000", // 0.001 ETH in wei
    destinationChainId: "84532", // Base Sepolia
    message: "0x68656c6c6f" // "hello" 的十六进制编码
  });

  // zkSync Sepolia 网络配置
  const ZK_SYNC_SEPOLIA = {
    chainId: 300,
    name: "zkSync Era Sepolia",
    symbol: "ETH",
    rpcUrl: "https://sepolia.era.zksync.dev",
    blockExplorerUrl: "https://sepolia.explorer.zksync.io",
    // 从配置文件中获取实际的合约地址
    contractAddress: getTokyDepositContract(300) || "0x9AA8668E11B1e9670B4DC8e81add17751bA1a4Ea"
  };

  const handleDirectContractCall = async () => {
    if (!isConnected) {
      message.error('请先连接钱包');
      return;
    }

    if (chainId !== 300) {
      message.warning('请切换到 zkSync Era Sepolia 测试网');
      return;
    }

    setLoading(true);
    
    try {
      message.info('🔄 正在调用合约...');
      
      // 检查钱包
      if (!(window as any).ethereum) {
        message.error('未检测到钱包');
        return;
      }

      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      
      // 使用完整的合约ABI
      const CONTRACT_ABI = TOKY_DEPOSIT_ABI;
      
      // 创建合约实例
      const contract = new ethers.Contract(
        ZK_SYNC_SEPOLIA.contractAddress, 
        CONTRACT_ABI, 
        signer
      );
      
      console.log('📋 调用参数:', testParams);
      
      // 准备交易参数
      const txParams: any = {
        gasLimit: 500000, // 设置足够的gas限制
      };
      
      // 如果是ETH转账，添加value字段
      if (testParams.inputToken === '0x0000000000000000000000000000000000000000') {
        txParams.value = testParams.inputAmount;
      }
      
      // 调用合约
      const tx = await contract.deposit(
        testParams.vault,
        testParams.recipient,
        testParams.inputToken,
        testParams.inputAmount,
        parseInt(testParams.destinationChainId),
        testParams.message,
        txParams
      );

      console.log('✅ 交易已发送:', tx.hash);
      setLastTxHash(tx.hash);
      message.success(`🎉 交易已发送！哈希: ${tx.hash.slice(0, 10)}...`);
      
      // 显示交易详情
      Modal.info({
        title: '✅ 合约调用成功',
        width: 700,
        content: (
          <div style={{ margin: '20px 0' }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="交易哈希">
                <a 
                  href={`${ZK_SYNC_SEPOLIA.blockExplorerUrl}/tx/${tx.hash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#0ea5e9' }}
                >
                  {tx.hash}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="合约地址">{ZK_SYNC_SEPOLIA.contractAddress}</Descriptions.Item>
              <Descriptions.Item label="Vault地址">{testParams.vault}</Descriptions.Item>
              <Descriptions.Item label="接收者">{testParams.recipient}</Descriptions.Item>
              <Descriptions.Item label="代币地址">{testParams.inputToken}</Descriptions.Item>
              <Descriptions.Item label="转账数量">{testParams.inputAmount} wei</Descriptions.Item>
              <Descriptions.Item label="目标链ID">{testParams.destinationChainId}</Descriptions.Item>
              <Descriptions.Item label="消息">{testParams.message}</Descriptions.Item>
            </Descriptions>
            
            <div style={{ 
              marginTop: 16, 
              padding: 12, 
              background: '#f0f9ff', 
              borderRadius: 6 
            }}>
              <Text style={{ color: '#0ea5e9' }}>
                💡 交易正在区块链上确认中，请在区块浏览器中查看详情
              </Text>
            </div>
          </div>
        ),
      });

      // 等待交易确认
      try {
        message.info('⏳ 等待交易确认...');
        const receipt = await tx.wait();
        console.log('🎯 交易已确认:', receipt);
        message.success('🎉 交易已确认！');
      } catch (waitError) {
        console.warn('等待确认超时，但交易可能仍在处理中:', waitError);
        message.warning('交易确认超时，请在区块浏览器中检查状态');
      }

    } catch (error: any) {
      console.error('❌ 合约调用失败:', error);
      
      let errorMsg = '合约调用失败';
      if (error.code === 'ACTION_REJECTED') {
        errorMsg = '用户取消了交易';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMsg = '余额不足，请确保账户有足够的ETH';
      } else if (error.message?.includes('execution reverted')) {
        errorMsg = '合约执行失败，请检查参数和权限';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      message.error(`❌ ${errorMsg}`);
      
      Modal.error({
        title: '❌ 合约调用失败',
        content: (
          <div style={{ margin: '20px 0' }}>
            <Alert
              message={errorMsg}
              description={`错误代码: ${error.code || 'UNKNOWN'}`}
              type="error"
              showIcon
            />
            
            <div style={{ 
              marginTop: 16, 
              padding: 12, 
              background: '#fef3c7', 
              borderRadius: 6 
            }}>
              <Text style={{ color: '#92400e' }}>
                💡 请检查网络连接、钱包余额和合约地址是否正确
              </Text>
            </div>
          </div>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleParameterChange = (field: string, value: string) => {
    setTestParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <PageContainer>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24
      }}>
        <Title level={2} style={{ margin: 0, color: '#1e293b' }}>
          <ExperimentOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
          合约调用测试
        </Title>
        <WalletButton />
      </div>

      {/* Network Status */}
      <TestCard>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16
        }}>
          <NetworkInfo />
          {chainId !== 300 && isConnected && (
            <NetworkSwitcher 
              targetChainId={300} 
              chainName="zkSync Era Sepolia"
              onSwitchSuccess={() => {
                message.success('网络切换成功！');
              }}
            />
          )}
        </div>
        
        {isConnected ? (
          chainId === 300 ? (
            <Alert
              message="✅ 网络连接正常"
              description={`已连接到 zkSync Era Sepolia 测试网 (链ID: ${chainId})`}
              type="success"
              showIcon
            />
          ) : (
            <Alert
              message="⚠️ 请切换网络"
              description="请切换到 zkSync Era Sepolia 测试网络 (链ID: 300) 以进行测试"
              type="warning"
              showIcon
            />
          )
        ) : (
          <Alert
            message="🔌 请连接钱包"
            description="需要连接钱包才能进行合约测试"
            type="info"
            showIcon
          />
        )}
      </TestCard>

      {/* Contract Information */}
      <TestCard 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <InfoCircleOutlined style={{ color: '#0ea5e9' }} />
            <span>Deposit 函数测试</span>
          </div>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Paragraph>
              此页面用于测试 TokyDeposit 合约的 deposit 函数调用。
              参数基于提供的截图数据进行配置，可以修改后测试不同场景。
            </Paragraph>
            
            <Alert
              message="函数签名"
              description="deposit(address vault, bytes32 recipient, address inputToken, uint256 inputAmount, uint256 destinationChainId, bytes message)"
              type="info"
              style={{ marginTop: 16 }}
            />
          </div>

          <Divider>测试参数配置</Divider>

          {/* 参数配置 */}
          <ParameterCard>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Text strong>Vault 地址:</Text>
                <Input
                  value={testParams.vault}
                  onChange={(e) => handleParameterChange('vault', e.target.value)}
                  placeholder="Vault 合约地址"
                  style={{ marginTop: 4 }}
                />
              </Col>
              
              <Col span={24}>
                <Text strong>接收者 (bytes32):</Text>
                <Input
                  value={testParams.recipient}
                  onChange={(e) => handleParameterChange('recipient', e.target.value)}
                  placeholder="接收者地址 (32字节格式)"
                  style={{ marginTop: 4 }}
                />
              </Col>
              
              <Col span={12}>
                <Text strong>代币地址:</Text>
                <Select
                  value={testParams.inputToken}
                  onChange={(value) => handleParameterChange('inputToken', value)}
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <Option value="0x0000000000000000000000000000000000000000">ETH (原生代币)</Option>
                  <Option value="0x0c0CB7D85a0fADD43Be91656cAF933Fd18e98168">MBT Token</Option>
                </Select>
              </Col>
              
              <Col span={12}>
                <Text strong>转账数量 (wei):</Text>
                <Input
                  value={testParams.inputAmount}
                  onChange={(e) => handleParameterChange('inputAmount', e.target.value)}
                  placeholder="数量 (wei)"
                  style={{ marginTop: 4 }}
                />
              </Col>
              
              <Col span={12}>
                <Text strong>目标链 ID:</Text>
                <Select
                  value={testParams.destinationChainId}
                  onChange={(value) => handleParameterChange('destinationChainId', value)}
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <Option value="84532">Base Sepolia (84532)</Option>
                  <Option value="11155111">Ethereum Sepolia (11155111)</Option>
                  <Option value="421614">Arbitrum Sepolia (421614)</Option>
                </Select>
              </Col>
              
              <Col span={12}>
                <Text strong>消息 (bytes):</Text>
                <Input
                  value={testParams.message}
                  onChange={(e) => handleParameterChange('message', e.target.value)}
                  placeholder="消息的十六进制编码"
                  style={{ marginTop: 4 }}
                />
              </Col>
            </Row>
          </ParameterCard>

          {/* 当前参数预览 */}
          <div>
            <Text strong style={{ fontSize: 16 }}>📋 当前测试参数:</Text>
            <Descriptions 
              column={1} 
              bordered 
              size="small" 
              style={{ marginTop: 8 }}
            >
              <Descriptions.Item label="Vault">{testParams.vault}</Descriptions.Item>
              <Descriptions.Item label="Recipient">{testParams.recipient}</Descriptions.Item>
              <Descriptions.Item label="Token">
                {testParams.inputToken === '0x0000000000000000000000000000000000000000' ? (
                  <Tag color="blue">ETH (原生代币)</Tag>
                ) : (
                  <Tag color="green">MBT Token</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">{testParams.inputAmount} wei</Descriptions.Item>
              <Descriptions.Item label="Destination Chain">
                <Tag color="purple">{testParams.destinationChainId}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Message">{testParams.message}</Descriptions.Item>
            </Descriptions>
          </div>

          {/* 执行按钮 */}
          <div style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              onClick={handleDirectContractCall}
              loading={loading}
              disabled={!isConnected || chainId !== 300}
              style={{ 
                height: 56,
                fontSize: 16,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 15px 0 rgba(116, 75, 162, 0.3)'
              }}
            >
              {loading ? '执行中...' : '🚀 执行 Deposit 调用'}
            </Button>
          </div>

          {/* 最近交易 */}
          {lastTxHash && (
            <div style={{ 
              marginTop: 24,
              padding: 16,
              background: '#f0f9ff',
              borderRadius: 12,
              border: '1px solid #0ea5e9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <CheckCircleOutlined style={{ color: '#10b981', marginRight: 8 }} />
                <Text strong>最近的交易:</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text code style={{ fontSize: 12 }}>{lastTxHash}</Text>
                <Button 
                  type="link" 
                  size="small"
                  href={`${ZK_SYNC_SEPOLIA.blockExplorerUrl}/tx/${lastTxHash}`}
                  target="_blank"
                >
                  在区块浏览器中查看
                </Button>
              </div>
            </div>
          )}
        </Space>
      </TestCard>

      {/* 使用说明 */}
      <TestCard 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CodeOutlined style={{ color: '#10b981' }} />
            <span>使用说明</span>
          </div>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="测试步骤"
            description={
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                <li>确保钱包已连接并切换到 zkSync Era Sepolia 测试网</li>
                <li>检查钱包中有足够的 ETH 用于支付 gas 费用</li>
                <li>根据需要修改测试参数</li>
                <li>点击"执行 Deposit 调用"按钮</li>
                <li>在钱包中确认交易</li>
                <li>等待交易确认并查看结果</li>
              </ol>
            }
            type="info"
            showIcon
          />
          
          <Alert
            message="注意事项"
            description="此为测试环境，使用的是测试网代币。请确保合约地址正确，避免在主网上进行测试。"
            type="warning"
            showIcon
          />
        </Space>
      </TestCard>
    </PageContainer>
  );
};

export default ContractTest;
