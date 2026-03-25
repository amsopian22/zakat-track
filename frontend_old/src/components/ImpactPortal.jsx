import React from 'react';

const ImpactPortal = ({ isOpen, onClose, selectedMustahik, apiBase }) => {
  if (!isOpen) return null;

  return (
    <div className="card fade-in" style={{ 
      position: 'fixed', 
      top: '40%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)', 
      width: '480px', 
      zIndex: 10000, 
      background: 'rgba(11, 17, 33, 0.95)',
      backdropFilter: 'blur(25px)',
      border: '2px solid var(--accent-primary)',
      padding: '2rem',
      boxShadow: '0 0 120px rgba(0,0,0,0.9), 0 0 30px rgba(16, 185, 129, 0.2)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--accent-primary)', fontSize: '1rem', letterSpacing: '1px' }}>IMPACT TRACKING PORTAL</h3>
        <button 
          onClick={onClose}
          style={{ background: 'transparent', padding: '0', color: '#94a3b8' }}
        >✕</button>
      </div>
      <div style={{ margin: '1rem 0', fontSize: '0.85rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Lacak transparansi penyaluran zakat ke mustahik secara real-time:</p>
        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="label">Status Terakhir:</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>✓ TERSALURKAN</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="label">ID Distribusi:</span>
            <span style={{ fontFamily: 'monospace' }}>#DST-{selectedMustahik ? selectedMustahik.id.slice(0,4) : '4492'}-TRACK</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="label">Penerima (Asnaf):</span>
            <span style={{ fontWeight: '500' }}>{selectedMustahik ? selectedMustahik.name : 'Pak Ridwan'} ({selectedMustahik ? selectedMustahik.asnaf_category : 'Miskin'})</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="label">Kontribusi SDG:</span>
            <span style={{ color: 'var(--accent-primary)' }}>{selectedMustahik ? (selectedMustahik.sdgs_label || 'SDG 1: No Poverty') : 'SDG 1: No Poverty'}</span>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
        <div style={{ background: 'white', padding: '10px', borderRadius: '8px', display: 'inline-block', marginBottom: '10px' }}>
          <img src={`${apiBase}/api/v1/donation/qrcode/TRACK-${selectedMustahik ? selectedMustahik.id : 'GENERAL'}`} style={{ width: '120px', height: '120px' }} alt="Track" />
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Scan untuk sertifikat dampak blockchain-verified</p>
      </div>
      <button onClick={onClose} style={{ width: '100%', fontWeight: 'bold' }}>KEMBALI KE DASHBOARD</button>
    </div>
  );
};

export default ImpactPortal;
