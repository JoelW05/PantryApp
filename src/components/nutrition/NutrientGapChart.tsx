'use client'
import { useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from 'recharts'
import type { NutrientGap } from '@/types'

const STATUS_COLOUR = { low: '#f59e0b', good: '#10b981', over: '#ef4444' }
const GROUPS = ['Macros', 'Minerals', 'Vitamins'] as const

export default function NutrientGapChart({ gaps }: { gaps: NutrientGap[] }) {
  const [activeGroup, setActiveGroup] = useState<string>('Macros')

  const grouped = gaps.reduce<Record<string, NutrientGap[]>>((acc, g) => {
    const grp = getGroup(g.key as string)
    if (!acc[grp]) acc[grp] = []
    acc[grp].push(g)
    return acc
  }, {})

  const data = (grouped[activeGroup] ?? []).map(g => ({
    name: g.label, pct: Math.min(g.pct, 150), status: g.status,
    actual: g.actual, goal: g.goal, unit: g.unit,
  }))

  const availableGroups = GROUPS.filter(g => (grouped[g]?.length ?? 0) > 0)

  return (
    <div className="space-y-4">
      {availableGroups.length > 1 && (
        <div className="flex gap-2">
          {availableGroups.map(g => (
            <button key={g} onClick={() => setActiveGroup(g)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${activeGroup === g ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
              {g}
              <span className={`ml-1.5 text-xs ${activeGroup === g ? 'text-gray-300' : 'text-gray-400'}`}>
                {grouped[g]?.filter(n => n.status === 'low').length > 0
                  ? `${grouped[g].filter(n => n.status === 'low').length} low`
                  : '✓'}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />Low (&lt;80%)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Good (80–120%)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Over (&gt;120%)</span>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-gray-400 py-4">No goals set for {activeGroup} yet. <a href="/goals" className="text-emerald-600 underline">Set goals →</a></p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, data.length * 28)}>
          <BarChart data={data} layout="vertical" margin={{ left: 100, right: 40 }}>
            <XAxis type="number" domain={[0, 130]} tickFormatter={v => `${v}%`} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#374151', fontSize: 12 }} axisLine={false} tickLine={false} width={95} />
            <Tooltip
              formatter={(_, __, props) => [`${props.payload.actual.toFixed(1)} / ${props.payload.goal} ${props.payload.unit}`, props.payload.name]}
              contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#111827' }}
            />
            <Bar dataKey="pct" radius={[0, 4, 4, 0]} maxBarSize={14}>
              {data.map((entry, i) => <Cell key={i} fill={STATUS_COLOUR[entry.status]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function getGroup(key: string): string {
  if (['calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g', 'sugar_g', 'saturated_fat_g', 'unsaturated_fat_g', 'trans_fat_g', 'cholesterol_mg'].includes(key)) return 'Macros'
  if (key.includes('vitamin')) return 'Vitamins'
  return 'Minerals'
}
