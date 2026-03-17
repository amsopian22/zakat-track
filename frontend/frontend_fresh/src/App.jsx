import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import logo from './assets/logo.png';
import { LayoutDashboard, Users, Map as MapIcon, Search, Bell, Plus, QrCode } from 'lucide-react';
import SurveyForm from './components/SurveyForm';

// Fix for default marker icon in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_BASE = "http://127.0.0.1:8000";

function App() {
  const [mustahiks, setMustahiks] = useState([]);
  const [selectedMustahik, setSelectedMustahik] = useState(null);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showImpactPortal, setShowImpactPortal] = useState(false);
  const [showcaseMode, setShowcaseMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);

  const stats = useMemo(() => {
    const total = mustahiks.length;
    if (total === 0) return { totalDist: 0, sdg1: 0, sdg2: 0 };

    const sdg1Count = mustahiks.filter(m => m.sdgs_label === 'SDG 1: No Poverty').length;
    const sdg2Count = mustahiks.filter(m => m.sdgs_label === 'SDG 2: Zero Hunger').length;

    return {
      totalDist: (total * 2500000), // Asumsi 2.5jt per mustahik
      sdg1: Math.round((sdg1Count / total) * 100),
      sdg2: Math.round((sdg2Count / total) * 100)
    };
  }, [mustahiks]);

  // Map Controller Component to handle flyTo and fitBounds
  function MapController({ selected, list }) {
    const map = useMap();
    
    useEffect(() => {
      if (selected) {
        map.flyTo([selected.lat, selected.lng], 16, { duration: 1.5 });
      }
    }, [selected, map]);

    useEffect(() => {
      if (list.length > 0) {
        const bounds = L.latLngBounds(list.map(m => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }, [list, map]);

    return null;
  }

  useEffect(() => {
    fetchMustahiks();
  }, []);

  const fetchMustahiks = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/mustahiks`);
      const data = await res.json();
      setMustahiks(data);
    } catch (err) {
      console.error("Gagal mengambil data mustahik:", err);
      // Fallback for demo
      setMustahiks([
        { id: '1', name: "Pak Ahmad", asnaf_category: "Fakir", priority_score: 0.85, lat: -0.502, lng: 117.153, income: 800000 },
      ]);
    }
  };

  const handleSurveySubmit = async (formData) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/mustahik`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsSurveyOpen(false);
        fetchMustahiks();
      }
    } catch (err) {
      console.error("Gagal menyimpan mustahik:", err);
      alert("Error saving data. Make sure backend is running.");
    }
  };

  const handleDisbursement = (m) => {
    setIsProcessing(true);
    // Simulasi Delay untuk "Feel" PIDI 4.0
    setTimeout(() => {
      setIsProcessing(false);
      setNotification({
        title: "⚡ PENYALURAN BERHASIL",
        message: `Dana QRIS Rp 2.500.000 telah terkirim ke: ${m.name}`,
        type: "success",
        impact: m.sdgs_label || 'SDG 1'
      });
    }, 1500);
  };

  const handleViewDetail = (m) => {
    setNotification({
      title: "RINGKASAN MUSTAHIK",
      details: [
        { label: "NIM", val: m.nim || 'MST-New' },
        { label: "Kategori", val: m.asnaf_category },
        { label: "Pilar SDGs", val: m.sdgs_label || 'SDG 1' },
        { label: "Garis Kemiskinan", val: "Rp 720.000" }
      ],
      type: "info"
    });
  };

  const handleDonateIn = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowQR(true);
    }, 1200);
  };

  const handleTrackImpact = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowImpactPortal(true);
    }, 1000);
  };
  const handleDeleteMustahik = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data mustahik ini? Tindakan ini tidak dapat dibatalkan.")) {
      try {
        const res = await fetch(`${API_BASE}/api/v1/mustahik/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setSelectedMustahik(null);
          fetchMustahiks();
          setNotification({
            title: "🗑️ DATA DIHAPUS",
            message: "Data mustahik telah berhasil dihapus dari sistem.",
            type: "info"
          });
        }
      } catch (err) {
        console.error("Gagal menghapus mustahik:", err);
        alert("Error deleting data.");
      }
    }
  };

  return (
    <div className={`dashboard-container ${showcaseMode ? 'showcase-mode' : ''}`}>
      {showcaseMode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 150px rgba(16, 185, 129, 0.1)',
          zIndex: 10000,
          animation: 'pulse 4s infinite'
        }} />
      )}
      <header>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={logo} alt="ZakatTrack Logo" style={{ width: '38px', height: '38px', borderRadius: '8px', boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)' }} />
          <span style={{ fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
            ZakatTrack
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div 
            onClick={() => setShowcaseMode(!showcaseMode)}
            style={{ 
              cursor: 'pointer', 
              padding: '0.4rem 0.8rem', 
              borderRadius: '20px', 
              background: showcaseMode ? 'linear-gradient(45deg, #10b981, #3b82f6)' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
          >
            {showcaseMode ? '✨ SHOWCASE MODE ON' : 'ENTER SHOWCASE'}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Cari Mustahik..." 
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
            />
          </div>
          <Bell size={20} />
          <button 
            onClick={() => setIsSurveyOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-primary)' }}
          >
            <Plus size={18} /> Survey Baru
          </button>
        </div>
      </header>

      <aside className="sidebar">
        <div className="card fade-in">
          <h3>Ringkasan Distribusi</h3>
          <div className="value">Rp { (stats.totalDist / 1000000).toFixed(1) }M</div>
          <div className="label">Total Dana Tersalurkan</div>
        </div>

        <div className="card fade-in" style={{ animationDelay: '0.1s' }}>
          <h3>Mustahik Terdaftar</h3>
          <div className="value">{mustahiks.length}</div>
          <div className="label">Terverifikasi (13 Kriteria)</div>
        </div>

        <div className="card fade-in" style={{ animationDelay: '0.2s' }}>
          <h3>Prioritas Tertinggi</h3>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {mustahiks.slice(0, 3).map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>{m.name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#10b981' }}>{m.sdgs_label || 'SDG 1'}</span>
                </div>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>{Math.round(m.priority_score * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card fade-in" style={{ animationDelay: '0.3s', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <h3 style={{ color: '#3b82f6' }}>SDGs Matrix Integration</h3>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>SDG 1: No Poverty</span>
              <span style={{ color: '#10b981' }}>{stats.sdg1}%</span>
            </div>
            <div className="progress-bar" style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
              <div style={{ width: `${stats.sdg1}%`, height: '100%', background: '#10b981', borderRadius: '2px' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0 5px 0' }}>
              <span>SDG 2: Zero Hunger</span>
              <span style={{ color: '#f59e0b' }}>{stats.sdg2}%</span>
            </div>
            <div className="progress-bar" style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
              <div style={{ width: `${stats.sdg2}%`, height: '100%', background: '#f59e0b', borderRadius: '2px' }}></div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            onClick={handleDonateIn}
            className="card" 
            style={{ width: '100%', background: 'linear-gradient(45deg, #f59e0b, #d97706)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <QrCode size={18} color="white" />
            <span style={{ color: 'white' }}>QRIS Donation (In)</span>
          </button>
          
          <button 
            onClick={handleTrackImpact}
            className="card" 
            style={{ width: '100%', border: '1px dashed var(--accent-secondary)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Users size={18} color="#f59e0b" />
            <span style={{ color: '#f59e0b' }}>Track Impact Portal</span>
          </button>
        </div>
      </aside>

      <main className="map-viewport">
        <MapContainer 
          center={[-0.502, 117.153]} 
          zoom={14} 
          scrollWheelZoom={true}
          zoomControl={false}
        >
          <MapController selected={selectedMustahik} list={mustahiks} />
          <TileLayer
            attribution='&copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {mustahiks.map(m => (
            <React.Fragment key={m.id}>
              <Marker position={[m.lat, m.lng]} eventHandlers={{
                click: () => setSelectedMustahik(m)
              }}>
                <Popup>
                  <div style={{ color: '#1e293b' }}>
                    <strong style={{ fontSize: '1.1rem' }}>{m.name}</strong><br/>
                    <span style={{ color: m.asnaf_category === 'Fakir' ? '#ef4444' : '#f59e0b', fontWeight: 'bold' }}>{m.asnaf_category}</span><br/>
                    Score: <strong>{Math.round(m.priority_score * 100)}%</strong>
                  </div>
                </Popup>
              </Marker>
              <Circle 
                center={[m.lat, m.lng]} 
                radius={200}
                pathOptions={{ 
                  fillColor: m.asnaf_category === 'Fakir' ? '#ef4444' : '#f59e0b',
                  color: 'transparent',
                  fillOpacity: 0.2
                }}
              />
            </React.Fragment>
          ))}
        </MapContainer>

        {/* Floating Details Overlay */}
        {selectedMustahik && !showQR && !showImpactPortal && !notification && (
          <div className="card fade-in" style={{ 
            position: 'absolute', 
            top: '20px', 
            right: '20px', 
            width: '320px', 
            zIndex: 1000, 
            background: 'rgba(11, 17, 33, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>{selectedMustahik.name}</h2>
              <button 
                onClick={() => setSelectedMustahik(null)}
                style={{ background: 'transparent', padding: '0', color: '#94a3b8' }}
              >✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="label">NIK</span>
                <span>{selectedMustahik.nik || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="label">Kategori Asnaf</span>
                <span style={{ color: selectedMustahik.asnaf_category === 'Fakir' ? '#ef4444' : '#f59e0b' }}>{selectedMustahik.asnaf_category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="label">Skor Layak (SAW)</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>{Math.round(selectedMustahik.priority_score * 100)}/100</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="label">Pendapatan</span>
                <span>Rp {selectedMustahik.income.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="label">Aset Terdata</span>
                <span>Rp {selectedMustahik.assets.toLocaleString()}</span>
              </div>
              <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0.5rem 0' }} />
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button 
                  onClick={() => handleDisbursement(selectedMustahik)}
                  style={{ flex: 1, fontSize: '0.7rem', padding: '0.6rem', background: 'linear-gradient(45deg, #f59e0b, #d97706)', border: 'none' }}
                >
                  Penyaluran
                </button>
                <button 
                  onClick={() => handleTrackImpact()}
                  style={{ flex: 1, fontSize: '0.7rem', padding: '0.6rem', background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
                >
                  Track
                </button>
                <button 
                  onClick={() => handleViewDetail(selectedMustahik)}
                  style={{ flex: 1, fontSize: '0.7rem', padding: '0.6rem', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                >
                  Detail
                </button>
                <button 
                  onClick={() => handleDeleteMustahik(selectedMustahik.id)}
                  style={{ fontSize: '0.7rem', padding: '0.6rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444' }}
                  title="Hapus Data"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QRIS Donation (In) Modal */}
        {showQR && (
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
                onClick={() => setShowQR(false)}
                style={{ background: 'transparent', padding: '0', color: '#94a3b8' }}
              >✕</button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Scan QR di bawah untuk melakukan pembayaran zakat/infak secara instan:
            </p>
            <div style={{ background: 'white', padding: '15px', borderRadius: '12px', display: 'inline-block', boxShadow: '0 0 25px rgba(255,255,255,0.1)' }}>
              <img src={`${API_BASE}/api/v1/donation/qrcode/DON-${Math.floor(Math.random()*9999)}`} style={{ width: '200px', height: '200px' }} alt="QRIS" />
            </div>
            <div style={{ margin: '1.5rem 0', padding: '12px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '10px', fontSize: '0.75rem', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
              <p>ID Transaksi: <strong>#TRX-{Math.floor(Math.random()*9999)}</strong></p>
              <p>Merchant: <strong>ZAKATTRACK DIGITAL</strong></p>
            </div>
            <button onClick={() => setShowQR(false)} style={{ width: '100%', background: 'var(--accent-secondary)', fontWeight: 'bold' }}>BATALKAN</button>
          </div>
        )}

        {/* Impact Tracking Portal Modal */}
        {showImpactPortal && (
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
                onClick={() => setShowImpactPortal(false)}
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
                <img src={`${API_BASE}/api/v1/donation/qrcode/TRACK-${selectedMustahik ? selectedMustahik.id : 'GENERAL'}`} style={{ width: '120px', height: '120px' }} alt="Track" />
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Scan untuk sertifikat dampak blockchain-verified</p>
            </div>
            <button onClick={() => setShowImpactPortal(false)} style={{ width: '100%', fontWeight: 'bold' }}>KEMBALI KE DASHBOARD</button>
          </div>
        )}
        {notification && (
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
            <button onClick={() => setNotification(null)} style={{ width: '100%' }}>TUTUP</button>
          </div>
        )}

        {/* Processing Spinner */}
        {isProcessing && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)', zIndex: 6000,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <div className="spinner" style={{
              width: '40px', height: '40px', border: '4px solid rgba(16, 185, 129, 0.2)',
              borderTopColor: 'var(--accent-primary)', borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ marginTop: '1rem', fontWeight: 'bold', letterSpacing: '2px' }}>PROCESSING TRANSACTION...</p>
          </div>
        )}
      </main>

      {isSurveyOpen && (
        <SurveyForm 
          onClose={() => setIsSurveyOpen(false)} 
          onSubmit={handleSurveySubmit} 
        />
      )}
    </div>
  );
}

export default App;
