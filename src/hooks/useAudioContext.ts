import { useEffect, useRef, useState } from 'react'

class AudioManager {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private drumSamples: Map<string, AudioBuffer> = new Map()
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.masterGain = this.audioContext.createGain()
    this.masterGain.connect(this.audioContext.destination)
    this.masterGain.gain.value = 0.8

    await this.loadDrumSamples()
    this.isInitialized = true
  }

  private async loadDrumSamples() {
    if (!this.audioContext) return

    // Generate drum samples using oscillators
    const sampleRate = this.audioContext.sampleRate
    const samples = {
      kick: this.generateKick(sampleRate),
      snare: this.generateSnare(sampleRate),
      hihat: this.generateHiHat(sampleRate),
      openhat: this.generateOpenHat(sampleRate),
      crash: this.generateCrash(sampleRate),
      ride: this.generateRide(sampleRate)
    }

    for (const [name, data] of Object.entries(samples)) {
      const buffer = this.audioContext.createBuffer(1, data.length, sampleRate)
      buffer.copyToChannel(data, 0)
      this.drumSamples.set(name, buffer)
    }
  }

  private generateKick(sampleRate: number): Float32Array {
    const length = Math.floor(sampleRate * 0.5) // 500ms
    const data = new Float32Array(length)
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // Multi-layered kick with sub-bass
      const subBass = Math.sin(2 * Math.PI * 45 * t) * Math.exp(-t * 3)
      const fundamental = Math.sin(2 * Math.PI * 70 * Math.exp(-t * 8) * t) * Math.exp(-t * 4)
      const punch = Math.sin(2 * Math.PI * 150 * Math.exp(-t * 20) * t) * Math.exp(-t * 15)
      const click = Math.exp(-t * 50) * (Math.random() * 2 - 1) * 0.15
      const envelope = Math.exp(-t * 3.5)
      
      data[i] = (subBass * 0.7 + fundamental * 0.8 + punch * 0.4 + click) * envelope * 0.95
    }
    return data
  }

  private generateSnare(sampleRate: number): Float32Array {
    const length = Math.floor(sampleRate * 0.22) // 220ms
    const data = new Float32Array(length)
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 8)
      // Complex snare with multiple frequencies
      const fundamental = Math.sin(2 * Math.PI * 220 * t) * 0.3
      const overtone1 = Math.sin(2 * Math.PI * 340 * t) * 0.2
      const overtone2 = Math.sin(2 * Math.PI * 480 * t) * 0.15
      const rattle = Math.sin(2 * Math.PI * 8000 * t) * 0.1 * Math.exp(-t * 20)
      const noise = (Math.random() * 2 - 1) * 0.7
      const crack = Math.exp(-t * 25) * (Math.random() * 2 - 1) * 0.4
      
      data[i] = (fundamental + overtone1 + overtone2 + rattle + noise + crack) * envelope * 0.8
    }
    return data
  }

  private generateHiHat(sampleRate: number): Float32Array {
    const length = Math.floor(sampleRate * 0.08) // 80ms
    const data = new Float32Array(length)
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 25)
      const highFreq = Math.sin(2 * Math.PI * 8000 * t) * 0.3
      const midFreq = Math.sin(2 * Math.PI * 12000 * t) * 0.2
      const noise = (Math.random() * 2 - 1) * 0.6
      data[i] = (highFreq + midFreq + noise) * envelope * 0.5
    }
    return data
  }

  private generateOpenHat(sampleRate: number): Float32Array {
    const length = Math.floor(sampleRate * 0.3) // 300ms
    const data = new Float32Array(length)
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 5)
      const noise = (Math.random() * 2 - 1)
      data[i] = noise * envelope * 0.3
    }
    return data
  }

  private generateCrash(sampleRate: number): Float32Array {
    const length = Math.floor(sampleRate * 2.2) // 2.2 seconds
    const data = new Float32Array(length)
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 1.2) // Even slower decay
      const noise = (Math.random() * 2 - 1) * 0.5
      
      // Rich harmonic content for realistic crash
      const shimmer1 = Math.sin(2 * Math.PI * 3200 * t) * 0.2
      const shimmer2 = Math.sin(2 * Math.PI * 4800 * t) * 0.15
      const shimmer3 = Math.sin(2 * Math.PI * 6400 * t) * 0.12
      const shimmer4 = Math.sin(2 * Math.PI * 8800 * t) * 0.08
      const midFreq = Math.sin(2 * Math.PI * 1600 * t) * 0.15
      const lowFreq = Math.sin(2 * Math.PI * 650 * t) * 0.12
      const sizzle = Math.sin(2 * Math.PI * 12000 * t) * 0.06 * Math.exp(-t * 4)
      
      data[i] = (noise + shimmer1 + shimmer2 + shimmer3 + shimmer4 + midFreq + lowFreq + sizzle) * envelope * 0.45
    }
    return data
  }

  private generateRide(sampleRate: number): Float32Array {
    const length = Math.floor(sampleRate * 0.8) // 800ms
    const data = new Float32Array(length)
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 3)
      const bell = Math.sin(2 * Math.PI * 1200 * t) * 0.4
      const noise = (Math.random() * 2 - 1) * 0.3
      data[i] = (bell + noise) * envelope * 0.4
    }
    return data
  }

  playDrumSample(drumType: string) {
    if (!this.audioContext || !this.masterGain || !this.isInitialized) return

    const buffer = this.drumSamples.get(drumType)
    if (!buffer) return

    const source = this.audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(this.masterGain)
    source.start()
  }

  playPianoNote(frequency: number, duration: number = 0.5) {
    if (!this.audioContext || !this.masterGain || !this.isInitialized) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    
    // ADSR envelope
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)
    
    oscillator.connect(gainNode)
    gainNode.connect(this.masterGain)
    
    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  setMasterVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = volume / 100
    }
  }

  suspend() {
    return this.audioContext?.suspend()
  }

  resume() {
    return this.audioContext?.resume()
  }
}

export const useAudioContext = () => {
  const audioManagerRef = useRef<AudioManager | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    audioManagerRef.current = new AudioManager()
    return () => {
      audioManagerRef.current?.suspend()
    }
  }, [])

  const initializeAudio = async () => {
    if (audioManagerRef.current && !isInitialized) {
      await audioManagerRef.current.initialize()
      setIsInitialized(true)
    }
  }

  const playDrumSample = (drumType: string) => {
    audioManagerRef.current?.playDrumSample(drumType)
  }

  const playPianoNote = (note: number, duration?: number) => {
    // Convert MIDI note to frequency
    const frequency = 440 * Math.pow(2, (note - 69) / 12)
    audioManagerRef.current?.playPianoNote(frequency, duration)
  }

  const setMasterVolume = (volume: number) => {
    audioManagerRef.current?.setMasterVolume(volume)
  }

  const suspend = () => audioManagerRef.current?.suspend()
  const resume = () => audioManagerRef.current?.resume()

  return {
    isInitialized,
    initializeAudio,
    playDrumSample,
    playPianoNote,
    setMasterVolume,
    suspend,
    resume
  }
}