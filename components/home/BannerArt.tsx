// Original SVG illustrations for the home carousel (no photos, no third-party art).
// Shapes marked .kh-float / .kh-twinkle animate gently; reduced motion stops them.

export function CameraArt() {
  return (
    <svg viewBox="0 0 400 320" role="presentation">
      <mask id="kh-moon"><rect width="400" height="320" fill="#fff" /><circle cx="318" cy="66" r="40" fill="#000" /></mask>
      <circle cx="300" cy="78" r="46" fill="#E3B25C" mask="url(#kh-moon)" />
      {[[60, 50], [120, 28], [210, 60], [360, 150], [40, 140], [250, 22]].map(([x, y], i) => (
        <path key={i} className="kh-twinkle" style={{ animationDelay: `${i * 0.4}s` }} d={`M${x} ${y - 6}l2 4 4 2-4 2-2 4-2-4-4-2 4-2z`} fill="#F3E3BD" />
      ))}
      <g className="kh-float">
        <rect x="88" y="128" width="210" height="136" rx="26" fill="#F7F1E6" />
        <rect x="88" y="128" width="210" height="34" rx="17" fill="#E3DACA" />
        <path d="M150 128l14-26h58l14 26z" fill="#E3DACA" />
        <rect x="108" y="140" width="34" height="12" rx="6" fill="#E8643C" />
        <circle cx="193" cy="200" r="52" fill="#0E2419" />
        <circle cx="193" cy="200" r="38" fill="#2C6A50" />
        <circle cx="193" cy="200" r="22" fill="#0B1D14" />
        <circle cx="182" cy="189" r="7" fill="#DCE6DA" opacity=".8" />
        <circle cx="270" cy="150" r="7" fill="#E3B25C" />
      </g>
      <g transform="translate(276 214) rotate(-8)">
        <rect width="104" height="46" rx="12" fill="#E3B25C" />
        <circle cx="0" cy="23" r="8" fill="#163A2B" />
        <circle cx="104" cy="23" r="8" fill="#163A2B" />
        <text x="52" y="29" textAnchor="middle" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="800" fontSize="15" fill="#163A2B">SAT – SUN</text>
      </g>
    </svg>
  );
}

export function ToolsArt() {
  return (
    <svg viewBox="0 0 400 320" role="presentation">
      <rect x="40" y="30" width="320" height="250" rx="28" fill="#1F4D3A" />
      {Array.from({ length: 8 * 6 }, (_, k) => <circle key={k} cx={70 + (k % 8) * 37} cy={58 + Math.floor(k / 8) * 40} r="3.2" fill="#163A2B" />)}
      <g className="kh-float">
        <path d="M100 110h120a18 18 0 0 1 18 18v14a18 18 0 0 1-18 18h-40l-12 70h-40l8-70h-36a18 18 0 0 1-18-18v-14a18 18 0 0 1 18-18z" fill="#C9491F" />
        <rect x="238" y="122" width="44" height="26" rx="6" fill="#DCE6DA" />
        <rect x="282" y="131" width="34" height="8" rx="4" fill="#BFD1BD" />
        <rect x="128" y="228" width="58" height="22" rx="8" fill="#163A2B" />
        <circle cx="114" cy="135" r="8" fill="#E3B25C" />
      </g>
      <g transform="translate(262 170) rotate(38)">
        <rect x="-8" y="0" width="16" height="96" rx="8" fill="#F7F1E6" />
        <path d="M-24 -8a24 24 0 1 1 48 0l-10 10h-28z" fill="#F7F1E6" />
        <rect x="-7" y="-26" width="14" height="22" fill="#1F4D3A" />
      </g>
      <g transform="translate(70 196) rotate(-24)">
        <rect x="0" y="-6" width="80" height="12" rx="6" fill="#E8643C" />
        <rect x="70" y="-20" width="26" height="40" rx="6" fill="#DCE6DA" />
      </g>
    </svg>
  );
}

