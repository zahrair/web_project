import React from 'react';
import './Widget.css';

const Widget = ({ title, description, path, onNavigate }) => {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate(path); // Call the navigation function with the path
    }
  };

  return (
    <div className="widget" onClick={handleClick}>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
};

export default Widget;
