import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SwapOutlined, HistoryOutlined, WalletOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Drawer, message } from 'antd';
import Bridge from './pages/Bridge';
import Transactions from './pages/Transactions';
import Portfolio from './pages/Portfolio';
import More from './pages/More';
import NetworkTest from './pages/NetworkTest';
import ContractTest from './pages/ContractTest';
import { useState, useEffect, useRef } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: white;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    justify-content: space-between;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
`;

const RightSection = styled.div`
  margin-left: auto;
`;

const Content = styled.main`
  flex: 1;
  padding-bottom: 80px;
  
  @media (min-width: 769px) {
    padding-bottom: 40px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  
  img {
    width: 40px;
    height: 40px;
  }
  
  .logo-text {
    font-size: 20px;
    font-weight: 700;
    color: #212529;
    
    @media (max-width: 480px) {
      font-size: 18px;
    }
  }
`;

const WalletAddress = styled.div`
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 14px;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  &:hover {
    border-color: #adb5bd;
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 13px;
  }
`;

const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: space-around;
  padding: 12px 0 8px;
  z-index: 100;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const NavItem = styled.div<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: ${props => props.$active ? '#212529' : '#6c757d'};
  font-size: 12px;
  font-weight: ${props => props.$active ? '600' : '400'};
  padding: 4px 16px;
  
  .anticon {
    font-size: 24px;
  }
  
  &:active {
    opacity: 0.7;
  }
`;

const DesktopNav = styled.nav`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavButton = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? '#f8f9fa' : 'transparent'};
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 15px;
  font-weight: ${props => props.$active ? '600' : '500'};
  color: ${props => props.$active ? '#212529' : '#6c757d'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: #f8f9fa;
    color: #212529;
  }
`;

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState('bridge');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { isConnected, address } = useAppKitAccount();
  const prevIsConnected = useRef<boolean>(isConnected);

  useEffect(() => {
    const path = location.pathname.replace('/', '') || 'bridge';
    setCurrentPath(path);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 监听断开连接事件，跳转到主页并关闭抽屉
  useEffect(() => {
    // 只有在之前是连接状态，现在断开连接时才跳转
    if (prevIsConnected.current && !isConnected) {
      setDrawerOpen(false); // 关闭抽屉
      navigate('/bridge');
      message.info('Wallet disconnected, redirected to home');
    }
    // 更新之前的连接状态
    prevIsConnected.current = isConnected;
  }, [isConnected, navigate]);

  const handleNavigation = (path: string) => {
    navigate(`/${path}`);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async (addr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(addr);
      message.success('Address copied!');
    } catch {
      message.error('Failed to copy address');
    }
  };

  return (
    <AppContainer>
      <Header>
        <LeftSection>
          <Logo onClick={() => handleNavigation('bridge')}>
            <img src="/toky-icon.svg" alt="Toky" />
            <div className="logo-text">Toky Finance</div>
          </Logo>
          
          <DesktopNav>
            <NavButton 
              $active={currentPath === 'bridge'}
              onClick={() => handleNavigation('bridge')}
            >
              <SwapOutlined />
              Bridge
            </NavButton>
            <NavButton 
              $active={currentPath === 'transactions'}
              onClick={() => handleNavigation('transactions')}
            >
              <HistoryOutlined />
              Transactions
            </NavButton>
          </DesktopNav>
        </LeftSection>
        
        <RightSection>
          {isConnected && address ? (
            <WalletAddress 
              onClick={() => setDrawerOpen(true)}
              onDoubleClick={(e) => copyAddress(address, e)}
              title="Double click to copy address"
            >
              <WalletOutlined />
              <span>{formatAddress(address)}</span>
            </WalletAddress>
          ) : (
            <appkit-button />
          )}
        </RightSection>
      </Header>
      
      <Content>
        <Routes>
          <Route path="/" element={<Navigate to="/bridge" replace />} />
          <Route path="/bridge" element={<Bridge />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/more" element={<More />} />
          <Route path="/contract-test" element={<ContractTest />} />
          <Route path="/networks" element={<NetworkTest />} />
          <Route path="*" element={<Navigate to="/bridge" replace />} />
        </Routes>
      </Content>
      
      <BottomNav>
        <NavItem 
          $active={currentPath === 'bridge'}
          onClick={() => handleNavigation('bridge')}
        >
          <SwapOutlined />
          <span>Bridge</span>
        </NavItem>
        <NavItem 
          $active={currentPath === 'transactions'}
          onClick={() => handleNavigation('transactions')}
        >
          <HistoryOutlined />
          <span>Transactions</span>
        </NavItem>
        <NavItem 
          $active={currentPath === 'portfolio'}
          onClick={() => handleNavigation('portfolio')}
        >
          <WalletOutlined />
          <span>Portfolio</span>
        </NavItem>
        <NavItem 
          $active={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          <MenuOutlined />
          <span>More</span>
        </NavItem>
      </BottomNav>

      <Drawer
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={400}
        closable={false}
        styles={{
          body: { padding: 0, position: 'relative' }
        }}
      >
        {isMobile && (
          <div style={{ 
            padding: '20px 20px 0',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <CloseOutlined 
              onClick={() => setDrawerOpen(false)}
              style={{ 
                fontSize: '24px', 
                color: '#212529', 
                cursor: 'pointer'
              }} 
            />
          </div>
        )}
        <More />
      </Drawer>
    </AppContainer>
  );
};

const App = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  );
};

export default App;
