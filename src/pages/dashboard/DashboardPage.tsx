import { useState } from 'react';
import { Row, Col, DatePicker, Select, Table, Space, Tag, Button, Tooltip } from 'antd';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Briefcase, IndianRupee, Users, AlertTriangle, Sparkles } from 'lucide-react';
import StatCard from '../../components/StatCard/StatCard';
import AIInsightCard from '../../components/AI/AIInsightCard';
import { getManagerInsights } from '../../api/aiApi';
import axiosClient from '../../api/axiosClient';

const { RangePicker } = DatePicker;

const funnelData = [
  { stage: 'Assigned',   count: 120, value: '₹4.2Cr', percentage: 100, color: '#0535E9' },
  { stage: 'Credit',     count: 85,  value: '₹3.1Cr', percentage: 71,  color: '#254eda' },
  { stage: 'KYC',        count: 50,  value: '₹1.8Cr', percentage: 42,  color: '#7C3AED' },
  { stage: 'Sanctioned', count: 30,  value: '₹1.2Cr', percentage: 25,  color: '#00B96B' },
  { stage: 'Disbursed',  count: 15,  value: '₹50L',   percentage: 13,  color: '#F10BF8' },
];

const FunnelChart = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
    {funnelData.map((item, index) => {
      const convRate = index > 0
        ? `${Math.round((item.count / funnelData[index - 1].count) * 100)}% from prev`
        : '—';

      return (
        <div key={index}>
          {/* Label row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0A0F1E' }}>{item.stage}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontWeight: 800, color: '#0A0F1E', fontSize: 13 }}>{item.count}</span>
              <span style={{ color: '#94A3B8', fontSize: 11, marginLeft: 4 }}>{item.value}</span>
            </div>
          </div>

          {/* Progress bar */}
          <Tooltip title={index > 0 ? convRate : 'Entry point'}>
            <div style={{ background: '#EEF1FF', borderRadius: 8, height: 22, overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
              <div
                style={{
                  width: `${item.percentage}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}CC 100%)`,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: 8,
                  transition: 'width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
              >
                {item.percentage > 25 && (
                  <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{item.percentage}%</span>
                )}
              </div>
            </div>
          </Tooltip>
        </div>
      );
    })}
  </div>
);

const DashboardPage = () => {
  const [dateRange, setDateRange] = useState<any>([dayjs().startOf('month'), dayjs()]);
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTriggered, setAiTriggered] = useState(false);

  const handleGenerateInsights = async () => {
    setAiTriggered(true);
    setAiLoading(true);
    const result = await getManagerInsights();
    setAiInsight(result);
    setAiLoading(false);
  };

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', dateRange],
    queryFn: async () => {
      const response = await axiosClient.get('/dashboard/summary');
      return response.data.data;
    },
  });

  const stuckCasesColumns = [
    {
      title: 'RM Name', dataIndex: 'rmName', key: 'rmName',
      render: (name: string) => <span style={{ fontWeight: 600 }}>{name}</span>
    },
    { title: 'Dealer', dataIndex: 'dealer', key: 'dealer' },
    {
      title: 'Stage', dataIndex: 'stage', key: 'stage',
      render: (s: string) => (
        <Tag style={{ background: '#FFF7E6', color: '#D46B08', border: 'none', borderRadius: 100, fontWeight: 700, fontSize: 11 }}>
          {s}
        </Tag>
      )
    },
    {
      title: 'Days Stuck', dataIndex: 'daysStuck', key: 'daysStuck',
      render: (d: number) => (
        <span style={{ fontWeight: 700, color: d > 10 ? '#FF4D4F' : '#FA8C16' }}>{d}d</span>
      )
    },
    {
      title: 'Deal Value', dataIndex: 'value', key: 'value',
      render: (v: number) => <span style={{ fontWeight: 700 }}>₹{v}L</span>
    },
    {
      title: 'Action', key: 'action',
      render: () => (
        <Button
          type="link"
          size="small"
          style={{ padding: 0, fontSize: 12, fontWeight: 600, color: '#0535E9' }}
        >
          View →
        </Button>
      )
    },
  ];

  const expiringColumns = [
    {
      title: 'Dealer', dataIndex: 'dealer', key: 'dealer',
      render: (d: string) => <span style={{ fontWeight: 600 }}>{d}</span>
    },
    { title: 'RM', dataIndex: 'rmName', key: 'rmName' },
    { title: 'Expiry Date', dataIndex: 'expiryDate', key: 'expiryDate' },
    {
      title: 'Days Left',
      dataIndex: 'daysLeft',
      key: 'daysLeft',
      render: (d: number) => (
        <Tag
          style={{
            background: d < 3 ? '#FFF1F0' : '#FFF7E6',
            color: d < 3 ? '#FF4D4F' : '#D46B08',
            border: 'none',
            borderRadius: 100,
            fontWeight: 700,
            fontSize: 11,
          }}
        >
          {d < 3 ? '🔴' : '🟡'} {d}d left
        </Tag>
      )
    },
    {
      title: 'Value', dataIndex: 'value', key: 'value',
      render: (v: number) => <span style={{ fontWeight: 700 }}>₹{v}L</span>
    },
  ];

  return (
    <div className="fade-in-up">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0A0F1E' }}>
            Portfolio Overview
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748B', fontWeight: 400 }}>
            {dayjs().format('dddd, MMMM D, YYYY')}
          </p>
        </div>
        <Space>
          <Select
            defaultValue="all"
            size="small"
            style={{ width: 130, fontSize: 12 }}
            options={[{ value: 'all', label: 'All Regions' }]}
          />
          <Select
            defaultValue="all"
            size="small"
            style={{ width: 130, fontSize: 12 }}
            options={[{ value: 'all', label: 'All Clusters' }]}
          />
          <RangePicker size="small" value={dateRange} onChange={setDateRange} style={{ fontSize: 12 }} />
        </Space>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Leads in Pipeline"
            value={stats?.totalLeads ?? 0}
            subtitle={`${stats?.activeLeads ?? 0} active · ${stats?.stuckLeads ?? 0} stuck`}
            icon={<Briefcase size={20} />}
            accentColor="#0535E9"
            trend={{ value: '8%', isPositive: true }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Disbursed MTD"
            value={`₹${stats?.disbursedValue ?? 0} Cr`}
            subtitle={`${stats?.disbursedTargetPerc ?? 0}% of monthly target`}
            subtitleColor="#00B96B"
            icon={<IndianRupee size={20} />}
            accentColor="#00B96B"
            trend={{ value: '12%', isPositive: true }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Portfolio NPA%"
            value={`${stats?.npaPercentage ?? 0}%`}
            subtitle={stats && stats.npaPercentage < 2 ? '✅ Within healthy range' : '⚠️ Needs attention'}
            subtitleColor={stats && stats.npaPercentage < 2 ? '#00B96B' : '#FA8C16'}
            icon={<AlertTriangle size={20} />}
            accentColor={stats && stats.npaPercentage < 2 ? '#00B96B' : '#FA8C16'}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Active RMs Today"
            value={`${stats?.activeRMs ?? 0}/${stats?.totalRMs ?? 0}`}
            subtitle="Checked in via SFA App"
            icon={<Users size={20} />}
            accentColor="#7C3AED"
          />
        </Col>
      </Row>

      {/* ── Charts + Tables Row ──────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Funnel */}
        <Col xs={24} lg={8}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E4E9FF', boxShadow: '0 2px 16px rgba(5,53,233,0.07)', height: '100%' }}>
            {/* Card Header */}
            <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #EEF1FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#0A0F1E' }}>Pipeline Funnel</span>
              <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>MTD Conversion</span>
            </div>
            <div style={{ padding: '20px' }}>
              <FunnelChart />
            </div>
          </div>
        </Col>

        {/* Stuck + Expiring Tables */}
        <Col xs={24} lg={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stuck Cases */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E4E9FF', boxShadow: '0 2px 16px rgba(5,53,233,0.07)' }}>
              <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #EEF1FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FA8C16' }} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#0A0F1E' }}>Stuck Cases</span>
                  <Tag style={{ background: '#FFF7E6', color: '#D46B08', border: 'none', borderRadius: 100, fontWeight: 700, fontSize: 11, marginLeft: 4 }}>
                    Needs Attention
                  </Tag>
                </div>
                <Button type="link" size="small" style={{ color: '#0535E9', fontWeight: 600, fontSize: 12 }}>
                  View All →
                </Button>
              </div>
              <Table
                size="small"
                columns={stuckCasesColumns}
                dataSource={stats?.stuckCases ?? []}
                pagination={false}
                locale={{ emptyText: <div style={{ padding: '20px', color: '#94A3B8', fontSize: 13 }}>✅ No stuck cases currently</div> }}
                style={{ borderRadius: '0 0 16px 16px', overflow: 'hidden' }}
              />
            </div>

            {/* Expiring Sanctions */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E4E9FF', boxShadow: '0 2px 16px rgba(5,53,233,0.07)' }}>
              <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #EEF1FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF4D4F' }} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#0A0F1E' }}>Expiring Sanctions</span>
                  <Tag style={{ background: '#FFF1F0', color: '#CF1322', border: 'none', borderRadius: 100, fontWeight: 700, fontSize: 11, marginLeft: 4 }}>
                    Next 7 Days
                  </Tag>
                </div>
                <Button type="link" size="small" style={{ color: '#0535E9', fontWeight: 600, fontSize: 12 }}>
                  View All →
                </Button>
              </div>
              <Table
                size="small"
                columns={expiringColumns}
                dataSource={stats?.expiringSanctions ?? []}
                pagination={false}
                locale={{ emptyText: <div style={{ padding: '20px', color: '#94A3B8', fontSize: 13 }}>✅ No expiring sanctions in next 7 days</div> }}
                style={{ borderRadius: '0 0 16px 16px', overflow: 'hidden' }}
              />
            </div>
          </div>
        </Col>
      </Row>

      {/* ── AI Manager Insights ──────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #EEF1FF', paddingTop: 20, marginTop: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg, #7C3AED, #0535E9)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Sparkles size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0A0F1E' }}>Weekly Portfolio Intelligence</div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>Powered by Gemini AI · Updates weekly</div>
            </div>
          </div>
          <Button
            icon={<Sparkles size={13} />}
            onClick={handleGenerateInsights}
            loading={aiLoading}
            style={{
              background: 'linear-gradient(90deg, #7C3AED, #0535E9)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              height: 36,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {aiTriggered ? 'Regenerate' : 'Generate AI Summary'}
          </Button>
        </div>

        {aiTriggered && (
          <AIInsightCard
            title="Manager Weekly Portfolio Insights"
            data={aiInsight?.insights ?? null}
            isLoading={aiLoading}
            onRefresh={handleGenerateInsights}
            sections={[
              { label: 'Executive Summary', key: 'executiveSummary' },
              { label: 'Team Performance', key: 'teamPerformanceHighlights', color: '#389e0d' },
              { label: 'High Risk Cases', key: 'highRiskCases', color: '#cf1322' },
              { label: 'Pending Attention', key: 'pendingAttentionItems', color: '#d4380d' },
              { label: 'Weekly Recommendations', key: 'weeklyRecommendations', color: '#0535E9' },
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
