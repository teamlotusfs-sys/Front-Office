@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-base: #0a0a0f;
  --bg-surface: #111118;
  --bg-card: #16161f;
  --bg-hover: #1c1c28;
  --border: #232334;
  --border-bright: #2e2e46;
  --accent: #e8ff47;
  --accent-dim: rgba(232, 255, 71, 0.12);
  --accent-glow: rgba(232, 255, 71, 0.25);
  --text-primary: #f0f0f8;
  --text-secondary: #8888a8;
  --text-muted: #44445a;
  --red: #ff4757;
  --green: #2ed573;
  --blue: #5352ed;
  --orange: #ffa502;
  --sidebar-w: 220px;
  --header-h: 60px;
}

html, body, #root { height: 100%; }

body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6 { 
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  letter-spacing: -0.02em;
}

button { cursor: pointer; font-family: inherit; border: none; font-weight: 600; }
a { text-decoration: none; color: inherit; }
input, select { font-family: inherit; }

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 2px; }

/* Utility */
.mono { font-family: 'Space Mono', monospace; }
.accent { color: var(--accent); }
.muted { color: var(--text-secondary); }
.badge {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 2px 8px; border-radius: 4px; font-size: 11px;
  font-weight: 600; font-family: 'Space Mono', monospace; letter-spacing: 0.04em;
}
.badge-green { background: rgba(46,213,115,0.15); color: var(--green); }
.badge-red { background: rgba(255,71,87,0.15); color: var(--red); }
.badge-orange { background: rgba(255,165,2,0.15); color: var(--orange); }
.badge-blue { background: rgba(83,82,237,0.15); color: var(--blue); }
.badge-muted { background: var(--bg-hover); color: var(--text-secondary); }
