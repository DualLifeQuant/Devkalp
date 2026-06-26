import React, { useState } from 'react'
import { INDIA_STATE_PATHS, IndiaStatePath } from './IndiaMapPaths'

interface IndiaMapProps {
  activeTab: number // 0: Education, 1: Healthcare, 2: Empowerment
  className?: string
}

export default function IndiaMap({ activeTab, className = '' }: IndiaMapProps) {
  const [hoveredState, setHoveredState] = useState<IndiaStatePath | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Define highlighted states for each tab (exactly 5 states per tab)
  const getHighlightClass = (stateId: string): string => {
    const educationStates = ['IN-GJ', 'IN-RJ', 'IN-MP', 'IN-UP', 'IN-BR']
    const healthcareStates = ['IN-MH', 'IN-KA', 'IN-AP', 'IN-TN', 'IN-TG']
    const empowermentStates = ['IN-GJ', 'IN-MH', 'IN-KA', 'IN-WB', 'IN-OR']

    if (activeTab === 0 && educationStates.includes(stateId)) {
      return 'fill-rose-500/80 hover:fill-rose-400 stroke-rose-300/40 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]'
    }
    if (activeTab === 1 && healthcareStates.includes(stateId)) {
      return 'fill-sky-500/80 hover:fill-sky-400 stroke-sky-300/40 drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]'
    }
    if (activeTab === 2 && empowermentStates.includes(stateId)) {
      return 'fill-emerald-500/80 hover:fill-emerald-400 stroke-emerald-300/40 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]'
    }

    // Default non-highlighted state
    return 'fill-[#16274e]/85 hover:fill-[#20366b]/95 stroke-sky-800/30'
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const svgEl = e.currentTarget.getBoundingClientRect()
    setTooltipPos({
      x: e.clientX - svgEl.left + 12,
      y: e.clientY - svgEl.top - 36
    })
  }

  return (
    <div className={`relative w-full aspect-[5/4] select-none ${className}`}>
      <svg
        viewBox="0 0 1000 800"
        className="w-full h-full transition-all duration-700"
        onMouseMove={handleMouseMove}
      >
        <g>
          {INDIA_STATE_PATHS.map((state) => {
            const highlightClass = getHighlightClass(state.id)
            const isHovered = hoveredState?.id === state.id
            return (
              <path
                key={state.id}
                id={state.id}
                d={state.d}
                title={state.title}
                className={`transition-all duration-500 ease-in-out cursor-pointer stroke-[1.2] ${highlightClass} ${
                  isHovered ? 'scale-[1.005] translate-y-[-1px]' : ''
                }`}
                onMouseEnter={() => setHoveredState(state)}
                onMouseLeave={() => setHoveredState(null)}
                style={{
                  transformOrigin: 'center',
                }}
              />
            )
          })}
        </g>
      </svg>

      {/* Interactive Tooltip */}
      {hoveredState && (
        <div
          className="absolute z-30 pointer-events-none bg-trust-950/95 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-xl text-xs font-medium text-white transition-all duration-75"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translateX(0%)',
          }}
        >
          {hoveredState.title}
        </div>
      )}
    </div>
  )
}