export function EarnArt() {
  return (
    <svg viewBox="0 0 400 320" role="presentation">
      <circle cx="210" cy="160" r="128" fill="#E3B25C" opacity=".55" />
      <g className="kh-float">
        <path d="M96 170l104-40 104 40-104 40z" fill="#F7C38A" />
        <path d="M96 170v86l104 40v-86z" fill="#F2A65E" />
        <path d="M304 170v86l-104 40v-86z" fill="#E08A43" />
        <path d="M96 170l-26 34 104 40 26-34z" fill="#F7D3A8" />
        <path d="M304 170l26 34-104 40-26-34z" fill="#F7D3A8" />
        <rect x="176" y="70" width="14" height="96" rx="7" fill="#7A2E14" transform="rotate(-14 183 118)" />
        <circle cx="212" cy="150" r="22" fill="#7A2E14" />
        <path d="M232 112l40-40 40 40z" fill="#1F4D3A" />
      </g>
      {[[318, 238, 0], [340, 210, 1], [296, 214, 2]].map(([x, y, k]) => (
        <g key={k} className="kh-float" style={{ animationDelay: `${0.3 * k}s` }}>
          <ellipse cx={x} cy={y} rx="28" ry="10" fill="#B9461C" />
          <ellipse cx={x} cy={y - 6} rx="28" ry="10" fill="#E3B25C" />
          <text x={x} y={y - 1} textAnchor="middle" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="800" fontSize="13" fill="#7A2E14">₹</text>
        </g>
      ))}
      <path d="M58 250l50-50 26 26 48-56" fill="none" stroke="#FFF4E6" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M170 160h20v20" fill="none" stroke="#FFF4E6" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FestiveArt() {
  const bulbs = ['#E3B25C', '#E8643C', '#DCE6DA', '#E3B25C', '#DCE6DA', '#E8643C', '#E3B25C', '#E8643C'];
  return (
    <svg viewBox="0 0 400 320" role="presentation">
      <path d="M10 40Q200 140 390 40" fill="none" stroke="#0B1D14" strokeWidth="3" />
      {bulbs.map((c, k) => {
        const t = (k + 0.5) / bulbs.length;
        const x = 10 + 380 * t;
        const y = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 140 + t * t * 40;
        return (
          <g key={k}>
            <rect x={x - 3} y={y} width="6" height="8" fill="#0B1D14" />
            <ellipse className="kh-twinkle" style={{ animationDelay: `${k * 0.25}s` }} cx={x} cy={y + 18} rx="8" ry="12" fill={c} />
          </g>
        );
      })}
      <g className="kh-float">
        <rect x="150" y="128" width="104" height="150" rx="22" fill="#0B1D14" />
        <circle cx="202" cy="176" r="20" fill="#2C6A50" />
        <circle cx="202" cy="176" r="9" fill="#E8643C" />
        <circle cx="202" cy="236" r="30" fill="#2C6A50" />
        <circle cx="202" cy="236" r="14" fill="#E3B25C" />
      </g>
      {[[78, 262], [322, 262]].map(([x, y], k) => (
        <g key={k}>
          <path d={`M${x - 38} ${y}q38 34 76 0z`} fill="#E8643C" />
          <path d={`M${x - 38} ${y}h76`} stroke="#B9461C" strokeWidth="5" strokeLinecap="round" />
          <path className="kh-flame" style={{ animationDelay: `${k * 0.3}s` }} d={`M${x} ${y - 46}c14 18 12 30 0 38c-12-8-14-20 0-38z`} fill="#E3B25C" />
          <path d={`M${x} ${y - 30}c6 8 5 14 0 18c-5-4-6-10 0-18z`} fill="#FFF4E6" />
        </g>
      ))}
      {[[110, 120], [300, 110], [60, 190], [350, 190]].map(([x, y], k) => (
        <path key={k} className="kh-twinkle" style={{ animationDelay: `${k * 0.5}s` }} d={`M${x} ${y - 9}l3 6 6 3-6 3-3 6-3-6-6-3 6-3z`} fill="#F3E3BD" />
      ))}
    </svg>
  );
}
