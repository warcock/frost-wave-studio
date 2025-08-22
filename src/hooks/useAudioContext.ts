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
    const length = Math.floor(sampleRate * 0.4) // 400ms
    const data = new Float32Array(length)
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const freq = 65 * Math.exp(-t * 12) // Deeper, punchier frequency sweep
      const envelope = Math.exp(-t * 6) // Longer sustain
      const click = Math.exp(-t * 40) * 0.2 // Add click for punch
      data[i] = (Math.sin(2 * Math.PI * freq * t) + click * (Math.random() * 2 - 1)) * envelope * 0.9
    }
    return data
  }

  private generateSnare(sampleRate: number): Float32Array {
    const length = Math.floor(sampleRate * 0.18) // 180ms
    const data = new Float32Array(length)
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 12)
      const tone1 = Math.sin(2 * Math.PI * 200 * t) * 0.25
      const tone2 = Math.sin(2 * Math.PI * 400 * t) * 0.15
      const noise = (Math.random() * 2 - 1) * 0.8
      const snap = Math.exp(-t * 30) * (Math.random() * 2 - 1) * 0.3
      data[i] = (tone1 + tone2 + noise + snap) * envelope * 0.7
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
    const length = Math.floor(sampleRate * 1.5) // 1.5 seconds
    const data = new Float32Array(length)
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 1.8) // Slower decay
      const noise = (Math.random() * 2 - 1)
      
      // Multiple frequency components for richer crash sound
      const shimmer1 = Math.sin(2 * Math.PI * 4000 * t) * 0.15
      const shimmer2 = Math.sin(2 * Math.PI * 6000 * t) * 0.1
      const shimmer3 = Math.sin(2 * Math.PI * 8000 * t) * 0.08
      const lowFreq = Math.sin(2 * Math.PI * 800 * t) * 0.1
      
      data[i] = (noise * 0.6 + shimmer1 + shimmer2 + shimmer3 + lowFreq) * envelope * 0.4
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