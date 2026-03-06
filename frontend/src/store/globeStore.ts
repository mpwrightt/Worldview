import { create } from 'zustand'

export type LayerType = 
  | 'flight' 
  | 'satellite' 
  | 'gps_interference' 
  | 'internet_outage' 
  | 'network_probe' 
  | 'geo_context'
  | 'cctv'

export interface Event {
  id: string
  type: LayerType
  title: string
  description: string
  timestamp: Date
  latitude: number
  longitude: number
  altitude?: number
  properties: Record<string, any>
  source: string
  confidence: number
}

interface GlobeState {
  activeLayers: LayerType[]
  toggleLayer: (layer: LayerType) => void
  
  currentTime: Date
  startTime: Date
  endTime: Date
  isPlaying: boolean
  playbackSpeed: number
  setTime: (time: Date) => void
  setPlaying: (playing: boolean) => void
  setPlaybackSpeed: (speed: number) => void
  
  selectedEvent: Event | null
  setSelectedEvent: (event: Event | null) => void
  
  events: Event[]
  addEvent: (event: Event) => void
  setEvents: (events: Event[]) => void
}

export const useGlobeStore = create<GlobeState>((set, get) => ({
  activeLayers: ['flight', 'satellite', 'cctv'],
  
  toggleLayer: (layer) => {
    const { activeLayers } = get()
    if (activeLayers.includes(layer)) {
      set({ activeLayers: activeLayers.filter(l => l !== layer) })
    } else {
      set({ activeLayers: [...activeLayers, layer] })
    }
  },

  currentTime: new Date(),
  startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
  endTime: new Date(),
  isPlaying: false,
  playbackSpeed: 1,

  setTime: (time) => set({ currentTime: time }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  selectedEvent: null,
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  
  events: [],
  addEvent: (event) => {
    const { events } = get()
    set({ events: [...events, event] })
  },
  setEvents: (events) => set({ events }),
}))
