import React, { useState } from 'react';
import { useGame } from '../hooks/useGameState';
import { NBA_TEAMS } from '../data/nbaData';
import './StartGame.css';

export default function StartGame() {
  const { startGame } = useGame();
  const [gmName, setGmName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamSelect, setShowTeamSelect] = useState(false);

  const handleStart = () => {
    if (gmName.trim() && selectedTeam) {
      startGame(selectedTeam.id, gmName);
    }
  };

  return (
    <div className="start-screen">
      {/* Animated background */}
      <div className="animated-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="start-container">
        {!showTeamSelect ? (
          <div className="start-welcome">
            <div className="start-logo">
              <div className="logo-icon">🏀</div>
              <h1 className="start-title">FRONT OFFICE</h1>
              <p className="start-subtitle">Build your dynasty</p>
            </div>

            <div className="start-form">
              <div className="form-group">
                <label>General Manager Name</label>
                <input
                  type="text"
                  value={gmName}
                  onChange={(e) => setGmName(e.target.value)}
                  placeholder="Enter your name"
                  className="gm-input"
                  onKeyDown={(e) => e.key === 'Enter' && gmName && setShowTeamSelect(true)}
                  autoFocus
                />
              </div>

              <button
                onClick={() => gmName && setShowTeamSelect(true)}
                className="start-btn start-btn-primary"
                disabled={!gmName.trim()}
              >
                <span>Continue to Team Selection</span>
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="team-select-screen">
            <div className="team-select-header">
              <button
                className="back-btn"
                onClick={() => {
                  setShowTeamSelect(false);
                  setSelectedTeam(null);
                }}
              >
                ← Back
              </button>
              <h2>Choose Your Team</h2>
              <div style={{ width: 40 }}></div>
            </div>

            <div className="team-grid">
              {NBA_TEAMS.map((team) => (
                <div
                  key={team.id}
                  className={`team-card ${selectedTeam?.id === team.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTeam(team)}
                >
                  <div className="team-card-inner">
                    <div className="team-emoji">{team.emoji}</div>
                    <div className="team-info">
                      <h3>{team.name}</h3>
                      <p>{team.city}</p>
                    </div>
                    <div className="team-rating">{team.rating}</div>
                  </div>
                  {selectedTeam?.id === team.id && (
                    <div className="selected-badge">✓</div>
                  )}
                </div>
              ))}
            </div>

            {selectedTeam && (
              <div className="team-select-footer">
                <button
                  onClick={handleStart}
                  className="start-btn start-btn-success"
                >
                  <span>Start with {selectedTeam.name}</span>
                  <span className="btn-arrow">🚀</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
