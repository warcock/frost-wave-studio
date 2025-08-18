import { useState, useEffect } from 'react'
import { Music, User, LogOut } from 'lucide-react'
import { StudioButton } from '@/components/ui/studio-button'
import PianoRoll from '@/components/PianoRoll'
import DrumMachine from '@/components/DrumMachine'
import TransportControls from '@/components/TransportControls'
import AuthModal from '@/components/AuthModal'
import { useToast } from '@/hooks/use-toast'
import { AudioProvider } from '@/contexts/AudioContext'

interface User {
  username: string
  id: string
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('mbstudio_current_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('mbstudio_current_user')
    setUser(null)
    toast({
      title: "Logged out",
      description: "See you next time!",
    })
  }

  const handleAuth = (newUser: User) => {
    setUser(newUser)
  }

  return (
    <AudioProvider>
      {!user ? (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center space-y-8 max-w-md w-full">
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                  <Music className="w-10 h-10 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-foreground">MB Studio</h1>
              <p className="text-xl text-muted-foreground">
                Professional music production suite
              </p>
            </div>
            
            <div className="space-y-4">
              <StudioButton 
                variant="studio" 
                size="lg"
                onClick={() => setShowAuth(true)}
                className="w-full"
              >
                Enter Studio
              </StudioButton>
              <p className="text-sm text-muted-foreground">
                Create beats, compose melodies, and produce music
              </p>
            </div>
          </div>

          <AuthModal
            isOpen={showAuth}
            onClose={() => setShowAuth(false)}
            onAuth={handleAuth}
          />
        </div>
      ) : (
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="bg-accent-panel border-b border-grid-line p-4 shadow-panel">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">MB Studio</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{user.username}</span>
                </div>
                <StudioButton 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                </StudioButton>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6 space-y-6">
            {/* Transport Controls */}
            <TransportControls />

            {/* Production Tools */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <PianoRoll />
              <DrumMachine />
            </div>
          </main>
        </div>
      )}
    </AudioProvider>
  )
};

export default Index;
