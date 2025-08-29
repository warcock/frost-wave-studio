import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { useAudioContext } from '../hooks/useAudioContext'

interface AudioContextType {
  isInitialized: boolean
  isPlaying: boolean
  currentStep: number
  bpm: number
  volume: number
  initializeAudio: () => Promise<void>
  playDrumSample: (drumType: string) => void
  playPianoNote: (note: number, duration?: number) => void
  setIsPlaying: (playing: boolean) => void
  setCurrentStep: (step: number) => void
  setBpm: (bpm: number) => void
  setVolume: (volume: number) => void
  drumPattern: { [key: string]: boolean[] }
  setDrumPattern: (pattern: { [key: string]: boolean[] } | ((prev: { [key: string]: boolean[] }) => { [key: string]: boolean[] })) => void
  pianoNotes: { id: string; note: number; start: number; duration: number; velocity: number }[]
  setPianoNotes: (notes: { id: string; note: number; start: number; duration: number; velocity: number }[] | ((prev: { id: string; note: number; start: number; duration: number; velocity: number }[]) => { id: string; note: number; start: number; duration: number; velocity: number }[])) => void
}

const AudioContext = createContext<AudioContextType | null>(null)

export const useStudioAudio = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useStudioAudio must be used within AudioProvider')
  }
  return context
}

interface AudioProviderProps {
  children: ReactNode
}

export const AudioProvider = ({ children }: AudioProviderProps) => {
  const audio = useAudioContext()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [bpm, setBpm] = useState(120)
  const [volume, setVolume] = useState(80)
  const [drumPattern, setDrumPattern] = useState<{ [key: string]: boolean[] }>({
    kick: new Array(16).fill(false),
    snare: new Array(16).fill(false),
    hihat: new Array(16).fill(false),
    openhat: new Array(16).fill(false),
    crash: new Array(16).fill(false),
    ride: new Array(16).fill(false)
  })
  const [pianoNotes, setPianoNotes] = useState<{ id: string; note: number; start: number; duration: number; velocity: number }[]>([])

  // Keep latest patterns/notes in refs to prevent interval reset on every change
  const drumPatternRef = useRef(drumPattern)
  const pianoNotesRef = useRef(pianoNotes)

  useEffect(() => {
    drumPatternRef.current = drumPattern
  }, [drumPattern])

  useEffect(() => {
    pianoNotesRef.current = pianoNotes
  }, [pianoNotes])

  // Sequencer logic (interval only depends on play state, bpm, and initialization)
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined

    if (isPlaying && audio.isInitialized) {
      const stepDuration = (60 / bpm / 4) * 1000 // 16th notes in milliseconds

      interval = setInterval(() => {
        setCurrentStep((prevStep) => {
          const nextStep = (prevStep + 1) % 16

          // Play drum samples for active steps
          const dp = drumPatternRef.current
          Object.entries(dp).forEach(([drumType, pattern]) => {
            if (pattern[nextStep]) {
              audio.playDrumSample(drumType)
            }
          })

          // Play piano notes for this step
          const pn = pianoNotesRef.current
          pn.forEach(note => {
            if (note.start === nextStep) {
              audio.playPianoNote(note.note, note.duration * 0.25) // Convert to seconds
            }
          })

          return nextStep
        })
      }, stepDuration)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, bpm, audio])

  // Update master volume when volume changes
  useEffect(() => {
    audio.setMasterVolume(volume)
  }, [volume, audio])

  // Keep audio context running once initialized so clicks can audition sounds even when not playing
  useEffect(() => {
    if (audio.isInitialized) {
      audio.resume()
    }
  }, [audio.isInitialized, audio])

  const handleSetVolume = (newVolume: number) => {
    setVolume(newVolume)
    audio.setMasterVolume(newVolume)
  }

  const value: AudioContextType = {
    isInitialized: audio.isInitialized,
    isPlaying,
    currentStep,
    bpm,
    volume,
    initializeAudio: audio.initializeAudio,
    playDrumSample: audio.playDrumSample,
    playPianoNote: audio.playPianoNote,
    setIsPlaying,
    setCurrentStep,
    setBpm,
    setVolume: handleSetVolume,
    drumPattern,
    setDrumPattern,
    pianoNotes,
    setPianoNotes
  }

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  )
}