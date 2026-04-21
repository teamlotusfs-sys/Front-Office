import React, { useState } from 'react';
import { useGame } from '../hooks/useGameState';
import GameSimAnimation from '../components/GameSimAnimation';
import './Schedule.css';

export default function Schedule() {
  const { gameState, simulateGame } = useGame();
  const { schedule, week } = gameState;
  const [expandedWeek, setExpandedWeek] = useState(week);
  const [gameAnimation, setGameAnimation] = React.useState(null);

  // Group by week
  const gamesByWeek = {};
  schedule.forEach(g => {
    const w = g.week || 1;
    if (!gamesByWeek[w]) gamesByWeek[w] = [];
    gamesByWeek[w].push(g);
  });

  const weeks = Object.keys(gamesByWeek).sort((a, b) => parseInt(a) - parseInt(b));
  const unplayedCount = schedule.filter(g => !g.played).length;

  return (
    <div>
      <h1 className="page-title">Schedule</h1>
      <p className="page-subtitle">Remaining: {unplayedCount} games</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button 
          onClick={simulateGame}
          style={{
            background: 'var(--accent)',
            color: '#0a0a0f',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 6,
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 14,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 20px rgba(232, 255, 71, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          ▶ Sim Next Game
        </button>
        <button 
          onClick={() => {
            for (let i = 0; i < 10; i++) {
              setTimeout(() => simulateGame(), i * 1000);
            }
          }}
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            padding: '12px 24px',
            borderRadius: 6,
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 14,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'all 0.3s',
          }}
        >
          ⏩ Sim 10 Games
        </button>
      </div>

      {gameAnimation && <GameSimAnimation {...gameAnimation} />}

      <div>
        {weeks.map(w => {
          const played = gamesByWeek[w].filter(g => g.played).length;
          const total = gamesByWeek[w].length;
          
          return (
            <div key={w} style={{ marginBottom: 16 }}>
              <button
                onClick={() => setExpandedWeek(expandedWeek === parseInt(w) ? null : parseInt(w))}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  padding: '14px',
                  borderRadius: 6,
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.target.style.background = 'var(--bg-card)'}
              >
                <div>
                  <span>Week {w}</span>
                  <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 400 }}>
                    ({played}/{total})
                  </span>
                </div>
                <span>{expandedWeek === parseInt(w) ? '▼' : '▶'}</span>
              </button>

              {expandedWeek === parseInt(w) && (
                <div style={{ paddingTop: 12 }}>
                  {gamesByWeek[w].map(game => (
                    <div
                      key={game.id}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        padding: '12px',
                        marginBottom: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                          {game.date} {game.isHome ? '🏠 Home' : '✈️ Away'}
                        </div>
                        <div style={{ fontWeight: 600 }}>vs {game.opponent}</div>
                      </div>

                      {game.played ? (
                        <div style={{ textAlign: 'right', fontFamily: 'Space Mono, monospace' }}>
                          <div style={{ 
                            fontSize: 16, 
                            fontWeight: 700,
                            color: game.won ? 'var(--green)' : 'var(--red)',
                          }}>
                            {game.won ? 'W' : 'L'} {game.score.us}-{game.score.them}
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Not played</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
