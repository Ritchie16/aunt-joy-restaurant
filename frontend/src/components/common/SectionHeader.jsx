import React from 'react';
import './SectionHeader.css';

const SectionHeader = ({ title, subtitle, align = 'center' }) => {
  return (
    <div className={`section-header ${align}`}>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
};

export default SectionHeader;