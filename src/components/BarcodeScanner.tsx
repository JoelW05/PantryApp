'use client'
import { useEffect, useRef, useState } from 'react'
import { X, Camera } from 'lucide-react'

interface Props {
  onDetected: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(true)

  useEffect(() => {
    let stopped = false
    let stopFn: (() => void) | null = null

    async function start() {
      const { BrowserMultiFormatReader } = await import('@zxing/browser')
      const codeReader = new BrowserMultiFormatReader()
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        if (devices.length === 0) { setError('No camera found.'); return }

        const deviceId = devices.find(d => d.label.toLowerCase().includes('back'))?.deviceId
          ?? devices[devices.length - 1].deviceId

        const controls = await codeReader.decodeFromVideoDevice(deviceId, videoRef.current!, (result) => {
          if (stopped || !result) return
          stopped = true
          setScanning(false)
          controls.stop()
          onDetected(result.getText())
        })
        stopFn = () => controls.stop()
      } catch {
        setError('Camera access denied. Please allow camera permission and try again.')
      }
    }

    start()
    return () => { stopped = true; stopFn?.() }
  }, [onDetected])

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Camera size={15} className="text-emerald-600" /> Scan barcode
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>

        {error ? (
          <div className="p-6 text-center text-sm text-red-600">{error}</div>
        ) : (
          <div className="relative bg-black">
            <video ref={videoRef} className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 border-2 border-white/20 rounded-xl" />
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
              </div>
            </div>
            <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/80">
              {scanning ? 'Point at a barcode' : '✓ Barcode detected'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
