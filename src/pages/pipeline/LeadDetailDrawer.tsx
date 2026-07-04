import { Drawer, Descriptions, Steps, Timeline, Tag, Button, Space, Divider, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

interface LeadDetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  leadId: string | null;
  onReassign: () => void;
  onUpdateStage: () => void;
}

const STAGES = ['ASSIGNED', 'IN_PROGRESS', 'CREDIT_ASSESSMENT', 'KYC_SUBMITTED', 'SANCTIONED', 'DISBURSED'];

const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({ visible, onClose, leadId, onReassign, onUpdateStage }) => {
  // Fetch detailed lead data from API
  const { data: leadData, isLoading } = useQuery({
    queryKey: ['lead-detail', leadId],
    queryFn: async () => {
      const response = await axiosClient.get(`/leads/${leadId}`);
      return response.data.data;
    },
    enabled: !!leadId && visible
  });

  if (!leadId) return null;

  const lead = leadData;
  const currentStageIndex = lead ? STAGES.indexOf(lead.stage) : 0;

  const getDaysLeft = (expiryDate: string) => {
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <Drawer
      title={`Lead Details - ${leadId.substring(18).toUpperCase()}`}
      width={600}
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          <Button onClick={onReassign}>Reassign RM</Button>
          <Button type="primary" onClick={onUpdateStage}>Update Stage</Button>
        </Space>
      }
    >
      {isLoading || !lead ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Descriptions title="Business Information" bordered column={1} size="small">
            <Descriptions.Item label="Dealer Name">
              {lead.dealer?.businessName || lead.dealer?.name || 'Unknown'}
            </Descriptions.Item>
            <Descriptions.Item label="Anchor">
              {lead.anchor?.name || 'Unknown'}
            </Descriptions.Item>
            <Descriptions.Item label="Deal Value">
              ₹{(lead.expectedValue || 0).toFixed(1)}L
            </Descriptions.Item>
            <Descriptions.Item label="Assigned RM">
              {lead.assignedTo?.name || 'Unassigned'}
            </Descriptions.Item>
            <Descriptions.Item label="Sanction Expiry">
              {lead.sanctionExpiryDate ? (
                <span style={{ color: getDaysLeft(lead.sanctionExpiryDate) <= 14 ? 'red' : 'inherit' }}>
                  {new Date(lead.sanctionExpiryDate).toLocaleDateString('en-IN')}{' '}
                  ({getDaysLeft(lead.sanctionExpiryDate)} days left)
                </span>
              ) : (
                'N/A'
              )}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <h3>Stage Timeline</h3>
          <Steps
            current={currentStageIndex}
            size="small"
            direction="vertical"
            style={{ marginTop: 12, marginBottom: 12 }}
            items={[
              { title: 'Assigned' },
              { title: 'In Progress' },
              { title: 'Credit Assessment' },
              { title: 'KYC Submitted' },
              { title: 'Sanctioned' },
              { title: 'Disbursed' },
            ]}
          />

          <Divider />

          <h3>System Flags</h3>
          <Space style={{ marginBottom: 16 }}>
            {lead.isStuck && <Tag color="warning">Stuck Lead (Action Required)</Tag>}
            {lead.urgencyFlag && <Tag color="error">Urgent Follow-up</Tag>}
            {lead.npaFlag && <Tag color="red">NPA / DPD High Risk</Tag>}
            {!lead.isStuck && !lead.urgencyFlag && !lead.npaFlag && <Tag color="success">Healthy Progression</Tag>}
          </Space>

          <Divider />

          <h3>Assignment History</h3>
          <Timeline
            mode="left"
            items={(lead.assignmentHistory || []).map((history: any) => ({
              label: new Date(history.assignedAt).toLocaleDateString('en-IN'),
              children: `Assigned to RM: ${history.rm?.name || 'Unknown'} by Admin (Reason: ${history.reason || 'Initial'})`,
            }))}
          />
        </>
      )}
    </Drawer>
  );
};

export default LeadDetailDrawer;
