"use client";

import { useEffect, useState } from "react";

const titleWords = ["GuitarHub’a", "Hoşgeldin", "Adamım!"];
const creditWords = ["Babayaga", "Tarafından", "Yaratıldı."];

export function WelcomeSplash() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setVisible(true), 0);
    const closeTimer = window.setTimeout(() => setClosing(true), 3300);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(closeTimer);
    };
  }, []);

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => setVisible(false), 650);
    return () => window.clearTimeout(timer);
  }, [closing]);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Hoş geldin animasyonunu kapat"
      onClick={() => setClosing(true)}
      className={`gh-welcome-splash ${closing ? "gh-welcome-splash--closing" : ""}`}
    >
      <span className="gh-welcome-orb gh-welcome-orb-one" />
      <span className="gh-welcome-orb gh-welcome-orb-two" />
      <span className="gh-welcome-card">
        <span className="gh-welcome-kicker">GuitarHub</span>
        <span className="gh-welcome-title" aria-label="GuitarHub’a Hoşgeldin Adamım!">
          {titleWords.map((word, index) => (
            <span key={word} style={{ animationDelay: `${index * 130}ms` }}>
              {word}
            </span>
          ))}
        </span>
        <span className="gh-welcome-credit" aria-label="Babayaga Tarafından Yaratıldı.">
          {creditWords.map((word, index) => (
            <span key={word} style={{ animationDelay: `${520 + index * 120}ms` }}>
              {word}
            </span>
          ))}
        </span>
        <span className="gh-welcome-line" />
      </span>
    </button>
  );
}
