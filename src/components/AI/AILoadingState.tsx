/**
 * AILoadingState — Shimmer placeholder while AI generates response
 */
import { Skeleton } from 'antd';
import { Sparkles } from 'lucide-react';

const AILoadingState = ({ label = 'Generating AI insight...' }: { label?: string }) => (
  <div style={{
    border: '1px solid #e0d7ff',
    borderRadius: 12,
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #fafaff, #f3f0ff)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <Sparkles size={14} style={{ color: '#7c3aed', animation: 'spin 2s linear infinite' }} />
      <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>{label}</span>
    </div>
    <Skeleton active paragraph={{ rows: 3 }} title={false} />
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default AILoadingState;
