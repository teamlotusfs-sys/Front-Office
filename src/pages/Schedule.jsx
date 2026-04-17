import React, { useState } from 'react';
import { useGame } from '../hooks/useGameState';

export default function Schedule() {
  const { gameState, simulateGame } = useGame();
  const { schedule, wins, losses } = gameState;
  const [selectedMonth, setSelectedMonth] = useState('Oct');

  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  
  const gamesByMonth = {};
  months.forEach(m => { gamesByMonth[m] = schedule.filter(g => g.date.startsWith(m)); });

  const currentMonth = gamesByMonth[selectedMonth] || [];
  const daysInMonth = currentMonth.length > 0 ? Math.max(...currentMonth.map(g => parseInt(g.date.split(' ')[1]))) : 0;

  const winStreak = (() => {
    const played = schedule.filter(g => g.played).reverse();
    if (!played.length) return { count: 0, type: null };
    const type = played[0].won;
    let count = 0;
    for (const g of played) { if (g.won === type) count++; else break; }
    return { count, type };
  })();

  const getDayGames = (day) => {
    return currentMonth.filter(g => parseInt(g.date.split(' ')[1]) === day);
  };

  return (
    <div>
      <h1 className="page-title">Schedule</h1>
      <p className="page-subtitle">
        {wins}W–{losses}L ·{' '}
        {winStreak.count > 1 && <span style={{ color: winStreak.type ? 'var(--green)' : 'var(--red)' }}>{winStreak.count}-game {winStreak.type ? 'win' : 'losing'} streak · </span>}
        {schedule.filter(g => !g.played).length} games remaining
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        {months.map(m => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            style={{
              background: selectedMonth === m ? 'var(--accent-dim)' : 'var(--bg-card)',
              border: `1px solid ${selectedMonth === m ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 4,
              color: selectedMonth === m ? 'var(--accent)' : 'var(--text-secondary)',
              padding: '7px 14px',
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontWeight: 600,
            }}
          >
            {m}
          </button>
        ))}
        <button className="action-btn success" onClick={simulateGame} style={{ marginLeft: 'auto' }}>
          ▶ Sim Next
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginBottom: 20 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              paddingBottom: 8,
              borderBottom: '1px solid var(--border)',
            }}
          >
            {day}
          </div>
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const games = getDayGames(day);
          const hasGame = games.length > 0;
          const game = games[0];

          return (
            <div
              key={day}
              style={{
                background: hasGame ? 'var(--bg-card)' : 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 12,
                minHeight: 90,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                cursor: hasGame ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (hasGame) {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--accent-dim)';
                }
              }}
              onMouseLeave={(e) => {
                if (hasGame) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--bg-card)';
                }
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {day}
              </div>

              {hasGame && (
                <>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {game.isHome ? 'vs' : '@'} {game.opponent}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {game.isHome ? 'HOME' : 'AWAY'}
                  </div>

                  {game.played ? (
                    <>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: game.won ? 'var(--green)' : 'var(--red)',
                          marginTop: 'auto',
                        }}
                      >
                        {game.won ? 'W' : 'L'}
                      </div>
                      <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--text-secondary)' }}>
                        {game.score.us}–{game.score.them}
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        fontSize: 10,
                        background: 'var(--accent)',
                        color: '#0a0a0f',
                        padding: '4px 8px',
                        borderRadius: 4,
                        textAlign: 'center',
                        fontWeight: 600,
                        marginTop: 'auto',
                      }}
                    >
                      UPCOMING
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
