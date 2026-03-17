import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Save, ArrowLeft, ArrowRight, CheckCircle, MapPin, DollarSign, Info, WifiOff } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ lat, lng, onPositionChange }) => {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);

  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const pos = marker.getLatLng();
        onPositionChange(pos.lat, pos.lng);
      }
    },
  }), [onPositionChange]);

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[lat, lng]}
      ref={markerRef}
    />
  );
};

const SurveyForm = ({ onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const isOnline = navigator.onLine;
  
  const [formData, setFormData] = useState({
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    nik: '',
    address: '',
    lat: -0.502,
    lng: 117.153,
    income: 0,
    dependents: 0,
    assets: 0,
    house_status: 1,
    utility_exp: 0,
    health_status: 1,
    education: 'SMA',
    employment: 'Pekerja Lepas',
    water_source: 'Leding',
    floor_material: 'Semen/Tanah',
    wall_material: 'Kayu/Tembok Murah'
  });

  const [formattedIncome, setFormattedIncome] = useState('');
  const [formattedAssets, setFormattedAssets] = useState('');

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }));
        },
        (error) => {
          console.warn("Geolocation failed or refused (offline):", error);
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle currency separately for display
    if (name === 'income' || name === 'assets') {
      const rawValue = value.replace(/[^0-9]/g, '');
      const numValue = Number(rawValue);
      setFormData(prev => ({ ...prev, [name]: numValue }));
      
      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(numValue);
      
      if (name === 'income') setFormattedIncome(formatted);
      else setFormattedAssets(formatted);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: ['dependents', 'utility_exp', 'house_status', 'health_status', 'lat', 'lng'].includes(name)
        ? Number(value) : value
    }));
  };

  const handleMapChange = (lat, lng) => {
    setFormData(prev => ({ ...prev, lat, lng }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const renderProgress = () => (
    <div className="wizard-progress">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={`progress-step-item ${step >= i ? 'active' : ''}`}>
          <div className="dot">{step > i ? <CheckCircle size={14} /> : i}</div>
          <span className="label">
            {i === 1 && 'Identitas'}
            {i === 2 && 'Lokasi'}
            {i === 3 && 'Ekonomi'}
            {i === 4 && 'Sosial'}
          </span>
        </div>
      ))}
      <div className="progress-line">
        <div className="fill" style={{ width: `${((step-1)/(totalSteps-1)) * 100}%` }}></div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="wizard-card fade-in">
        <div className="wizard-header">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Survey Mustahik Baru</h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Digital Assessment PIDI 4.0</p>
          </div>
          <X onClick={onClose} style={{ cursor: 'pointer', color: '#64748b' }} />
        </div>

        {renderProgress()}

        <div className="wizard-content">
          {step === 1 && (
            <div className="step-fade">
              <h3 className="step-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Info size={18} color="var(--accent-primary)" /> Informasi Identitas
              </h3>
              <div className="input-group">
                <label>Nama Lengkap Sesuai KTP</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Contoh: Budi Santoso" required />
              </div>
              <div className="input-group">
                <label>Nomor Induk Kependudukan (NIK)</label>
                <input type="text" name="nik" value={formData.nik} onChange={handleChange} placeholder="16 Digit NIK" maxLength="16" required />
              </div>
              <div className="input-group">
                <label>Alamat Domisili Sekarang</label>
                <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Alamat lengkap RT/RW" rows="3" required />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-fade">
              <h3 className="step-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <MapPin size={18} color="var(--accent-primary)" /> Titik Koordinat Geografis
              </h3>
              <div className="wizard-map-container">
                <MapContainer center={[formData.lat, formData.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <LocationPicker lat={formData.lat} lng={formData.lng} onPositionChange={handleMapChange} />
                </MapContainer>
              </div>
              <div className="coord-info">
                <div><span>LAT:</span> <code style={{ color: 'var(--accent-primary)' }}>{formData.lat.toFixed(6)}</code></div>
                <div><span>LNG:</span> <code style={{ color: 'var(--accent-primary)' }}>{formData.lng.toFixed(6)}</code></div>
              </div>
              <p className="hint">Geser marker hijau pada peta untuk menentukan posisi presisi rumah mustahik.</p>
            </div>
          )}

          {step === 3 && (
            <div className="step-fade">
              <h3 className="step-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <DollarSign size={18} color="var(--accent-primary)" /> Indikator Ekonomi (SAW)
              </h3>
              <div className="grid-2">
                <div className="input-group">
                  <label>Pendapatan per Bulan (C1)</label>
                  <input type="text" name="income" value={formattedIncome} onChange={handleChange} placeholder="Rp 0" required />
                </div>
                <div className="input-group">
                  <label>Jumlah Tanggungan (C2)</label>
                  <input type="number" name="dependents" value={formData.dependents} onChange={handleChange} placeholder="Orang" required />
                </div>
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>Estimasi Nilai Aset (C3)</label>
                  <input type="text" name="assets" value={formattedAssets} onChange={handleChange} placeholder="Rp 0" required />
                </div>
                <div className="input-group">
                  <label>Beban Listrik & PDAM (C5)</label>
                  <input type="number" name="utility_exp" value={formData.utility_exp} onChange={handleChange} placeholder="Rp" required />
                </div>
              </div>
              <div className="input-group">
                <label>Status Kepemilikan Rumah (C4)</label>
                <select name="house_status" value={formData.house_status} onChange={handleChange}>
                  <option value="1">Sewa / Numpang / Rumah Dinas</option>
                  <option value="2">Milik Sendiri / Warisan</option>
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="step-fade">
              <h3 className="step-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <CheckCircle size={18} color="var(--accent-primary)" /> Kondisi Fisik & Sosial
              </h3>
              <div className="grid-2">
                <div className="input-group">
                  <label>Status Kesehatan (C6)</label>
                  <select name="health_status" value={formData.health_status} onChange={handleChange}>
                    <option value="1">Sehat & Produktif</option>
                    <option value="2">Sakit Kronis / Disabilitas</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Pendidikan Terakhir</label>
                  <select name="education" value={formData.education} onChange={handleChange}>
                    <option value="Tidak Sekolah">Tidak Sekolah</option>
                    <option value="SD">SD / Sederajat</option>
                    <option value="SMP">SMP / Sederajat</option>
                    <option value="SMA">SMA / Sederajat</option>
                    <option value="Sarjana">Sarjana / Diploma</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label>Pekerjaan Utama</label>
                  <select name="employment" value={formData.employment} onChange={handleChange}>
                    <option value="Buruh Harian">Buruh Harian / Kasar</option>
                    <option value="Petani/Nelayan">Petani / Nelayan</option>
                    <option value="Pedagang Kecil">Pedagang Kecil / Kaki Lima</option>
                    <option value="Pekerja Lepas">Pekerja Lepas / Serabutan</option>
                    <option value="IRT">Ibu Rumah Tangga</option>
                    <option value="Tidak Bekerja">Tidak Bekerja / Lansia</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Sumber Air Minum</label>
                  <select name="water_source" value={formData.water_source} onChange={handleChange}>
                    <option value="Leding/PAM">Leding / PAM</option>
                    <option value="Sumur Terlindung">Sumur Terlindung</option>
                    <option value="Air Hujan">Air Hujan</option>
                    <option value="Sungai/Mata Air">Sungai / Mata Air</option>
                    <option value="Air Kemasan">Air Kemasan / Isi Ulang</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label>Bahan Lantai Utama</label>
                  <select name="floor_material" value={formData.floor_material} onChange={handleChange}>
                    <option value="Keramik/Granit">Keramik / Granit</option>
                    <option value="Semen/Plester">Semen / Plester</option>
                    <option value="Kayu/Papan">Kayu / Papan</option>
                    <option value="Tanah/Pasir">Tanah / Pasir</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Bahan Dinding Rumah</label>
                  <select name="wall_material" value={formData.wall_material} onChange={handleChange}>
                    <option value="Tembok Permanen">Tembok Permanen</option>
                    <option value="Semi Permanen">Semi Permanen</option>
                    <option value="Kayu/Papan">Kayu / Papan</option>
                    <option value="Bambu/Anyaman">Bambu / Anyaman</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="wizard-footer">
          {!isOnline && (
            <div style={{ fontSize: '0.7rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <WifiOff size={12} /> Mode Offline
            </div>
          )}
          {step > 1 && (
            <button type="button" onClick={prevStep} className="btn-secondary">
              <ArrowLeft size={18} /> Kembali
            </button>
          )}
          <div style={{ flex: 1 }}></div>
          {step < totalSteps ? (
            <button type="button" onClick={nextStep} className="btn-primary">
              Lanjut <ArrowRight size={18} />
            </button>
          ) : (
            <button type="button" onClick={() => onSubmit(formData)} className="btn-success">
              <Save size={18} /> Simpan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;
