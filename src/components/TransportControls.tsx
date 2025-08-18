import { useState, useEffect } from 'react'
import { Play, Pause, Square, SkipBack, RotateCcw } from 'lucide-react'
import { StudioButton } from '@/components/ui/studio-button'
import { Slider } from '@/components/ui/slider'

const TransportControls = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [position, setPosition] = useState(0) // Position in beats
  const [volume, setVolume] = useState(80)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setPosition(prev => prev + 0.25) // Increment by 16th notes
      }, (60 / bpm / 4) * 1000) // Convert BPM to milliseconds for 16th notes
    }
    return () => clearInterval(interval)
  }, [isPlaying, bpm])

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleStop = () => {
    setIsPlaying(false)
    setPosition(0)
  }

  const handleRecord = () => {
    setIsRecording(!isRecording)
    if (!isPlaying) {
      setIsPlaying(true)
    }
  }

  const formatTime = (beats: number) => {
    const totalSeconds = (beats * 60) / bpm
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const bars = Math.floor(beats / 4) + 1
    const beat = (beats % 4) + 1
    return `${bars}:${Math.floor(beat)}:${String(Math.floor((beat % 1) * 4) + 1).padStart(2, '0')}`
  }

  return (
    <div className="bg-panel border border-grid-line rounded-lg p-4 shadow-panel">
      <div className="flex items-center justify-between gap-4">
        {/* Transport Buttons */}
        <div className="flex items-center gap-2">
          <StudioButton
            variant="transport"
            size="transport"
            onClick={() => setPosition(0)}
          >
            <SkipBack className="w-5 h-5" />
          </StudioButton>

          <StudioButton
            variant="transport"
            size="transport"
            onClick={handlePlay}
            className={isPlaying ? "bg-track-active text-primary-foreground" : ""}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </StudioButton>

          <StudioButton
            variant="transport"
            size="transport"
            onClick={handleStop}
          >
            <Square className="w-5 h-5" />
          </StudioButton>

          <StudioButton
            variant={isRecording ? "destructive" : "transport"}
            size="transport"
            onClick={handleRecord}
            className={isRecording ? "animate-pulse-glow" : ""}
          >
            <div className="w-4 h-4 rounded-full bg-current" />
          </StudioButton>

          <StudioButton
            variant="transport"
            size="transport"
            onClick={() => setPosition(0)}
          >
            <RotateCcw className="w-5 h-5" />
          </StudioButton>
        </div>

        {/* Position Display */}
        <div className="bg-track-bg border border-grid-line rounded-md px-4 py-2 font-mono text-lg text-primary">
          {formatTime(position)}
        </div>

        {/* BPM Control */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            BPM
          </label>
          <div className="flex items-center gap-3 min-w-[120px]">
            <Slider
              value={[bpm]}
              onValueChange={(value) => setBpm(value[0])}
              min={60}
              max={200}
              step={1}
              className="flex-1"
            />
            <div className="w-12 text-center font-mono text-primary font-semibold">
              {bpm}
            </div>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Vol
          </label>
          <div className="flex items-center gap-3 min-w-[120px]">
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <div className="w-8 text-center font-mono text-primary font-semibold text-sm">
              {volume}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 bg-track-bg border border-grid-line rounded-md h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-primary transition-all duration-100"
          style={{ width: `${(position % 16) * 6.25}%` }}
        />
      </div>
    </div>
  )
}

export default TransportControls