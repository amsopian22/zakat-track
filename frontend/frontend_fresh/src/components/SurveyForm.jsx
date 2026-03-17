import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Save } from 'lucide-react';
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

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }));
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['income', 'dependents', 'assets', 'utility_exp', 'house_status', 'health_status', 'lat', 'lng'].includes(name)
        ? Number(value) : value
    }));
  };

  const handleMapChange = (lat, lng) => {
    setFormData(prev => ({ ...prev, lat, lng }));
  };

  return (
    <div className="card fade-in" style={{ 
      position: 'fixed', 
      top: '50px', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      width: '550px', 
      maxHeight: 'calc(100vh - 80px)',
      overflowY: 'auto',
      zIndex: 2000, 
      background: 'rgba(11, 17, 33, 0.98)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
      padding: '2rem',
      border: '1px solid var(--accent-primary)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-primary)' }}>Survey Mustahik Baru (13 Var)</h2>
        <X onClick={onClose} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="survey-grid">
        <div className="input-group">
          <label>Nama Lengkap</label>
          <input type="text" name="name" onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>NIK</label>
          <input type="text" name="nik" onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>Alamat</label>
          <textarea name="address" onChange={handleChange} required />
        </div>

        {/* Mini Map Integration */}
        <div className="input-group">
          <label>Visualisasi Lokasi (Geser Marker)</label>
          <div style={{ height: '200px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <MapContainer center={[formData.lat, formData.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <LocationPicker lat={formData.lat} lng={formData.lng} onPositionChange={handleMapChange} />
            </MapContainer>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label>Latitude</label>
            <input type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Longitude</label>
            <input type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label>Total Pendapatan (C1)</label>
            <input type="number" name="income" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Jml Tanggungan (C2)</label>
            <input type="number" name="dependents" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Nilai Aset (C3)</label>
            <input type="number" name="assets" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Beban Listrik (C5)</label>
            <input type="number" name="utility_exp" onChange={handleChange} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label>Status Rumah (C4)</label>
            <select name="house_status" onChange={handleChange}>
              <option value="1">Sewa / Numpang</option>
              <option value="2">Milik Sendiri</option>
            </select>
          </div>
          <div className="input-group">
            <label>Status Kesehatan (C6)</label>
            <select name="health_status" onChange={handleChange}>
              <option value="1">Sehat</option>
              <option value="2">Sakit Kronis / Disabilitas</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label>Pendidikan Terakhir</label>
            <select name="education" onChange={handleChange}>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="Sarjana">Sarjana</option>
            </select>
          </div>
          <div className="input-group">
            <label>Pekerjaan</label>
            <input type="text" name="employment" onChange={handleChange} placeholder="Misal: Buruh" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label>Sumber Air Minum</label>
            <input type="text" name="water_source" onChange={handleChange} placeholder="Misal: Sumur" />
          </div>
          <div className="input-group">
            <label>Bahan Lantai Utama</label>
            <input type="text" name="floor_material" onChange={handleChange} placeholder="Misal: Tanah" />
          </div>
        </div>

        <div className="input-group">
          <label>Bahan Dinding Rumah</label>
          <input type="text" name="wall_material" onChange={handleChange} placeholder="Misal: Papan" />
        </div>

        <button type="submit" style={{ width: '100%', marginTop: '1.5rem', background: 'linear-gradient(45deg, #10b981, #059669)' }}>
          <Save size={18} /> Simpan Data Mustahik
        </button>
      </form>

      <style dangerouslySetInnerHTML={{ __html: `
        .survey-grid { display: flex; flex-direction: column; gap: 1rem; }
        .input-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .input-group label { font-size: 0.8rem; color: var(--text-muted); }
        .input-group input, .input-group textarea, .input-group select {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-color);
          padding: 0.7rem;
          border-radius: 0.5rem;
          color: white;
          outline: none;
        }
        .input-group input:focus { border-color: var(--accent-primary); }
      `}} />
    </div>
  );
};

export default SurveyForm;
