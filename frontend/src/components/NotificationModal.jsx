import React from 'react';

const NotificationModal = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className="card fade-in" style={{ 
      position: 'absolute', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)', 
      width: '350px', 
      zIndex: 5000, 
      background: 'var(--bg-color)',
      border: `2px solid ${notification.type === 'success' ? 'var(--accent-primary)' : 'var(--accent-secondary)'}`,
      textAlign: 'center'
    }}>
      <h3 style={{ color: notification.type === 'success' ? 'var(--accent-primary)' : 'var(--accent-secondary)' }}>
        {notification.title}
      </h3>
      {notification.message && <p style={{ fontSize: '0.9rem', margin: '1rem 0' }}>{notification.message}</p>}
      {notification.details && (
        <div style={{ textAlign: 'left', margin: '1rem 0', fontSize: '0.85rem' }}>
          {notification.details.map(d => (
            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span className="label" style={{ color: 'var(--text-muted)' }}>{d.label}</span>
              <span>{d.val}</span>
            </div>
          ))}
        </div>
      )}
      {notification.impact && (
        <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
          Impact Contribution: {notification.impact}
        </div>
      )}
      <button onClick={onClose} style={{ width: '100%' }}>TUTUP</button>
    </div>
  );
};

export default NotificationModal;
