import React from 'react'

export const TreasurerSeal = ({ className = "w-96 h-96 opacity-10", size = 400 }) => {
  return (
    <svg
      viewBox="0 0 400 400"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="navyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <path
          id="textCircleOuter"
          d="M 200, 200 m -160, 0 a 160,160 0 1,1 320,0 a 160,160 0 1,1 -320,0"
        />
        <path
          id="textCircleInner"
          d="M 200, 200 m -120, 0 a 120,120 0 1,1 240,0 a 120,120 0 1,1 -240,0"
        />
      </defs>

      {/* Outer Decorative Ring */}
      <circle cx="200" cy="200" r="190" fill="none" stroke="url(#goldGradient)" strokeWidth="4" />
      <circle cx="200" cy="200" r="182" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 3" />
      <circle cx="200" cy="200" r="176" fill="none" stroke="url(#goldGradient)" strokeWidth="2" />

      {/* Outer Banner Text Ring */}
      <circle cx="200" cy="200" r="145" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text fill="currentColor" fontSize="13" fontWeight="bold" letterSpacing="3" textAnchor="middle">
        <textPath href="#textCircleOuter" startOffset="50%">
          ★ MUNICIPALITY OF JANIUAY • PROVINCE OF ILOILO ★
        </textPath>
      </text>

      {/* Inner Ring */}
      <circle cx="200" cy="200" r="110" fill="none" stroke="url(#goldGradient)" strokeWidth="3" />
      <text fill="currentColor" fontSize="10.5" fontWeight="bold" letterSpacing="2" textAnchor="middle">
        <textPath href="#textCircleInner" startOffset="50%">
          • OFFICE OF THE MUNICIPAL TREASURER • BPLO
        </textPath>
      </text>

      {/* Center Shield & Emblems */}
      <g transform="translate(140, 140) scale(0.6)">
        {/* Treasury Shield */}
        <path
          d="M 100 10 L 175 40 L 175 120 C 175 170 100 200 100 200 C 100 200 25 170 25 120 L 25 40 Z"
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="6"
        />
        {/* Scales of Justice */}
        <line x1="100" y1="50" x2="100" y2="150" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <line x1="60" y1="80" x2="140" y2="80" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        {/* Left Pan */}
        <path d="M 60 80 L 45 115 L 75 115 Z" fill="none" stroke="currentColor" strokeWidth="4" />
        {/* Right Pan */}
        <path d="M 140 80 L 125 115 L 155 115 Z" fill="none" stroke="currentColor" strokeWidth="4" />
        {/* Base */}
        <path d="M 70 150 L 130 150 L 140 165 L 60 165 Z" fill="url(#goldGradient)" />
      </g>

      {/* Stars on flanks */}
      <polygon points="50,200 54,208 63,208 56,214 59,222 50,217 41,222 44,214 37,208 46,208" fill="url(#goldGradient)" />
      <polygon points="350,200 354,208 363,208 356,214 359,222 350,217 341,222 344,214 337,208 346,208" fill="url(#goldGradient)" />
      
      {/* Established ribbon text */}
      <text x="200" y="295" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="bold" letterSpacing="1">
        OFFICIAL SEAL
      </text>
    </svg>
  )
}

export default TreasurerSeal
