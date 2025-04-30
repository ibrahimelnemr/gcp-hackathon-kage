import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Terminal, Users, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedGradientBackground } from '@/components/ui/animated-gradient-background';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BACKEND_URL } from '@/data/Data';
import { TaskBoard } from '@/components/project/TaskBoard';
import { Task } from '@/data/Interfaces';

interface Project {
  project_name: string;
  project_description: string;
  tasks: Task[];
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project_id');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true); // Start loading
      try {
        const response = await fetch(`${BACKEND_URL}/project`);
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (project: Project) => {
    navigate(`/projects?project_id=${project.project_name}`);
  };

  const selectedProject = projects.find((project) => project.project_name === projectId);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Projects</h1>

        {loading ? (
          // Loading animation
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-kage-purple"></div>
          </div>
        ) : !projectId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                className="bg-kage-gray rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:border-kage-purple"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-kage-gray-900 mb-2">
                      {project.project_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {project.project_description} {/* Display up to 3 lines */}
                    </p>
                    <Button
                      variant="default"
                      className="w-full bg-kage-purple text-white hover:bg-kage-purple-dark transition-colors"
                      onClick={() => handleProjectClick(project)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          selectedProject && (
            <motion.div
              className="bg-kage-gray rounded-lg shadow-md p-8 border border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center text-muted-foreground mb-4 hover:text-kage-gray-900 transition-colors"
              >
                <ArrowLeft className="mr-2" /> {/* Back arrow icon */}
                Back to Projects
              </button>

              <h2 className="text-4xl font-bold text-kage-gray-900 mb-4">
                {selectedProject.project_name}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {selectedProject.project_description}
              </p>

              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">Tasks</h3>
                <TaskBoard tasks={selectedProject.tasks} />
              </div>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}
