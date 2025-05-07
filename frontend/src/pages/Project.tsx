import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TaskBoard } from '@/components/project/TaskBoard';
import { BACKEND_URL } from '@/data/Data';
import { usePopupHandler } from '@/hooks/usePopupHandler';
import { EditProjectPopup } from '@/components/project/EditProjectPopup';
import { IProject } from '@/data/Interfaces';
import { Edit, Settings, User } from 'lucide-react'; // Import the edit, settings, and user icons
import { SettingsPopup } from '@/components/project/SettingsPopup';
import { EmployeePopup } from '@/components/project/EmployeePopup';
import HttpHook from '@/hooks/HttpHook';

export default function Project() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isOpen: isEditOpen, openPopup: openEditPopup, closePopup: closeEditPopup } = usePopupHandler();
  const { isOpen: isSettingsOpen, openPopup: openSettingsPopup, closePopup: closeSettingsPopup } = usePopupHandler();
  const { isOpen: isEmployeePopupOpen, openPopup: openEmployeePopup, closePopup: closeEmployeePopup } = usePopupHandler();
  const { sendRequest } = HttpHook();

  const fetchProject = async () => {
    setLoading(true);
    try {
      const data = await sendRequest({
        method: 'get',
        url: `${BACKEND_URL}/project/${projectId}`,
      });
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
          <button
            onClick={openEmployeePopup}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Manage Employees"
          >
            <User className="h-5 w-5" />
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

      <EmployeePopup
        isOpen={isEmployeePopupOpen}
        onClose={closeEmployeePopup}
        projectId={project.id}
        employees={project.employees}
        onEmployeeUpdated={fetchProject}
      />

      <TaskBoard tasks={project.tasks} projectId={Number(projectId)} /> {/* Pass projectId */}
    </div>
  );
}