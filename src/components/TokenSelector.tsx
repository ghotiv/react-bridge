import React from 'react';
import { Select, Avatar } from 'antd';
import { Token, Chain } from '../types/bridge';

interface TokenSelectorProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  selectedChain: Chain | null;
  placeholder?: string;
  disabled?: boolean;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  tokens,
  selectedToken,
  onSelect,
  selectedChain,
  placeholder = "Select token",
  disabled = false,
}) => {
  // Filter tokens that are supported on the selected chain
  const availableTokens = selectedChain 
    ? tokens.filter(token => token.addresses[selectedChain.id])
    : [];

  return (
    <Select
      value={selectedToken?.symbol}
      placeholder={placeholder}
      onChange={(tokenSymbol) => {
        const token = tokens.find(t => t.symbol === tokenSymbol);
        if (token) onSelect(token);
      }}
      disabled={disabled || !selectedChain}
      style={{ width: '100%' }}
      size="large"
      notFoundContent={selectedChain ? "No tokens available on this chain" : "Please select a chain first"}
      optionRender={(option) => {
        const token = tokens.find(t => t.symbol === option.value);
        if (!token) return null;
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size={24} src={token.logo} alt={token.name} />
            <div>
              <div style={{ fontWeight: 500 }}>{token.symbol}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{token.name}</div>
            </div>
          </div>
        );
      }}
    >
      {availableTokens.map((token) => (
        <Select.Option key={token.symbol} value={token.symbol}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size={20} src={token.logo} alt={token.name} />
            <div>
              <div style={{ fontWeight: 500 }}>{token.symbol}</div>
              <div style={{ fontSize: 11, color: '#666' }}>{token.name}</div>
            </div>
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};
