
import { Table, DatePicker, Select, Space, Button, Card, Row, Col } from 'antd';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line, ResponsiveContainer, ReferenceLine } from 'recharts';

const { RangePicker } = DatePicker;

const AnalyticsPage = () => {
  const scoreData = [
    { key: '1', rmName: 'Rahul Sharma', cluster: 'North-1', target: 50, actual: 55, achievement: 110, npa: 1.2, conversion: 65, visits: 120, rank: 1 },
    { key: '2', rmName: 'Anjali Verma', cluster: 'North-1', target: 40, actual: 35, achievement: 87.5, npa: 2.1, conversion: 55, visits: 98, rank: 2 },
    { key: '3', rmName: 'Vikram Singh', cluster: 'North-2', target: 45, actual: 25, achievement: 55.5, npa: 3.5, conversion: 40, visits: 70, rank: 3 },
  ];

  const columns = [
    { title: 'Rank', dataIndex: 'rank', key: 'rank', sorter: (a: any, b: any) => a.rank - b.rank },
    { title: 'RM Name', dataIndex: 'rmName', key: 'rmName' },
    { title: 'Cluster', dataIndex: 'cluster', key: 'cluster' },
    { title: 'Target ₹L', dataIndex: 'target', key: 'target', sorter: (a: any, b: any) => a.target - b.target },
    { title: 'Actual ₹L', dataIndex: 'actual', key: 'actual', sorter: (a: any, b: any) => a.actual - b.actual },
    { 
      title: 'Achieved %', 
      dataIndex: 'achievement', 
      key: 'achievement',
      render: (val: number) => (
        <span style={{ 
          color: val >= 100 ? '#52c41a' : (val >= 70 ? '#faad14' : '#ff4d4f'),
          fontWeight: 'bold' 
        }}>
          {val}%
        </span>
      ),
      sorter: (a: any, b: any) => a.achievement - b.achievement
    },
    { title: 'NPA %', dataIndex: 'npa', key: 'npa' },
  ];

  const barData = [
    { name: 'Rahul S.', disbursed: 55 },
    { name: 'Anjali V.', disbursed: 35 },
    { name: 'Vikram S.', disbursed: 25 },
  ];

  const trendData = [
    { month: 'May', actual: 120, target: 150 },
    { month: 'Jun', actual: 140, target: 150 },
    { month: 'Jul', actual: 160, target: 150 },
    { month: 'Aug', actual: 190, target: 180 },
    { month: 'Sep', actual: 175, target: 180 },
    { month: 'Oct', actual: 115, target: 200 },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Performance Analytics</h2>
        <Space>
          <Button icon={<Download size={16} />}>Export Report</Button>
        </Space>
      </div>

      <div style={{ padding: 16, background: '#fafafa', borderRadius: 8, marginBottom: 24, display: 'flex', gap: 16 }}>
        <RangePicker />
        <Select placeholder="All Clusters" style={{ width: 150 }} />
        <Select mode="multiple" placeholder="Select RMs" style={{ minWidth: 200 }} />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Regional RM Comparison (Disbursed ₹L)" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <ReferenceLine y={40} label="Target" stroke="red" strokeDasharray="3 3" />
                <Bar dataKey="disbursed" fill="#1038CC" name="Disbursed Value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="6-Month Trend (Overall Disbursal vs Target)" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#1038CC" strokeWidth={3} name="Actual Disbursed" />
                <Line type="monotone" dataKey="target" stroke="#ff4d4f" strokeDasharray="5 5" name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title="RM Scorecards" bordered={false}>
        <Table columns={columns} dataSource={scoreData} pagination={false} />
      </Card>
    </div>
  );
};

export default AnalyticsPage;
