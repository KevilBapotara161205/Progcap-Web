import { useState } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, Input, Drawer, Space, Tag, Tooltip } from 'antd';
import { Plus, Sparkles, Brain, Search, X } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import AIInsightCard from '../../components/AI/AIInsightCard';
import { getMerchantXray, smartSearch } from '../../api/aiApi';
import axiosClient from '../../api/axiosClient';

const XRAY_SECTIONS = [
  { label: 'Business Summary', key: 'businessSummary' },
  { label: 'Risk Assessment', key: 'riskAssessment', color: '#cf1322' },
  { label: 'Positive Signals', key: 'positiveSignals', color: '#389e0d' },
  { label: 'Potential Concerns', key: 'potentialConcerns', color: '#d4380d' },
  { label: 'Conversation Points', key: 'suggestedConversationPoints' },
  { label: 'Recommended Follow-up', key: 'recommendedFollowUp', color: '#1038CC' },
  { label: 'Loan Opportunity', key: 'loanOpportunitySummary', color: '#531dab' },
];

const LeadsPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // ── AI X-Ray state ────────────────────────────────────────────────────────────
  const [xrayDrawerOpen, setXrayDrawerOpen] = useState(false);
  const [xrayLoading, setXrayLoading] = useState(false);
  const [xrayData, setXrayData] = useState<any>(null);
  const [xrayLead, setXrayLead] = useState<any>(null);

  // ── AI Smart Search state ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});

  // ── KYC Docs state ─────────────────────────────────────────────────────────────
  const [kycDrawerOpen, setKycDrawerOpen] = useState(false);
  const [kycLead, setKycLead] = useState<any>(null);

  const { data: kycDocs, isLoading: kycLoading } = useQuery({
    queryKey: ['lead-kyc', kycLead?.leadId],
    queryFn: async () => {
      if (!kycLead?.leadId) return [];
      const res = await axiosClient.get(`/kyc/lead/${kycLead.leadId}`);
      return res.data?.data || [];
    },
    enabled: !!kycLead?.leadId && kycDrawerOpen
  });

  // ── Dynamic Selection states ───────────────────────────────────────────────────
  const [selectedAnchor, setSelectedAnchor] = useState<string | null>(null);

  // ── Fetch Leads from API ───────────────────────────────────────────────────────
  const { data: leadsResponse, refetch: refetchLeads } = useQuery({
    queryKey: ['leads', appliedFilters],
    queryFn: async () => {
      const params: any = { limit: 100 };
      if (appliedFilters.stage) params.stage = appliedFilters.stage;
      if (appliedFilters.isStuck !== undefined) params.isStuck = appliedFilters.isStuck;
      if (appliedFilters.urgencyFlag !== undefined) params.urgencyFlag = appliedFilters.urgencyFlag;
      if (appliedFilters.npaFlag !== undefined) params.npaFlag = appliedFilters.npaFlag;
      if (appliedFilters.searchText) params.searchText = appliedFilters.searchText;

      const response = await axiosClient.get('/leads', { params });
      return response.data;
    }
  });

  const leads = leadsResponse?.data || [];

  // Fetch Anchors (for form select)
  const { data: anchors } = useQuery({
    queryKey: ['anchors'],
    queryFn: async () => {
      const response = await axiosClient.get('/anchors', { params: { limit: 100 } });
      return response.data.data;
    },
    enabled: isModalVisible
  });

  // Fetch Dealers for selected Anchor
  const { data: dealers } = useQuery({
    queryKey: ['dealers', selectedAnchor],
    queryFn: async () => {
      if (!selectedAnchor) return [];
      const response = await axiosClient.get(`/anchors/${selectedAnchor}/dealers`, { params: { limit: 100 } });
      return response.data.data;
    },
    enabled: !!selectedAnchor && isModalVisible
  });

  // Fetch RMs (for form select)
  const { data: rms } = useQuery({
    queryKey: ['rms'],
    queryFn: async () => {
      const response = await axiosClient.get('/users', { params: { role: 'RM', limit: 100 } });
      return response.data.data;
    },
    enabled: isModalVisible
  });

  // ── Create Lead Mutation ───────────────────────────────────────────────────────
  const createLeadMutation = useMutation({
    mutationFn: async (newLead: any) => {
      return axiosClient.post('/leads', newLead);
    },
    onSuccess: () => {
      refetchLeads();
      setIsModalVisible(false);
      form.resetFields();
      setSelectedAnchor(null);
    }
  });

  const handleOpenXray = async (record: any) => {
    setXrayLead(record);
    setXrayDrawerOpen(true);
    setXrayLoading(true);
    setXrayData(null);
    const result = await getMerchantXray(record.leadId, record.dealerId);
    setXrayData(result);
    setXrayLoading(false);
  };

  const handleRefreshXray = async () => {
    if (!xrayLead) return;
    setXrayLoading(true);
    const result = await getMerchantXray(xrayLead.leadId, xrayLead.dealerId);
    setXrayData(result);
    setXrayLoading(false);
  };

  const handleSmartSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    const result = await smartSearch(searchQuery);
    if (result && result.filters) {
      setAppliedFilters(result.filters);
    }
    setSearchLoading(false);
  };

  const clearAiFilters = () => {
    setAppliedFilters({});
    setSearchQuery('');
  };

  const columns = [
    { title: 'Lead ID', dataIndex: 'id', key: 'id', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Dealer', dataIndex: 'dealer', key: 'dealer' },
    { title: 'Anchor', dataIndex: 'anchor', key: 'anchor' },
    {
      title: 'Expected Value',
      dataIndex: 'value',
      key: 'value',
      render: (v: number) => <span style={{ fontWeight: 600, color: '#1038CC' }}>₹{v.toFixed(1)}L</span>
    },
    { title: 'Assigned RM', dataIndex: 'rm', key: 'rm' },
    {
      title: 'Stage',
      dataIndex: 'stage',
      key: 'stage',
      render: (s: string) => (
        <Tag color={s === 'SANCTIONED' ? 'green' : s === 'KYC_SUBMITTED' ? 'blue' : 'orange'}>
          {s}
        </Tag>
      )
    },
    {
      title: 'Flags',
      key: 'flags',
      render: (_: any, record: any) => (
        <Space>
          {record.isStuck && <Tag color="warning">Stuck</Tag>}
          {record.urgencyFlag && <Tag color="error">Urgent</Tag>}
          {record.npaFlag && <Tag color="red">NPA Risk</Tag>}
        </Space>
      )
    },
    { title: 'Created Date', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="AI Merchant X-Ray">
            <Button
              size="small"
              type="default"
              icon={<Brain size={13} />}
              onClick={() => handleOpenXray(record)}
              style={{ borderColor: '#7c3aed', color: '#7c3aed', fontSize: 11 }}
            >
              AI X-Ray
            </Button>
          </Tooltip>
          <Tooltip title="View KYC Documents">
            <Button
              size="small"
              type="default"
              onClick={() => {
                setKycLead(record);
                setKycDrawerOpen(true);
              }}
              style={{ fontSize: 11, marginLeft: 8 }}
            >
              KYC Docs
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ── Map API Leads to table format ──────────────────────────────────────────────
  const tableData = (leads || []).map((lead: any) => ({
    key: lead._id,
    id: lead._id.substring(18).toUpperCase(),
    leadId: lead._id,
    dealerId: lead.dealer?._id,
    dealer: lead.dealer?.businessName || lead.dealer?.name || 'Unknown',
    anchor: lead.anchor?.name || 'Unknown',
    value: lead.expectedValue || 0,
    rm: lead.assignedTo?.name || 'Unassigned',
    stage: lead.stage,
    isStuck: lead.isStuck,
    urgencyFlag: lead.urgencyFlag,
    npaFlag: lead.npaFlag,
    createdAt: dayjs(lead.createdAt).format('MMM D'),
  }));

  const handleCreateLead = (values: any) => {
    createLeadMutation.mutate({
      anchor: values.anchorId,
      dealer: values.dealerId,
      assignedTo: values.rmId,
      expectedValue: parseFloat(values.expectedValue), // Stored directly in Lakhs
      notes: values.notes,
      sanctionExpiryDate: values.expiryDate ? values.expiryDate.toISOString() : undefined,
      plannedVisitDate: values.plannedVisitDate ? values.plannedVisitDate.toISOString() : undefined,
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Lead Management</h2>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsModalVisible(true)} style={{ background: '#1038CC' }}>
          New Lead
        </Button>
      </div>

      {/* ── AI Smart Search Box (Feature 7) ── */}
      <div style={{
        background: 'linear-gradient(135deg, #f5f3ff, #fbfbfe)',
        border: '1px solid #ddd6fe',
        borderRadius: 12,
        padding: '14px 18px',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Sparkles size={14} color="#7c3aed" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#6d28d9' }}>AI Smart Search Filter</span>
          <span style={{ fontSize: 11, color: '#8b5cf6', marginLeft: 6 }}>Try: "Show pending KYC", "stuck cases", or "urgent leads"</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Input
            placeholder="Type search query in plain English..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onPressEnter={handleSmartSearch}
            prefix={<Search size={14} color="#aaa" />}
            style={{ borderRadius: 8, height: 38 }}
          />
          <Button
            type="primary"
            onClick={handleSmartSearch}
            loading={searchLoading}
            style={{ background: '#7c3aed', borderColor: '#7c3aed', borderRadius: 8, height: 38 }}
          >
            Search
          </Button>
        </div>

        {Object.keys(appliedFilters).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#666', marginRight: 4 }}>Applied AI Filters:</span>
            {appliedFilters.stage && <Tag color="blue">Stage: {appliedFilters.stage}</Tag>}
            {appliedFilters.isStuck && <Tag color="warning">Stuck Deals</Tag>}
            {appliedFilters.urgencyFlag && <Tag color="error">Urgent Only</Tag>}
            {appliedFilters.npaFlag && <Tag color="red">NPA Risk</Tag>}
            {appliedFilters.searchText && <Tag color="default">Text: "{appliedFilters.searchText}"</Tag>}
            <Button
              type="text"
              size="small"
              onClick={clearAiFilters}
              icon={<X size={12} />}
              style={{ fontSize: 11, height: 22, display: 'flex', alignItems: 'center', color: '#666' }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <Table columns={columns} dataSource={tableData} rowKey="key" size="small" />

      {/* ── New Lead Modal ─────────────────────────────────────────────────── */}
      <Modal
        title="Create New Lead"
        open={isModalVisible}
        onOk={() => {
          form.validateFields().then(values => {
            handleCreateLead(values);
          });
        }}
        confirmLoading={createLeadMutation.isPending}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedAnchor(null);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="anchorId" label="Select Anchor" rules={[{ required: true, message: 'Please select an anchor' }]}>
            <Select
              showSearch
              placeholder="Search Anchor"
              onChange={(val) => {
                setSelectedAnchor(val);
                form.setFieldValue('dealerId', undefined);
              }}
              options={(anchors || []).map((a: any) => ({ label: a.name, value: a._id }))}
            />
          </Form.Item>
          <Form.Item name="dealerId" label="Select Dealer" rules={[{ required: true, message: 'Please select a dealer' }]}>
            <Select
              showSearch
              placeholder="Search Dealer"
              disabled={!selectedAnchor}
              options={(dealers || []).map((d: any) => ({ label: d.businessName || d.name, value: d._id }))}
            />
          </Form.Item>
          <Form.Item name="expectedValue" label="Expected Deal Value (₹L)" rules={[{ required: true, message: 'Expected value is required' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="rmId" label="Assign To (RM)" rules={[{ required: true, message: 'Please assign an RM' }]}>
            <Select
              showSearch
              placeholder="Select RM"
              options={(rms || []).map((r: any) => ({ label: r.name, value: r._id }))}
            />
          </Form.Item>
          <Form.Item name="expiryDate" label="Sanction Expiry Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="plannedVisitDate" label="Scheduled Visit Date & Time">
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── AI Merchant X-Ray Drawer ───────────────────────────────────────── */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={16} color="#7c3aed" />
            <span>AI Merchant X-Ray</span>
            {xrayLead && (
              <Tag color="purple" style={{ fontSize: 11, marginLeft: 4 }}>
                {xrayLead.dealer}
              </Tag>
            )}
          </div>
        }
        width={560}
        open={xrayDrawerOpen}
        onClose={() => { setXrayDrawerOpen(false); setXrayData(null); setXrayLead(null); }}
        extra={
          <Button
            size="small"
            icon={<Sparkles size={12} />}
            onClick={handleRefreshXray}
            loading={xrayLoading}
            style={{ borderColor: '#7c3aed', color: '#7c3aed' }}
          >
            Regenerate
          </Button>
        }
      >
        <div style={{ marginBottom: 12, padding: '8px 12px', background: '#fafafa', borderRadius: 8, fontSize: 12, color: '#555' }}>
          <strong>Disclaimer:</strong> AI insights are advisory only and based solely on system records. They do not constitute official credit assessment or compliance decisions.
        </div>
        <AIInsightCard
          title={`${xrayLead?.dealer || 'Merchant'} Intelligence Report`}
          data={xrayData?.insight ?? null}
          isLoading={xrayLoading}
          onRefresh={handleRefreshXray}
          sections={XRAY_SECTIONS}
        />
      </Drawer>

      {/* ── KYC Documents Drawer ───────────────────────────────────────────── */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>KYC Documents</span>
            {kycLead && (
              <Tag color="blue" style={{ fontSize: 11, marginLeft: 4 }}>
                {kycLead.dealer}
              </Tag>
            )}
          </div>
        }
        width={560}
        open={kycDrawerOpen}
        onClose={() => { setKycDrawerOpen(false); setKycLead(null); }}
      >
        {kycLoading ? (
           <div>Loading documents...</div>
        ) : kycDocs && kycDocs.length > 0 ? (
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
             {kycDocs.map((doc: any) => (
               <div key={doc._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                   <strong>{doc.docType.replace('_', ' ')}</strong>
                   <Tag color={doc.status === 'VERIFIED' ? 'success' : 'processing'}>{doc.status}</Tag>
                 </div>
                 {doc.s3Url ? (
                   <div style={{ height: 120, width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
                      <img src={doc.s3Url.startsWith('/') ? `http://localhost:3000${doc.s3Url}` : doc.s3Url} alt={doc.docType} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                   </div>
                 ) : (
                   <div style={{ color: '#999', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No image available</div>
                 )}
                 <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                    Uploaded: {dayjs(doc.uploadedAt).format('MMM D, YYYY')}
                 </div>
               </div>
             ))}
           </div>
        ) : (
           <div style={{ padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8, textAlign: 'center', color: '#666' }}>
             No KYC documents uploaded yet.
           </div>
        )}
      </Drawer>
    </div>
  );
};

export default LeadsPage;
