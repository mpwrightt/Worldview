import { useEffect } from 'react'
import { AlertTriangle, Plane, Satellite, Radio, Wifi, Activity, X } from 'lucide-react'
import { useGlobeStore, LayerType, Event } from '../store/globeStore'
import { format } from 'date-fns'

const getEventIcon = (type: LayerType) => {
  switch (type) {
    case 'flight':
      return <Plane size={14} className="text-cyan-400" />
    case 'satellite':
      return <Satellite size={14} className="text-yellow-400" />
    case 'gps_interference':
      return <Radio size={14} className="text-red-400" />
    case 'internet_outage':
      return <Wifi size={14} className="text-orange-400" />
    case 'network_probe':
      return <Activity size={14} className="text-green-400" />
    default:
      return <AlertTriangle size={14} className="text-gray-400" />
  }
}

const getEventColor = (type: LayerType) => {
  switch (type) {
    case 'flight':
      return 'border-l-cyan-500'
    case 'satellite':
      return 'border-l-yellow-500'
    case 'gps_interference':
      return 'border-l-red-500'
    case 'internet_outage':
      return 'border-l-orange-500'
    case 'network_probe':
      return 'border-l-green-500'
    default:
      return 'border-l-gray-500'
  }
}

// Mock events for demo
const mockEvents: Event[] = [
  {
    id: '1',
    type: 'gps_interference',
    title: 'GPS Interference Detected',
    description: '65% of aircraft reporting GPS issues in region',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    latitude: 55.7558,
    longitude: 37.6173,
    properties: { severity: 'high', percentage: 65, radius_km: 100 },
    source: 'GPSJAM',
    confidence: 0.85
  },
  {
    id: '2',
    type: 'internet_outage',
    title: 'Internet Outage: Syria',
    description: 'Critical connectivity drop detected',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    latitude: 33.5138,
    longitude: 36.2765,
    properties: { country: 'Syria', severity: 'critical', drop_pct: 78 },
    source: 'IODA',
    confidence: 0.92
  },
  {
    id: '3',
    type: 'flight',
    title: 'Flight AAL123',
    description: 'Commercial flight en route',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    latitude: 40.7128,
    longitude: -74.006,
    altitude: 10000,
    properties: { callsign: 'AAL123', icao24: 'a1b2c3', velocity: 250 },
    source: 'OpenSky',
    confidence: 0.95
  },
  {
    id: '4',
    type: 'network_probe',
    title: 'OONI: Anomaly Detected',
    description: 'Web connectivity test showing blocking',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    latitude: 35.6892,
    longitude: 51.389,
    properties: { target: 'example.com', is_anomaly: true },
    source: 'OONI',
    confidence: 0.75
  },
  {
    id: '5',
    type: 'gps_interference',
    title: 'GPS Interference Detected',
    description: 'Medium severity jamming detected',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    latitude: 35.6892,
    longitude: 51.389,
    properties: { severity: 'medium', percentage: 35 },
    source: 'GPSJAM',
    confidence: 0.65
  }
]

const EventPanel = () => {
  const { selectedEvent, setSelectedEvent, addEvent } = useGlobeStore()

  // Add mock events on mount
  useEffect(() => {
    mockEvents.forEach(event => addEvent(event))
  }, [])

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Recent Events</span>
        <span className="text-xs text-gray-400">
          {mockEvents.length} events
        </span>
      </div>
      
      <div className="panel-content space-y-2 max-h-[50vh] overflow-y-auto">
        {mockEvents.map((event) => (
          <div
            key={event.id}
            onClick={() => setSelectedEvent(event)}
            className={`p-3 rounded-lg bg-gray-800/50 border-l-2 ${getEventColor(event.type)} 
              cursor-pointer hover:bg-gray-800 transition-colors
              ${selectedEvent?.id === event.id ? 'ring-1 ring-blue-500 bg-gray-800' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate">
                    {event.title}
                  </span>
                  <span className="text-xs text-gray-500 shrink-0">
                    {format(event.timestamp, 'HH:mm')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {event.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-gray-500">
                    Source: {event.source}
                  </span>
                  <span className={`${
                    event.confidence > 0.8 ? 'text-green-400' :
                    event.confidence > 0.5 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {(event.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event Detail View */}
      {selectedEvent && (
        <div className="border-t border-gray-800 p-4 bg-gray-900/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Event Details</h3>
            <button
              onClick={() => setSelectedEvent(null)}
              className="p-1 hover:bg-gray-800 rounded"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Type</span>
              <span className="capitalize">{selectedEvent.type.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Time</span>
              <span>{format(selectedEvent.timestamp, 'MMM d, HH:mm:ss')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Location</span>
              <span>
                {selectedEvent.latitude.toFixed(4)}, {selectedEvent.longitude.toFixed(4)}
              </span>
            </div>
            {selectedEvent.altitude && (
              <div className="flex justify-between">
                <span className="text-gray-400">Altitude</span>
                <span>{(selectedEvent.altitude / 1000).toFixed(1)} km</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Source</span>
              <span>{selectedEvent.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Confidence</span>
              <span>{(selectedEvent.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800">
            <h4 className="text-xs font-medium text-gray-400 mb-2">Properties</h4>
            <div className="space-y-1 text-xs">
              {Object.entries(selectedEvent.properties).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-500">{key}</span>
                  <span className="text-gray-300">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
              Create Incident
            </button>
            <button className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
              Add to Timeline
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventPanel
