import { Plane, Satellite, Radio, Wifi, Activity, MapPin, Video, Check } from 'lucide-react'
import { useGlobeStore, LayerType } from '../store/globeStore'

interface LayerConfig {
  id: LayerType
  name: string
  icon: React.ReactNode
  color: string
}

const layers: LayerConfig[] = [
  { id: 'flight', name: 'Aircraft', icon: <Plane size={16} />, color: '#06b6d4' },
  { id: 'satellite', name: 'Satellites', icon: <Satellite size={16} />, color: '#facc15' },
  { id: 'gps_interference', name: 'GPS Interference', icon: <Radio size={16} />, color: '#f87171' },
  { id: 'internet_outage', name: 'Internet Outages', icon: <Wifi size={16} />, color: '#fb923c' },
  { id: 'network_probe', name: 'Network Probes', icon: <Activity size={16} />, color: '#4ade80' },
  { id: 'cctv', name: 'CCTV Cameras', icon: <Video size={16} />, color: '#e879f9' },
  { id: 'geo_context', name: 'Context Layers', icon: <MapPin size={16} />, color: '#a78bfa' },
]

const LayerPanel = () => {
  const { activeLayers, toggleLayer } = useGlobeStore()

  return (
    <div className="panel bg-gray-900/90 border border-gray-700 rounded-lg overflow-hidden">
      <div className="panel-header px-4 py-3 border-b border-gray-700 bg-gray-800/50">
        <span className="font-semibold">Layers</span>
        <span className="text-xs text-gray-400">{activeLayers.length} active</span>
      </div>
      <div className="panel-content p-2 space-y-1">
        {layers.map((layer) => {
          const isActive = activeLayers.includes(layer.id)
          return (
            <div
              key={layer.id}
              onClick={() => {
                console.log('Toggling layer:', layer.id)
                toggleLayer(layer.id)
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors ${
                isActive ? 'bg-blue-600/20' : 'hover:bg-gray-800'
              }`}
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ 
                  backgroundColor: isActive ? `${layer.color}30` : 'rgba(100,100,120,0.2)',
                  color: isActive ? layer.color : '#9ca3af'
                }}
              >
                {layer.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-200">{layer.name}</div>
              </div>
              {isActive && <Check size={16} className="text-blue-400" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LayerPanel
