import { useState, useEffect } from 'react';
import './styles.css';

interface TokenData {
  symbol: string;
  name: string;
  marketCap: number;
  price: number;
  change24h: number;
  volume24h: number;
  sparkline: number[];
}

const tokens: TokenData[] = [
  {
    symbol: '$CLONK',
    name: 'Clonk Protocol',
    marketCap: 200000000,
    price: 0.0847,
    change24h: 12.4,
    volume24h: 8420000,
    sparkline: [45, 52, 48, 55, 62, 58, 67, 72, 68, 75, 82, 78],
  },
  {
    symbol: '$BNKR',
    name: 'Bunker Finance',
    marketCap: 500000000,
    price: 0.2134,
    change24h: -3.2,
    volume24h: 15800000,
    sparkline: [85, 82, 78, 75, 72, 68, 70, 65, 62, 58, 55, 52],
  },
];

function formatNumber(num: number): string {
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(0) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toFixed(2);
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="sparkline" preserveAspectRatio="none">
      <defs>
        <linearGradient id={positive ? "greenGlow" : "redGlow"} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={positive ? "#00ff88" : "#ff3366"} stopOpacity="0.4" />
          <stop offset="100%" stopColor={positive ? "#00ff88" : "#ff3366"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`url(#${positive ? "greenGlow" : "redGlow"})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#00ff88" : "#ff3366"}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function TokenCard({ token, delay }: { token: TokenData; delay: number }) {
  const [visible, setVisible] = useState(false);
  const [price, setPrice] = useState(token.price);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 0.002;
      setPrice(p => {
        const newPrice = p * (1 + change);
        setFlash(newPrice > p ? 'up' : 'down');
        setTimeout(() => setFlash(null), 200);
        return newPrice;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const isPositive = token.change24h >= 0;

  return (
    <div className={`token-card ${visible ? 'visible' : ''}`}>
      <div className="card-header">
        <div className="token-identity">
          <div className="token-icon">
            <span className="icon-inner">{token.symbol[1]}</span>
            <div className="icon-ring" />
          </div>
          <div className="token-names">
            <span className="token-symbol">{token.symbol}</span>
            <span className="token-name">{token.name}</span>
          </div>
        </div>
        <div className={`change-badge ${isPositive ? 'positive' : 'negative'}`}>
          <span className="arrow">{isPositive ? '▲' : '▼'}</span>
          <span>{Math.abs(token.change24h).toFixed(1)}%</span>
        </div>
      </div>

      <div className="price-section">
        <div className={`current-price ${flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''}`}>
          ${price.toFixed(4)}
        </div>
        <div className="price-label">CURRENT PRICE</div>
      </div>

      <div className="chart-container">
        <Sparkline data={token.sparkline} positive={isPositive} />
        <div className="chart-overlay">
          <div className="scan-line" />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat">
          <span className="stat-label">MARKET CAP</span>
          <span className="stat-value">${formatNumber(token.marketCap)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">24H VOLUME</span>
          <span className="stat-value">${formatNumber(token.volume24h)}</span>
        </div>
      </div>

      <div className="card-actions">
        <button className="action-btn buy">
          <span className="btn-text">BUY</span>
          <div className="btn-glow" />
        </button>
        <button className="action-btn sell">
          <span className="btn-text">SELL</span>
          <div className="btn-glow" />
        </button>
      </div>

      <div className="card-border" />
      <div className="corner tl" />
      <div className="corner tr" />
      <div className="corner bl" />
      <div className="corner br" />
    </div>
  );
}

function DataStream() {
  const [data, setData] = useState<string[]>([]);

  useEffect(() => {
    const items = [
      'TX_CONFIRMED: 0x7f3a...8b2c',
      'BLOCK: #19,847,293',
      'GAS: 24 gwei',
      'MEMPOOL: 142 pending',
      'NODE: CONNECTED',
      'SYNC: 100%',
      'LATENCY: 12ms',
    ];

    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev, items[Math.floor(Math.random() * items.length)]];
        return newData.slice(-5);
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="data-stream">
      {data.map((item, i) => (
        <div key={i} className="stream-item">{item}</div>
      ))}
    </div>
  );
}

export default function App() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="terminal">
      <div className="noise" />
      <div className="vignette" />

      <header className="terminal-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-text">CRYPTO</span>
            <span className="logo-accent">TERMINAL</span>
          </div>
          <div className="status-indicator">
            <span className="pulse" />
            <span>LIVE</span>
          </div>
        </div>
        <div className="header-right">
          <DataStream />
          <div className="clock">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </div>
        </div>
      </header>

      <main className="terminal-main">
        <div className="grid-lines" />

        <div className="tokens-container">
          {tokens.map((token, i) => (
            <TokenCard key={token.symbol} token={token} delay={i * 200} />
          ))}
        </div>

        <div className="market-ticker">
          <div className="ticker-content">
            <span className="ticker-item">BTC: $67,842.00 <span className="up">+2.4%</span></span>
            <span className="ticker-item">ETH: $3,421.50 <span className="up">+1.8%</span></span>
            <span className="ticker-item">SOL: $142.30 <span className="down">-0.9%</span></span>
            <span className="ticker-item">DOGE: $0.1245 <span className="up">+5.2%</span></span>
            <span className="ticker-item">$CLONK: $0.0847 <span className="up">+12.4%</span></span>
            <span className="ticker-item">$BNKR: $0.2134 <span className="down">-3.2%</span></span>
            <span className="ticker-item">BTC: $67,842.00 <span className="up">+2.4%</span></span>
            <span className="ticker-item">ETH: $3,421.50 <span className="up">+1.8%</span></span>
            <span className="ticker-item">SOL: $142.30 <span className="down">-0.9%</span></span>
            <span className="ticker-item">DOGE: $0.1245 <span className="up">+5.2%</span></span>
          </div>
        </div>
      </main>

      <footer className="terminal-footer">
        <span>Requested by @WhaleTonyOVO · Built by @clonkbot</span>
      </footer>
    </div>
  );
}
