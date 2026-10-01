import React from 'react';

export const SkeletonCard = () => (
  <div className="panel-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
    <div className="skeleton" style={{ height: '160px', width: '100%', borderRadius: 'var(--radius-sm)' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="skeleton" style={{ height: '20px', width: '45%' }} />
      <div className="skeleton" style={{ height: '20px', width: '25%', borderRadius: '999px' }} />
    </div>
    <div className="skeleton" style={{ height: '14px', width: '60%' }} />
    <div className="skeleton" style={{ height: '36px', width: '100%', marginTop: '0.5rem' }} />
  </div>
);

export const SkeletonTableRow = ({ columns = 8 }) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} style={{ padding: '0.85rem 1rem' }}>
        <div className="skeleton" style={{ height: '16px', width: i === 0 ? '60%' : '80%' }} />
      </td>
    ))}
  </tr>
);

export const SkeletonStat = () => (
  <div className="panel-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <div className="skeleton" style={{ height: '12px', width: '50%' }} />
    <div className="skeleton" style={{ height: '32px', width: '35%', marginTop: '0.25rem' }} />
    <div className="skeleton" style={{ height: '10px', width: '65%' }} />
  </div>
);
