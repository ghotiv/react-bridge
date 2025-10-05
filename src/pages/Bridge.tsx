import React, { useState, useEffect } from 'react';
import { Input, Button, message, Switch, Modal, Avatar, Tooltip } from 'antd';
import { SwapOutlined, CloseOutlined, EditOutlined, UnorderedListOutlined, ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { useAppKitAccount, useAppKitProvider, useAppKitNetwork } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit/react';
import { TokenGroupSelector } from '../components/TokenGroupSelector';
import { ChainInfoSelector } from '../components/ChainInfoSelector';
import { TokenGroup, ChainInfo } from '../types/bridge';
import { bridgeApi } from '../api/bridge';
import { useTransactions } from '../hooks/useTransactions';
import { networks } from '../config';

const PageContainer = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 140px);
  
  @media (max-width: 768px) {
    padding: 16px;
    min-height: calc(100vh - 180px);
  }
`;

const BridgeCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 20px;
  }
`;

const HistoryButton = styled(Button)`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e9ecef;
  background: white;
  padding: 0;
  flex-shrink: 0;
  
  &:hover {
    background: #f8f9fa !important;
    border-color: #dee2e6 !important;
  }
  
  .anticon {
    font-size: 20px;
    color: #6c757d;
  }
`;

const Section = styled.div`
  background: #f8f9fa;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
`;

const AmountInput = styled(Input)`
  font-size: 32px;
  font-weight: 600;
  text-align: right;
  border: none;
  background: transparent;
  padding: 0;
  color: #212529;
  
  &::placeholder {
    color: #dee2e6;
  }
  
  &:focus {
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #6c757d;
`;


const SwapButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: -8px 0;
  position: relative;
  z-index: 1;
`;

const SwapButton = styled(Button)`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 3px solid #f8f9fa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  &:hover {
    background: #f8f9fa;
    border-color: #e9ecef;
  }
  
  .anticon {
    font-size: 20px;
  }
`;

const ActionSection = styled.div`
  margin-top: 16px;
`;

const SendToAnotherAddress = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 16px;
  font-size: 12px;
  color: #6c757d;
  cursor: pointer;
  
  &:hover {
    color: #212529;
  }
`;

const BridgeButton = styled(Button)`
  width: 100%;
  height: 56px;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 700;
  background: #ff6b35 !important;
  border: none !important;
  color: white !important;
  
  &:hover:not(:disabled) {
    background: #ff6b35 !important;
    color: white !important;
    border: none !important;
  }
  
  &:focus:not(:disabled) {
    background: #ff6b35 !important;
    color: white !important;
    border: none !important;
  }
  
  &:active:not(:disabled) {
    background: #ff6b35 !important;
    color: white !important;
    border: none !important;
  }
  
  &:disabled {
    background: #e9ecef !important;
    color: #adb5bd !important;
    border: none !important;
  }
  
  @media (max-width: 768px) {
    height: 52px;
    font-size: 16px;
  }
`;

const FeeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  font-size: 14px;
  color: #6c757d;
