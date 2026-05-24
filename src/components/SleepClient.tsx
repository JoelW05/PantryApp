'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import type { SleepLog, IntakeLog } from '@/types'

export default function SleepClient({ initialLogs, intakeLogs, userId }: { initialLogs: SleepLog[]; intakeLogs: IntakeLog[]; userId: string }) {
  const supabase = createClient()
  const [logs, setLogs] = useState<SleepLog[]>(initialLogs)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ sleep_start: '', sleep_end: '', quality: '7', notes: '' })

  async function addLog() {
    const { data, error } = await supabase.from('sleep_logs').insert({
      user_id: userId, sleep_start: form.sleep_start, sleep_end: form.sleep_end,
      quality: Number(form.quality), notes: form.notes || null,
    }).select().single()
    if (!error && data) { setLogs(prev => [...prev, data as SleepLog]); setShowForm(false) }
  }

  const correlationData = logs.map(s => {
    const day = new Date(s.sleep_start)
    day.setDate(day.getDate() - 1)
    const dayStr = day.toISOString().split('T')[0]
    const cals = intakeLogs.filter(l => l.logged_at.startsWith(dayStr)).reduce((sum, l) => sum + (l.calories ?? 0), 0)
    const durationH = (new Date(s.sleep_end).getTime() - new Date(s.sleep_start).getTime()) / 3600000
    return { calories: Math.round(cals), quality: s.quality ?? 0, duration: Math.round(durationH * 10) / 10 }
  }).filter(d => d.calories > 0 && d.quality > 0)

  return (
    <div className="space-y-6">
      <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">
        <Plus size={14} /> Log sleep
      </button>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Fell asleep</label>
              <input type="datetime-local" value={form.sleep_start} onChange={e => setForm(f => ({ ...f, sleep_start: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Woke up</label>
              <input type="datetime-local" value={form.sleep_end} onChange={e => setForm(f => ({ ...f, sleep_end: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Quality: {form.quality}/10</label>
              <input type="range" min="1" max="10" value={form.quality} onChange={e => setForm(f => ({ ...f, quality: e.target.value }))} className="w-full accent-emerald-600" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Notes</label>
              <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. had caffeine late" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900" />
            </div>
          </div>
          <button onClick={addLog} disabled={!form.sleep_start || !form.sleep_end} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-40">Save</button>
        </div>
      )}

      {correlationData.length >= 3 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Calories vs sleep quality</h3>
          <p className="text-xs text-gray-400 mb-4">Each dot = one night. X axis = calories eaten the previous day.</p>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="calories" name="Calories" unit=" kcal" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis dataKey="quality" name="Sleep quality" domain={[1, 10]} tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', fontSize: 12, color: '#111827' }} />
              <Scatter data={correlationData} fill="#10b981" opacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
          {correlationData.length < 7 && <p className="text-xs text-amber-600 mt-2">Log at least 7 nights for a meaningful pattern.</p>}
        </div>
      )}

      <div className="space-y-3">
        {logs.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No sleep logs yet.</p>}
        {[...logs].reverse().map(log => {
          const durationH = (new Date(log.sleep_end).getTime() - new Date(log.sleep_start).getTime()) / 3600000
          return (
            <div key={log.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-semibold text-gray-900">{format(new Date(log.sleep_start), 'EEE d MMM')}</p>
                <p className="text-xs text-gray-500 mt-0.5">{format(new Date(log.sleep_start), 'HH:mm')} – {format(new Date(log.sleep_end), 'HH:mm')} · {durationH.toFixed(1)}h</p>
                {log.notes && <p className="text-xs text-gray-400 mt-0.5">{log.notes}</p>}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-600">{log.quality}/10</p>
                <p className="text-xs text-gray-400">quality</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
