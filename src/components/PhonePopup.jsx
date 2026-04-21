import React, { useEffect, useState } from 'react';
import { NBA_TEAMS } from '../data/nbaData';

export default function PhonePopup({ offer, onAnswer, onDecline }) {
  const [isRinging, setIsRinging] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const team = NBA_TEAMS.find(t => t.id === offer.from.id);

  useEffect(() => {
    const timer = setTimeout(() => setIsRinging(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 9999,
      animation: 'slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(600px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(232, 255, 71, 0.7); }
          50% { box-shadow: 0 0 0 15px rgba(232, 255, 71, 0); }
        }
        @keyframes ring {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
      `}</style>
      
      {/* Phone Device */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
        borderRadius: 50,
        padding: '14px',
        width: 380,
        boxShadow: '0 30px 80px rgba(0,0,0,0.8), inset 0 0 40px rgba(232,255,71,0.05)',
        border: '12px solid #0a0a0f',
        animation: isRinging ? 'ring 0.3s ease-in-out infinite' : 'none',
        position: 'relative',
      }}>
        {/* Screen */}
        <div style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #141420 100%)',
          borderRadius: 40,
          padding: '0',
          aspectRatio: '9/16',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 700,
          boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Notch */}
          <div style={{
            background: '#000',
            height: 28,
            borderRadius: '0 0 25px 25px',
            position: 'relative',
            zIndex: 10,
          }} />

          {/* Content */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            overflowY: 'auto',
            gap: 16,
          }}>
            {/* Status bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12,
              color: '#888',
              paddingBottom: 8,
              borderBottom: '1px solid rgba(232,255,71,0.1)',
            }}>
              <span>🏀</span>
              <span>{formatTime(elapsed)}</span>
              <span>📡</span>
            </div>

            {/* Team Avatar */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              marginBottom: 8,
            }}>
              <div style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: team.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 45,
                color: '#fff',
                fontWeight: 700,
                boxShadow: `0 10px 30px ${team.color}80`,
                animation: isRinging ? 'pulse 1.5s infinite' : 'none',
              }}>
                {team.emoji}
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 2,
                }}>
                  {team.name}
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#888',
                }}>
                  {isRinging ? 'Incoming call...' : 'Connected'}
                </div>
              </div>
            </div>

            {/* Trade Details */}
            <div style={{
              background: 'rgba(232, 255, 71, 0.05)',
              border: '1px solid rgba(232, 255, 71, 0.2)',
              borderRadius: 12,
              padding: 12,
              fontSize: 12,
            }}>
              <div style={{ marginBottom: 8 }}>
                <div style={{ color: '#e8ff47', fontWeight: 600, marginBottom: 4 }}>They Offer:</div>
                {offer.theirPlayers?.map(p => (
                  <div key={p.id} style={{ color: '#aaa', marginBottom: 2, fontSize: 11 }}>
                    • {p.firstName} {p.lastName} ({p.ovr} OVR)
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid rgba(232, 255, 71, 0.1)', paddingTop: 8 }}>
                <div style={{ color: '#e8ff47', fontWeight: 600, marginBottom: 4 }}>You Give:</div>
                {offer.yourPlayers?.map(p => (
                  <div key={p.id} style={{ color: '#aaa', marginBottom: 2, fontSize: 11 }}>
                    • {p.firstName} {p.lastName} ({p.ovr} OVR)
                  </div>
                ))}
              </div>
            </div>

            {/* Evaluation message */}
            <div style={{
              background: 'rgba(232, 255, 71, 0.08)',
              borderLeft: '3px solid #e8ff47',
              padding: '10px 12px',
              borderRadius: 4,
              fontSize: 12,
              color: '#e8ff47',
              fontWeight: 500,
            }}>
              "{offer.message}"
            </div>
          </div>

          {/* Buttons Container */}
          <div style={{
            display: 'flex',
            gap: 16,
            padding: '16px 20px 24px',
            justifyContent: 'center',
            borderTop: '1px solid rgba(232,255,71,0.1)',
          }}>
            {/* Decline Button */}
            <button
              onClick={() => onDecline()}
              style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: '#ff3b30',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(255, 59, 48, 0.4)',
                fontWeight: 700,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 59, 48, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 59, 48, 0.4)';
              }}
              title="Decline"
            >
              ✕
            </button>

            {/* Accept Button */}
            <button
              onClick={() => onAnswer()}
              style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: '#34c759',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(52, 199, 89, 0.4)',
                fontWeight: 700,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(52, 199, 89, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(52, 199, 89, 0.4)';
              }}
              title="Accept"
            >
              ✓
            </button>
          </div>

          {/* Home indicator */}
          <div style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 4,
            background: '#333',
            borderRadius: 2,
          }} />
        </div>
      </div>
    </div>
  );
}
