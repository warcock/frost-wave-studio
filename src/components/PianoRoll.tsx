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
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const { playPianoNote, isInitialized, initializeAudio } = useStudioAudio()
  
  // Piano keys (88 keys, starting from A0)
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octaves = [2, 3, 4, 5, 6, 7] // Focus on middle octaves for the demo
  const pianoKeys = octaves.flatMap(octave => 
    noteNames.map((name, index) => ({
      note: octave * 12 + index,
      name: `${name}${octave}`,
      isBlack: name.includes('#')
    }))
  ).reverse() // Reverse so higher notes are at the top

  const gridCells = 32 // 32 beats visible
  
  const addNote = (noteNumber: number, beat: number) => {
    const newNote: Note = {
      id: `${noteNumber}-${beat}-${Date.now()}`,
      note: noteNumber,
      start: beat,
      duration: 1,
      velocity: 80
    }
    setNotes(prev => [...prev, newNote])
  }

  const removeNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId))
  }

  return (
    <div className="bg-panel border border-grid-line rounded-lg overflow-hidden shadow-panel">
      <div className="border-b border-grid-line p-3 bg-accent-panel">
        <h3 className="text-lg font-semibold text-foreground">Piano Roll</h3>
      </div>
      
      <div className="flex h-80 overflow-auto">
        {/* Piano Keys */}
        <div className="w-16 bg-track-bg border-r border-grid-line flex-shrink-0">
          {pianoKeys.map(key => (
            <div
              key={key.note}
              className={cn(
                "h-4 border-b border-grid-line flex items-center justify-center text-xs cursor-pointer transition-colors",
                key.isBlack 
                  ? "bg-piano-key-black text-piano-key-white hover:bg-piano-key-active" 
                  : "bg-piano-key-white text-piano-key-black hover:bg-highlight"
              )}
              onClick={async () => {
                if (!isInitialized) {
                  await initializeAudio()
                }
                playPianoNote(key.note, 0.5)
              }}
            >
              {key.name}
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
                  className="h-4 border-r border-grid-line/20 hover:bg-primary/20 cursor-pointer transition-colors"
                  onClick={() => addNote(key.note, colIndex)}
                />
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
                  "absolute h-4 bg-secondary rounded border border-secondary-foreground/20 cursor-pointer transition-all",
                  selectedNote === note.id && "ring-2 ring-primary"
                )}
                style={{
                  top: `${(rowIndex / pianoKeys.length) * 100}%`,
                  left: `${(note.start / gridCells) * 100}%`,
                  width: `${(note.duration / gridCells) * 100}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedNote(note.id)
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