`;

const EstimatedAmount = styled.div`
  font-size: 32px;
  font-weight: 600;
  text-align: right;
  color: #adb5bd;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const Bridge: React.FC = () => {
  const location = useLocation();
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>('eip155');
  const { chainId, switchNetwork } = useAppKitNetwork();
  const { transactions } = useTransactions();
  
  const [selectedTokenGroup, setSelectedTokenGroup] = useState<TokenGroup | null>(null);
  const [availableChains, setAvailableChains] = useState<ChainInfo[]>([]);
  const [fromChainInfo, setFromChainInfo] = useState<ChainInfo | null>(null);
  const [toChainInfo, setToChainInfo] = useState<ChainInfo | null>(null);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [customRecipient, setCustomRecipient] = useState('');
  const [sendToAnother, setSendToAnother] = useState(false);
  const [loadingChains, setLoadingChains] = useState(false);
  const [showPercentButtons, setShowPercentButtons] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [tempAddress, setTempAddress] = useState('');
  const [balance, setBalance] = useState<string>('--');
  const [showHistory, setShowHistory] = useState(false);

  // Format address to short version
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    if (addr.length < 10) return addr;
    return `${addr.slice(0, 5)}...${addr.slice(-5)}`;
  };

  // Validate EVM address
  const isValidEVMAddress = (addr: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  // Auto-fill recipient address
  useEffect(() => {
    if (address) {
      if (!sendToAnother) {
        setRecipient(address);
      } else if (customRecipient) {
        setRecipient(customRecipient);
      }
    }
  }, [address, sendToAnother, customRecipient]);

  // Handle "Bridge Again" parameters from Transactions page
  useEffect(() => {
    interface BridgeAgainState {
      fromChain?: { id: number; name: string };
      toChain?: { id: number; name: string };
      token?: { symbol: string };
      amount?: string;
    }
    const state = location.state as BridgeAgainState | null;
    if (state?.fromChain && state?.toChain && state?.token && state?.amount) {
      const loadBridgeAgainParams = async () => {
        try {
          const groups = await bridgeApi.getTokenGroups();
          const matchingGroup = groups.find(g => g.token_group === state.token!.symbol);
          
          if (!matchingGroup) {
            return;
          }
          
          const chains = await bridgeApi.getChainsByTokenGroup(matchingGroup.token_group);
          const fromChain = chains.find(c => c.chain_id === state.fromChain!.id);
          const toChain = chains.find(c => c.chain_id === state.toChain!.id);
          
          setSelectedTokenGroup(matchingGroup);
          setAvailableChains(chains);
          
          setTimeout(() => {
            if (fromChain) {
              setFromChainInfo(fromChain);
            }
            
            if (toChain) {
              setToChainInfo(toChain);
            }
            
            setAmount(state.amount);
          }, 100);
        } catch (error) {
          console.error('Failed to load bridge again params:', error);
        }
      };
      
      loadBridgeAgainParams();
    }
  }, [location.state]);

  // Set default token to ETH (skip if coming from Bridge Again)
  useEffect(() => {
    interface BridgeAgainCheck {
      fromChain?: unknown;
      token?: unknown;
    }
        const state = location.state as BridgeAgainCheck | null;
        const hasBridgeAgainState = state && state.fromChain && state.token;
        
        if (hasBridgeAgainState) {
          return;
        }
    
    const fetchDefaultToken = async () => {
      try {
        const groups = await bridgeApi.getTokenGroups();
        const ethGroup = groups.find(g => g.token_group === 'ETH');
        if (ethGroup && !selectedTokenGroup) {
          setSelectedTokenGroup(ethGroup);
        }
      } catch (error) {
        console.error('Failed to fetch token groups:', error);
      }
    };
    fetchDefaultToken();
  }, [selectedTokenGroup, location.state]);

  // Fetch chains by token group (skip if Bridge Again is loading)
  useEffect(() => {
        const hasBridgeAgainState = location.state && 
          (location.state as { fromChain?: unknown }).fromChain;
        
        if (hasBridgeAgainState) {
          return;
        }
    
    const fetchChainsByTokenGroup = async () => {
      if (!selectedTokenGroup) {
        setAvailableChains([]);
        setFromChainInfo(null);
        setToChainInfo(null);
        setBalance('--');
        return;
      }
      setLoadingChains(true);
      try {
        const chains = await bridgeApi.getChainsByTokenGroup(selectedTokenGroup.token_group);
        setAvailableChains(chains);
        setFromChainInfo(null);
        setToChainInfo(null);
        setBalance('--');
      } catch (error) {
        console.error('Failed to fetch chain data:', error);
        message.error('Failed to get supported chains');
      } finally {
        setLoadingChains(false);
      }
    };
    fetchChainsByTokenGroup();
  }, [selectedTokenGroup, location.state]);

  // Fetch balance when from chain or token changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (!fromChainInfo || !selectedTokenGroup || !address || !walletProvider) {
        setBalance('--');
        return;
      }

      try {
        const { ethers } = await import('ethers');
        
        // Create provider using RPC URL from chain info
        const provider = new ethers.JsonRpcProvider(fromChainInfo.rpc_url);
        
        // Get deposit args to get token address
        const depositArgs = await bridgeApi.getDepositArgs(
          selectedTokenGroup.token_group,
          fromChainInfo.chain_id,
          fromChainInfo.chain_id, // Use same chain for getting token address
          '1',
          address
        );

        const tokenAddress = depositArgs.inputToken;
        
        let balanceWei: bigint;
        
        // Check if it's native token (ETH)
        if (tokenAddress === '0x0000000000000000000000000000000000000000') {
          // Get native token balance (ETH)
          balanceWei = await provider.getBalance(address);
        } else {
          // Get ERC20 token balance
          const ERC20_ABI = [
            'function balanceOf(address owner) view returns (uint256)'
          ];
          const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          balanceWei = await tokenContract.balanceOf(address);
        }

        // Convert from wei to human readable
        const balanceNum = parseFloat(ethers.formatEther(balanceWei));
        setBalance(balanceNum.toFixed(4));
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        setBalance('0.0000');
      }
    };

    fetchBalance();
  }, [fromChainInfo, selectedTokenGroup, address, walletProvider]);

  const swapChains = () => {
    const temp = fromChainInfo;
    setFromChainInfo(toChainInfo);
    setToChainInfo(temp);
  };

  const handleToggleSendToAnother = () => {
    if (sendToAnother && customRecipient) {
      // If already has custom address, clear it
      setCustomRecipient('');
      setSendToAnother(false);
    } else if (!sendToAnother) {
      // Open modal to set address
      setTempAddress(customRecipient || '');
      setShowAddressModal(true);
    }
  };

  const handleEditAddress = () => {
    setTempAddress(customRecipient || '');
    setShowAddressModal(true);
  };

  const handleSaveAddress = () => {
    if (!tempAddress) {
      // Allow saving empty address to clear it
      setCustomRecipient('');
      setSendToAnother(false);
      setShowAddressModal(false);
      message.success('Recipient address cleared');
      return;
    }
    if (!isValidEVMAddress(tempAddress)) {
      message.error('Invalid Ethereum address');
      return;
    }
    setCustomRecipient(tempAddress);
    setSendToAnother(true);
    setShowAddressModal(false);
    message.success('Recipient address saved');
  };

  const handleCancelAddressModal = () => {
    setTempAddress('');
    setShowAddressModal(false);
  };

  const handleBridge = async () => {
    if (!selectedTokenGroup || !fromChainInfo || !toChainInfo || !amount || !recipient) {
      message.error('Please fill in all required fields');
      return;
    }

    if (!isConnected || !walletProvider) {
      message.error('Please connect your wallet first');
      return;
    }

    // 检查当前网络是否匹配源链
    if (chainId !== fromChainInfo.chain_id) {
      message.warning({
        content: `Please switch to ${fromChainInfo.alias_name} network`,
        duration: 3,
      });
      
      try {
        // 查找目标网络配置
        const targetNetwork = networks.find((net) => net.id === fromChainInfo.chain_id);
        
        if (!targetNetwork) {
          message.error(`Network ${fromChainInfo.alias_name} is not configured`);
          return;
        }

        // 使用 AppKit 的 switchNetwork 方法（兼容移动端和桌面端）
        await switchNetwork(targetNetwork);
        message.success(`Switched to ${fromChainInfo.alias_name}`);
        
        // 给网络切换一点时间
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: unknown) {
        console.error('Network switch failed:', error);
        
        const err = error as { code?: number; message?: string };
        
        // 处理用户拒绝切换
        if (err.code === 4001 || err.message?.includes('rejected')) {
          message.error('Network switch was cancelled');
        } else if (err.code === 4902) {
          message.error(`${fromChainInfo.alias_name} network is not added to your wallet. Please add it manually.`);
        } else {
          message.error('Please manually switch to the correct network');
        }
        return;
      }
    }

    try {
      message.info('💳 Initiating bridge transaction...');
      
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      
      const contractAddress = fromChainInfo.contract_deposit;
      if (!contractAddress) {
        message.error(`Chain ${fromChainInfo.alias_name} does not support deposit`);
        return;
      }

      const depositArgs = await bridgeApi.getDepositArgs(
        selectedTokenGroup.token_group,
        fromChainInfo.chain_id,
        toChainInfo.chain_id,
        amount,
        recipient
      );

      const { TOKY_DEPOSIT_ABI } = await import('../contracts/TokyDeposit');
      const contract = new ethers.Contract(contractAddress, TOKY_DEPOSIT_ABI, signer);
      
      const vaultAddress = depositArgs.vault;
      const tokenAddress = depositArgs.inputToken;
      const recipientBytes32 = ethers.zeroPadValue(depositArgs.recipient, 32);
      const amountWei = BigInt(depositArgs.inputAmount);
      const toChainId = depositArgs.destinationChainId;
      const messageBytes = depositArgs.message && depositArgs.message.trim() !== "" ? depositArgs.message : "0x";
      
      let tx;
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        tx = await contract.deposit(
          vaultAddress,
          recipientBytes32,
          tokenAddress,
          amountWei,
          toChainId,
          messageBytes,
          { value: amountWei }
        );
      } else {
        tx = await contract.deposit(
          vaultAddress,
          recipientBytes32,
          tokenAddress,
          amountWei,
          toChainId,
          messageBytes
        );
      }

      message.success(`Transaction sent! Hash: ${tx.hash.slice(0, 10)}...`);
      
      await tx.wait();
      message.success('Transaction confirmed!');
      
      // Clear form
      setAmount('');
    } catch (error: unknown) {
      console.error('Bridge failed:', error);
      const err = error as { code?: string; message?: string };
      
      let errorMsg = 'Bridge transaction failed';
      if (err.code === 'ACTION_REJECTED') {
        errorMsg = 'User cancelled transaction';
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      message.error(errorMsg);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
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

  return (
    <PageContainer>
      <BridgeCard>
        {/* Token Selection */}
        <Section onMouseEnter={(e) => e.stopPropagation()} onMouseLeave={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <TokenGroupSelector 
              selectedTokenGroup={selectedTokenGroup}
              onSelectTokenGroup={setSelectedTokenGroup}
              placeholder="Choose token"
            />
            <Tooltip 
              title="Transactions" 
              placement="left"
              color="#108ee9"
            >
              <HistoryButton 
                icon={<UnorderedListOutlined />}
                onClick={() => setShowHistory(!showHistory)}
              />
            </Tooltip>
          </div>
        </Section>

        {/* From Chain & Amount */}
        <Section
          onMouseEnter={() => setShowPercentButtons(true)}
          onMouseLeave={() => setShowPercentButtons(false)}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', minHeight: '32px' }}>
            <div style={{ fontSize: '13px', color: '#6c757d', fontWeight: 500 }}>From</div>
            {showPercentButtons && balance !== '--' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button size="small" onClick={() => setAmount((parseFloat(balance) * 0.25).toFixed(4))}>25%</Button>
                <Button size="small" onClick={() => setAmount((parseFloat(balance) * 0.5).toFixed(4))}>50%</Button>
                <Button size="small" onClick={() => setAmount((parseFloat(balance) * 0.75).toFixed(4))}>75%</Button>
                <Button size="small" onClick={() => setAmount(balance)}>MAX</Button>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ChainInfoSelector
              selectedChainInfo={fromChainInfo}
              onSelectChainInfo={setFromChainInfo}
              availableChains={availableChains}
              placeholder="Select chain"
              loading={loadingChains}
            />
            <AmountInput
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!selectedTokenGroup || !fromChainInfo}
              style={{ flex: 1 }}
            />
          </div>
          <BalanceRow>
            <span>{balance} {selectedTokenGroup?.token_group || 'TOKEN'}</span>
          </BalanceRow>
        </Section>

        {/* Swap Button */}
        <SwapButtonWrapper>
          <SwapButton 
            icon={<SwapOutlined rotate={90} />} 
            onClick={swapChains}
            disabled={!fromChainInfo || !toChainInfo}
          />
        </SwapButtonWrapper>

        {/* To Chain */}
        <Section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', minHeight: '32px' }}>
            <div style={{ fontSize: '13px', color: '#6c757d', fontWeight: 500 }}>To</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ChainInfoSelector
              selectedChainInfo={toChainInfo}
              onSelectChainInfo={setToChainInfo}
              availableChains={availableChains}
              placeholder="Select chain"
              loading={loadingChains}
            />
            <EstimatedAmount style={{ flex: 1 }}>
              {amount || '0'}
            </EstimatedAmount>
          </div>
          <BalanceRow>
            <span>0 {selectedTokenGroup?.token_group || 'TOKEN'}</span>
            <span>${amount ? (parseFloat(amount) * 3.46).toFixed(2) : '0'}</span>
          </BalanceRow>
        </Section>

        {/* Actions */}
        <ActionSection>
          <SendToAnotherAddress>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={sendToAnother ? handleToggleSendToAnother : handleToggleSendToAnother}>
              <Switch checked={sendToAnother} size="small" onChange={handleToggleSendToAnother} />
              <span>Send to another address</span>
            </div>
            {sendToAnother && customRecipient && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span 
                  onClick={handleEditAddress}
                  style={{ 
                    color: '#000', 
                    fontWeight: 600, 
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    cursor: 'pointer'
                  }}
                >{formatAddress(customRecipient)}</span>
                <Button 
                  size="small" 
                  onClick={handleEditAddress}
                  icon={<EditOutlined />}
                  style={{ border: 'none', padding: '2px', fontSize: '12px' }}
                />
              </div>
            )}
          </SendToAnotherAddress>

          <BridgeButton
            onClick={handleBridge}
            disabled={!isConnected || !selectedTokenGroup || !fromChainInfo || !toChainInfo || !amount || parseFloat(amount) <= 0}
          >
            Bridge
          </BridgeButton>

          <FeeRow>
            <span>Total fee ⓘ $1.54</span>
            <span>⏱ ~ 22 sec</span>
          </FeeRow>
        </ActionSection>
      </BridgeCard>

      {/* Address Modal */}
      <Modal
        title="Send to"
        open={showAddressModal}
        onCancel={handleCancelAddressModal}
        footer={null}
        closeIcon={<CloseOutlined />}
        centered
      >
        <div style={{ marginBottom: '24px' }}>
          <Input
            placeholder="Paste recipient address"
            value={tempAddress}
            onChange={(e) => setTempAddress(e.target.value)}
            size="large"
            style={{ marginBottom: '16px' }}
            allowClear
          />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button 
            size="large" 
            onClick={handleCancelAddressModal}
            style={{ flex: 1, height: '48px', borderRadius: '12px' }}
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            size="large" 
            onClick={handleSaveAddress}
            style={{ 
              flex: 1, 
              height: '48px', 
              borderRadius: '12px',
              background: '#00a389',
              borderColor: '#00a389'
            }}
          >
            Save
          </Button>
        </div>
        <div style={{ marginTop: '16px', fontSize: '14px', color: '#6c757d', textAlign: 'center' }}>
          Note that only <span style={{ textDecoration: 'underline' }}>Ethereum</span> addresses are valid.
        </div>
      </Modal>

      {/* History Modal */}
      <Modal
        title="History"
        open={showHistory}
        onCancel={() => setShowHistory(false)}
        footer={null}
        closeIcon={<CloseOutlined />}
        centered
        width={600}
      >
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6c757d' }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No transactions yet</p>
            <p style={{ fontSize: '14px' }}>Your bridge transactions will appear here</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr', gap: '16px', padding: '12px 0', borderBottom: '1px solid #e9ecef' }}>
                <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>Date</div>
                <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>Amount</div>
                <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>From/To</div>
              </div>
            </div>

            {transactions.slice(0, 5).map((tx, index) => (
              <div 
                key={index}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1.5fr 1.5fr', 
                  gap: '16px', 
                  padding: '16px 0', 
                  borderBottom: index < 4 ? '1px solid #f8f9fa' : 'none',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: tx.status === 'completed' ? '#ff6b35' : '#ffc107',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px'
                  }}>
                    {getStatusIcon(tx.status)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#212529', fontWeight: 500 }}>
                    {formatDate(tx.timestamp)}
                  </div>
                </div>

                <div style={{ fontSize: '15px', color: '#212529', fontWeight: 600 }}>
                  {tx.amount} {tx.token?.symbol || 'TOKEN'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar 
                    src={tx.fromChain.logo} 
                    size={24}
                    style={{ backgroundColor: '#f0f0f0' }}
                  />
                  <ArrowRightOutlined style={{ fontSize: '14px', color: '#6c757d' }} />
                  <Avatar 
                    src={tx.toChain.logo} 
                    size={24}
                    style={{ backgroundColor: '#f0f0f0' }}
                  />
                </div>
              </div>
            ))}

            {transactions.length > 5 && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Button 
                  type="link" 
                  onClick={() => {
                    setShowHistory(false);
                    window.location.href = '/transactions';
                  }}
                  style={{ fontSize: '16px', fontWeight: 600 }}
                >
                  View Full History
                </Button>
              </div>
            )}
          </>
        )}
      </Modal>
    </PageContainer>
  );
};

export default Bridge;
