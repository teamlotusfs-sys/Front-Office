import React, { useState } from 'react';
import { useGame, formatSalary } from '../hooks/useGameState';
import { PLAYER_POSITIONS } from '../data/nbaData';
import './Rotations.css';

export default function Rotations() {
  const { gameState } = useGame();
  const { roster } = gameState;
  const [startingLineup, setStartingLineup] = useState(Array(5).fill(null));
  const [benchRotation, setBenchRotation] = useState(Array(8).fill(null));
  const [minutesAlloc, setMinutesAlloc] = useState({});

  const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
  
  // Initialize minutes allocation
  React.useEffect(() => {
    const newMinutes = {};
    [...startingLineup, ...benchRotation].forEach(player => {
      if (player && !minutesAlloc[player.id]) {
        newMinutes[player.id] = player === startingLineup.find(p => p?.id === player.id) ? 32 : 12;
      }
    });
    if (Object.keys(newMinutes).length > 0) {
      setMinutesAlloc(prev => ({ ...prev, ...newMinutes }));
    }
  }, [startingLineup, benchRotation]);

  const handleSelectPlayer = (index, isStarter) => {
    if (isStarter) {
      const newLineup = [...startingLineup];
      newLineup[index] = null;
      setStartingLineup(newLineup);
    } else {
      const newBench = [...benchRotation];
      newBench[index] = null;
      setBenchRotation(newBench);
    }
  };

  const handleAddPlayerToLineup = (player, isStarter) => {
    if (isStarter) {
      const posIndex = positions.indexOf(player.pos);
      const newLineup = [...startingLineup];
      if (newLineup[posIndex] !== null) {
        // Swap if position already filled
        const displaced = newLineup[posIndex];
        newLineup[posIndex] = player;
        // Try to add displaced to bench
        const emptyBenchIndex = benchRotation.findIndex(p => p === null);
        if (emptyBenchIndex !== -1) {
          const newBench = [...benchRotation];
          newBench[emptyBenchIndex] = displaced;
          setBenchRotation(newBench);
        }
      } else {
        newLineup[posIndex] = player;
      }
      setStartingLineup(newLineup);
    } else {
      const newBench = [...benchRotation];
      const emptyIndex = newBench.findIndex(p => p === null);
      if (emptyIndex !== -1) {
        newBench[emptyIndex] = player;
        setBenchRotation(newBench);
      }
    }
  };

  const availablePlayers = roster.filter(p => 
    !startingLineup.includes(p) && !benchRotation.includes(p)
  );

  const totalMinutes = Object.values(minutesAlloc).reduce((sum, m) => sum + m, 0);
  const totalSalary = [...startingLineup, ...benchRotation]
    .filter(p => p !== null)
    .reduce((sum, p) => sum + (p?.salary || 0), 0);

  return (
    <div>
      <h1 className="page-title">Rotations & Lineups</h1>
      <p className="page-subtitle">Build your starting lineup and manage bench rotations</p>

      <div className="rotations-container">
        {/* Left - Roster Selection */}
        <div className="rotation-section rotation-roster">
          <div className="rotation-section-header">
            <h3>🏀 Available Players ({availablePlayers.length})</h3>
          </div>
          <div className="roster-list">
            {availablePlayers.sort((a, b) => b.ovr - a.ovr).map(player => (
              <div key={player.id} className="roster-player">
                <div className="roster-player-info">
                  <div className="roster-player-name">{player.firstName} {player.lastName}</div>
                  <div className="roster-player-stats">
                    <span className="roster-ovr">{player.ovr}</span>
                    <span className="roster-pos">{player.pos}</span>
                  </div>
                </div>
                <div className="roster-player-salary">{formatSalary(player.salary)}</div>
                <div className="roster-player-actions">
                  <button
                    onClick={() => handleAddPlayerToLineup(player, true)}
                    className="roster-btn roster-btn-start"
                    title="Add to Starting Lineup"
                  >
                    +START
                  </button>
                  <button
                    onClick={() => handleAddPlayerToLineup(player, false)}
                    className="roster-btn roster-btn-bench"
                    title="Add to Bench"
                  >
                    +BENCH
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle - Starting Lineup */}
        <div className="rotation-section">
          <div className="rotation-section-header">
            <h3>⭐ Starting Lineup</h3>
            <div className="rotation-count">5/5</div>
          </div>
          <div className="lineup-positions">
            {positions.map((pos, idx) => (
              <div key={pos} className="position-slot">
                <div className="position-label">{pos}</div>
                {startingLineup[idx] ? (
                  <div className="player-slot filled">
                    <div className="slot-player-name">
                      {startingLineup[idx].firstName} {startingLineup[idx].lastName}
                    </div>
                    <div className="slot-player-stats">
                      <span className="slot-ovr">{startingLineup[idx].ovr}</span>
                      <span className="slot-age">{startingLineup[idx].age}y</span>
                    </div>
                    <div className="slot-player-minutes">
                      <input
                        type="number"
                        min="0"
                        max="48"
                        value={minutesAlloc[startingLineup[idx].id] || 32}
                        onChange={(e) => setMinutesAlloc(prev => ({
                          ...prev,
                          [startingLineup[idx].id]: parseInt(e.target.value)
                        }))}
                        className="minutes-input"
                      />
                      <span className="minutes-label">min</span>
                    </div>
                    <button
                      onClick={() => handleSelectPlayer(idx, true)}
                      className="slot-remove"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="player-slot empty">
                    <span>Empty</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right - Bench Rotation */}
        <div className="rotation-section">
          <div className="rotation-section-header">
            <h3>🪑 Bench Rotation</h3>
            <div className="rotation-count">{benchRotation.filter(p => p !== null).length}/8</div>
          </div>
          <div className="bench-list">
            {benchRotation.map((player, idx) => (
              <div key={idx} className="bench-slot">
                {player ? (
                  <div className="bench-player">
                    <div className="bench-player-info">
                      <div className="bench-player-name">{player.firstName} {player.lastName}</div>
                      <div className="bench-player-pos">{player.pos}</div>
                    </div>
                    <div className="bench-player-ovr">{player.ovr}</div>
                    <div className="bench-player-minutes">
                      <input
                        type="number"
                        min="0"
                        max="48"
                        value={minutesAlloc[player.id] || 12}
                        onChange={(e) => setMinutesAlloc(prev => ({
                          ...prev,
                          [player.id]: parseInt(e.target.value)
                        }))}
                        className="minutes-input-bench"
                      />
                    </div>
                    <button
                      onClick={() => handleSelectPlayer(idx, false)}
                      className="bench-remove"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="bench-player-empty">
                    <span>Empty Slot</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="rotation-summary">
        <div className="summary-card">
          <div className="summary-label">Total Players</div>
          <div className="summary-value">
            {[...startingLineup, ...benchRotation].filter(p => p !== null).length}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Minutes</div>
          <div className="summary-value">{totalMinutes}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Avg OVR</div>
          <div className="summary-value">
            {(
              [...startingLineup, ...benchRotation]
                .filter(p => p !== null)
                .reduce((sum, p) => sum + p.ovr, 0) / 
              [...startingLineup, ...benchRotation].filter(p => p !== null).length
            ).toFixed(1)}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Payroll</div>
          <div className="summary-value">{formatSalary(totalSalary)}</div>
        </div>
      </div>
    </div>
  );
}
