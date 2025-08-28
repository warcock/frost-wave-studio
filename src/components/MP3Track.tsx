import { useRef, useState } from 'react'
import { StudioButton } from '@/components/ui/studio-button'
import { useStudioAudio } from '@/contexts/AudioContext'
import { Upload, Play, Pause, Square, Volume2 } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

const MP3Track = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [audioFile, setAudioFile] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [isMP3Playing, setIsMP3Playing] = useState(false)
  const [volume, setVolume] = useState([70])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const { isPlaying: sequencerPlaying, setIsPlaying } = useStudioAudio()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file)
      setAudioFile(url)
      setFileName(file.name)
      setCurrentTime(0)
      setIsMP3Playing(false)
    }
  }

  const handlePlay = () => {
    if (!audioRef.current) return

    if (isMP3Playing) {
      audioRef.current.pause()
      setIsMP3Playing(false)
      // Stop sequencer if it's playing
      if (sequencerPlaying) {
        setIsPlaying(false)
      }
    } else {
      audioRef.current.play()
      setIsMP3Playing(true)
      // Start sequencer to sync
      if (!sequencerPlaying) {
        setIsPlaying(true)
      }
    }
  }

  const handleStop = () => {
    if (!audioRef.current) return
    
    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setIsMP3Playing(false)
    setCurrentTime(0)
    
    // Stop sequencer
    if (sequencerPlaying) {
      setIsPlaying(false)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0] / 100
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-panel border border-grid-line rounded-lg overflow-hidden shadow-panel">
      <div className="border-b border-grid-line p-3 bg-accent-panel flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Audio Track</h3>
        <div className="flex gap-2">
          <StudioButton 
            variant="ghost" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-1" />
            Import
          </StudioButton>
        </div>
      </div>

      <div className="p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {audioFile && (
          <>
            <audio
              ref={audioRef}
              src={audioFile}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => {
                setIsMP3Playing(false)
                setCurrentTime(0)
              }}
            />

            <div className="space-y-4">
              {/* File info */}
              <div className="text-sm text-muted-foreground truncate">
                {fileName}
              </div>

              {/* Transport controls */}
              <div className="flex items-center gap-2">
                <StudioButton
                  variant="transport"
                  size="sm"
                  onClick={handlePlay}
                  className="flex-shrink-0"
                >
                  {isMP3Playing ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </StudioButton>

                <StudioButton
                  variant="transport"
                  size="sm"
                  onClick={handleStop}
                  className="flex-shrink-0"
                >
                  <Square className="w-4 h-4" />
                </StudioButton>

                {/* Time display */}
                <div className="text-sm font-mono text-muted-foreground">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-track-bg rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-100"
                  style={{ 
                    width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' 
                  }}
                />
              </div>

              {/* Volume control */}
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-mono text-muted-foreground w-10">
                  {volume[0]}%
                </span>
              </div>

              {/* Waveform placeholder */}
              <div className="h-20 bg-track-bg rounded border border-grid-line flex items-center justify-center relative overflow-hidden">
                <div className="text-xs text-muted-foreground">Audio Waveform</div>
                {/* Playback indicator */}
                {isMP3Playing && duration > 0 && (
                  <div 
                    className="absolute top-0 w-0.5 h-full bg-primary transition-all duration-100"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                  />
                )}
              </div>
            </div>
          </>
        )}

        {!audioFile && (
          <div 
            className="border-2 border-dashed border-grid-line rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to import an MP3 or audio file
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MP3Track