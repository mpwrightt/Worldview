import { useEffect, useRef, useCallback, useState } from 'react'
import * as Cesium from 'cesium'
import { useGlobeStore } from '../store/globeStore'
import { useAllRealTimeData } from '../hooks/useRealTimeData'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
const CESIUM_ION_TOKEN = import.meta.env.VITE_CESIUM_ION_TOKEN || ''

// Set Cesium Ion token if available
if (CESIUM_ION_TOKEN) {
  Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN
}

const CesiumGlobe = () => {
  const cesiumContainer = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Cesium.Viewer | null>(null)
  const dataSourceRef = useRef<Cesium.CustomDataSource | null>(null)
  const tilesetRef = useRef<any>(null)
  const { activeLayers } = useGlobeStore()
  const { events, stats, isLoading } = useAllRealTimeData()
  const [globeReady, setGlobeReady] = useState(false)

  const resetView = useCallback(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(0, 20, 25000000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0,
      },
      duration: 1.5,
    })
  }, [])

  // Initialize viewer
  useEffect(() => {
    if (!cesiumContainer.current || viewerRef.current) return

    console.log('Initializing Cesium viewer with Google 3D Tiles...')

    // Create viewer with simple base layer first
    const viewer = new Cesium.Viewer(cesiumContainer.current, {
      baseLayerPicker: false,
      geocoder: false,
      homeButton: true,
      sceneModePicker: true,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      vrButton: false,
      infoBox: true,
      selectionIndicator: true,
      skyAtmosphere: new Cesium.SkyAtmosphere(),
      scene3DOnly: false,
    })

    const initializeScene = async () => {
      // Try to add Google 3D Tiles if API key is available
      if (GOOGLE_MAPS_API_KEY) {
        try {
          // Create Google 3D Tiles tileset
          const tileset = await Cesium.Cesium3DTileset.fromUrl(
            `https://tile.googleapis.com/v1/3dtiles/root.json?key=${GOOGLE_MAPS_API_KEY}`,
            {
              showCreditsOnScreen: false,
            }
          )
          
          viewer.scene.primitives.add(tileset)
          tilesetRef.current = tileset
          
          // Fly to San Francisco to show off the 3D buildings
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(-122.4194, 37.7749, 2000),
            orientation: {
              heading: Cesium.Math.toRadians(0),
              pitch: Cesium.Math.toRadians(-45),
              roll: 0,
            },
            duration: 0,
          })
          
          console.log('Google 3D Tiles added successfully')
        } catch (error) {
          console.error('Failed to load Google 3D Tiles:', error)
          // Fallback to default view
          viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(0, 20, 25000000),
            orientation: {
              heading: Cesium.Math.toRadians(0),
              pitch: Cesium.Math.toRadians(-90),
              roll: 0,
            },
          })
        }
      } else {
        console.warn('No Google Maps API key found, using default globe')
        // Use Natural Earth as fallback
        viewer.imageryLayers.removeAll()
        const imageryProvider = await Cesium.TileMapServiceImageryProvider.fromUrl(
          Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
        )
        viewer.imageryLayers.addImageryProvider(imageryProvider)
        
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(0, 20, 25000000),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-90),
            roll: 0,
          },
        })
      }
    }

    void initializeScene()

    // Hide the default credit display
    const creditContainer = viewer.cesiumWidget.creditContainer as HTMLElement
    if (creditContainer) {
      creditContainer.style.display = 'none'
    }

    const controller = viewer.scene.screenSpaceCameraController
    controller.minimumZoomDistance = 100
    controller.maximumZoomDistance = 100000000
    controller.enableRotate = true
    controller.enableTranslate = true
    controller.enableZoom = true
    controller.enableTilt = true
    controller.enableLook = true
    controller.zoomEventTypes = [
      Cesium.CameraEventType.WHEEL,
      Cesium.CameraEventType.PINCH,
    ]
    
    viewer.scene.globe.depthTestAgainstTerrain = true
    viewer.scene.globe.enableLighting = true
    if (viewer.scene.skyBox) {
      viewer.scene.skyBox.show = true
    }
    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.show = true
    }
    viewer.scene.backgroundColor = Cesium.Color.BLACK

    // Create a data source for all entities
    const dataSource = new Cesium.CustomDataSource('realtimeData')
    viewer.dataSources.add(dataSource)
    dataSourceRef.current = dataSource

    viewerRef.current = viewer
    setGlobeReady(true)
    console.log('Cesium viewer initialized')
    
    ;(window as any).resetCesiumView = resetView
    ;(window as any).getCesiumViewer = () => viewer

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [resetView])

  // Update entities when data changes
  useEffect(() => {
    const dataSource = dataSourceRef.current
    if (!dataSource || events.length === 0) return

    // Clear existing
    dataSource.entities.removeAll()

    // Add real events from Convex
    events.forEach((event: any) => {
      if (!event.latitude || !event.longitude) return

      const isMilitary = event.properties?.military === true
      const color = getColorForEventType(event.eventType, isMilitary)
      
      dataSource.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          event.longitude, 
          event.latitude, 
          event.altitude || 10000
        ),
        point: {
          pixelSize: getPixelSize(event.eventType, isMilitary),
          color: color,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          scaleByDistance: new Cesium.NearFarScalar(1e5, 2.0, 1e7, 0.5),
        },
        label: {
          text: event.title,
          font: isMilitary ? 'bold 11px sans-serif' : '11px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -10),
          showBackground: true,
          backgroundColor: new Cesium.Color(0, 0, 0, 0.7),
          scaleByDistance: new Cesium.NearFarScalar(1e5, 1.5, 5e6, 0.5),
        },
        properties: {
          layerType: event.eventType,
          ...event.properties,
          eventId: event._id,
        },
      })
    })

    console.log(`Updated Cesium with ${events.length} real events`)
  }, [events])

  // Filter by active layers
  useEffect(() => {
    const dataSource = dataSourceRef.current
    if (!dataSource) return

    dataSource.entities.values.forEach((entity) => {
      if (entity.properties?.layerType) {
        const layerType = entity.properties.layerType.getValue()
        entity.show = activeLayers.includes(layerType)
      }
    })
  }, [activeLayers])

  // Loading indicator
  if (isLoading || !globeReady) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>{isLoading ? 'Loading real-time data...' : 'Initializing 3D Globe...'}</p>
          {!GOOGLE_MAPS_API_KEY && (
            <p className="text-xs text-yellow-400 mt-2">No Google Maps API key configured</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        ref={cesiumContainer}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%', background: '#000' }}
      />
      {/* Data stats overlay */}
      <div className="absolute bottom-4 right-4 z-10 bg-black/70 text-white p-3 rounded-lg text-sm">
        <p className="font-semibold">Live Data:</p>
        <p>Total Events: {stats.total.toLocaleString()}</p>
        {Object.entries(stats.byType).map(([type, count]) => (
          <p key={type} className="text-gray-300">
            {type}: {count?.toLocaleString()}
          </p>
        ))}
      </div>
    </>
  )
}

function getColorForEventType(type: string, isMilitary?: boolean): Cesium.Color {
  if (isMilitary) return Cesium.Color.RED
  
  switch (type) {
    case 'flight':
      return Cesium.Color.CYAN
    case 'satellite':
      return Cesium.Color.YELLOW
    case 'gps_interference':
      return Cesium.Color.RED
    case 'internet_outage':
      return Cesium.Color.ORANGE
    case 'network_probe':
      return Cesium.Color.GREEN
    case 'cctv':
      return Cesium.Color.MAGENTA
    default:
      return Cesium.Color.WHITE
  }
}

function getPixelSize(type: string, isMilitary?: boolean): number {
  if (isMilitary) return 12
  
  switch (type) {
    case 'flight':
      return 10
    case 'satellite':
      return 9
    case 'cctv':
      return 8
    default:
      return 8
  }
}

export default CesiumGlobe
