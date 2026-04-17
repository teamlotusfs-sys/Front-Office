import React, { useEffect, useState } from 'react';
import { NBA_TEAMS } from '../data/nbaData';

export default function PhonePopup({ offer, onAnswer, onDecline }) {
  const [isRinging, setIsRinging] = useState(true);
  const team = NBA_TEAMS.find(t => t.id === offer.from.id);

  useEffect(() => {
    const timer = setTimeout(() => setIsRinging(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 9999,
      animation: 'slideUp 0.4s ease-out',
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(232, 255, 71, 0.7); }
          50% { box-shadow: 0 0 0 10px rgba(232, 255, 71, 0); }
        }
      `}</style>
      
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 20,
        width: 320,
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        animation: isRinging ? 'pulse 2s infinite' : 'none',
      }}>
        {/* Phone Icon */}
        <div style={{
          textAlign: 'center',
          fontSize: 48,
          marginBottom: 16,
        }}>
          📱
        </div>

        {/* Team Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          justifyContent: 'center',
        }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: team.color,
          }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {team.abbr} GM
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              Incoming trade call
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: 8,
        }}>
          <button
            onClick={() => onDecline()}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.borderColor = 'var(--border-bright)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            Decline
          </button>
          <button
            onClick={() => onAnswer()}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 6,
              color: '#0a0a0f',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(232, 255, 71, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Answer
          </button>
        </div>
      </div>
    </div>
  );
}
