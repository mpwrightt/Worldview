import { useState } from 'react'
import CesiumGlobe from './components/CesiumGlobe'
import LayerPanel from './components/LayerPanel'
import { RotateCcw } from 'lucide-react'

function App() {
  const [showLayers, setShowLayers] = useState(true)

  const resetView = () => {
    // Access the reset function exposed by CesiumGlobe
    if ((window as any).resetCesiumView) {
      ;(window as any).resetCesiumView()
    }
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* Globe */}
      <CesiumGlobe />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="panel bg-gray-900/90 border border-gray-700 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white">WorldView OSINT</h1>
            <span className="text-xs text-gray-400">v1.0.0</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetView}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
              title="Reset View"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Reset View</span>
            </button>
            <button
              onClick={() => setShowLayers(!showLayers)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors"
            >
              {showLayers ? 'Hide' : 'Show'} Layers
            </button>
          </div>
        </div>
      </div>

      {/* Layer Panel */}
      {showLayers && (
        <div className="absolute top-20 left-4 z-10 w-64">
          <LayerPanel />
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="panel bg-gray-900/80 border border-gray-700 rounded-lg p-3 text-xs text-gray-300">
          <p className="font-semibold mb-1">Navigation:</p>
          <ul className="space-y-1">
            <li>• Left click + drag: Rotate</li>
            <li>• Right click + drag: Pan</li>
            <li>• Scroll: Zoom in/out</li>
            <li>• Double click: Zoom to location</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
