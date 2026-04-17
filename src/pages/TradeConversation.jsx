import React, { useState } from 'react';
import { NBA_TEAMS } from '../data/nbaData';

export default function TradeConversation({ 
  trade, 
  onAccept, 
  onDecline, 
  onCounter,
  isIncoming = false 
}) {
  const [messages, setMessages] = useState([
    {
      from: isIncoming ? 'gm' : 'you',
      text: trade.message || (isIncoming ? `I've got a trade offer for you` : 'Check out this trade idea'),
      timestamp: Date.now(),
    }
  ]);
  
  const team = NBA_TEAMS.find(t => t.id === trade.from.id);
  const isDeclined = trade.type === 'decline';

  const handleAccept = () => {
    if (isDeclined) return; // Block if declined
    
    setMessages([...messages, {
      from: 'you',
      text: '✓ Trade Accepted',
      timestamp: Date.now(),
    }]);
    setTimeout(() => onAccept(trade), 300);
  };

  const handleDecline = () => {
    setMessages([...messages, {
      from: 'you',
      text: '✗ Trade Declined',
      timestamp: Date.now(),
    }]);
    setTimeout(() => onDecline(trade), 300);
  };

  const handleCounter = () => {
    setMessages([...messages, {
      from: 'you',
      text: 'Let me counter that...',
      timestamp: Date.now(),
    }]);
    onCounter(trade);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-card)',
      borderRadius: 8,
      border: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: team.color,
        }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{team.abbr}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{team.name}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.from === 'you' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              background: msg.from === 'you' ? 'var(--accent)' : 'var(--bg-hover)',
              color: msg.from === 'you' ? '#0a0a0f' : 'var(--text-primary)',
              padding: '10px 14px',
              borderRadius: 8,
              maxWidth: '80%',
              fontSize: 13,
              fontWeight: msg.from === 'you' ? 600 : 400,
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Trade Details */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '12px 16px',
        background: 'var(--bg-surface)',
        fontSize: 12,
        maxHeight: 200,
        overflowY: 'auto',
      }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>They Give:</div>
          {trade.theirPlayers?.map(p => (
            <div key={p.id} style={{ fontSize: 11, color: 'var(--text-primary)', marginBottom: 2 }}>
              • {p.firstName} {p.lastName} ({p.ovr} OVR)
            </div>
          ))}
        </div>
        <div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>You Give:</div>
          {trade.yourPlayers?.map(p => (
            <div key={p.id} style={{ fontSize: 11, color: 'var(--text-primary)', marginBottom: 2 }}>
              • {p.firstName} {p.lastName} ({p.ovr} OVR)
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: 8,
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={handleDecline}
          style={{
            flex: 1,
            minWidth: 80,
            padding: '8px 12px',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-secondary)',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--red)';
            e.currentTarget.style.color = 'var(--red)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          Decline
        </button>
        {trade.countered && (
          <button
            onClick={handleCounter}
            style={{
              flex: 1,
              minWidth: 80,
              padding: '8px 12px',
              background: 'var(--bg-hover)',
              border: '1px solid var(--accent)',
              borderRadius: 4,
              color: 'var(--accent)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(232, 255, 71, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
            }}
          >
            Counter
          </button>
        )}
        <button
          onClick={handleAccept}
          disabled={isDeclined}
          style={{
            flex: 1,
            minWidth: 80,
            padding: '8px 12px',
            background: isDeclined ? 'var(--bg-hover)' : 'var(--accent)',
            border: 'none',
            borderRadius: 4,
            color: isDeclined ? 'var(--text-secondary)' : '#0a0a0f',
            fontSize: 11,
            fontWeight: 600,
            cursor: isDeclined ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            opacity: isDeclined ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isDeclined) {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDeclined) {
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
          title={isDeclined ? 'Trade declined - cannot accept' : 'Accept trade'}
        >
          Accept
        </button>
      </div>

      {/* Declined Message */}
      {isDeclined && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(255, 71, 87, 0.1)',
          borderTop: '1px solid var(--border)',
          color: 'var(--red)',
          fontSize: 11,
          textAlign: 'center',
          fontWeight: 600,
        }}>
          Trade Declined - {trade.reason || 'Not interested'}
        </div>
      )}
    </div>
  );
}
