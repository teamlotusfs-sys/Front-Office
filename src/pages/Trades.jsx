import React, { useState } from 'react';
import { useGame, formatSalary } from '../hooks/useGameState';
import { NBA_TEAMS } from '../data/nbaData';
import { evaluateTrade } from '../data/TradeSystem';
import TradeConversation from './TradeConversation';
import './Trades.css';

export default function Trades() {
  const { gameState, executeTrade, declineTrade } = useGame();
  const { roster, team, allRosters, draftPicks } = gameState;
  const [activeTab, setActiveTab] = useState('propose');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedYourPlayers, setSelectedYourPlayers] = useState([]);
  const [selectedYourPicks, setSelectedYourPicks] = useState([]);
  const [selectedTheirPlayers, setSelectedTheirPlayers] = useState([]);
  const [selectedTheirPicks, setSelectedTheirPicks] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const availableTeams = NBA_TEAMS.filter(t => t.id !== team.id);

  const handleProposeTradeClick = () => {
    if (!selectedTeam || (selectedYourPlayers.length === 0 && selectedYourPicks.length === 0) || (selectedTheirPlayers.length === 0 && selectedTheirPicks.length === 0)) {
      return;
    }

    const yourPlayers = roster.filter(p => selectedYourPlayers.includes(p.id));
    const theirPlayers = allRosters[selectedTeam.id].filter(p => selectedTheirPlayers.includes(p.id));

    const evaluation = evaluateTrade(yourPlayers, [], theirPlayers, [], selectedTeam.id);
    
    setActiveConversation({
      from: selectedTeam,
      yourPlayers,
      theirPlayers,
      yourPicks: selectedYourPicks,
      theirPicks: selectedTheirPicks,
      message: evaluation.message,
      type: evaluation.type,
      accepted: evaluation.accepted,
    });
  };

  const handleAcceptTrade = (trade) => {
    executeTrade(trade);
    setActiveConversation(null);
    setSelectedYourPlayers([]);
    setSelectedYourPicks([]);
    setSelectedTheirPlayers([]);
    setSelectedTheirPicks([]);
    setSelectedTeam(null);
  };

  const handleDeclineTrade = (trade) => {
    declineTrade(trade);
    setActiveConversation(null);
  };

  const filteredTeams = availableTeams.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.abbr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const theirTeamRoster = selectedTeam ? allRosters[selectedTeam.id] : [];
  const theirTeamPicks = selectedTeam ? 
    draftPicks.filter(p => p.from === selectedTeam.id) : [];

  const yourSalary = roster.filter(p => selectedYourPlayers.includes(p.id)).reduce((sum, p) => sum + p.salary, 0);
  const theirSalary = theirTeamRoster.filter(p => selectedTheirPlayers.includes(p.id)).reduce((sum, p) => sum + p.salary, 0);

  return (
    <div>
      <h1 className="page-title">Trade Center</h1>
      <p className="page-subtitle">Build your perfect roster through strategic trades</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { id: 'propose', label: '✉️ Propose Trade' },
          { id: 'offers', label: '📞 Trade Offers' },
          { id: 'history', label: '📋 History' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: activeTab === t.id ? 'var(--accent-dim)' : 'var(--bg-card)',
              border: `1px solid ${activeTab === t.id ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 6,
              color: activeTab === t.id ? 'var(--accent)' : 'var(--text-secondary)',
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ display: activeTab === 'propose' ? 'block' : 'none' }}>
        {activeConversation ? (
          <div style={{ maxWidth: 700 }}>
            <TradeConversation
              trade={activeConversation}
              onAccept={handleAcceptTrade}
              onDecline={handleDeclineTrade}
              isIncoming={false}
            />
          </div>
        ) : (
          <div className="trade-builder">
            {/* Left Column - Team Select */}
            <div className="trade-column">
              <div className="trade-column-header">
                <h3>🏀 Select Trade Partner</h3>
              </div>
              <input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="trade-search"
              />
              <div className="trade-team-list">
                {filteredTeams.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTeam(t);
                      setSelectedTheirPlayers([]);
                      setSelectedTheirPicks([]);
                    }}
                    className={`trade-team-btn ${selectedTeam?.id === t.id ? 'active' : ''}`}
                  >
                    <div className="trade-team-dot" style={{ background: t.color }} />
                    <div>
                      <div className="trade-team-abbr">{t.abbr}</div>
                      <div className="trade-team-name">{t.name}</div>
                    </div>
                    <div className="trade-team-rating">{t.rating}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Middle Column - Your Players */}
            <div className="trade-column">
              <div className="trade-column-header">
                <h3>😊 Your Assets</h3>
                <div className="trade-salary-info">
                  Salary: <span style={{ color: 'var(--accent)' }}>{formatSalary(yourSalary)}</span>
                </div>
              </div>
              
              <div className="trade-asset-group">
                <div className="trade-asset-label">Players ({selectedYourPlayers.length})</div>
                <div className="trade-player-list">
                  {roster.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedYourPlayers(prev =>
                        prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                      )}
                      className={`trade-player-card ${selectedYourPlayers.includes(p.id) ? 'selected' : ''}`}
                    >
                      <div className="player-name">
                        {p.firstName} {p.lastName}
                      </div>
                      <div className="player-stats">
                        <span className="player-ovr">{p.ovr}</span>
                        <span className="player-pos">{p.pos}</span>
                      </div>
                      <div className="player-salary">{formatSalary(p.salary)}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="trade-asset-group" style={{ marginTop: 16 }}>
                <div className="trade-asset-label">Draft Picks ({selectedYourPicks.length})</div>
                <div className="trade-player-list">
                  {draftPicks.filter(p => p.from === team.id).map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedYourPicks(prev =>
                        prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                      )}
                      className={`trade-pick-card ${selectedYourPicks.includes(p.id) ? 'selected' : ''}`}
                    >
                      <div className="pick-round">R{p.round}</div>
                      <div className="pick-year">{p.year}</div>
                      {p.protected && <div className="pick-protection">{p.protected}</div>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Their Players */}
            {selectedTeam && (
              <div className="trade-column">
                <div className="trade-column-header">
                  <h3>🏆 {selectedTeam.abbr} Assets</h3>
                  <div className="trade-salary-info">
                    Salary: <span style={{ color: 'var(--green)' }}>{formatSalary(theirSalary)}</span>
                  </div>
                </div>

                <div className="trade-asset-group">
                  <div className="trade-asset-label">Players ({selectedTheirPlayers.length})</div>
                  <div className="trade-player-list">
                    {theirTeamRoster.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedTheirPlayers(prev =>
                          prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                        )}
                        className={`trade-player-card ${selectedTheirPlayers.includes(p.id) ? 'selected' : ''}`}
                      >
                        <div className="player-name">
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="player-stats">
                          <span className="player-ovr">{p.ovr}</span>
                          <span className="player-pos">{p.pos}</span>
                        </div>
                        <div className="player-salary">{formatSalary(p.salary)}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="trade-asset-group" style={{ marginTop: 16 }}>
                  <div className="trade-asset-label">Draft Picks ({selectedTheirPicks.length})</div>
                  <div className="trade-player-list">
                    {theirTeamPicks.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedTheirPicks(prev =>
                          prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                        )}
                        className={`trade-pick-card ${selectedTheirPicks.includes(p.id) ? 'selected' : ''}`}
                      >
                        <div className="pick-round">R{p.round}</div>
                        <div className="pick-year">{p.year}</div>
                        {p.protected && <div className="pick-protection">{p.protected}</div>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!activeConversation && selectedTeam && (
          <button
            onClick={handleProposeTradeClick}
            disabled={!selectedTeam || (selectedYourPlayers.length === 0 && selectedYourPicks.length === 0) || (selectedTheirPlayers.length === 0 && selectedTheirPicks.length === 0)}
            className="trade-propose-btn"
            style={{
              marginTop: 24,
              opacity: !selectedTeam || (selectedYourPlayers.length === 0 && selectedYourPicks.length === 0) || (selectedTheirPlayers.length === 0 && selectedTheirPicks.length === 0) ? 0.5 : 1,
            }}
          >
            Propose Trade to {selectedTeam.abbr}
          </button>
        )}
      </div>

      <div style={{ display: activeTab === 'offers' ? 'block' : 'none' }}>
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 20px' }}>
          No trade offers yet. GMs will call you with offers during the season.
        </div>
      </div>

      <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 20px' }}>
          No trades completed yet.
        </div>
      </div>
    </div>
  );
}
