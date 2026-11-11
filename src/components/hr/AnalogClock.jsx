import { useEffect, useState } from "react";

// Degrees from 12 o'clock, clockwise, for a time on a 12-hour face
const angleOf = (hours, minutes = 0) => ((hours % 12) + minutes / 60) * 30;

// A point on the face at radius r and angle (degrees from 12 o'clock)
const pointAt = (r, angle) => {
  const rad = (angle * Math.PI) / 180;
  return [50 + r * Math.sin(rad), 50 - r * Math.cos(rad)];
};

// "09:00" → { h, m }
const parseTime = (time) => {
  const [h, m] = (time ?? "").split(":").map(Number);
  return Number.isFinite(h) ? { h, m: m || 0 } : null;
};

// The duty hours as an arc around the face (only when they fit on one 12-hour turn)
const dutyArc = (dutyStart, dutyEnd) => {
  const from = parseTime(dutyStart);
  const to = parseTime(dutyEnd);
  if (!from || !to) return null;
  const span = (to.h * 60 + to.m - (from.h * 60 + from.m)) / 60; // hours
  if (span <= 0 || span >= 12) return null;
  const a = angleOf(from.h, from.m);
  const b = a + span * 30;
  const [x1, y1] = pointAt(46, a);
  const [x2, y2] = pointAt(46, b);
  return `M ${x1} ${y1} A 46 46 0 ${span * 30 > 180 ? 1 : 0} 1 ${x2} ${y2}`;
};

// A live analog clock: hour and minute hands, a ticking second hand, and the person's duty hours
// as a soft green arc on the rim. className sets the size (e.g. "size-16 sm:size-24").
const AnalogClock = ({ dutyStart, dutyEnd, className = "size-20" }) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const arc = dutyArc(dutyStart, dutyEnd);
  const label = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <svg viewBox="0 0 100 100" className={`shrink-0 drop-shadow-sm ${className}`} role="img" aria-label={`Time now ${label}`}>
      <defs>
        <radialGradient id="clock-face" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </radialGradient>
      </defs>

      {/* Face and rim */}
      <circle cx="50" cy="50" r="49" fill="#f1f5f9" />
      <circle cx="50" cy="50" r="45.5" fill="url(#clock-face)" stroke="#e2e8f0" strokeWidth="0.8" />
      {arc && <path d={arc} fill="none" stroke="#10b981" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />}

      {/* Hour marks as dots: bigger and dark at 12, 3, 6 and 9 */}
      {Array.from({ length: 12 }, (_, i) => {
        const major = i % 3 === 0;
        const [cx, cy] = pointAt(39, i * 30);
        return <circle key={i} cx={cx} cy={cy} r={major ? 2.4 : 1.2} fill={major ? "#0f172a" : "#94a3b8"} />;
      })}

      {/* Hands */}
      <line x1="50" y1="50" x2="50" y2="27" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" transform={`rotate(${angleOf(h, m)} 50 50)`} />
      <line x1="50" y1="50" x2="50" y2="16" stroke="#334155" strokeWidth="2.6" strokeLinecap="round" transform={`rotate(${m * 6 + s * 0.1} 50 50)`} />
      <g transform={`rotate(${s * 6} 50 50)`}>
        <line x1="50" y1="58" x2="50" y2="13" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="50" cy="13" r="1.6" fill="#10b981" />
      </g>
      <circle cx="50" cy="50" r="3.2" fill="#0f172a" />
      <circle cx="50" cy="50" r="1.4" fill="#10b981" />
    </svg>
  );
};

export default AnalogClock;
