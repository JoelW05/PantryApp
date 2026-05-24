'use client'
import { useState } from 'react'
import { Plus, Trash2, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { ScheduleBlock } from '@/types'

export default function ScheduleClient({ initialBlocks, userId }: { initialBlocks: ScheduleBlock[]; userId: string }) {
  const supabase = createClient()
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(initialBlocks)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ label: '', start_time: '', end_time: '', is_cooking_window: true })

  async function addBlock() {
    const { data, error } = await supabase.from('schedule_blocks').insert({ user_id: userId, ...form }).select().single()
    if (!error && data) {
      setBlocks(prev => [...prev, data as ScheduleBlock].sort((a, b) => a.start_time.localeCompare(b.start_time)))
      setShowForm(false)
    }
  }

  async function removeBlock(id: string) {
    await supabase.from('schedule_blocks').delete().eq('id', id)
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  function durationMins(b: ScheduleBlock) {
    return Math.round((new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / 60000)
  }

  return (
    <div className="space-y-4">
      <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">
        <Plus size={14} /> Add window
      </button>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Label (e.g. "Lunch break")</label>
              <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Start</label>
              <input type="datetime-local" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">End</label>
              <input type="datetime-local" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="cooking" checked={form.is_cooking_window} onChange={e => setForm(f => ({ ...f, is_cooking_window: e.target.checked }))} className="accent-emerald-600 w-4 h-4" />
              <label htmlFor="cooking" className="text-sm text-gray-700">Use for cooking suggestions</label>
            </div>
          </div>
          <button onClick={addBlock} disabled={!form.start_time || !form.end_time} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-40">Add</button>
        </div>
      )}

      <div className="space-y-3">
        {blocks.length === 0 && <p className="text-sm text-gray-400 text-center py-10">No schedule blocks added yet.</p>}
        {blocks.map(block => (
          <div key={block.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-semibold text-gray-900">{block.label || 'Free window'}</p>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <Clock size={10} />
                {format(new Date(block.start_time), 'EEE d MMM, HH:mm')} – {format(new Date(block.end_time), 'HH:mm')}
                <span className="ml-1 text-gray-400">({durationMins(block)} min)</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {block.is_cooking_window && (
                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">cooking</span>
              )}
              <button onClick={() => removeBlock(block.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
