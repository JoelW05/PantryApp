'use client'
import { useRef, useState } from 'react'
import { Camera, Upload, X, Loader2, CheckSquare, Square, Plus, AlertCircle } from 'lucide-react'
import type { ScannedItem } from '@/types'

interface ReviewItem {
  name: string
  amount: string  // single editable field e.g. "500g", "2 unit"
  checked: boolean
  isDuplicate: boolean
}

interface Props {
  onAdd: (items: ScannedItem[]) => void
  onClose: () => void
  existingNames?: string[]  // current pantry item names for duplicate detection
}

function parseAmount(amount: string): { quantity: number; unit: string } {
  const m = amount.trim().match(/^([\d.]+)\s*([a-zA-Z]*)$/)
  if (m) return { quantity: parseFloat(m[1]) || 1, unit: m[2] || 'g' }
  return { quantity: 1, unit: 'unit' }
}

function isLikelyDuplicate(scannedName: string, existingNames: string[]): boolean {
  const a = scannedName.toLowerCase().trim()
  return existingNames.some(n => {
    const b = n.toLowerCase().trim()
    if (a === b || a.includes(b) || b.includes(a)) return true
    const aWords = a.split(/\s+/).filter(w => w.length > 2)
    const bWords = b.split(/\s+/).filter(w => w.length > 2)
    return aWords.some(w => bWords.includes(w))
  })
}

export default function ReceiptScanner({ onAdd, onClose, existingNames = [] }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg')
  const [scanning, setScanning] = useState(false)
  const [items, setItems] = useState<ReviewItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFile(file: File) {
    const mt = file.type as 'image/jpeg' | 'image/png' | 'image/webp'
    setMediaType(mt || 'image/jpeg')
    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)
      setImageBase64(dataUrl.split(',')[1])
      setItems(null)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  async function scan() {
    if (!imageBase64) return
    setScanning(true)
    setError(null)
    try {
      const res = await fetch('/api/pantry/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mediaType }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setItems((data.items as ScannedItem[]).map(i => ({
        name: i.name,
        amount: `${i.quantity}${i.unit}`,
        checked: true,
        isDuplicate: isLikelyDuplicate(i.name, existingNames),
      })))
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setScanning(false)
    }
  }

  function toggle(idx: number) {
    setItems(prev => prev!.map((it, i) => i === idx ? { ...it, checked: !it.checked } : it))
  }

  function updateName(idx: number, value: string) {
    setItems(prev => prev!.map((it, i) => i === idx ? { ...it, name: value } : it))
  }

  function updateAmount(idx: number, value: string) {
    setItems(prev => prev!.map((it, i) => i === idx ? { ...it, amount: value } : it))
  }

  function confirmAdd() {
    const selected = items!
      .filter(i => i.checked && i.name.trim())
      .map(i => ({ name: i.name.trim(), ...parseAmount(i.amount) }))
    onAdd(selected)
  }

  const checkedCount = items?.filter(i => i.checked).length ?? 0
  const duplicateCount = items?.filter(i => i.isDuplicate).length ?? 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="text-sm font-semibold text-gray-800">Scan receipt</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
      </div>

      <div className="p-4 space-y-4">
        {!items && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button onClick={() => cameraRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                <Camera size={16} /> Use camera
              </button>
              <button onClick={() => fileRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                <Upload size={16} /> Upload photo
              </button>
            </div>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

            {preview && (
              <div className="relative">
                <img src={preview} alt="Receipt" className="w-full max-h-64 object-contain rounded-lg border border-gray-200" />
                <button onClick={() => { setPreview(null); setImageBase64(null) }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-gray-500 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            )}

            {preview && (
              <button onClick={scan} disabled={scanning}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                {scanning ? <><Loader2 size={15} className="animate-spin" /> Analysing receipt…</> : 'Analyse receipt'}
              </button>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        )}

        {items && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">{items.length} items found</p>
                <p className="text-xs text-gray-400 mt-0.5">Click any field to correct it.</p>
              </div>
              <button onClick={() => { setItems(null); setPreview(null); setImageBase64(null) }}
                className="text-xs text-gray-400 hover:text-gray-600 underline shrink-0">Rescan</button>
            </div>

            {/* Duplicate warning banner */}
            {duplicateCount > 0 && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">
                  <span className="font-semibold">{duplicateCount} item{duplicateCount !== 1 ? 's' : ''} already in your pantry.</span>
                  {' '}You can still add them to update your stock, or uncheck to skip.
                </p>
              </div>
            )}

            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <div className="grid grid-cols-[24px_1fr_80px] gap-2 px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                <span />
                <span className="text-xs font-medium text-gray-400">Name</span>
                <span className="text-xs font-medium text-gray-400">Amount</span>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map((item, i) => (
                  <div key={i} className={`grid grid-cols-[24px_1fr_80px] gap-2 items-center px-3 py-2 ${!item.checked ? 'opacity-40' : ''} ${item.isDuplicate ? 'bg-amber-50/50' : ''}`}>
                    <button onClick={() => toggle(i)} className="shrink-0">
                      {item.checked
                        ? <CheckSquare size={16} className="text-emerald-600" />
                        : <Square size={16} className="text-gray-300" />}
                    </button>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <input
                        value={item.name}
                        onChange={e => updateName(i, e.target.value)}
                        className="text-sm text-gray-900 border border-transparent hover:border-gray-300 focus:border-emerald-400 rounded px-1.5 py-1 focus:outline-none w-full bg-transparent focus:bg-white min-w-0"
                      />
                      {item.isDuplicate && (
                        <span className="text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap shrink-0">
                          in pantry
                        </span>
                      )}
                    </div>
                    <input
                      value={item.amount}
                      onChange={e => updateAmount(i, e.target.value)}
                      placeholder="500g"
                      className="text-sm text-gray-900 border border-transparent hover:border-gray-300 focus:border-emerald-400 rounded px-1.5 py-1 focus:outline-none w-full bg-transparent focus:bg-white text-right"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={confirmAdd} disabled={checkedCount === 0}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
              <Plus size={15} /> Add {checkedCount} item{checkedCount !== 1 ? 's' : ''} to pantry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
