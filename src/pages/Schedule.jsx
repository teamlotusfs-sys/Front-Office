import React, { useState, useMemo } from 'react';
import { useGame } from '../hooks/useGameState';
import GameSimAnimation from '../components/GameSimAnimation';
import BoxScore from '../components/BoxScore';
import './Schedule.css';

// Define months as a constant outside component to prevent re-creation
const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];

export default function Schedule() {
  const { gameState, gameAnimation, simulateGame } = useGame();
  const [selectedGame, setSelectedGame] = useState(null);
  const [currentMonth, setCurrentMonth] = useState('Oct');

  // Get schedule early (memoized to prevent dependency issues)
  const schedule = useMemo(() => gameState?.schedule || [], [gameState]);

  // Memoize stats calculation
  const stats = useMemo(() => ({
    total: schedule.length,
    played: schedule.filter(g => g.played).length,
    wins: schedule.filter(g => g.played && g.won).length,
    losses: schedule.filter(g => g.played && !g.won).length,
    remaining: schedule.filter(g => !g.played).length,
  }), [schedule]);

  const handleSimMultiple = (count) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => simulateGame(), i * 1200);
    }
  };

  const handleGameClick = (game) => {
    if (game.played && game.boxScore) {
      setSelectedGame(selectedGame?.id === game.id ? null : game);
    }
  };

  // Group games by month
  const gamesByMonth = useMemo(() => 
    MONTHS.reduce((acc, month) => {
      acc[month] = schedule.filter(g => g.date && g.date.startsWith(month));
      return acc;
    }, {}),
    [schedule]
  );

  const currentMonthGames = gamesByMonth[currentMonth] || [];

  // Get next unplayed game for quick sim
  const nextGame = schedule.find(g => !g.played);

  // Early return AFTER all hooks
  if (!gameState || !gameState.schedule) {
    return <div className="page-title">Loading...</div>;
  }

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <div>
          <h1 className="page-title">2025-26 Schedule</h1>
          <p className="page-subtitle">
            <span className="record-display">{stats.wins}W - {stats.losses}L</span>
            <span className="separator">•</span>
            <span>{stats.played}/{stats.total} Games Played</span>
          </p>
        </div>
        <div className="quick-actions">
          <button onClick={simulateGame} className="action-btn primary" disabled={!nextGame}>
            <span className="btn-icon">▶</span>
            Sim Next
          </button>
          <button onClick={() => handleSimMultiple(10)} className="action-btn" disabled={stats.remaining < 10}>
            <span className="btn-icon">⏩</span>
            Sim 10
          </button>
          <button onClick={() => handleSimMultiple(stats.remaining)} className="action-btn" disabled={stats.remaining === 0}>
            <span className="btn-icon">⏭️</span>
            Finish Season
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-label">Win %</div>
          <div className="stat-value">
            {stats.played > 0 ? ((stats.wins / stats.played) * 100).toFixed(1) : '0.0'}%
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Home</div>
          <div className="stat-value">
            {schedule.filter(g => g.played && g.isHome && g.won).length}-
            {schedule.filter(g => g.played && g.isHome && !g.won).length}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Away</div>
          <div className="stat-value">
            {schedule.filter(g => g.played && !g.isHome && g.won).length}-
            {schedule.filter(g => g.played && !g.isHome && !g.won).length}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Remaining</div>
          <div className="stat-value">{stats.remaining}</div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="month-nav">
        {MONTHS.map(month => {
          const monthGames = gamesByMonth[month] || [];
          const monthRecord = {
            w: monthGames.filter(g => g.played && g.won).length,
            l: monthGames.filter(g => g.played && !g.won).length,
          };
          return (
            <button
              key={month}
              onClick={() => setCurrentMonth(month)}
              className={`month-btn ${currentMonth === month ? 'active' : ''}`}
            >
              <div className="month-name">{month}</div>
              {monthGames.length > 0 && (
                <div className="month-record">
                  {monthRecord.w > 0 || monthRecord.l > 0 ? (
                    <span>{monthRecord.w}-{monthRecord.l}</span>
                  ) : (
                    <span className="upcoming-count">{monthGames.length}G</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {gameAnimation && <GameSimAnimation {...gameAnimation} />}

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {currentMonthGames.length === 0 ? (
          <div className="empty-month">
            <div className="empty-icon">📅</div>
            <p>No games scheduled in {currentMonth}</p>
          </div>
        ) : (
          currentMonthGames.map((game) => (
            <div key={game.id} className="game-card-wrapper">
              <div
                className={`game-card ${game.played ? 'played' : 'upcoming'} ${
                  game.played && game.won ? 'win' : game.played && !game.won ? 'loss' : ''
                } ${selectedGame?.id === game.id ? 'selected' : ''} ${
                  !game.played && nextGame?.id === game.id ? 'next-game' : ''
                }`}
                onClick={() => handleGameClick(game)}
              >
                {/* Game Header */}
                <div className="game-card-header">
                  <div className="game-date">{game.date || 'TBD'}</div>
                  <div className="game-location">
                    {game.isHome ? (
                      <span className="location-badge home">HOME</span>
                    ) : (
                      <span className="location-badge away">AWAY</span>
                    )}
                  </div>
                </div>

                {/* Team Info */}
                <div className="game-card-body">
                  <div className="opponent-logo">{game.isHome ? '🏠' : '✈️'}</div>
                  <div className="opponent-details">
                    <div className="opponent-abbr">{game.opponent || 'TBD'}</div>
                    <div className="opponent-name-small">{game.oppName || ''}</div>
                  </div>
                </div>

                {/* Game Result */}
                <div className="game-card-footer">
                  {game.played ? (
                    <>
                      <div className={`result-indicator ${game.won ? 'win' : 'loss'}`}>
                        {game.won ? 'W' : 'L'}
                      </div>
                      {game.score && (
                        <div className="final-score">
                          <span className={game.won ? 'winner' : 'loser'}>{game.score.us}</span>
                          <span className="score-sep">-</span>
                          <span className={!game.won ? 'winner' : 'loser'}>{game.score.them}</span>
                        </div>
                      )}
                      {game.boxScore && (
                        <div className="view-box">
                          {selectedGame?.id === game.id ? '▼' : '▶'}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="game-time">
                      {!game.played && nextGame?.id === game.id && (
                        <span className="next-badge">NEXT GAME</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Box Score */}
              {selectedGame?.id === game.id && game.boxScore && (
                <div className="expanded-boxscore">
                  <BoxScore game={game} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
