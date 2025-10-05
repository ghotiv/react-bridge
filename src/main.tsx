import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'
import { ConfigProvider } from 'antd'
import { createAppKit } from '@reown/appkit/react'
import { networks, projectId, metadata, ethersAdapter } from './config'

createAppKit({
  adapters: [ethersAdapter],
  networks,
  metadata,
  projectId,
  themeMode: 'light',
  features: {
    analytics: false
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6366f1',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorInfo: '#3b82f6',
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
