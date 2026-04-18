import React, { useState } from 'react';
import { useGame } from '../hooks/useGameState';
import GameSimAnimation from '../components/GameSimAnimation';

export default function Schedule() {
  const { gameState, gameAnimation, simulateGame } = useGame();
  const { schedule, week } = gameState;
  const [expandedWeek, setExpandedWeek] = useState(week);

  // Group by week
  const gamesByWeek = {};
  schedule.forEach(g => {
    const w = g.week || 1;
    if (!gamesByWeek[w]) gamesByWeek[w] = [];
    gamesByWeek[w].push(g);
  });

  const weeks = Object.keys(gamesByWeek).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div>
      <h1 className="page-title">Schedule</h1>
      <p className="page-subtitle">Week {week} of 82 games</p>

      <button 
        onClick={simulateGame}
        style={{
          background: 'var(--accent)',
          color: '#000',
          border: 'none',
          padding: '10px 16px',
          borderRadius: 4,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 20,
        }}
      >
        ▶ Simulate Game
      </button>

      {gameAnimation && <GameSimAnimation {...gameAnimation} />}

      <div>
        {weeks.map(w => (
          <div key={w} style={{ marginBottom: 16 }}>
            <button
              onClick={() => setExpandedWeek(expandedWeek === parseInt(w) ? null : parseInt(w))}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                padding: '12px',
                borderRadius: 4,
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Week {w}</span>
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
                      borderRadius: 4,
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
                      <div style={{ textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>
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
        ))}
      </div>
    </div>
  );
}
