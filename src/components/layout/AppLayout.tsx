import { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Badge, ConfigProvider, Modal } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  CheckSquare,
  BarChart3,
  Users2,
  Bell,
  LogOut,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const { Sider, Content } = Layout;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Modal.confirm({
      title: 'Sign Out',
      content: 'Are you sure you want to sign out?',
      okText: 'Yes, Sign Out',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: () => {
        logout();
        navigate('/login');
      },
    });
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserIcon size={14} />,
      label: 'Profile',
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogOut size={14} />,
      label: 'Sign Out',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const menuItems = [
    {
      key: '/dashboard',
      icon: <LayoutDashboard size={17} />,
      label: 'Overview',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/pipeline',
      icon: <KanbanSquare size={17} />,
      label: 'Pipeline',
      onClick: () => navigate('/pipeline'),
    },
    {
      key: '/leads',
      icon: <Users size={17} />,
      label: 'Leads',
      onClick: () => navigate('/leads'),
    },
    {
      key: '/approvals',
      icon: <CheckSquare size={17} />,
      label: 'Approvals',
      onClick: () => navigate('/approvals'),
    },
    {
      key: '/analytics',
      icon: <BarChart3 size={17} />,
      label: 'Analytics',
      onClick: () => navigate('/analytics'),
    },
    {
      key: '/users',
      icon: <Users2 size={17} />,
      label: 'User Management',
      onClick: () => navigate('/users'),
    },
    {
      key: '/notifications',
      icon: <Bell size={17} />,
      label: 'Notifications',
      onClick: () => navigate('/notifications'),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0535E9',
          colorLink: '#0535E9',
          borderRadius: 8,
          fontFamily: "'Inter', sans-serif",
        },
      }}
    >
      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        {/* ── Dark Navy Sidebar ──────────────────────────────────────────── */}
        <Sider
          collapsed={collapsed}
          collapsedWidth={64}
          width={240}
          style={{
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: '#080E28',
            borderRight: '1px solid rgba(255,255,255,0.07)',
          }}
          trigger={null}
        >
          {/* Logo */}
          <div
            className="sidebar-logo"
            style={{
              padding: collapsed ? '0 16px' : '0 20px',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            {/* Brand Icon */}
            <div
              style={{
                width: 34,
                height: 34,
                background: 'linear-gradient(135deg, #F10BF8 0%, #0535E9 100%)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: 17,
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(5, 53, 233, 0.4)',
              }}
            >
              P
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                  PROGCAP
                </div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 500, letterSpacing: '1.5px', whiteSpace: 'nowrap' }}>
                  RBH DASHBOARD
                </div>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.65)',
              }}
              inlineIndent={16}
            />
          </div>

          {/* Collapse toggle */}
          <div
            style={{
              padding: '12px 8px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                width: '100%',
                color: 'rgba(255,255,255,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 8,
                fontSize: 12,
              }}
            >
              {!collapsed && 'Collapse'}
            </Button>
          </div>
        </Sider>

        {/* ── Main Area ─────────────────────────────────────────────────── */}
        <Layout
          style={{
            marginLeft: collapsed ? 64 : 240,
            transition: 'margin-left 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            height: '100vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* ── Top Header ──────────────────────────────────────────────── */}
          <div
            style={{
              height: 64,
              flexShrink: 0,
              background: '#fff',
              borderBottom: '1px solid #E4E9FF',
              boxShadow: '0 1px 8px rgba(5, 53, 233, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              zIndex: 10,
            }}
          >
            {/* Page title / breadcrumb area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 13, color: '#64748B' }}>
                {location.pathname === '/dashboard' && "👋 Welcome back, here's today's overview"}
                {location.pathname === '/pipeline' && '📊 Active loan pipeline by stage'}
                {location.pathname === '/leads' && '👥 All leads assigned to your team'}
                {location.pathname === '/approvals' && '✅ Pending approvals and reviews'}
                {location.pathname === '/analytics' && '📈 Performance analytics & KPIs'}
                {location.pathname === '/users' && '🔑 User and role management'}
                {location.pathname === '/notifications' && '🔔 Notifications and alerts'}
              </div>
            </div>

            {/* Right side — Notifications + Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Notification Bell */}
              <Badge count={3} size="small" offset={[-4, 4]}>
                <Button
                  type="text"
                  icon={<Bell size={17} />}
                  onClick={() => navigate('/notifications')}
                  style={{
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748B',
                    borderRadius: 8,
                  }}
                />
              </Badge>

              {/* User Dropdown */}
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                <div
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '5px 10px',
                    borderRadius: 10,
                    border: '1px solid #E4E9FF',
                    transition: 'all 0.2s',
                    background: '#F4F6FF',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0535E9';
                    e.currentTarget.style.background = 'rgba(5,53,233,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E4E9FF';
                    e.currentTarget.style.background = '#F4F6FF';
                  }}
                >
                  <Avatar
                    size={30}
                    style={{
                      background: 'linear-gradient(135deg, #F10BF8 0%, #0535E9 100%)',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  <div style={{ lineHeight: '1.3' }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: '#0A0F1E' }}>
                      {user?.name || 'RBH User'}
                    </div>
                    <div style={{ color: '#64748B', fontSize: 10, fontWeight: 500 }}>
                      {user?.role?.replace('_', ' ') || 'Cluster Manager'}
                    </div>
                  </div>
                </div>
              </Dropdown>
            </div>
          </div>

          {/* ── Page Content ──────────────────────────────────────────────── */}
          <Content
            style={{
              flex: 1,
              overflow: 'auto',
              padding: 24,
              background: '#F4F6FF',
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AppLayout;
