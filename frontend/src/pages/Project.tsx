import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TaskBoard } from '@/components/project/TaskBoard';
import { BACKEND_URL } from '@/data/Data';
import { usePopupHandler } from '@/hooks/usePopupHandler';
import { EditProjectPopup } from '@/components/project/EditProjectPopup';
import { IProject } from '@/data/Interfaces';

export default function Project() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isOpen, openPopup, closePopup } = usePopupHandler();

  const fetchProject = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/project/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      console.log(`Project - response`);
      const data = await response.json();
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
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center text-muted-foreground mb-4 hover:text-kage-gray-900 transition-colors"
      >
        Back to Projects
      </button>

      <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
      <p className="text-lg text-muted-foreground mb-6">{project.description}</p>

      <Button onClick={openPopup}>Edit Project</Button>

      <EditProjectPopup
        isOpen={isOpen}
        onClose={closePopup}
        project={project}
        onProjectUpdated={fetchProject}
      />

      <TaskBoard tasks={project.tasks} />
    </div>
  );
}