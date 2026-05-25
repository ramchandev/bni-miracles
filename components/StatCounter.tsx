"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  label: string;
  value: string;
  numericValue: number;
  prefix?: string;
  suffix?: string;
};

function Counter({ stat }: { stat: Stat }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const increment = stat.numericValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= stat.numericValue) {
        setCount(stat.numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, stat.numericValue]);

  const formatted = count.toLocaleString("en-IN");

  return (
    <div ref={ref} className="text-center p-6">
      <div
        className="text-3xl md:text-4xl font-extrabold mb-1"
        style={{ color: "var(--color-accent)" }}
      >
        {stat.prefix || ""}{formatted}{stat.suffix || ""}
      </div>
      <div className="text-sm font-medium mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
        {stat.label}
      </div>
    </div>
  );
}

export default function StatCounter({ stats, title }: { stats: Stat[]; title: string }) {
  return (
    <section className="py-16 px-6" style={{ background: "var(--color-dark)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2
          className="text-center text-2xl md:text-3xl font-extrabold mb-10"
          style={{ color: "white" }}
        >
          {title}
        </h2>
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Counter stat={stat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
