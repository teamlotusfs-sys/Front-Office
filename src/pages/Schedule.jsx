import React, { useState } from 'react';
import { useGame } from '../hooks/useGameState';
import GameSimAnimation from '../components/GameSimAnimation';
import './Schedule.css';

export default function Schedule() {
  const { gameState, gameAnimation, simulateGame } = useGame();
  
  if (!gameState) {
    return <div className="page-title">Loading...</div>;
  }
  
  const { schedule } = gameState;
  const [filter, setFilter] = useState('all');

  const filtered = schedule.filter(g => {
    if (filter === 'played') return g.played;
    if (filter === 'unplayed') return !g.played;
    return true;
  });

  const stats = {
    total: schedule.length,
    played: schedule.filter(g => g.played).length,
    wins: schedule.filter(g => g.played && g.won).length,
    losses: schedule.filter(g => g.played && !g.won).length,
    remaining: schedule.filter(g => !g.played).length,
  };

  const handleSimMultiple = (count) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => simulateGame(), i * 1200);
    }
  };

  return (
    <div>
      <h1 className="page-title">Schedule</h1>
      <p className="page-subtitle">2025-26 Season</p>

      <div className="schedule-stats">
        <div className="stat-box">
          <div className="stat-label">Record</div>
          <div className="stat-value">{stats.wins}-{stats.losses}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Played</div>
          <div className="stat-value">{stats.played}/{stats.total}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Remaining</div>
          <div className="stat-value">{stats.remaining}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Win %</div>
          <div className="stat-value">
            {stats.played > 0 ? ((stats.wins / stats.played) * 100).toFixed(1) : '0.0'}%
          </div>
        </div>
      </div>

      <div className="schedule-controls">
        <button onClick={simulateGame} className="sim-btn sim-btn-primary">
          ▶ Sim Next Game
        </button>
        <button onClick={() => handleSimMultiple(5)} className="sim-btn">
          ⏩ Sim 5 Games
        </button>
        <button onClick={() => handleSimMultiple(10)} className="sim-btn">
          ⏩⏩ Sim 10 Games
        </button>
        <button
          onClick={() => handleSimMultiple(stats.remaining)}
          className="sim-btn"
          disabled={stats.remaining === 0}
        >
          ⏭️ Sim Rest of Season
        </button>
      </div>

      <div className="schedule-filters">
        {['all', 'played', 'unplayed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
          >
            {f === 'all' ? 'All Games' : f === 'played' ? 'Played' : 'Upcoming'}
            <span className="filter-count">
              {f === 'all' ? stats.total : f === 'played' ? stats.played : stats.remaining}
            </span>
          </button>
        ))}
      </div>

      {gameAnimation && <GameSimAnimation {...gameAnimation} />}

      <div className="schedule-list">
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No games found</p></div>
        ) : (
          filtered.map((game, idx) => (
            <div
              key={game.id}
              className={`schedule-game ${game.played ? 'played' : 'upcoming'} ${
                game.played && game.won ? 'win' : ''
              } ${game.played && !game.won ? 'loss' : ''}`}
            >
              <div className="game-number">Game {idx + 1}</div>
              <div className="game-matchup">
                <div className="team-indicator">{game.isHome ? '🏠' : '✈️'}</div>
                <div className="opponent-info">
                  <div className="opponent-name">{game.oppName}</div>
                  <div className="opponent-meta">
                    <span className="opponent-abbr">{game.opponent}</span>
                    <span className="game-date">{game.date}</span>
                  </div>
                </div>
              </div>
              <div className="game-status">
                {game.played ? (
                  <>
                    <div className={`result-badge ${game.won ? 'win' : 'loss'}`}>
                      {game.won ? 'W' : 'L'}
                    </div>
                    <div className="score">
                      <span className={game.won ? 'winning-score' : 'losing-score'}>
                        {game.score.us}
                      </span>
                      <span className="score-dash">-</span>
                      <span className={!game.won ? 'winning-score' : 'losing-score'}>
                        {game.score.them}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="upcoming-badge">Upcoming</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
