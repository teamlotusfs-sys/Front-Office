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
        background: '#000',
        borderRadius: 40,
        padding: '12px',
        width: 360,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 0 30px rgba(255,255,255,0.1)',
        border: '8px solid #111',
        animation: isRinging ? 'ring 0.3s ease-in-out infinite' : 'none',
      }}>
        {/* Notch */}
        <div style={{
          background: '#000',
          height: 30,
          borderRadius: '0 0 30px 30px',
          marginBottom: 8,
          position: 'relative',
          zIndex: 10,
        }} />

        {/* Screen */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
          borderRadius: 32,
          padding: '40px 20px',
          aspectRatio: '9/16',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'center',
          minHeight: 650,
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Top status bar */}
          <div style={{
            position: 'absolute',
            top: 20,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingX: 20,
            fontSize: 12,
            color: '#888',
          }}>
            <span>🏀</span>
            <span>{formatTime(elapsed)}</span>
            <span>📡</span>
          </div>

          {/* Team Avatar */}
          <div style={{
            marginTop: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}>
            <div style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: team.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 50,
              color: '#fff',
              fontWeight: 700,
              boxShadow: `0 10px 30px ${team.color}80`,
              animation: isRinging ? 'pulse 1.5s infinite' : 'none',
            }}>
              {team.abbr}
            </div>
            
            <div>
              <div style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#fff',
                marginBottom: 4,
              }}>
                {team.name}
              </div>
              <div style={{
                fontSize: 14,
                color: '#888',
              }}>
                {isRinging ? 'Incoming call...' : 'Connected'}
              </div>
            </div>
          </div>

          {/* Call info */}
          <div style={{
            fontSize: 13,
            color: '#aaa',
            marginTop: 20,
          }}>
            <div>GM wants to discuss a trade</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
              {trade.yourPlayers?.length} player{trade.yourPlayers?.length !== 1 ? 's' : ''} for {trade.theirPlayers?.length}
            </div>
          </div>

          {/* Buttons Container */}
          <div style={{
            display: 'flex',
            gap: 20,
            width: '100%',
            marginTop: 20,
            justifyContent: 'center',
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 59, 48, 0.6)';
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(52, 199, 89, 0.6)';
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
