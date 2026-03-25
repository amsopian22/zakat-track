import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import logo from './assets/logo.png';
import { LayoutDashboard, Users, Map as MapIcon, Search, Bell, Plus, QrCode, Wifi, WifiOff, FileText, RefreshCw } from 'lucide-react';
import SurveyForm from './components/SurveyForm';
import QRModal from './components/QRModal';
import ImpactPortal from './components/ImpactPortal';
import NotificationModal from './components/NotificationModal';
import AIInsightWidget from './components/AIInsightWidget';

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

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

function App() {
  const [mustahiks, setMustahiks] = useState([]);
  const [selectedMustahik, setSelectedMustahik] = useState(null);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showImpactPortal, setShowImpactPortal] = useState(false);
  const [showcaseMode, setShowcaseMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const stats = useMemo(() => {
    const total = mustahiks.length;
    if (total === 0) return { totalDist: 0, sdg1: 0, sdg2: 0 };

    const sdg1Count = mustahiks.filter(m => m.sdgs_label === 'SDG 1: No Poverty').length;
    const sdg2Count = mustahiks.filter(m => m.sdgs_label === 'SDG 2: Zero Hunger').length;

    return {
      totalDist: (total * 2500000), 
      sdg1: Math.round((sdg1Count / total) * 100),
      sdg2: Math.round((sdg2Count / total) * 100)
    };
  }, [mustahiks]);

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
    
    const handleOnline = () => { setIsOnline(true); syncPendingData(); };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync check
    updatePendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updatePendingCount = () => {
    const pendingJson = localStorage.getItem('pendingSurveys');
    const pending = pendingJson ? JSON.parse(pendingJson) : [];
    setPendingSyncCount(pending.length);
  };

  const syncPendingData = async () => {
    const pendingJson = localStorage.getItem('pendingSurveys');
    if (!pendingJson) return;

    const pending = JSON.parse(pendingJson);
    if (pending.length === 0) return;

    setNotification({ title: "🔄 SINKRONISASI", message: `Mengirim ${pending.length} data survey tertunda...`, type: "info" });

    const successfullySynced = [];
    for (const data of pending) {
      try {
        const res = await fetch(`${API_BASE}/api/v1/mustahik`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-API-Key': 'zakat-secret-2026'
          },
          body: JSON.stringify(data)
        });
        if (res.ok) successfullySynced.push(data.id);
      } catch (err) {
        console.error("Gagal sinkronisasi item:", err);
      }
    }

    const remaining = pending.filter(p => !successfullySynced.includes(p.id));
    localStorage.setItem('pendingSurveys', JSON.stringify(remaining));
    updatePendingCount();

    if (successfullySynced.length > 0) {
      fetchMustahiks();
      setNotification({ title: "✅ SINKRON BERHASIL", message: `${successfullySynced.length} data survey telah terkirim.`, type: "success" });
    }
  };

  const fetchMustahiks = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/mustahiks`);
      const data = await res.json();
      setMustahiks(data);
    } catch (err) {
      console.error("Gagal mengambil data mustahik:", err);
      setMustahiks([]);
    }
  };

  const handleSurveySubmit = async (formData) => {
    if (!isOnline) {
      const pendingJson = localStorage.getItem('pendingSurveys');
      const pending = pendingJson ? JSON.parse(pendingJson) : [];
      pending.push(formData);
      localStorage.setItem('pendingSurveys', JSON.stringify(pending));
      updatePendingCount();
      setIsSurveyOpen(false);
      setNotification({ title: "📂 TERSIMPAN OFFLINE", message: "Internet tidak tersedia. Data disimpan di perangkat dan akan dikirim otomatis saat online.", type: "warning" });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/mustahik`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': 'zakat-secret-2026'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsSurveyOpen(false);
        fetchMustahiks();
        setNotification({ title: "✅ BERHASIL", message: "Data mustahik telah terverifikasi dan disimpan.", type: "success" });
      } else {
        throw new Error("Gagal kirim ke API");
      }
    } catch (err) {
      // If API call fails during submission, fallback to offline
      const pendingJson = localStorage.getItem('pendingSurveys');
      const pending = pendingJson ? JSON.parse(pendingJson) : [];
      pending.push(formData);
      localStorage.setItem('pendingSurveys', JSON.stringify(pending));
      updatePendingCount();
      setIsSurveyOpen(false);
      setNotification({ title: "📂 FALLBACK OFFLINE", message: "Gagal terhubung ke server. Data diamankan secara lokal.", type: "warning" });
    }
  };

  const handleDisbursement = (m) => {
    if (m.asnaf_category === 'Mampu') {
      setNotification({
        title: "⚠️ PENYALURAN DIBLOKIR",
        message: `Kategori '${m.name}' adalah Mampu. Dana zakat hanya untuk asnaf (Fakir/Miskin).`,
        type: "error"
      });
      return;
    }

    setIsProcessing(true);
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
        { label: "Pilar SDGs", val: m.sdgs_label || 'SDG 1' }
      ],
      type: "info"
    });
  };

  const handleDeleteMustahik = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data mustahik ini?")) {
      try {
        const res = await fetch(`${API_BASE}/api/v1/mustahik/${id}`, {
          method: 'DELETE',
          headers: { 'X-API-Key': 'zakat-secret-2026' }
        });
        if (res.ok) {
          setSelectedMustahik(null);
          fetchMustahiks();
        }
      } catch (err) {
        console.error("Gagal menghapus mustahik:", err);
      }
    }
  };

  const handleExportAudit = () => {
    window.print();
  };

  return (
    <div className={`dashboard-container ${showcaseMode ? 'showcase-mode' : ''}`}>
      {showcaseMode && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          pointerEvents: 'none', boxShadow: 'inset 0 0 150px rgba(16, 185, 129, 0.1)',
          zIndex: 10000, animation: 'pulse 4s infinite'
        }} />
      )}
      <header>
        <div className="logo">
          <img src={logo} alt="ZakatTrack" style={{ width: '42px', height: '42px', borderRadius: '12px', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.4)' }} />
          <span>ZakatTrack</span>
          <div className={`status-indicator ${isOnline ? 'status-online' : 'status-offline'}`} style={{ marginLeft: '1.5rem' }}>
            {isOnline ? (
              <><Wifi size={14} /> Online</>
            ) : (
              <><WifiOff size={14} /> Offline {pendingSyncCount > 0 && <span className="sync-badge">{pendingSyncCount} pending</span>}</>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
          <div 
            onClick={() => setShowcaseMode(!showcaseMode)}
            style={{ 
              cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '24px', 
              background: showcaseMode ? 'linear-gradient(45deg, var(--accent-primary), var(--accent-secondary))' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', fontWeight: '700', transition: 'all 0.4s ease'
            }}
          >
            {showcaseMode ? '✨ PRESENTATION' : 'PREVIEW'}
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
            <input type="text" placeholder="Cari..." style={{ width: '180px', fontSize: '0.85rem' }} />
          </div>
          <div className="icon-button" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}><Bell size={18} /></div>
          <button onClick={() => setIsSurveyOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}>
            <Plus size={18} /> New Survey
          </button>
        </div>
      </header>

      <aside className="sidebar">
        <div className="card fade-in">
          <h3>Total Penyaluran</h3>
          <div className="value">Rp { (stats.totalDist / 1000000).toFixed(1) }M</div>
          <div className="label">Dashboard Akumulasi</div>
        </div>

        <div className="card fade-in" style={{ animationDelay: '0.1s' }}>
          <h3>Mustahik Aktif</h3>
          <div className="value">{mustahiks.length}</div>
          <div className="label">Terverifikasi Digital</div>
        </div>

        <div className="card fade-in" style={{ animationDelay: '0.2s', background: 'rgba(16, 185, 129, 0.03)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Mustahik Unggulan</h3>
            {pendingSyncCount > 0 && <RefreshCw size={14} className="spin" style={{ color: 'var(--accent-secondary)' }} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {mustahiks.slice(0, 3).map((m, idx) => (
              <div 
                key={m.id} 
                className="mustahik-item"
                onClick={() => setSelectedMustahik(m)}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.4rem', 
                  borderRadius: '0.5rem', animation: `fadeIn 0.5s ease-out ${0.3 + idx * 0.1}s forwards`, opacity: 0, cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600' }}>{m.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>{m.asnaf_category}</div>
                </div>
                <div style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>{Math.round(m.priority_score * 100)}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card fade-in" style={{ animationDelay: '0.3s' }}>
          <h3>SDGs Alignment</h3>
          <div style={{ marginTop: '0.5rem' }}>
            <div className="progress-bar" style={{ height: '6px' }}><div style={{ width: `${stats.sdg1}%`, background: '#10b981' }}></div></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginTop: '4px' }}><span>SDG 1</span><span>{stats.sdg1}%</span></div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button className="card" onClick={handleExportAudit} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#94a3b8' }}>
            <FileText size={18} /> Export Audit PDF
          </button>
          <button className="card" onClick={() => setShowQR(true)} style={{ width: '100%', background: 'linear-gradient(45deg, #f59e0b, #d97706)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'white' }}>
            <QrCode size={18} /> QRIS Portal
          </button>
          <button className="card" onClick={() => setShowImpactPortal(true)} style={{ width: '100%', background: 'transparent', border: '1px dashed var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#f59e0b' }}>
            <Users size={18} /> Impact Portal
          </button>
        </div>
      </aside>

      <main className="map-viewport">
        <MapContainer center={[-0.502, 117.153]} zoom={14} scrollWheelZoom={true} zoomControl={false}>
          <MapController selected={selectedMustahik} list={mustahiks} />
          <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {mustahiks.map(m => (
            <React.Fragment key={m.id}>
              <Marker position={[m.lat, m.lng]} eventHandlers={{ click: () => setSelectedMustahik(m) }}>
                <Popup><div style={{ color: '#1e293b' }}><strong>{m.name}</strong><br/>{m.asnaf_category}</div></Popup>
              </Marker>
              <Circle center={[m.lat, m.lng]} radius={200} pathOptions={{ fillColor: m.asnaf_category === 'Fakir' ? '#ef4444' : '#f59e0b', color: 'transparent', fillOpacity: 0.2 }} />
            </React.Fragment>
          ))}
        </MapContainer>

        {selectedMustahik && (
          <div className="card fade-in" style={{ position: 'absolute', top: '20px', right: '20px', width: '320px', zIndex: 1000, background: 'rgba(11, 17, 33, 0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem' }}>{selectedMustahik.name}</h2>
              <button onClick={() => setSelectedMustahik(null)} style={{ background: 'transparent', padding: '0', color: '#94a3b8' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Skor SAW</span><span style={{ color: '#10b981', fontWeight: 'bold' }}>{Math.round(selectedMustahik.priority_score * 100)}/100</span></div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button 
                  onClick={() => handleDisbursement(selectedMustahik)} 
                  disabled={selectedMustahik.asnaf_category === 'Mampu'}
                  style={{ 
                    flex: 1, 
                    fontSize: '0.7rem', 
                    background: selectedMustahik.asnaf_category === 'Mampu' ? '#334155' : 'linear-gradient(45deg, #f59e0b, #d97706)', 
                    border: 'none', 
                    color: selectedMustahik.asnaf_category === 'Mampu' ? '#64748b' : 'white',
                    cursor: selectedMustahik.asnaf_category === 'Mampu' ? 'not-allowed' : 'pointer',
                    opacity: selectedMustahik.asnaf_category === 'Mampu' ? 0.6 : 1
                  }}
                  title={selectedMustahik.asnaf_category === 'Mampu' ? "Tidak berhak menerima zakat" : ""}
                >
                  Penyaluran
                </button>
                <button onClick={() => handleViewDetail(selectedMustahik)} style={{ flex: 1, fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', color: 'white' }}>Detail</button>
                <button onClick={() => handleDeleteMustahik(selectedMustahik.id)} style={{ padding: '0.6rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444' }}>🗑️</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="printable-report">
        <h1>ZakatTrack - Audit Digital Report</h1>
        <p>Tanggal Laporan: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
        <hr />
        <h3>Ringkasan Eksekutif</h3>
        <p>Total Penyaluran: Rp {stats.totalDist.toLocaleString('id-ID')}</p>
        <p>Total Mustahik Terdata: {mustahiks.length}</p>
        
        <h3>Daftar Mustahik Prioritas (SAW Ranked)</h3>
        <table>
          <thead>
            <tr>
              <th>NIM</th>
              <th>Nama</th>
              <th>Asnaf</th>
              <th>Skor SAW</th>
              <th>Pilar SDGs</th>
            </tr>
          </thead>
          <tbody>
            {mustahiks.map(m => (
              <tr key={m.id}>
                <td>{m.nim || 'N/A'}</td>
                <td>{m.name}</td>
                <td>{m.asnaf_category}</td>
                <td>{(m.priority_score * 100).toFixed(1)}%</td>
                <td>{m.sdgs_label}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '40px', fontSize: '0.7rem', fontStyle: 'italic', textAlign: 'center' }}>
          Laporan ini dihasilkan secara otomatis oleh ZakatTrack AI Insight Engine.
        </div>
      </div>

      <QRModal isOpen={showQR} onClose={() => setShowQR(false)} apiBase={API_BASE} />
      <ImpactPortal isOpen={showImpactPortal} onClose={() => setShowImpactPortal(false)} selectedMustahik={selectedMustahik} apiBase={API_BASE} />
      <NotificationModal notification={notification} onClose={() => setNotification(null)} />
      
      <AIInsightWidget apiBase={API_BASE} />

      {isSurveyOpen && (
        <SurveyForm onClose={() => setIsSurveyOpen(false)} onSubmit={handleSurveySubmit} />
      )}
    </div>
  );
}

export default App;
