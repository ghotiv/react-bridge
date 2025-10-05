import React, { useState, useEffect } from 'react';
import { Select, Avatar, Space, Typography, Spin } from 'antd';
import { TokenGroup } from '../types/bridge';
import { bridgeApi } from '../api/bridge';

const { Text } = Typography;

interface TokenGroupSelectorProps {
  selectedTokenGroup: TokenGroup | null;
  onSelectTokenGroup: (tokenGroup: TokenGroup | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const TokenGroupSelector: React.FC<TokenGroupSelectorProps> = ({
  selectedTokenGroup,
  onSelectTokenGroup,
  placeholder = "Select token group",
  disabled = false,
}) => {
  const [tokenGroups, setTokenGroups] = useState<TokenGroup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTokenGroups = async () => {
      setLoading(true);
      try {
        const groups = await bridgeApi.getTokenGroups();
        setTokenGroups(groups);
      } catch (error) {
        console.error('Failed to get token groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenGroups();
  }, []);

  const handleSelect = (value: string) => {
    const selectedGroup = tokenGroups.find(group => group.token_group === value);
    onSelectTokenGroup(selectedGroup || null);
  };

  const handleClear = () => {
    onSelectTokenGroup(null);
  };

  return (
    <Select
      value={selectedTokenGroup?.token_group}
      placeholder={placeholder}
      onChange={handleSelect}
      onClear={handleClear}
      allowClear
      disabled={disabled}
      loading={loading}
      style={{ width: 'auto', minWidth: '100px' }}
      popupMatchSelectWidth={false}
      dropdownStyle={{ minWidth: '300px' }}
      size="large"
      optionLabelProp="label"
    >
      {tokenGroups.map((group) => (
        <Select.Option 
          key={group.token_group} 
          value={group.token_group}
          label={
            <Space>
              <Avatar 
                src={group.token_logo_url} 
                size={20}
                style={{ backgroundColor: '#f0f0f0' }}
              />
              <Text>{group.token_group}</Text>
            </Space>
          }
        >
          <Space>
            <Avatar 
              src={group.token_logo_url} 
              size={24}
              style={{ backgroundColor: '#f0f0f0' }}
            />
            <div>
              <Text strong>{group.token_group}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {group.token_group} Token Group
              </Text>
            </div>
          </Space>
        </Select.Option>
      ))}
    </Select>
  );
};
