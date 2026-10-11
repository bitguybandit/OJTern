import React from 'react';

const Badge = ({ status, text }) => {
  const normalized = (status || '').toString().toLowerCase();

  let variant = 'default';
  if (['approved', 'verified', 'active', 'placed', 'accepted'].includes(normalized)) {
    variant = 'success';
  } else if (['rejected', 'inactive', 'rejectedbypartner'].includes(normalized)) {
    variant = 'danger';
  } else if (['pending', 'draft'].includes(normalized)) {
    variant = 'warning';
  } else if (['returnedforcorrection'].includes(normalized)) {
    variant = 'attention';
  } else if (['closed'].includes(normalized)) {
    variant = 'neutral';
  }

  const displayText = text || status;

  return (
    <span className={`badge badge-${variant}`}>
      <span className="badge-dot"></span>
      {displayText}
    </span>
  );
};

export default Badge;
