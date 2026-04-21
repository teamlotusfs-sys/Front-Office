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
  const yourTeamPicks = draftPicks.filter(p => p.from === team.id);

  const yourSalary = roster.filter(p => selectedYourPlayers.includes(p.id)).reduce((sum, p) => sum + p.salary, 0);
  const theirSalary = theirTeamRoster.filter(p => selectedTheirPlayers.includes(p.id)).reduce((sum, p) => sum + p.salary, 0);

  const sortedYourRoster = [...roster].sort((a, b) => b.ovr - a.ovr);
  const sortedTheirRoster = [...theirTeamRoster].sort((a, b) => b.ovr - a.ovr);

  const canPropose = selectedTeam && (selectedYourPlayers.length > 0 || selectedYourPicks.length > 0) && (selectedTheirPlayers.length > 0 || selectedTheirPicks.length > 0);

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
              *

