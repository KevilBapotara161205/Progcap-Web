import { useState } from 'react';
import { Tabs, Table, Button, Space, Select, Tag, Dropdown, message, Modal } from 'antd';
import { Download, Filter, MoreHorizontal, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import LeadDetailDrawer from './LeadDetailDrawer';
import LeadAssignmentModal from './LeadAssignmentModal';
import axiosClient from '../../api/axiosClient';

const PipelinePage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [drawerLeadId, setDrawerLeadId] = useState<string | null>(null);
  const [reassignModalVisible, setReassignModalVisible] = useState(false);
  const [stageModalVisible, setStageModalVisible] = useState(false);
  const [updateStageLeadId, setUpdateStageLeadId] = useState<string | null>(null);
  const [updateStageVal, setUpdateStageVal] = useState<string>('');

  // Filters state
  const [stageFilter, setStageFilter] = useState<string | undefined>(undefined);
  const [rmFilter, setRmFilter] = useState<string | undefined>(undefined);
  const [anchorFilter, setAnchorFilter] = useState<string | undefined>(undefined);

  const queryClient = useQueryClient();

  // ── Fetch RMs for filter dropdown ──────────────────────────────────────────
  const { data: rms } = useQuery({
    queryKey: ['rms-filter'],
    queryFn: async () => {
      const response = await axiosClient.get('/users', { params: { role: 'RM', limit: 100 } });
      return response.data.data;
    }
  });

  // ── Fetch Anchors for filter dropdown ──────────────────────────────────────
  const { data: anchors } = useQuery({
    queryKey: ['anchors-filter'],
    queryFn: async () => {
      const response = await axiosClient.get('/anchors', { params: { limit: 100 } });
      return response.data.data;
    }
  });

  // ── Fetch Pipeline Leads ───────────────────────────────────────────────────
  const { data: leadsResponse, isLoading } = useQuery({
    queryKey: ['leads-pipeline', activeTab, stageFilter, rmFilter, anchorFilter],
    queryFn: async () => {
      const params: any = { limit: 100 };
      if (activeTab === 'stuck') {
        params.isStuck = 'true';
      }
      if (stageFilter) params.stage = stageFilter;
      if (rmFilter) params.assignedTo = rmFilter;
      if (anchorFilter) params.anchorId = anchorFilter;

      const response = await axiosClient.get('/leads', { params });
      return response.data.data; // array of leads
    }
  });

  const leads = leadsResponse || [];

  // Client-side expiry filtering for expiring tab
  const filteredLeads = leads.filter((lead: any) => {
    if (activeTab === 'expiring') {
      if (lead.stage !== 'SANCTIONED' || !lead.sanctionExpiryDate) return false;
      const daysLeft = Math.ceil((new Date(lead.sanctionExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft > 0 && daysLeft <= 7;
    }
    return true;
  });

  // ── Toggle Urgent Mutation ─────────────────────────────────────────────────
  const toggleUrgentMutation = useMutation({
    mutationFn: async (leadId: string) => {
      return axiosClient.patch(`/leads/${leadId}/flag-urgent`);
    },
    onSuccess: () => {
      message.success('Urgency flag updated successfully');
      queryClient.invalidateQueries({ queryKey: ['leads-pipeline'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to update urgency flag');
    }
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ leadId, stage }: { leadId: string; stage: string }) => {
      return axiosClient.patch(`/leads/${leadId}/stage`, { stage });
    },
    onSuccess: () => {
      message.success('Lead stage updated successfully');
      queryClient.invalidateQueries({ queryKey: ['leads-pipeline'] });
      setStageModalVisible(false);
      setUpdateStageLeadId(null);
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to update stage');
    }
  });

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Dealer', dataIndex: 'dealer', key: 'dealer' },
    { title: 'Anchor', dataIndex: 'anchor', key: 'anchor' },
    { title: 'RM', dataIndex: 'rm', key: 'rm' },
    {
      title: 'Stage',
      dataIndex: 'stage',
      key: 'stage',
      render: (stage: string) => (
        <Tag color={stage === 'SANCTIONED' ? 'green' : stage === 'KYC_SUBMITTED' ? 'blue' : 'orange'}>
          {stage}
        </Tag>
      )
    },
    {
      title: 'Deal Value',
      dataIndex: 'value',
      key: 'value',
      render: (v: number) => <span style={{ fontWeight: 600 }}>₹{v.toFixed(1)}L</span>
    },
    { title: 'Last Activity', dataIndex: 'lastActivity', key: 'lastActivity' },
    {
      title: 'Days Stuck',
      dataIndex: 'daysStuck',
      key: 'daysStuck',
      render: (d: number, record: any) => (
        <span style={{ color: record.isStuck ? '#fa8c16' : 'inherit', fontWeight: record.isStuck ? 600 : 'normal' }}>
          {d} days
        </span>
      )
    },
    {
      title: 'Sanction Expiry',
      dataIndex: 'expiry',
      key: 'expiry',
      render: (expiry: string, record: any) => (
        <span>
          {expiry}{' '}
          {record.urgencyFlag && (
            <AlertCircle size={14} color="red" style={{ verticalAlign: 'middle', marginLeft: 4 }} />
          )}
        </span>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'View Details', onClick: () => setDrawerLeadId(record.leadId) },
              {
                key: 'reassign',
                label: 'Reassign RM',
                onClick: () => {
                  setSelectedRowKeys([record.leadId]);
                  setReassignModalVisible(true);
                }
              },
              {
                key: 'stage',
                label: 'Update Stage',
                onClick: () => {
                  setUpdateStageLeadId(record.leadId);
                  setUpdateStageVal(record.stage);
                  setStageModalVisible(true);
                }
              },
              {
                key: 'urgent',
                label: record.urgencyFlag ? 'Unflag Urgent' : 'Flag Urgent',
                danger: !record.urgencyFlag,
                onClick: () => toggleUrgentMutation.mutate(record.leadId)
              },
            ]
          }}
        >
          <Button type="text" icon={<MoreHorizontal size={16} />} />
        </Dropdown>
      ),
    },
  ];

  // Map API response to AntD table datasource
  const tableData = filteredLeads.map((lead: any) => {
    const daysStuck = lead.isStuck ? 4 : 1; // standard default mapping
    const daysLeft = lead.sanctionExpiryDate
      ? Math.ceil((new Date(lead.sanctionExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      key: lead._id,
      id: lead._id.substring(18).toUpperCase(),
      leadId: lead._id,
      dealer: lead.dealer?.businessName || lead.dealer?.name || 'Unknown',
      anchor: lead.anchor?.name || 'Unknown',
      rm: lead.assignedTo?.name || 'Unassigned',
      stage: lead.stage,
      value: lead.expectedValue || 0,
      lastActivity: dayjs(lead.lastActivityAt || lead.updatedAt).format('MMM D'),
      daysStuck,
      expiry: lead.sanctionExpiryDate
        ? `${dayjs(lead.sanctionExpiryDate).format('MMM D')} (${daysLeft}d left)`
        : 'N/A',
      urgencyFlag: lead.urgencyFlag,
      isStuck: lead.isStuck
    };
  });

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const resetFilters = () => {
    setStageFilter(undefined);
    setRmFilter(undefined);
    setAnchorFilter(undefined);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Pipeline Management</h2>
        <Space>
          <Button icon={<Download size={16} />}>Export CSV</Button>
          <Button icon={<Filter size={16} />} onClick={() => setShowFilters(!showFilters)}>
            Filters
          </Button>
        </Space>
      </div>

      {showFilters && (
        <div style={{ padding: 16, background: '#fafafa', borderRadius: 8, marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select
            placeholder="Stage"
            value={stageFilter}
            onChange={setStageFilter}
            style={{ width: 180 }}
            allowClear
            options={[
              { value: 'ASSIGNED', label: 'Assigned' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'CREDIT_ASSESSMENT', label: 'Credit Assessment' },
              { value: 'KYC_SUBMITTED', label: 'KYC Submitted' },
              { value: 'SANCTIONED', label: 'Sanctioned' },
              { value: 'DISBURSED', label: 'Disbursed' },
            ]}
          />
          <Select
            placeholder="RM Name"
            value={rmFilter}
            onChange={setRmFilter}
            style={{ width: 180 }}
            allowClear
            showSearch
            options={(rms || []).map((r: any) => ({ value: r._id, label: r.name }))}
          />
          <Select
            placeholder="Anchor"
            value={anchorFilter}
            onChange={setAnchorFilter}
            style={{ width: 180 }}
            allowClear
            showSearch
            options={(anchors || []).map((a: any) => ({ value: a._id, label: a.name }))}
          />
          <Button onClick={resetFilters}>Reset</Button>
        </div>
      )}

      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, padding: '8px 16px', background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{selectedRowKeys.length} items selected</span>
          <Space>
            <Button size="small" onClick={() => setReassignModalVisible(true)}>Reassign Selected</Button>
          </Space>
        </div>
      )}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'all', label: 'All Pipeline' },
          { key: 'stuck', label: 'Stuck Cases' },
          { key: 'expiring', label: 'Expiring Soon' },
        ]}
      />

      <Table
        loading={isLoading}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={tableData}
        rowKey="key"
        pagination={{ pageSize: 10 }}
      />

      <LeadDetailDrawer
        visible={!!drawerLeadId}
        leadId={drawerLeadId}
        onClose={() => setDrawerLeadId(null)}
        onReassign={() => {
          if (drawerLeadId) {
            setSelectedRowKeys([drawerLeadId]);
            setReassignModalVisible(true);
          }
        }}
        onUpdateStage={() => {
          if (drawerLeadId) {
            const currentLead = leads.find((l: any) => l._id === drawerLeadId);
            setUpdateStageLeadId(drawerLeadId);
            setUpdateStageVal(currentLead?.stage || 'ASSIGNED');
            setStageModalVisible(true);
          }
        }}
      />

      <LeadAssignmentModal
        visible={reassignModalVisible}
        onCancel={() => {
          setReassignModalVisible(false);
          setSelectedRowKeys([]);
        }}
        selectedLeadIds={selectedRowKeys as string[]}
      />

      <Modal
        title="Update Lead Stage"
        open={stageModalVisible}
        onOk={() => {
          if (updateStageLeadId && updateStageVal) {
            updateStageMutation.mutate({ leadId: updateStageLeadId, stage: updateStageVal });
          }
        }}
        onCancel={() => {
          setStageModalVisible(false);
          setUpdateStageLeadId(null);
        }}
        confirmLoading={updateStageMutation.isPending}
      >
        <div style={{ padding: '16px 0' }}>
          <p style={{ marginBottom: 8, color: '#666' }}>Select the new pipeline stage for this lead:</p>
          <Select
            value={updateStageVal}
            onChange={setUpdateStageVal}
            style={{ width: '100%' }}
            options={[
              { value: 'ASSIGNED', label: 'Assigned' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'CREDIT_ASSESSMENT', label: 'Credit Assessment' },
              { value: 'KYC_SUBMITTED', label: 'KYC Submitted' },
              { value: 'SANCTIONED', label: 'Sanctioned' },
              { value: 'DISBURSED', label: 'Disbursed' },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default PipelinePage;
