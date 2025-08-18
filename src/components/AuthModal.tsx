import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StudioButton } from '@/components/ui/studio-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuth: (user: { username: string; id: string }) => void
}

const AuthModal = ({ isOpen, onClose, onAuth }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    if (!isLogin && password !== confirmPassword) {
      toast({
        title: "Error", 
        description: "Passwords don't match",
        variant: "destructive"
      })
      return
    }

    // Local storage authentication
    const users = JSON.parse(localStorage.getItem('mbstudio_users') || '{}')
    
    if (isLogin) {
      // Login
      if (users[username] && users[username].password === password) {
        const user = { username, id: users[username].id }
        localStorage.setItem('mbstudio_current_user', JSON.stringify(user))
        onAuth(user)
        onClose()
        toast({
          title: "Welcome back!",
          description: `Successfully logged in as ${username}`,
        })
      } else {
        toast({
          title: "Error",
          description: "Invalid username or password",
          variant: "destructive"
        })
      }
    } else {
      // Register
      if (users[username]) {
        toast({
          title: "Error",
          description: "Username already exists",
          variant: "destructive"
        })
        return
      }
      
      const newUser = {
        id: `user_${Date.now()}`,
        password,
        createdAt: new Date().toISOString()
      }
      
      users[username] = newUser
      localStorage.setItem('mbstudio_users', JSON.stringify(users))
      
      const user = { username, id: newUser.id }
      localStorage.setItem('mbstudio_current_user', JSON.stringify(user))
      onAuth(user)
      onClose()
      toast({
        title: "Account created!",
        description: `Welcome to MB Studio, ${username}!`,
      })
    }

    // Reset form
    setUsername('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-panel border-grid-line max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-foreground">
            {isLogin ? 'Login to' : 'Join'} MB Studio
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-muted-foreground">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-track-bg border-grid-line text-foreground"
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-track-bg border-grid-line text-foreground"
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-muted-foreground">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-track-bg border-grid-line text-foreground"
                placeholder="Confirm your password"
              />
            </div>
          )}

          <StudioButton 
            type="submit" 
            variant="studio" 
            className="w-full"
          >
            {isLogin ? 'Login' : 'Create Account'}
          </StudioButton>

          <div className="text-center">
            <StudioButton
              type="button"
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary-foreground"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </StudioButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AuthModal