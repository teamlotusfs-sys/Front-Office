import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGameState';
import { NBA_TEAMS } from '../data/nbaData';
import './StartPage.css';

export default function StartPage() {
  const navigate = useNavigate();
  const { startGame } = useGame();
  const [step, setStep] = useState('home'); // home | setup
  const [gmName, setGmName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confFilter, setConfFilter] = useState('All');

  const filteredTeams = NBA_TEAMS.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.abbr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchConf = confFilter === 'All' || t.conf === confFilter;
    return matchSearch && matchConf;
  }).sort((a, b) => a.rating - b.rating);

  function handleStart() {
    console.log('🔍 handleStart called');
    console.log('gmName:', gmName);
    console.log('selectedTeam:', selectedTeam);
    
    if (!gmName.trim() || !selectedTeam) {
      console.log('❌ Missing data - returning early');
      return;
    }
    
    console.log('✅ Calling startGame with:', selectedTeam.id, gmName.trim());
    startGame(selectedTeam.id, gmName.trim());
    
    console.log('✅ Navigating to /dashboard');
    navigate('/dashboard');
  }

  if (step === 'home') {
    return (
      <div className="start-home">
        <div className="start-noise" />
        <div className="start-grid-bg" />

        <div className="start-logo-area">
          <div className="start-icon">🏀</div>
          <h1 className="start-title">REBUILD<span className="accent">MODE</span></h1>
          <p className="start-sub">Build a dynasty from the ground up. Every pick counts.</p>
        </div>

        <div className="start-actions">
          <button className="btn-primary-lg" onClick={() => setStep('setup')}>
            <span>New Franchise</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <button className="btn-ghost-lg" disabled>Continue Save <span className="badge badge-muted" style={{marginLeft:8}}>SOON</span></button>
        </div>

        <div className="start-features">
          {[
            { icon: '📋', label: 'Manage Roster', desc: 'Sign, trade, and develop players' },
            { icon: '📅', label: 'Sim Season', desc: 'Advance week-by-week through the season' },
            { icon: '🔄', label: 'Trade Center', desc: 'Deal players and draft picks' },
            { icon: '🏆', label: 'Draft Board', desc: 'Scout and select future stars' },
          ].map(f => (
            <div className="start-feature-card" key={f.label}>
              <span className="start-feature-icon">{f.icon}</span>
              <strong>{f.label}</strong>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="start-footer-note">Season 2025–26 · 30 Teams · 72-Game Schedule</p>
      </div>
    );
  }

  return (
    <div className="start-setup">
      <div className="start-noise" />
      <div className="start-grid-bg" />

      <div className="setup-container">
        <button className="setup-back" onClick={() => setStep('home')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>

        <h2 className="setup-heading">Choose Your Franchise</h2>
        <p className="setup-sub muted">Pick a team and enter your name to begin. Low-rated teams = bigger challenge.</p>

        <div className="setup-name-row">
          <label className="setup-label">Your GM Name</label>
          <input
            className="setup-input"
            placeholder="e.g. Sam Presti"
            value={gmName}
            onChange={e => setGmName(e.target.value)}
            maxLength={30}
          />
        </div>

        <div className="setup-filters">
          <input
            className="setup-search"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="setup-conf-btns">
            {['All', 'East', 'West'].map(c => (
              <button key={c} className={`conf-btn ${confFilter === c ? 'active' : ''}`} onClick={() => setConfFilter(c)}>{c}</button>
            ))}
          </div>
          <span className="setup-sort-note muted">Sorted: easiest rebuild first</span>
        </div>

        <div className="team-grid">
          {filteredTeams.map(team => (
            <button
              key={team.id}
              className={`team-card ${selectedTeam?.id === team.id ? 'selected' : ''}`}
              onClick={() => setSelectedTeam(team)}
              style={{ '--team-color': team.color }}
            >
              <div className="team-card-color-bar" />
              <div className="team-card-body">
                <span className="team-card-abbr">{team.abbr}</span>
                <span className="team-card-name">{team.name}</span>
                <span className="team-card-record muted mono">{team.record}</span>
              </div>
              <div className="team-card-rating" style={{ color: team.rating >= 80 ? '#e8ff47' : team.rating >= 70 ? '#2ed573' : '#ffa502' }}>
                <span className="rating-val">{team.rating}</span>
                <span className="rating-label">OVR</span>
              </div>
            </button>
          ))}
        </div>

        {selectedTeam && (
          <div className="setup-selected-banner">
            <span>Selected: <strong>{selectedTeam.name}</strong></span>
            <span className="muted">{selectedTeam.record} · {selectedTeam.conf}ern Conference</span>
            <button
              className="btn-primary-lg btn-compact"
              onClick={handleStart}
              disabled={!gmName.trim()}
            >
              Start Rebuild →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
