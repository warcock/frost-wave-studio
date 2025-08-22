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
    setPianoNotes: setNotes
  } = useStudioAudio()
  
  // Piano keys (88 keys, full range)
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octaves = [1, 2, 3, 4, 5, 6, 7, 8] // Full piano range from C1 to C8
  const pianoKeys = octaves.flatMap(octave => 
    noteNames.map((name, index) => ({
      note: octave * 12 + index,
      name: `${name}${octave}`,
      isBlack: name.includes('#')
    }))
  ).reverse() // Reverse so higher notes are at the top

  const gridCells = 32 // 32 beats visible
  
  const addNote = async (noteNumber: number, beat: number) => {
    // Check if there's already a note at this position
    const existingNote = notes.find(note => note.note === noteNumber && note.start === beat)
    if (existingNote) {
      // Play the existing note and select it
      if (!isInitialized) {
        await initializeAudio()
      }
      playPianoNote(noteNumber, 0.5)
      setSelectedNote(existingNote.id)
      return
    }

    // Create new note
    const newNote: Note = {
      id: `${noteNumber}-${beat}-${Date.now()}`,
      note: noteNumber,
      start: beat,
      duration: 1,
      velocity: 80
    }
    setNotes(prev => [...prev, newNote])
    
    // Play the note when placed
    if (!isInitialized) {
      await initializeAudio()
    }
    playPianoNote(noteNumber, 0.5)
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
                  ? "bg-piano-key-black text-piano-key-white hover:bg-piano-key-active hover:text-foreground z-10 mx-3 -my-px shadow-sm hover:shadow-md" 
                  : "bg-piano-key-white text-piano-key-black hover:bg-piano-key-white/80 hover:text-foreground hover:shadow-sm"
              )}
              style={{
                fontSize: '9px',
                fontWeight: '600',
                minHeight: '12px'
              }}
              onClick={async () => {
                if (!isInitialized) {
                  await initializeAudio()
                }
                playPianoNote(key.note, 0.5)
              }}
            >
              <span className="group-hover:scale-110 transition-transform duration-150">
                {key.name}
              </span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 relative bg-track-bg">
          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Vertical lines (beats) */}
            {Array.from({ length: gridCells + 1 }).map((_, i) => (
              <div
                key={`v-${i}`}
                className={cn(
                  "absolute top-0 bottom-0 w-px",
                  i % 4 === 0 ? "bg-grid-line" : "bg-grid-line/50"
                )}
                style={{ left: `${(i / gridCells) * 100}%` }}
              />
            ))}
            
            {/* Horizontal lines (notes) */}
            {pianoKeys.map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute left-0 right-0 h-px bg-grid-line/30"
                style={{ top: `${(i / pianoKeys.length) * 100}%` }}
              />
            ))}
          </div>

          {/* Note grid */}
          <div className="grid grid-cols-32 h-full">
            {pianoKeys.map((key, rowIndex) => (
              Array.from({ length: gridCells }).map((_, colIndex) => (
              <div
                key={`${key.note}-${colIndex}`}
                className="h-3 border-r border-grid-line/20 hover:bg-primary/30 cursor-pointer transition-all duration-150 relative group"
                style={{ minHeight: '12px' }}
                onClick={async () => {
                  if (!isInitialized) {
                    await initializeAudio()
                  }
                  await addNote(key.note, colIndex)
                }}
              >
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-sm" />
              </div>
              ))
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
                  "absolute h-3 bg-secondary rounded border border-secondary-foreground/20 cursor-pointer transition-all duration-200 hover:bg-secondary/80 hover:shadow-sm",
                  selectedNote === note.id && "ring-2 ring-primary shadow-lg scale-105"
                )}
                style={{
                  top: `${(rowIndex / pianoKeys.length) * 100}%`,
                  left: `${(note.start / gridCells) * 100}%`,
                  width: `${(note.duration / gridCells) * 100}%`,
                  minHeight: '12px'
                }}
                onClick={async (e) => {
                  e.stopPropagation()
                  setSelectedNote(note.id)
                  // Play note when clicked
                  if (!isInitialized) {
                    await initializeAudio()
                  }
                  playPianoNote(note.note, 0.5)
                }}
                onDoubleClick={() => removeNote(note.id)}
              />
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