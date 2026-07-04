import { useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, message } from 'antd';
import { Plus, Upload, Edit, UserX } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

const UsersPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState<any>(null);

  const queryClient = useQueryClient();

  // Fetch users matching selected role
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['users-list', 'RM'],
    queryFn: async () => {
      const response = await axiosClient.get('/users', {
        params: { role: 'RM', limit: 100 }
      });
      return response.data.data; // Array of users
    }
  });

  const users = usersResponse || [];

  // Create User Mutation
  const createUserMutation = useMutation({
    mutationFn: async (payload: any) => {
      return axiosClient.post('/users', payload);
    },
    onSuccess: () => {
      message.success('RM created successfully');
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      handleClose();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to create RM');
    }
  });

  // Update User Mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return axiosClient.patch(`/users/${id}`, payload);
    },
    onSuccess: () => {
      message.success('RM updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      handleClose();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to update RM');
    }
  });

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return axiosClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      message.success('RM deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to delete RM');
    }
  });

  const handleEdit = (record: any) => {
    setEditingUser(record);
    form.setFieldsValue({
      name: record.name,
      phone: record.phone,
      email: record.email,
    });
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this RM?',
      content: 'This will revoke all access for this RM in the SFA system.',
      okText: 'Yes, Delete',
      okType: 'danger',
      onOk: () => {
        deleteUserMutation.mutate(id);
      }
    });
  };

  const onOk = async () => {
    try {
      const values = await form.validateFields();
      const payload: any = {
        name: values.name,
        phone: values.phone,
        email: values.email,
        role: 'RM'
      };

      if (editingUser) {
        updateUserMutation.mutate({ id: editingUser._id, payload });
      } else {
        createUserMutation.mutate(payload);
      }
    } catch (e) {
      // Validation failed
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (r: string) => <Tag color="blue">{r}</Tag> },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => <Tag color={s === 'ACTIVE' ? 'success' : 'error'}>{s}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<Edit size={16} />} onClick={() => handleEdit(record)} />
          <Button type="text" danger icon={<UserX size={16} />} onClick={() => handleDelete(record._id)} />
        </Space>
      ),
    },
  ];

  const tableData = users.map((user: any) => ({
    ...user,
    key: user._id
  }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>RM Management</h2>
        <Space>
          <Button icon={<Upload size={16} />}>Bulk Import</Button>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => { setEditingUser(null); form.resetFields(); setModalVisible(true); }} style={{ background: '#1038CC' }}>
            Add RM
          </Button>
        </Space>
      </div>

      <Table loading={isLoading} columns={columns} dataSource={tableData} />

      <Modal
        title={editingUser ? "Edit RM" : "Add New RM"}
        open={modalVisible}
        onOk={onOk}
        confirmLoading={createUserMutation.isPending || updateUserMutation.isPending}
        onCancel={handleClose}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Mobile Number" rules={[{ required: true, message: 'Phone is required', len: 10 }]}>
            <Input maxLength={10} placeholder="e.g. 9876543210" />
          </Form.Item>
          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Valid email is required' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;
