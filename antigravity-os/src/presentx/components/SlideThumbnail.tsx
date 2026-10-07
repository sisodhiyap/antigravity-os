"use client";

import React from "react";
import { Slide, DesignTokens } from "../types";
import { clsx } from "clsx";
import { Copy, Trash2, GripVertical } from "lucide-react";

interface SlideThumbnailProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  tokens: DesignTokens;
  onSelect: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export const SlideThumbnail: React.FC<SlideThumbnailProps> = ({
  slide,
  index,
  isActive,
  tokens,
  onSelect,
  onDuplicate,
  onDelete,
}) => {
  return (
    <div
      onClick={onSelect}
      className={clsx(
        "group relative flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer select-none",
        isActive
          ? "bg-[var(--ag-gold-alpha)] border-[var(--ag-gold)] shadow-[var(--ag-shadow-gold)]"
          : "bg-[var(--ag-surface)] border-[var(--ag-border)] hover:border-[var(--ag-border-hover)]"
      )}
    >
      <span className="text-xs font-mono font-bold w-5 text-center text-[var(--ag-muted)] group-hover:text-[var(--ag-text)]">
        {index + 1}
      </span>

      {/* Mini Slide Preview Box */}
      <div
        className="w-24 h-14 rounded-lg flex flex-col justify-between p-1.5 border overflow-hidden shrink-0"
        style={{
          backgroundColor: tokens.backgroundColor,
          borderColor: `${tokens.primaryColor}30`,
        }}
      >
        <div
          className="text-[7px] font-bold truncate"
          style={{ color: tokens.textColor, fontFamily: tokens.fontHeading }}
        >
          {slide.headline}
        </div>
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: "60%", backgroundColor: tokens.primaryColor }}
          />
        </div>
        <div className="text-[6px] font-mono opacity-50 flex justify-between" style={{ color: tokens.textSecondaryColor }}>
          <span>{slide.layout}</span>
          <span>{index + 1}</span>
        </div>
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <p className="text-xs font-bold truncate text-[var(--ag-text)]">{slide.headline}</p>
        <p className="text-[10px] font-mono text-[var(--ag-muted)] truncate">{slide.layout}</p>
      </div>

      {/* Action Hover Buttons */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
        {onDuplicate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            title="Duplicate Slide"
            className="p-1 rounded hover:bg-[var(--ag-elevated)] text-[var(--ag-muted)] hover:text-[var(--ag-text)]"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete Slide"
            className="p-1 rounded hover:bg-[var(--ag-error-bg)] text-[var(--ag-muted)] hover:text-[var(--ag-error)]"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
