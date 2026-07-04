import { useState } from 'react';
import { Table, Button, Space, Tag, Modal, Input, Select, message } from 'antd';
import { Check, X } from 'lucide-react';

const ApprovalsPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [selectedRequestKey, setSelectedRequestKey] = useState<string | null>(null);

  // Search & Filter States
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const [data, setData] = useState([
    { 
      key: '1', 
      leadInfo: 'Super Electronics', 
      requestedBy: 'Rahul Sharma', 
      requestedAt: '2 hours ago', 
      currentLimit: '₹20L', 
      requestedLimit: '+ ₹5L', 
      notes: 'Festive stock expansion support', 
      status: 'PENDING' 
    },
    { 
      key: '2', 
      leadInfo: 'Gupta Traders', 
      requestedBy: 'Amit Patel', 
      requestedAt: '1 day ago', 
      currentLimit: '₹15L', 
      requestedLimit: '- ₹2L', 
      notes: 'Reduced sales volume requested limit adjustment', 
      status: 'PENDING' 
    },
    { 
      key: '3', 
      leadInfo: 'Apex Motors', 
      requestedBy: 'Kevil Bapotara', 
      requestedAt: '3 days ago', 
      currentLimit: '₹30L', 
      requestedLimit: '+ ₹10L', 
      notes: 'Inventory scaling request', 
      status: 'APPROVED' 
    },
  ]);

  const columns = [
    { title: 'Lead / Merchant', dataIndex: 'leadInfo', key: 'leadInfo', render: (text: string) => <strong>{text}</strong> },
    { title: 'Requested By', dataIndex: 'requestedBy', key: 'requestedBy' },
    { title: 'Current Limit', dataIndex: 'currentLimit', key: 'currentLimit' },
    { 
      title: 'Requested Limit', 
      dataIndex: 'requestedLimit', 
      key: 'requestedLimit',
      render: (v: string) => {
        const isIncrease = v.startsWith('+');
        return <Tag color={isIncrease ? 'green' : 'red'} style={{ fontWeight: 600 }}>{v}</Tag>;
      }
    },
    { title: 'Notes', dataIndex: 'notes', key: 'notes' },
    { title: 'Requested At', dataIndex: 'requestedAt', key: 'requestedAt' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        let color = 'gold';
        if (status === 'APPROVED') color = 'green';
        if (status === 'REJECTED') color = 'red';
        return <Tag color={color} style={{ fontWeight: 600 }}>{status}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => {
        if (record.status !== 'PENDING') return <span style={{ color: '#888', fontStyle: 'italic' }}>Reviewed</span>;
        return (
          <Space>
            <Button 
              type="primary" 
              size="small" 
              icon={<Check size={14}/>} 
              onClick={() => { setSelectedRequestKey(record.key); setApprovalAction('approve'); setModalVisible(true); }}
              style={{ background: '#52c41a' }}
            >
              Approve
            </Button>
            <Button 
              type="primary" 
              danger 
              size="small" 
              icon={<X size={14}/>}
              onClick={() => { setSelectedRequestKey(record.key); setApprovalAction('reject'); setModalVisible(true); }}
            >
              Reject
            </Button>
          </Space>
        );
      },
    },
  ];

  const onOk = () => {
    if (approvalAction === 'reject' && !comment) {
      message.error('Comment is mandatory for rejection');
      return;
    }

    setData(prev => prev.map(item => {
      if (item.key === selectedRequestKey) {
        return { 
          ...item, 
          status: approvalAction === 'approve' ? 'APPROVED' : 'REJECTED',
          notes: comment ? `${item.notes} (Review Note: ${comment})` : item.notes
        };
      }
      return item;
    }));

    message.success(`Request ${approvalAction}d successfully`);
    setModalVisible(false);
    setComment('');
  };

  // Filter & Search Logic
  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.leadInfo.toLowerCase().includes(searchText.toLowerCase()) ||
      item.requestedBy.toLowerCase().includes(searchText.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchText.toLowerCase());
      
    const matchesStatus = !statusFilter || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Approvals Workflow</h2>

      {/* Search & Filter Bar */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Input 
          placeholder="Search by Lead or RM..." 
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
        <Select
          placeholder="Filter by Status"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 180 }}
          allowClear
          options={[
            { value: 'PENDING', label: 'Pending' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'REJECTED', label: 'Rejected' },
          ]}
        />
      </div>

      <Table columns={columns} dataSource={filteredData} pagination={false} />

      <Modal
        title={approvalAction === 'approve' ? 'Approve Request' : 'Reject Request'}
        open={modalVisible}
        onOk={onOk}
        onCancel={() => { setModalVisible(false); setComment(''); }}
        okText={approvalAction === 'approve' ? 'Approve' : 'Reject'}
        okButtonProps={{ danger: approvalAction === 'reject' }}
      >
        <div style={{ marginBottom: 16, marginTop: 16 }}>
          <label>Comments {approvalAction === 'reject' && <span style={{ color: 'red' }}>*</span>}</label>
          <Input.TextArea 
            rows={4} 
            value={comment} 
            onChange={e => setComment(e.target.value)} 
            placeholder="Enter reason or comments here..." 
            style={{ marginTop: 8 }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ApprovalsPage;
