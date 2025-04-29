import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Terminal, Users, MessageSquare } from 'lucide-react';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project_id');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/project`);
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (project: Project) => {
    navigate(`/projects?project_id=${project.project_name}`);
  };

  const selectedProject = projects.find((project) => project.project_name === projectId);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };
  
  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Project Management",
      description: "Build your dream team and get AI-powered task assignments.",
      path: "/project-manager",
      color: "bg-kage-purple"
    },
    {
      icon: <Terminal className="h-6 w-6" />,
      title: "Code Assistant",
      description: "Analyze and optimize your code with advanced AI guidance.",
      //path: "/code-assistant",
      path: "https://console.cloud.google.com/vertex-ai/studio/multimodal?endpointId=7663865425947525120&region=us-central1&cloudshell=true&invt=AbuvLg&project=nse-gcp-ema-tt-ec0b4-sbx-1&pli=1",
      color: "bg-kage-accent"
    },
    // {
    //   icon: <MessageSquare className="h-6 w-6" />,
    //   title: "AI Chat",
    //   description: "Get real-time answers to technical questions from KAGE.",
    //   path: "/ai-chat",
    //   color: "bg-kage-purple-light"
    // }
  ];

  return (
    <div className="flex flex-col min-h-screen">

      {/* Projects Section */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Projects</h1>

        {!projectId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                className="bg-kage-gray rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{project.project_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {project.project_description.split("\n")[0]} {/* Display first line */}
                    </p>
                    <Button
                      variant="default"
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
            <div>
              <h2 className="text-2xl font-bold mb-4">{selectedProject.project_name}</h2>
              <p className="mb-4">{selectedProject.project_description}</p>
              <TaskBoard tasks={selectedProject.tasks} />
              <Button variant="secondary" onClick={() => navigate('/projects')}>
                Back to Projects
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
