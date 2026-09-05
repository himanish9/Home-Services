import React from 'react';

const STAGES = [
  { key: 'PENDING', label: 'Requested', desc: 'Awaiting provider' },
  { key: 'ACCEPTED', label: 'Accepted', desc: 'Technician assigned' },
  { key: 'ON_THE_WAY', label: 'On The Way', desc: 'Travelling to location' },
  { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Work underway' },
  { key: 'COMPLETED', label: 'Completed', desc: 'Job finished' }
];

const StatusTracker = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <div style={{
        background: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        color: '#991b1b',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        margin: '1.5rem 0'
      }}>
        <span style={{ fontSize: '1.25rem' }}>✕</span>
        <div>This booking was cancelled.</div>
      </div>
    );
  }

  const stageKeys = STAGES.map((s) => s.key);
  const currentIndex = stageKeys.indexOf(status);

  return (
    <div style={{ margin: '2rem 0' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        position: 'relative',
        marginBottom: '1rem'
      }}>
        {/* Progress Bar Background */}
        <div style={{
          position: 'absolute',
          top: '18px',
          left: '5%',
          right: '5%',
          height: '4px',
          background: '#e2e8f0',
          zIndex: 0
        }} />

        {/* Active Progress Bar Fill */}
        <div style={{
          position: 'absolute',
          top: '18px',
          left: '5%',
          width: `${Math.max(0, (currentIndex / (STAGES.length - 1)) * 90)}%`,
          height: '4px',
          background: '#2563eb',
          zIndex: 0,
          transition: 'width 0.4s ease'
        }} />

        {STAGES.map((stage, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={stage.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                zIndex: 1,
                width: '80px'
              }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: isDone ? '#2563eb' : '#ffffff',
                border: `3px solid ${isDone ? '#2563eb' : '#cbd5e1'}`,
                color: isDone ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                boxShadow: isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.25)' : 'var(--shadow-sm)',
                transition: 'all 0.3s ease'
              }}>
                {idx < currentIndex ? '✓' : idx + 1}
              </div>

              <span style={{
                fontSize: '0.8rem',
                fontWeight: isCurrent ? 800 : 600,
                color: isDone ? '#0f172a' : '#94a3b8',
                marginTop: '0.5rem',
                whiteSpace: 'nowrap'
              }}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTracker;
