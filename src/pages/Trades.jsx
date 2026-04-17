import React, { useState } from 'react';
import { useGame } from '../hooks/useGameState';
import { NBA_TEAMS } from '../data/nbaData';
import { evaluateTrade, calculateTradeValue } from '../data/TradeSystem';
import TradeConversation from './TradeConversation';
import PhonePopup from '../components/PhonePopup';

export default function Trades() {
  const { gameState, executeTrade, declineTrade } = useGame();
  const { roster, team, allRosters } = gameState;
  const [activeTab, setActiveTab] = useState('propose'); // propose | offers | history
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedYourPlayers, setSelectedYourPlayers] = useState([]);
  const [selectedTheirPlayers, setSelectedTheirPlayers] = useState([]);
  const [tradeEval, setTradeEval] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [answeringPhone, setAnsweringPhone] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const availableTeams = NBA_TEAMS.filter(t => t.id !== team.id);

  const handleProposeTradeClick = () => {
    if (!selectedTeam || selectedYourPlayers.length === 0 || selectedTheirPlayers.length === 0) {
      return;
    }

    const yourPlayers = roster.filter(p => selectedYourPlayers.includes(p.id));
    const theirPlayers = allRosters[selectedTeam.id].filter(p => selectedTheirPlayers.includes(p.id));

    const evaluation = evaluateTrade(yourPlayers, [], theirPlayers, [], selectedTeam.id);
    
    setTradeEval({
      from: selectedTeam,
      yourPlayers,
      theirPlayers,
      picks: [],
      ...evaluation,
    });

    setActiveConversation({
      from: selectedTeam,
      yourPlayers,
      theirPlayers,
      message: evaluation.message,
      type: evaluation.type,
      accepted: evaluation.accepted,
      countered: evaluation.countered,
    });
  };

  const handleAcceptTrade = (trade) => {
    executeTrade(trade);
    setActiveConversation(null);
    setSelectedYourPlayers([]);
    setSelectedTheirPlayers([]);
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

  const proposeTab = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
      {/* Team Select */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          Trade Partner
        </div>
        <input
          placeholder="Search teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text-primary)',
            fontSize: 12,
            marginBottom: 10,
            outline: 'none',
          }}
        />
        <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filteredTeams.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTeam(t)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                background: selectedTeam?.id === t.id ? 'var(--accent-dim)' : 'var(--bg-card)',
                border: selectedTeam?.id === t.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
              <span>{t.abbr}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Your Players */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          Your Players ({selectedYourPlayers.length})
        </div>
        <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {roster.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedYourPlayers(prev =>
                prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
              )}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: selectedYourPlayers.includes(p.id) ? 'var(--accent-dim)' : 'var(--bg-card)',
                border: selectedYourPlayers.includes(p.id) ? '1px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
            >
              <span>{p.firstName} {p.lastName}</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.ovr}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Their Players */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          Their Players ({selectedTheirPlayers.length})
        </div>
        <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {selectedTeam && allRosters[selectedTeam.id] ? (
            allRosters[selectedTeam.id].map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedTheirPlayers(prev =>
                  prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                )}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: selectedTheirPlayers.includes(p.id) ? 'var(--accent-dim)' : 'var(--bg-card)',
                  border: selectedTheirPlayers.includes(p.id) ? '1px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 6,
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
              >
                <span>{p.firstName} {p.lastName}</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.ovr}</span>
              </button>
            ))
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Select a team first</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="page-title">Trade Center</h1>
      <p className="page-subtitle">Propose trades, receive offers, negotiate deals</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
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
              borderRadius: 4,
              color: activeTab === t.id ? 'var(--accent)' : 'var(--text-secondary)',
              padding: '8px 16px',
              fontSize: 12,
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
          <div style={{ maxWidth: 600 }}>
            <TradeConversation
              trade={activeConversation}
              onAccept={handleAcceptTrade}
              onDecline={handleDeclineTrade}
              isIncoming={false}
            />
          </div>
        ) : (
          <>
            {proposeTab}
            <button
              onClick={handleProposeTradeClick}
              disabled={!selectedTeam || selectedYourPlayers.length === 0 || selectedTheirPlayers.length === 0}
              style={{
                marginTop: 20,
                padding: '12px 24px',
                background: selectedTeam && selectedYourPlayers.length > 0 && selectedTheirPlayers.length > 0 ? 'var(--accent)' : 'var(--bg-hover)',
                color: selectedTeam && selectedYourPlayers.length > 0 && selectedTheirPlayers.length > 0 ? '#0a0a0f' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: selectedTeam && selectedYourPlayers.length > 0 && selectedTheirPlayers.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >
              Send Trade Offer
            </button>
          </>
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

      {/* Phone Popup */}
      {answeringPhone && (
        <PhonePopup
          offer={answeringPhone}
          onAnswer={() => setActiveConversation(answeringPhone)}
          onDecline={() => setAnsweringPhone(null)}
        />
      )}
    </div>
  );
}
