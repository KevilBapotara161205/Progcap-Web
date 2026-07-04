import { useEffect, useState } from 'react';
import { List, Badge, Button, Select, Space } from 'antd';
import { Bell, Briefcase, AlertTriangle, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';


const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'stuck_case', title: 'Stuck Case Alert', message: 'Lead L-1001 has been stuck in KYC for 4 days.', time: '10 mins ago', read: false },
    { id: 2, type: 'new_lead', title: 'New Lead Assigned', message: 'L-2001 (Sharma Stores) assigned to Rahul.', time: '1 hour ago', read: false },
    { id: 3, type: 'approval', title: 'Approval Required', message: 'Credit limit escalation requested by Vikram.', time: '2 hours ago', read: true },
  ]);

  useEffect(() => {
    // Connect to backend Socket.io for real-time alerts
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      path: '/socket.io',
      transports: ['websocket']
    });

    socket.on('new_lead', (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'new_lead',
        title: 'New Lead',
        message: `Lead ${data.leadId} created.`,
        time: 'Just now',
        read: false
      }, ...prev]);
    });

    socket.on('stuck_case', (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'stuck_case',
        title: 'Stuck Case Alert',
        message: `Lead ${data.leadId} is stuck.`,
        time: 'Just now',
        read: false
      }, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'stuck_case': return <AlertTriangle color="#faad14" />;
      case 'new_lead': return <Briefcase color="#1038CC" />;
      case 'approval': return <CheckCircle color="#52c41a" />;
      default: return <Bell />;
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Notifications</h2>
        <Space>
          <Select defaultValue="all" style={{ width: 150 }} options={[
            { label: 'All Alerts', value: 'all' },
            { label: 'Unread', value: 'unread' },
            { label: 'Stuck Cases', value: 'stuck' },
          ]} />
          <Button onClick={markAllRead}>Mark all read</Button>
        </Space>
      </div>

      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={item => (
          <List.Item
            style={{ 
              background: item.read ? '#fff' : '#f0f5ff', 
              padding: '16px 24px', 
              borderRadius: 8, 
              marginBottom: 8,
              border: item.read ? '1px solid #f0f0f0' : '1px solid #d6e4ff'
            }}
          >
            <List.Item.Meta
              avatar={
                <Badge dot={!item.read} color="#1038CC">
                  <div style={{ background: '#fff', padding: 12, borderRadius: '50%', border: '1px solid #f0f0f0' }}>
                    {getIcon(item.type)}
                  </div>
                </Badge>
              }
              title={<span style={{ fontWeight: item.read ? 500 : 700 }}>{item.title}</span>}
              description={
                <div>
                  <div style={{ color: '#333' }}>{item.message}</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>{item.time}</div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default NotificationsPage;
