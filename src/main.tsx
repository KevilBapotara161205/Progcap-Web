import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#0535E9',
            colorSuccess: '#61CE70',
            colorWarning: '#F59E0B',
            colorError: '#EF4444',
            colorTextBase: '#2D2D2D',
            colorBgBase: '#FAFAFA',
            borderRadius: 10,
            fontFamily: "'Poppins', sans-serif",
            fontSize: 14,
            colorBgContainer: '#FFFFFF',
          },
          components: {
            Button: { borderRadius: 10, controlHeight: 40 },
            Card: { borderRadius: 16 },
            Input: { borderRadius: 10, controlHeight: 40 },
            Select: { borderRadius: 10, controlHeight: 40 },
            Table: { headerBg: '#0031B9', headerColor: '#FFFFFF', borderRadius: 12 },
            Menu: { darkItemBg: '#050126', darkSubMenuItemBg: '#0031B9', darkItemSelectedBg: '#0535E9' },
          }
        }}
      >
        <App />
        <Toaster position="top-right" />
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
