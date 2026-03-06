import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react'
import { useGlobeStore } from '../store/globeStore'
import { format } from 'date-fns'

interface TimelineProps {
  onPlayPause: () => void
  isPlaying: boolean
}

const Timeline = ({ onPlayPause, isPlaying }: TimelineProps) => {
  const { 
    currentTime, 
    setTime, 
    startTime, 
    endTime, 
    playbackSpeed, 
    setPlaybackSpeed 
  } = useGlobeStore()
  
  const progressRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  // Calculate progress percentage
  const totalDuration = endTime.getTime() - startTime.getTime()
  const currentProgress = currentTime.getTime() - startTime.getTime()
  const progressPercent = Math.max(0, Math.min(100, (currentProgress / totalDuration) * 100))

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setTime(new Date(currentTime.getTime() + 60000 * playbackSpeed)) // 1 minute per tick
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying, currentTime, playbackSpeed, setTime])

  // Handle timeline click/drag
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return
    
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = new Date(startTime.getTime() + totalDuration * percent)
    setTime(newTime)
  }, [startTime, endTime, totalDuration, setTime])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    handleTimelineClick(e)
  }

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!isDragging || !progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const newTime = new Date(startTime.getTime() + totalDuration * percent)
    setTime(newTime)
  }, [isDragging, startTime, totalDuration, setTime])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleReset = () => {
    setTime(startTime)
  }

  const speeds = [0.5, 1, 2, 5, 10]

  return (
    <div className="timeline-container p-4">
      <div className="flex items-center gap-4">
        {/* Playback controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
          
          <button
            onClick={() => setTime(new Date(Math.max(startTime.getTime(), currentTime.getTime() - 3600000)))}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            title="Back 1 hour"
          >
            <SkipBack size={18} />
          </button>
          
          <button
            onClick={onPlayPause}
            className="p-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <button
            onClick={() => setTime(new Date(Math.min(endTime.getTime(), currentTime.getTime() + 3600000)))}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            title="Forward 1 hour"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Timeline */}
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>{format(startTime, 'MMM d, HH:mm')}</span>
            <span className="text-white font-medium">
              {format(currentTime, 'MMM d, HH:mm:ss')}
            </span>
            <span>{format(endTime, 'MMM d, HH:mm')}</span>
          </div>
          
          <div
            ref={progressRef}
            onClick={handleTimelineClick}
            onMouseDown={handleMouseDown}
            className="timeline-track cursor-pointer"
            style={{ height: '24px' }}
          >
            <div
              className="timeline-progress absolute h-full rounded"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="timeline-handle"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400 mr-2">Speed</span>
          {speeds.map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                playbackSpeed === speed
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Timeline
