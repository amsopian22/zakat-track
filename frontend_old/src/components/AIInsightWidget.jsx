import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCcw, X, MessageCircle } from 'lucide-react';

const AIInsightWidget = ({ apiBase }) => {
  const [insight, setInsight] = useState("Memuat analisis strategis dari Cloud AI...");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchInsight = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/ai/insight`);
      const data = await res.json();
      setInsight(data.insight);
    } catch (err) {
      setInsight("Gagal menghubungi AI Advisor. Mohon pastikan koneksi internet aktif dan backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInsight();
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <div 
        className="ai-floating-btn" 
        onClick={() => setIsOpen(!isOpen)}
        title="Buka AI Advisor"
      >
        {isOpen ? <X size={28} /> : <Sparkles size={28} />}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-primary)' }}>
              <Sparkles size={20} /> AI Advisor (Cloud)
            </h3>
            <button 
              onClick={fetchInsight} 
              disabled={loading}
              className="icon-button"
              style={{ padding: '4px', color: '#94a3b8' }}
            >
              <RefreshCcw size={16} className={loading ? 'spin' : ''} />
            </button>
          </div>
          
          <div className="ai-chat-body">
            <div style={{ marginBottom: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Analisis Mustahik Prioritas
            </div>
            <p>
              {insight}
            </p>
            <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--accent-primary)', opacity: 0.8 }}>
              ✨ Didukung oleh Ollama Cloud - Ministral 3
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIInsightWidget;
