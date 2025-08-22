import { useState, useEffect } from 'react'
import { StudioButton } from '@/components/ui/studio-button'
import { useStudioAudio } from '@/contexts/AudioContext'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Project {
  id: string
  name: string
  drumPattern: any
  pianoNotes: any[]
  bpm: number
  volume: number
  createdAt: string
  userId: string
}

interface ProjectManagerProps {
  userId: string
}

const ProjectManager = ({ userId }: ProjectManagerProps) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectName, setProjectName] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  
  const { 
    drumPattern, 
    pianoNotes, 
    bpm, 
    volume,
    setDrumPattern,
    setPianoNotes,
    setBpm,
    setVolume
  } = useStudioAudio()

  useEffect(() => {
    loadProjects()
  }, [userId])

  const loadProjects = () => {
    const savedProjects = localStorage.getItem(`mb_studio_projects_${userId}`)
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }

  const saveProject = () => {
    if (!projectName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a project name",
        variant: "destructive"
      })
      return
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name: projectName.trim(),
      drumPattern,
      pianoNotes,
      bpm,
      volume,
      createdAt: new Date().toISOString(),
      userId
    }

    const updatedProjects = [...projects, newProject]
    setProjects(updatedProjects)
    localStorage.setItem(`mb_studio_projects_${userId}`, JSON.stringify(updatedProjects))

    toast({
      title: "Success",
      description: `Project "${projectName}" saved successfully`
    })

    setProjectName('')
    setIsOpen(false)
  }

  const loadProject = (project: Project) => {
    setDrumPattern(project.drumPattern)
    setPianoNotes(project.pianoNotes)
    setBpm(project.bpm)
    setVolume(project.volume)

    toast({
      title: "Success",
      description: `Project "${project.name}" loaded`
    })
  }

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId)
    setProjects(updatedProjects)
    localStorage.setItem(`mb_studio_projects_${userId}`, JSON.stringify(updatedProjects))

    toast({
      title: "Success",
      description: "Project deleted"
    })
  }

  return (
    <div className="flex gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <StudioButton variant="secondary" size="sm">
            Save Project
          </StudioButton>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <StudioButton 
                variant="ghost" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </StudioButton>
              <StudioButton onClick={saveProject}>
                Save
              </StudioButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {projects.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <StudioButton variant="ghost" size="sm">
              Load Project
            </StudioButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Load Project</DialogTitle>
            </DialogHeader>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {projects.map(project => (
                <div 
                  key={project.id}
                  className="flex items-center justify-between p-3 border border-grid-line rounded-lg bg-panel"
                >
                  <div>
                    <h4 className="font-medium text-foreground">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <StudioButton 
                      size="sm" 
                      onClick={() => loadProject(project)}
                    >
                      Load
                    </StudioButton>
                    <StudioButton 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteProject(project.id)}
                    >
                      Delete
                    </StudioButton>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default ProjectManager