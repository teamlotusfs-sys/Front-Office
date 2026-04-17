function random() {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / 4294967296;
  }
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    const hex = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
    return parseInt(hex, 16) / 4294967296;
  }
  return Math.random();
}

// Calculate trade value for a player
export function calculatePlayerValue(player) {
  const ovrValue = (player.ovr - 60) * 50;
  const salaryValue = player.salary / 1_000_000 * 30;
  const yearsValue = player.yearsLeft * 20;
  return ovrValue + salaryValue + yearsValue;
}

// Calculate total trade value
export function calculateTradeValue(players = [], picks = []) {
  let value = 0;
  players.forEach(p => { value += calculatePlayerValue(p); });
  picks.forEach(p => { value += p.round === 1 ? 100 : 50; });
  return value;
}

// GM Personality Types
const GM_PERSONALITIES = {
  AGGRESSIVE: 'aggressive',
  PASSIVE: 'passive',
  REALISTIC: 'realistic',
  DESPERATE: 'desperate',
  SELECTIVE: 'selective',
};

function getGMPersonality(teamId) {
  const seed = teamId.charCodeAt(0);
  const rand = (seed * 9301 + 49297) % 233280 / 233280;
  if (rand < 0.2) return GM_PERSONALITIES.AGGRESSIVE;
  if (rand < 0.4) return GM_PERSONALITIES.PASSIVE;
  if (rand < 0.6) return GM_PERSONALITIES.REALISTIC;
  if (rand < 0.8) return GM_PERSONALITIES.DESPERATE;
  return GM_PERSONALITIES.SELECTIVE;
}

// Response templates based on personality and trade value difference
const RESPONSE_TEMPLATES = {
  [GM_PERSONALITIES.AGGRESSIVE]: {
    accept: [
      "Let's make it happen 🤝",
      "I like the way you think",
      "Done. Send it over",
      "We have a deal 💪",
      "Let's go, handshake 🤙",
    ],
    decline: [
      "Not close enough, got anything else?",
      "Need way more for that",
      "That's disrespectful lmao 💀",
      "Try again when you have real assets",
      "You smoking? 🚬",
    ],
    counter: [
      "How about this instead?",
      "Let me adjust this...",
      "What if I add [PLAYER]?",
      "Counter with [OFFER]",
      "Let me sweeten the pot",
    ],
  },
  [GM_PERSONALITIES.PASSIVE]: {
    accept: [
      "Yeah that works for me",
      "Sounds good to me",
      "I'll take it",
      "Works for our timeline",
      "Let's do it",
    ],
    decline: [
      "Not really interested right now",
      "Doesn't fit what we need",
      "We'll pass for now",
      "Not the right deal for us",
      "Maybe another time",
    ],
    counter: [
      "What if we tweaked it slightly?",
      "Could you adjust [PLAYER]?",
      "What about instead...",
      "Small change needed",
      "Almost there, but...",
    ],
  },
  [GM_PERSONALITIES.REALISTIC]: {
    accept: [
      "Fair deal, let's go 🤝",
      "That's balanced, I'm in",
      "Good value on both sides",
      "Makes sense for both of us",
      "Yeah, this works",
    ],
    decline: [
      "Values don't line up",
      "One side has too much advantage",
      "Not a fair trade",
      "Numbers don't match",
      "Too lopsided",
    ],
    counter: [
      "What if we balance it with [ASSET]?",
      "Need something else to even it out",
      "Can you add to even the value?",
      "Let's make it more balanced",
      "Close, but need one more piece",
    ],
  },
  [GM_PERSONALITIES.DESPERATE]: {
    accept: [
      "YES please, we need this",
      "Take it before I change my mind 😅",
      "DONE. Send immediately",
      "Oh thank god, yes",
      "Whatever gets us a deal",
    ],
    decline: [
      "Ugh, maybe something else?",
      "Close but not quite...",
      "We're so close...",
      "Just need a little more",
      "Almost, but can we adjust?",
    ],
    counter: [
      "What if you added [ASSET]?",
      "Can we make one small change?",
      "So close, just need [PLAYER]",
      "One more piece?",
      "Nearly there...",
    ],
  },
  [GM_PERSONALITIES.SELECTIVE]: {
    accept: [
      "You've done your homework, let's go",
      "Respect the offer, I'm in",
      "Impressive, I'll take it",
      "You know what you're doing",
      "This is smart for both sides",
    ],
    decline: [
      "Doesn't align with our vision",
      "Not the direction we're heading",
      "I don't see the fit",
      "Doesn't match our timeline",
      "Not what we're building toward",
    ],
    counter: [
      "What if we adjust the direction?",
      "Could work if we modify [ASPECT]",
      "I see it differently, here's my take",
      "Different approach: [OFFER]",
      "Let me propose an alternative",
    ],
  },
};

