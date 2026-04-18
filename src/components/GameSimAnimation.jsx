import React, { useEffect, useState } from 'react';

export default function GameSimAnimation({ game, progress, total }) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    setDisplayProgress(progress);
  }, [progress]);

  if (!game) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10000,
      background: 'var(--bg-card)',
      border: '2px solid var(--accent)',
      borderRadius: 12,
      padding: '40px',
      minWidth: 420,
      textAlign: 'center',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      animation: 'slideIn 0.3s ease-out',
    }}>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>

      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
        Simulating Games
      </div>
      
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>
        {game.isHome ? '🏠' : '✈️'} {game.opponent}
      </div>

      <div style={{ 
        background: 'var(--bg-surface)',
        borderRadius: 8,
        padding: '16px',
        marginBottom: 20,
        fontSize: 14,
        fontFamily: 'DM Mono, monospace',
        fontWeight: 600,
      }}>
        Game {displayProgress} of {total}
      </div>

      {/* Progress bar */}
      <div style={{
        background: 'var(--bg-hover)',
        borderRadius: 6,
        height: 10,
        overflow: 'hidden',
        marginBottom: 16,
        border: '1px solid var(--border)',
      }}>
        <div style={{
          background: 'linear-gradient(90deg, var(--accent), #5352ed)',
          height: '100%',
          width: `${(displayProgress / total) * 100}%`,
          transition: 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }} />
      </div>

      <div style={{
        fontSize: 12,
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
      }}>
        {displayProgress === total ? '✓ Complete!' : 'Processing...'}
      </div>
    </div>
  );
}
