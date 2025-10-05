import React from 'react';
import { Select, Avatar } from 'antd';
import { Chain } from '../types/bridge';

interface ChainSelectorProps {
  chains: Chain[];
  selectedChain: Chain | null;
  onSelect: (chain: Chain) => void;
  placeholder?: string;
  disabled?: boolean;
  excludeChain?: Chain | null;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
  chains,
  selectedChain,
  onSelect,
  placeholder = "Select chain",
  disabled = false,
  excludeChain = null,
}) => {
  const filteredChains = excludeChain 
    ? chains.filter(chain => chain.id !== excludeChain.id)
    : chains;

  return (
    <Select
      value={selectedChain?.id}
      placeholder={placeholder}
      onChange={(chainId) => {
        const chain = chains.find(c => c.id === chainId);
        if (chain) onSelect(chain);
      }}
      disabled={disabled}
      style={{ width: '100%' }}
      size="large"
      optionRender={(option) => {
        const chain = chains.find(c => c.id === option.value);
        if (!chain) return null;
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size={24} src={chain.logo} alt={chain.name} />
            <span>{chain.name}</span>
          </div>
        );
      }}
    >
      {filteredChains.map((chain) => (
        <Select.Option key={chain.id} value={chain.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size={20} src={chain.logo} alt={chain.name} />
            <span>{chain.name}</span>
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};
