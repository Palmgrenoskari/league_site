"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";

interface ItemTooltipProps {
  children: React.ReactNode;
  itemId: number;
  itemData: any;
}

export function ItemTooltip({ children, itemId, itemData }: ItemTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const item = itemData?.[itemId];

  useEffect(() => {
    if (showTooltip && containerRef.current && tooltipRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Check if there's enough space below
      let y = rect.bottom + 10;
      if (y + tooltipRect.height > viewportHeight) {
        // Position above if not enough space below
        y = rect.top - tooltipRect.height - 10;
      }

      // Calculate horizontal position
      let x = rect.left;
      if (x + tooltipRect.width > viewportWidth) {
        x = viewportWidth - tooltipRect.width - 10;
      }

      setPosition({ x, y });
    }
  }, [showTooltip]);

  if (!item) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}

      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute z-50 w-64 rounded bg-slate-900 border border-slate-700 p-3 shadow-lg text-sm [&_passive]:text-blue-100 [&_passive]:font-semibold [&_active]:text-blue-100 [&_active]:font-semibold"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            position: "fixed",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="font-semibold text-yellow-200">{item.name}</div>
            <div className="text-yellow-400 text-xs">
              {item.gold.total} gold
            </div>
          </div>

          <div
            className="text-slate-300 mb-2"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />

          {item.plaintext && (
            <div className="text-slate-400 text-xs italic">
              {item.plaintext}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
