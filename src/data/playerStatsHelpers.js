function random() {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / 4294967296;
  }
  return Math.random();
}

export function getBasePPG(ovr, position) {
  const basePPG = ((ovr - 59) / 40) * 24 + 4;
  const positionMultiplier = {
    'PG': 0.9,
    'SG': 1.0,
    'SF': 1.05,
    'PF': 1.15,
    'C': 1.1,
  };
  return basePPG * (positionMultiplier[position] || 1.0);
}

export function getGameVariance() {
  const rand = random();
  if (rand > 0.85) return 5 + random() * 5;
  if (rand < 0.10) return -5 - random() * 5;
  return (random() - 0.5) * 6;
}

export function getMinutesPlayed(isStarter, requestedMinutes) {
  if (requestedMinutes) return requestedMinutes;
  if (isStarter) return 30 + Math.floor(random() * 8);
  return 8 + Math.floor(random() * 14);
}

export function generatePlayerGameStats(player, isStarter, teamWon, requestedMinutes = null) {
  const basePPG = getBasePPG(player.ovr, player.pos);
  const variance = getGameVariance();
  const minutes = getMinutesPlayed(isStarter, requestedMinutes);
  
  const winBonus = teamWon ? 2 + random() * 1.5 : 0;
  
  const pointsPerMinute = (basePPG + variance + winBonus) / 36;
  const points = Math.max(0, Math.round(pointsPerMinute * minutes));
  
  const rebounds = Math.max(0, Math.round(
    (player.pos === 'C' ? 8 : player.pos === 'PF' ? 6 : 3) * 
    (minutes / 36) * 
    (player.ovr / 80)
  ));
  
  const assists = Math.max(0, Math.round(
    (player.pos === 'PG' ? 6 : player.pos === 'SG' ? 3 : 2) * 
    (minutes / 36) * 
    (player.ovr / 80)
  ));
  
  const steals = Math.max(0, Math.round(
    (1 + random() * 0.5) * 
    (minutes / 36) * 
    (player.ovr / 90)
  ));
  
  const blocks = Math.max(0, Math.round(
    (player.pos === 'C' ? 1.5 : player.pos === 'PF' ? 0.5 : 0.1) * 
    (minutes / 36) * 
    (player.ovr / 80)
  ));
  
  return { points, rebounds, assists, steals, blocks, minutes };
}
