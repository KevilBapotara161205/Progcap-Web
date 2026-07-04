/**
 * AIInsightCard — Reusable AI-generated insight display card
 * RBH Web Dashboard
 *
 * Always shows the "✨ AI Generated Insight" badge so users never
 * confuse AI content with official system data.
 */
import { useState } from 'react';
import { Button, Divider, Tag, Tooltip, Alert } from 'antd';
import { Sparkles, RefreshCw, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';
import AILoadingState from './AILoadingState';

interface Section {
  label: string;
  key: string;
  color?: string;
}

interface AIInsightCardProps {
  title?: string;
  data: Record<string, any> | string | null;
  isLoading?: boolean;
  isOffline?: boolean;
  onRefresh?: () => void;
  /** Which keys from data to display as sections */
  sections?: Section[];
  loadingLabel?: string;
  compact?: boolean;
}

const DEFAULT_SECTIONS: Section[] = [
  { label: 'Business Summary', key: 'businessSummary' },
  { label: 'Risk Assessment', key: 'riskAssessment', color: '#cf1322' },
  { label: 'Positive Signals', key: 'positiveSignals', color: '#389e0d' },
  { label: 'Concerns', key: 'potentialConcerns', color: '#d4380d' },
  { label: 'Conversation Points', key: 'suggestedConversationPoints' },
  { label: 'Recommended Follow-up', key: 'recommendedFollowUp', color: '#1038CC' },
  { label: 'Loan Opportunity', key: 'loanOpportunitySummary', color: '#531dab' },
];

const AIInsightCard = ({
  title = 'AI Generated Insight',
  data,
  isLoading = false,
  isOffline = false,
  onRefresh,
  sections = DEFAULT_SECTIONS,
  loadingLabel,
  compact = false,
}: AIInsightCardProps) => {
  const [collapsed, setCollapsed] = useState(false);

  // ── Offline state ────────────────────────────────────────────────────────────
  if (isOffline) {
    return (
      <div style={{
        border: '1px dashed #d0d0d0',
        borderRadius: 12,
        padding: 16,
        background: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        color: '#888',
      }}>
        <WifiOff size={16} />
        <span style={{ fontSize: 13 }}>AI insights unavailable offline. Connect to internet to use AI features.</span>
      </div>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (isLoading) {
    return <AILoadingState label={loadingLabel} />;
  }

  // ── No data / error state ────────────────────────────────────────────────────
  if (!data) {
    return (
      <Alert
        message="AI insight could not be generated"
        description="The AI service is temporarily unavailable. All business features remain fully functional."
        type="warning"
        showIcon
        icon={<Sparkles size={14} />}
        style={{ borderRadius: 10 }}
        action={onRefresh && (
          <Button size="small" type="text" icon={<RefreshCw size={12} />} onClick={onRefresh}>
            Retry
          </Button>
        )}
      />
    );
  }

  // ── Plain text response ──────────────────────────────────────────────────────
  if (typeof data === 'string') {
    return (
      <div style={{
        border: '1px solid #e0d7ff',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#fff',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f3f0ff, #ede9fe)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={13} color="#7c3aed" />
            <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>✨ AI Generated Insight</Tag>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4c1d95' }}>{title}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {onRefresh && (
              <Tooltip title="Regenerate">
                <Button size="small" type="text" icon={<RefreshCw size={12} />} onClick={onRefresh} />
              </Tooltip>
            )}
            <Button
              size="small"
              type="text"
              icon={collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>
        </div>
        {!collapsed && (
          <div style={{ padding: 16, fontSize: 13, lineHeight: 1.7, color: '#333' }}>
            {data}
          </div>
        )}
      </div>
    );
  }

  // ── Structured JSON response ──────────────────────────────────────────────────
  return (
    <div style={{
      border: '1px solid #e0d7ff',
      borderRadius: 12,
      overflow: 'hidden',
      background: '#fff',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #f3f0ff, #ede9fe)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={13} color="#7c3aed" />
          <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>✨ AI Generated Insight</Tag>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#4c1d95' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {onRefresh && (
            <Tooltip title="Regenerate">
              <Button size="small" type="text" icon={<RefreshCw size={12} />} onClick={onRefresh} />
            </Tooltip>
          )}
          <Button
            size="small"
            type="text"
            icon={collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            onClick={() => setCollapsed(!collapsed)}
          />
        </div>
      </div>

      {/* Sections */}
      {!collapsed && (
        <div style={{ padding: compact ? '10px 14px' : '14px 18px' }}>
          {sections.map((section, idx) => {
            const value = data[section.key];
            if (!value) return null;
            return (
              <div key={section.key}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: section.color || '#555' }}>
                    {section.label}
                  </span>
                  <div style={{ fontSize: 13, color: '#333', marginTop: 3, lineHeight: 1.65 }}>
                    {Array.isArray(value) ? (
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {value.map((item: string, i: number) => <li key={i}>{item}</li>)}
                      </ul>
                    ) : (
                      <span>{value}</span>
                    )}
                  </div>
                </div>
                {idx < sections.length - 1 && <Divider style={{ margin: '8px 0' }} />}
              </div>
            );
          })}
          <div style={{ marginTop: 10, fontSize: 10, color: '#aaa', textAlign: 'right' }}>
            AI-generated · Not official data · Based on system records only
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightCard;
