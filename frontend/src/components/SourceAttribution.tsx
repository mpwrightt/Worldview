import { useState } from 'react'
import { Info, X } from 'lucide-react'

interface Source {
  name: string
  license: string
  attribution: string
  url?: string
}

const sources: Source[] = [
  {
    name: 'CelesTrak',
    license: 'CC0 1.0',
    attribution: 'Satellite data from CelesTrak',
    url: 'https://celestrak.org'
  },
  {
    name: 'OpenSky',
    license: 'ODbL',
    attribution: 'Flight data from OpenSky Network',
    url: 'https://opensky-network.org'
  },
  {
    name: 'OONI',
    license: 'CC-BY-SA 4.0',
    attribution: 'Censorship data from OONI',
    url: 'https://ooni.org'
  },
  {
    name: 'IODA',
    license: 'CC-BY 4.0',
    attribution: 'Outage data from IODA',
    url: 'https://ioda.inetintel.org'
  },
  {
    name: 'RIPE Atlas',
    license: 'CC-BY 4.0',
    attribution: 'Network data from RIPE Atlas',
    url: 'https://atlas.ripe.net'
  },
  {
    name: 'GPSJAM',
    license: 'Research Use',
    attribution: 'GPS interference data from GPSJAM',
    url: 'https://gpsjam.org'
  },
  {
    name: 'Cesium',
    license: 'Apache 2.0',
    attribution: '3D globe by CesiumJS',
    url: 'https://cesium.com'
  }
]

const SourceAttribution = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Attribution button */}
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-28 right-4 z-10 p-2 rounded-lg bg-gray-900/90 border border-gray-700 text-gray-400 hover:text-white transition-colors"
        title="Data Sources & Attribution"
      >
        <Info size={18} />
      </button>

      {/* Attribution panel */}
      {isOpen && (
        <div className="absolute bottom-28 right-4 z-20 w-80 panel">
          <div className="panel-header">
            <span>Data Sources</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-800 rounded"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>
          
          <div className="panel-content">
            <p className="text-xs text-gray-400 mb-4">
              This platform aggregates data from multiple open sources. 
              Each source has its own license requirements.
            </p>

            <div className="space-y-3">
              {sources.map((source) => (
                <div key={source.name} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{source.name}</span>
                    <span className="text-xs text-gray-500">{source.license}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {source.attribution}
                  </p>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 mt-0.5 inline-block"
                    >
                      {source.url}
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-800">
              <p className="text-xs text-gray-500">
                <strong>Usage Restrictions:</strong> Some data sources are 
                restricted to non-commercial research use only. Check individual 
                source terms before redistributing data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mini attribution bar */}
      <div className="absolute bottom-24 left-4 z-10">
        <div className="text-[10px] text-gray-500">
          Data: CelesTrak, OpenSky, OONI, IODA, RIPE Atlas | Globe: Cesium
        </div>
      </div>
    </>
  )
}

export default SourceAttribution
