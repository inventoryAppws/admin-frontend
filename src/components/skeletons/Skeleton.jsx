import React from 'react';

export function Bone({ width, height, radius, style = {}, className = '' }) {
  return (
    <span
      className={`admin-skeleton-bone ${className}`}
      style={{
        width: width !== undefined ? width : '100%',
        height: height !== undefined ? height : '16px',
        borderRadius: radius !== undefined ? radius : '6px',
        ...style
      }}
    />
  );
}

export default Bone;
