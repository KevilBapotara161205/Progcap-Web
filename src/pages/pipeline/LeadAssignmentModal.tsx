import { Modal, Form, Select, Input, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

interface LeadAssignmentModalProps {
  visible: boolean;
  onCancel: () => void;
  selectedLeadIds: string[];
}

const LeadAssignmentModal: React.FC<LeadAssignmentModalProps> = ({ visible, onCancel, selectedLeadIds }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch real RMs
  const { data: rms, isLoading } = useQuery({
    queryKey: ['rms-list'],
    queryFn: async () => {
      const response = await axiosClient.get('/users', { params: { role: 'RM', limit: 100 } });
      return response.data.data;
    },
    enabled: visible
  });

  // Mutation to assign leads
  const assignMutation = useMutation({
    mutationFn: async (payload: { rmId: string; reason: string }) => {
      // Call assign endpoint for each selected lead
      const requests = selectedLeadIds.map(leadId =>
        axiosClient.patch(`/leads/${leadId}/assign`, {
          assignedTo: payload.rmId,
          reason: payload.reason
        })
      );
      return Promise.all(requests);
    },
    onSuccess: () => {
      message.success(`Successfully reassigned ${selectedLeadIds.length} lead(s)`);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      form.resetFields();
      onCancel();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to reassign leads');
    }
  });

  const onOk = async () => {
    try {
      const values = await form.validateFields();
      assignMutation.mutate({
        rmId: values.rmId,
        reason: values.reason
      });
    } catch (e) {
      // Validation failed
    }
  };

  return (
    <Modal
      title="Reassign Leads"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={assignMutation.isPending}
      okText="Reassign"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="rmId"
          label="Select New RM"
          rules={[{ required: true, message: 'Please select an RM' }]}
        >
          <Select
            showSearch
            placeholder="Search RM by name"
            loading={isLoading}
            options={(rms || []).map((rm: any) => ({ label: rm.name, value: rm._id }))}
          />
        </Form.Item>
        <Form.Item
          name="reason"
          label="Reason for Reassignment"
          rules={[{ required: true, message: 'Please provide a reason' }]}
        >
          <Input.TextArea rows={3} placeholder="e.g. Current RM on leave" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LeadAssignmentModal;
