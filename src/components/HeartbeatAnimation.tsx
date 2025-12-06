const HeartbeatAnimation = () => {
  return (
    <svg 
      width="100%" 
      height="60" 
      viewBox="0 0 1200 60" 
      xmlns="http://www.w3.org/2000/svg"
      className="heartbeat-svg"
    >
      <defs>
        <linearGradient id="heartbeatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1A73E8" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#1A73E8" stopOpacity="1" />
          <stop offset="100%" stopColor="#0BB5FF" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      
      <path
        d="M 0 30 L 200 30 L 220 20 L 240 40 L 260 10 L 280 30 L 300 30 L 500 30 L 520 20 L 540 40 L 560 10 L 580 30 L 600 30 L 800 30 L 820 20 L 840 40 L 860 10 L 880 30 L 900 30 L 1200 30"
        stroke="url(#heartbeatGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <animate
          attributeName="stroke-dasharray"
          from="0 2400"
          to="2400 0"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
};

export default HeartbeatAnimation;
