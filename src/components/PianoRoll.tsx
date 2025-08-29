import { useState } from 'react'
import { StudioButton } from '@/components/ui/studio-button'
import { useStudioAudio } from '@/contexts/AudioContext'

interface Note {
  id: string
  note: number
  start: number
  duration: number
  velocity: number
}

const PianoRoll = () => {
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const { 
    playPianoNote, 
    isInitialized, 
    initializeAudio,
    pianoNotes: notes,
    setPianoNotes: setNotes,
    isPlaying,
    currentStep
  } = useStudioAudio()
  
  // Piano keys (88 keys, full range)
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octaves = [0, 1, 2, 3, 4, 5, 6, 7, 8] // Full piano range from C0 to C8
  const pianoKeys = octaves.flatMap(octave => 
    noteNames.map((name, index) => ({
      note: octave * 12 + index,
      name: `${name}${octave}`,
      isBlack: name.includes('#'),
      frequency: 440 * Math.pow(2, (octave * 12 + index - 69) / 12) // A4 = 440Hz reference
    }))
  ).reverse() // Reverse so higher notes are at the top

  const gridCells = 32 // 32 beats visible
  
  const addNote = async (noteNumber: number, beat: number) => {
    if (!isInitialized) {
      await initializeAudio()
    }

    // Always play sound when clicking
    playPianoNote(noteNumber, 0.3)

    // Check if note already exists at this position
    const existingNote = notes.find(note => 
      note.note === noteNumber && Math.floor(note.start) === beat
    )
    
    if (existingNote) {
      // Toggle off: remove the existing note
      setNotes(prev => prev.filter(n => n.id !== existingNote.id))
      if (selectedNote === existingNote.id) {
        setSelectedNote(null)
      }
    } else {
      // Add new note
      const newNote: Note = {
        id: `note-${Date.now()}-${noteNumber}`,
        note: noteNumber,
        start: beat,
        duration: 1,
        velocity: 80
      }
      setNotes(prev => [...prev, newNote])
      setSelectedNote(newNote.id)
    }
  }

  const removeNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId))
  }

  const clearAllNotes = () => {
    setNotes([])
    setSelectedNote(null)
  }

  return (
    <div className="bg-panel border border-grid-line rounded-lg overflow-hidden shadow-panel">
      <div className="border-b border-grid-line p-3 bg-accent-panel flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Piano Roll</h3>
        <div className="flex gap-2">
          <StudioButton 
            variant="ghost" 
            size="sm"
            onClick={clearAllNotes}
          >
            Clear
          </StudioButton>
        </div>
      </div>
      
      <div className="flex h-96 overflow-auto">
        {/* Piano Keys */}
        <div className="w-24 bg-track-bg border-r border-grid-line flex-shrink-0">
          {pianoKeys.map(key => (
            <div
              key={key.note}
              className={cn(
                "h-3 border-b border-grid-line/30 flex items-center justify-center text-xs cursor-pointer transition-all duration-200 relative group",
                key.isBlack 
                  ? "bg-accent text-accent-foreground border-l-2 border-primary/20 shadow-inner hover:bg-primary/20 hover:border-primary/40" 
                  : "bg-card text-card-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
              )}
              style={{
                fontSize: '8px',
                fontWeight: '500',
                minHeight: '12px'
              }}
              onClick={async () => {
                if (!isInitialized) {
                  await initializeAudio()
                }
                playPianoNote(key.note, 0.3)
              }}
            >
              <span className="group-hover:scale-105 transition-transform duration-150 font-mono opacity-80 group-hover:opacity-100">
                {!key.isBlack && key.name}
              </span>
              <div 
                className={cn(
                  "absolute left-0 top-0 w-0.5 h-full opacity-0 transition-opacity bg-primary",
                  "group-hover:opacity-100"
                )} 
              />
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 relative bg-track-bg">
          {/* Playback line */}
          {isPlaying && (
            <div 
              className="absolute top-0 w-0.5 h-full bg-primary z-20 transition-all duration-75 shadow-lg"
              style={{ 
                left: `${(currentStep / gridCells) * 100}%`,
                boxShadow: '0 0 8px hsl(var(--primary))'
              }}
            />
          )}
          
          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Vertical lines (beats) */}
            {Array.from({ length: gridCells + 1 }).map((_, i) => (
              <div
                key={`v-${i}`}
                className={cn(
                  "absolute top-0 bottom-0 w-px",
                  i % 8 === 0 ? "bg-primary/30" : i % 4 === 0 ? "bg-grid-line" : "bg-grid-line/30"
                )}
                style={{ left: `${(i / gridCells) * 100}%` }}
              />
            ))}
            
            {/* Horizontal lines (notes) */}
            {pianoKeys.map((key, i) => (
              <div
                key={`h-${i}`}
                className={cn(
                  "absolute left-0 right-0 h-px",
                  key.isBlack ? "bg-grid-line/15" : "bg-grid-line/25"
                )}
                style={{ top: `${(i / pianoKeys.length) * 100}%` }}
              />
            ))}
          </div>

          {/* Note grid */}
          <div className="h-full relative">
            {pianoKeys.map((key, rowIndex) => (
              <div 
                key={`row-${key.note}`} 
                className="flex h-3 border-b border-grid-line/10"
                style={{ minHeight: '12px' }}
              >
                {Array.from({ length: gridCells }).map((_, colIndex) => (
                  <div
                    key={`${key.note}-${colIndex}`}
                    className={cn(
                      "flex-1 border-r border-grid-line/20 cursor-pointer transition-all duration-150 relative group",
                      key.isBlack ? "hover:bg-primary/15" : "hover:bg-primary/20",
                      currentStep === colIndex && isPlaying && "bg-primary/5"
                    )}
                    onClick={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      await addNote(key.note, colIndex)
                    }}
                  >
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-sm" />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Notes */}
          {notes.map(note => {
            const rowIndex = pianoKeys.findIndex(k => k.note === note.note)
            if (rowIndex === -1) return null
            
            return (
              <div
                key={note.id}
                className={cn(
                  "absolute h-3 bg-secondary rounded-sm border border-secondary-foreground/30 cursor-pointer transition-all duration-200 hover:bg-secondary/90 hover:shadow-md z-10",
                  selectedNote === note.id && "ring-2 ring-primary shadow-lg bg-primary/80 border-primary"
                )}
                style={{
                  top: `${rowIndex * 12}px`,
                  left: `${(note.start / gridCells) * 100}%`,
                  width: `${Math.max((note.duration / gridCells) * 100, 3)}%`,
                  minHeight: '12px'
                }}
                onClick={async (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedNote(note.id)
                  // Play note when clicked
                  if (!isInitialized) {
                    await initializeAudio()
                  }
                  playPianoNote(note.note, 0.5)
                }}
                onDoubleClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  removeNote(note.id)
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-secondary/20 rounded-sm" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ')
}

export default PianoRoll