// Evaluate trade offer
export function evaluateTrade(yourPlayers, yourPicks, theirPlayers, theirPicks, theirTeamId) {
  const yourValue = calculateTradeValue(yourPlayers, yourPicks);
  const theirValue = calculateTradeValue(theirPlayers, theirPicks);
  
  const valueDiff = Math.abs(yourValue - theirValue);
  const valueDiffPercent = (valueDiff / Math.max(yourValue, theirValue)) * 100;
  
  const personality = getGMPersonality(theirTeamId);
  
  // Determine accept/decline/counter - MUCH more lenient now
  let response;
  
  if (valueDiffPercent < 10) {
    // Very fair trade - high accept rate
    if (random() > 0.2 || personality === GM_PERSONALITIES.DESPERATE) {
      response = {
        type: 'accept',
        message: RESPONSE_TEMPLATES[personality].accept[Math.floor(random() * RESPONSE_TEMPLATES[personality].accept.length)],
        accepted: true,
      };
    } else {
      response = {
        type: 'counter',
        message: RESPONSE_TEMPLATES[personality].counter[Math.floor(random() * RESPONSE_TEMPLATES[personality].counter.length)],
        accepted: false,
        countered: true,
      };
    }
  } else if (valueDiffPercent < 20) {
    // Slightly off - mostly accepts/counters
    const rand = random();
    if (rand > 0.3 || personality === GM_PERSONALITIES.DESPERATE || personality === GM_PERSONALITIES.AGGRESSIVE) {
      response = {
        type: 'accept',
        message: RESPONSE_TEMPLATES[personality].accept[Math.floor(random() * RESPONSE_TEMPLATES[personality].accept.length)],
        accepted: true,
      };
    } else if (rand > 0.15) {
      response = {
        type: 'counter',
        message: RESPONSE_TEMPLATES[personality].counter[Math.floor(random() * RESPONSE_TEMPLATES[personality].counter.length)],
        accepted: false,
        countered: true,
      };
    } else {
      response = {
        type: 'decline',
        message: RESPONSE_TEMPLATES[personality].decline[Math.floor(random() * RESPONSE_TEMPLATES[personality].decline.length)],
        reason: 'Values are a bit off',
        accepted: false,
      };
    }
  } else if (valueDiffPercent < 35) {
    // Noticeably off - still mostly accepts
    const rand = random();
    if (rand > 0.4 || personality === GM_PERSONALITIES.DESPERATE) {
      response = {
        type: 'accept',
        message: RESPONSE_TEMPLATES[personality].accept[Math.floor(random() * RESPONSE_TEMPLATES[personality].accept.length)],
        accepted: true,
      };
    } else if (rand > 0.2) {
      response = {
        type: 'counter',
        message: RESPONSE_TEMPLATES[personality].counter[Math.floor(random() * RESPONSE_TEMPLATES[personality].counter.length)],
        accepted: false,
        countered: true,
      };
    } else {
      response = {
        type: 'decline',
        message: RESPONSE_TEMPLATES[personality].decline[Math.floor(random() * RESPONSE_TEMPLATES[personality].decline.length)],
        reason: 'Trade is too far apart in value',
        accepted: false,
      };
    }
  } else if (valueDiffPercent < 50) {
    // Pretty far off - mixed responses
    const rand = random();
    if (rand > 0.5 || personality === GM_PERSONALITIES.DESPERATE) {
      response = {
        type: 'accept',
        message: RESPONSE_TEMPLATES[personality].accept[Math.floor(random() * RESPONSE_TEMPLATES[personality].accept.length)],
        accepted: true,
      };
    } else if (rand > 0.3) {
      response = {
        type: 'counter',
        message: RESPONSE_TEMPLATES[personality].counter[Math.floor(random() * RESPONSE_TEMPLATES[personality].counter.length)],
        accepted: false,
        countered: true,
      };
    } else {
      response = {
        type: 'decline',
        message: RESPONSE_TEMPLATES[personality].decline[Math.floor(random() * RESPONSE_TEMPLATES[personality].decline.length)],
        reason: 'Deal is way too one-sided',
        accepted: false,
      };
    }
  } else {
    // Extremely lopsided - might still accept if desperate
    if (personality === GM_PERSONALITIES.DESPERATE && random() > 0.3) {
      response = {
        type: 'accept',
        message: RESPONSE_TEMPLATES[personality].accept[Math.floor(random() * RESPONSE_TEMPLATES[personality].accept.length)],
        accepted: true,
      };
    } else {
      response = {
        type: 'decline',
        message: RESPONSE_TEMPLATES[personality].decline[Math.floor(random() * RESPONSE_TEMPLATES[personality].decline.length)],
        reason: 'Not even close',
        accepted: false,
      };
    }
  }
  
  return {
    ...response,
    yourValue: Math.round(yourValue),
    theirValue: Math.round(theirValue),
    valueDiffPercent: Math.round(valueDiffPercent * 10) / 10,
    personality,
  };
}

// Generate AI trade offer
export function generateAITradeOffer(aiTeam, yourRoster, theirRoster, theirBudget) {
  // AI picks 1-2 players from their roster
  const theirPlayers = [];
  const numPlayers = random() > 0.6 ? 2 : 1;
  
  for (let i = 0; i < numPlayers; i++) {
    const randomPlayer = theirRoster[Math.floor(random() * theirRoster.length)];
    if (!theirPlayers.find(p => p.id === randomPlayer.id)) {
      theirPlayers.push(randomPlayer);
    }
  }
  
  // AI wants 1-2 of your players
  const yourPlayers = [];
  const numWantedPlayers = random() > 0.7 ? 2 : 1;
  
  for (let i = 0; i < numWantedPlayers; i++) {
    const randomPlayer = yourRoster[Math.floor(random() * yourRoster.length)];
    if (!yourPlayers.find(p => p.id === randomPlayer.id)) {
      yourPlayers.push(randomPlayer);
    }
  }
  
  return {
    from: aiTeam,
    theirPlayers,
    yourPlayers,
    picks: [],
  };
}
