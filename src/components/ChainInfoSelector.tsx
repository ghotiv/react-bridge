import React from 'react';
import { Select, Avatar, Space, Typography } from 'antd';
import { ChainInfo } from '../types/bridge';

const { Text } = Typography;

interface ChainInfoSelectorProps {
  availableChains: ChainInfo[];
  selectedChainInfo: ChainInfo | null;
  onSelectChainInfo: (chain: ChainInfo | null) => void;
  placeholder?: string;
  loading?: boolean;
}

export const ChainInfoSelector: React.FC<ChainInfoSelectorProps> = ({
  availableChains = [],
  selectedChainInfo,
  onSelectChainInfo,
  placeholder = "Select blockchain",
  loading = false,
}) => {
  const handleSelect = (value: number) => {
    const chain = availableChains.find(c => c.chain_id === value);
    onSelectChainInfo(chain || null);
  };

  const handleClear = () => {
    onSelectChainInfo(null);
  };

  return (
    <Select
      value={selectedChainInfo?.chain_id}
      placeholder={placeholder}
      onChange={handleSelect}
      onClear={handleClear}
      allowClear
      disabled={loading}
      loading={loading}
      style={{ width: 'auto', minWidth: '120px' }}
      popupMatchSelectWidth={false}
      dropdownStyle={{ minWidth: '350px' }}
      size="large"
      optionLabelProp="label"
    >
      {availableChains.map((chain) => (
        <Select.Option 
          key={chain.chain_id} 
          value={chain.chain_id}
          label={
            <Space>
              <Avatar 
                src={chain.chain_logo_url} 
                size={20}
                style={{ backgroundColor: '#f0f0f0' }}
              />
              <Text>{chain.alias_name}</Text>
            </Space>
          }
        >
          <Space>
            <Avatar 
              src={chain.chain_logo_url} 
              size={24}
              style={{ backgroundColor: '#f0f0f0' }}
            />
            <div>
              <Text strong>{chain.alias_name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Chain ID: {chain.chain_id}
              </Text>
            </div>
          </Space>
        </Select.Option>
      ))}
    </Select>
  );
};
