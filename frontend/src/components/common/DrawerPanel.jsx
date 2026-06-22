import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DrawerPanel.css';

export default function DrawerPanel({ children, closeEventName, returnPath = '/', maxWidth }) {
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(returnPath);
    }, 250);
  };

  useEffect(() => {
    if (!closeEventName) return;
    const onExit = () => handleClose();
    window.addEventListener(closeEventName, onExit);
    return () => window.removeEventListener(closeEventName, onExit);
  }, [closeEventName, returnPath, navigate]);

  return (
    <>
      <div className={`drawer-backdrop ${isExiting ? 'exiting' : ''}`} onClick={handleClose}></div>
      <div 
        className={`drawer-panel ${isExiting ? 'exiting' : ''}`}
        style={maxWidth ? { maxWidth } : undefined}
      >
        {children}
      </div>
    </>
  );
}
