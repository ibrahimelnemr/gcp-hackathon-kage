import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TaskBoard } from '@/components/project/TaskBoard';
import { BACKEND_URL } from '@/data/Data';
import { usePopupHandler } from '@/hooks/usePopupHandler';
import { EditProjectPopup } from '@/components/project/EditProjectPopup';
import { IProject } from '@/data/Interfaces';
import { Edit, Settings } from 'lucide-react'; // Import the edit and settings icons
import { SettingsPopup } from '@/components/project/SettingsPopup';

export default function Project() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isOpen: isEditOpen, openPopup: openEditPopup, closePopup: closeEditPopup } = usePopupHandler();
  const { isOpen: isSettingsOpen, openPopup: openSettingsPopup, closePopup: closeSettingsPopup } = usePopupHandler();

  const fetchProject = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/project/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      const data = await response.json();
      console.log(`Project.tsx - fetchProject`);
      console.log(data);
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-kage-purple"></div>
      </div>
    );
  }

  if (!project) {
    return <p>Project not found.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <div className="flex space-x-2">
          <button
            onClick={openEditPopup}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Edit Project"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={openSettingsPopup}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Project Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
      <p className="text-lg text-muted-foreground mb-6">{project.description}</p>

      <EditProjectPopup
        isOpen={isEditOpen}
        onClose={closeEditPopup}
        project={project}
        onProjectUpdated={fetchProject}
      />

      <SettingsPopup
        isOpen={isSettingsOpen}
        onClose={closeSettingsPopup}
        projectId={project.id}
      />

      <TaskBoard tasks={project.tasks} />
    </div>
  );
}