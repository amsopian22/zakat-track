import React, { useMemo } from 'react';

const QRModal = ({ isOpen, onClose, apiBase }) => {
  const transactionId = useMemo(() => Math.floor(Math.random() * 9999), []);
  const donId = useMemo(() => Math.floor(Math.random() * 9999), []);

  if (!isOpen) return null;

  return (
    <div className="card fade-in" style={{ 
      position: 'fixed', 
      top: '40%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)', 
      width: '400px', 
      zIndex: 10000, 
      background: 'rgba(11, 17, 33, 0.95)',
      backdropFilter: 'blur(25px)',
      border: '2px solid var(--accent-secondary)',
      textAlign: 'center',
      padding: '2rem',
      boxShadow: '0 0 100px rgba(0,0,0,0.9), 0 0 30px rgba(245, 158, 11, 0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
        <span style={{ color: 'var(--accent-secondary)', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '1px' }}>QRIS DONATION</span>
        <button 
          onClick={onClose}
          style={{ background: 'transparent', padding: '0', color: '#94a3b8' }}
        >✕</button>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Scan QR di bawah untuk melakukan pembayaran zakat/infak secara instan:
      </p>
      <div style={{ background: 'white', padding: '15px', borderRadius: '12px', display: 'inline-block', boxShadow: '0 0 25px rgba(255,255,255,0.1)' }}>
        <img src={`${apiBase}/api/v1/donation/qrcode/DON-${donId}`} style={{ width: '200px', height: '200px' }} alt="QRIS" />
      </div>
      <div style={{ margin: '1.5rem 0', padding: '12px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '10px', fontSize: '0.75rem', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
        <p>ID Transaksi: <strong>#TRX-{transactionId}</strong></p>
        <p>Merchant: <strong>ZAKATTRACK DIGITAL</strong></p>
      </div>
      <button onClick={onClose} style={{ width: '100%', background: 'var(--accent-secondary)', fontWeight: 'bold' }}>BATALKAN</button>
    </div>
  );
};

export default QRModal;
