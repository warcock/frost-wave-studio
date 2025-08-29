import { StudioButton } from '@/components/ui/studio-button'
import { useStudioAudio } from '@/contexts/AudioContext'

const DrumMachine = () => {
  const { 
    isPlaying, 
    currentStep, 
    drumPattern: pattern, 
    setDrumPattern: setPattern,
    playDrumSample,
    isInitialized,
    initializeAudio
  } = useStudioAudio()

  const drumSounds = [
    { id: 'kick', name: 'Kick', color: 'bg-destructive' },
    { id: 'snare', name: 'Snare', color: 'bg-warning' },
    { id: 'hihat', name: 'Hi-Hat', color: 'bg-primary' },
    { id: 'openhat', name: 'Open Hat', color: 'bg-secondary' },
    { id: 'crash', name: 'Crash', color: 'bg-highlight' },
    { id: 'ride', name: 'Ride', color: 'bg-accent' }
  ]

  const toggleStep = async (drumId: string, step: number) => {
    if (!isInitialized) {
      await initializeAudio()
    }
    
    // Always play sample when clicked
    playDrumSample(drumId)
    
    setPattern(prev => ({
      ...prev,
      [drumId]: prev[drumId].map((active, index) => 
        index === step ? !active : active
      )
    }))
  }

  const clearPattern = () => {
    setPattern(prev => 
      Object.keys(prev).reduce((acc, key) => ({
        ...acc,
        [key]: new Array(16).fill(false)
      }), {})
    )
  }

  const randomizePattern = () => {
    setPattern(prev => 
      Object.keys(prev).reduce((acc, key) => ({
        ...acc,
        [key]: new Array(16).fill(false).map(() => Math.random() > 0.7)
      }), {})
    )
  }

  return (
    <div className="bg-panel border border-grid-line rounded-lg overflow-hidden shadow-panel">
      <div className="border-b border-grid-line p-3 bg-accent-panel flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Drum Machine</h3>
        <div className="flex gap-2">
          <StudioButton 
            variant="ghost" 
            size="sm"
            onClick={clearPattern}
          >
            Clear
          </StudioButton>
          <StudioButton 
            variant="ghost" 
            size="sm"
            onClick={randomizePattern}
          >
            Random
          </StudioButton>
        </div>
      </div>

      <div className="p-4">
        {/* Step indicators */}
        <div className="flex mb-4">
          <div className="w-20"></div> {/* Space for drum names */}
          {Array.from({ length: 16 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "flex-1 h-6 border border-grid-line flex items-center justify-center text-xs transition-all",
                currentStep === index && isPlaying 
                  ? "bg-track-active text-primary-foreground animate-beat-pulse" 
                  : "bg-track-bg text-muted-foreground",
                index % 4 === 0 ? "border-primary/50" : "border-grid-line"
              )}
            >
              {index + 1}
            </div>
          ))}
        </div>
        {/* Drum rows container with a single global playhead line */}
        <div className="relative">
          {isPlaying && (
            <div
              className="absolute left-20 top-0 w-0.5 bg-primary z-10 transition-all duration-75 shadow-lg"
              style={{
                left: `${80 + (currentStep * 22)}px`,
                height: `${drumSounds.length * 34}px`, // approx. 32px row height + gaps
                boxShadow: '0 0 6px hsl(var(--primary))'
              }}
            />
          )}

          {/* Drum rows */}
          {drumSounds.map(drum => (
            <div key={drum.id} className="flex mb-2 items-center">
              <div className="w-20 text-sm font-medium text-foreground pr-2">
                {drum.name}
              </div>
              {pattern[drum.id].map((active, index) => (
                <StudioButton
                  key={index}
                  variant={active ? "active" : "ghost"}
                  size="icon"
                  className={cn(
                    "flex-1 h-8 m-px transition-all relative",
                    active ? drum.color : "bg-track-bg/50 hover:bg-track-bg/70 border border-grid-line",
                    currentStep === index && isPlaying && "ring-2 ring-primary/50",
                    index % 4 === 0 && "border-l-2 border-primary/20",
                    index % 8 === 0 && "border-l-2 border-primary/40"
                  )}
                  onClick={() => toggleStep(drum.id, index)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ')
}

export default DrumMachine