import { useLocation, useNavigate } from 'react-router-dom';
import { TaskBoard } from '@/components/project/TaskBoard';
import { Button } from '@/components/ui/button';

export default function ProjectTaskBoard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { project } = location.state as { project: { project_name: string; tasks: any[] } };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{project.project_name}</h1>
        <Button variant="secondary" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </div>
      <TaskBoard tasks={project.tasks} />
    </div>
  );
}