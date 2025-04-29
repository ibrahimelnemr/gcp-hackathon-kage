import { Link } from 'react-router-dom';
import { ArrowRight, Terminal, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedGradientBackground } from '@/components/ui/animated-gradient-background';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Task {
  status: string;
  description: string;
  employee_name: string | null;
}

interface Project {
  project_name: string;
  project_description: string;
  tasks: Task[];
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching data from an API
    const fetchProjects = async () => {
      const mockData: Project[] = [
        {
          project_name: "Default Project",
          project_description:
            "Start Date: April 2025\nDevelop an AI agent that can extract text from a contract (word document) and compare it to a template. The AI agent must be able to compare the contract to the template and provide differences where the contract does not comply with the template and provide a proposal to the contract.\nPlatform: Azure OpenAI, Python backend, frontend.\nCloud: AWS. Requires AWS expertise for deployment and service integration.\nGoal: Demonstrable proof-of-concept for company to test.\nEnd Date: June 2025",
          tasks: [
            {
              status: "pending",
              description: "Prepare documentation and training materials for the proof-of-concept demonstration.",
              employee_name: "John Doe",
            },
            {
              status: "in-progress",
              description: "Develop the backend API to connect the frontend with the AI agent and AWS services.",
              employee_name: "Jane Smith"
            },
            {
              status: "completed",
              description: "Develop the frontend UI for user interaction and display of results.",
              employee_name: "Alice Johnson",
            },
            {
              status: "pending",
              description: "Integrate the AI agent with the AWS infrastructure.",
              employee_name: "Bob Brown"
            },
            {
              status: "in-progress",
              description: "Set up AWS infrastructure for the project (e.g., compute, storage, networking).",
              employee_name: "Charlie Green",
            },
            {
              status: "pending",
              description: "Develop the proposal generation functionality based on comparison results.",
              employee_name: "Diana White",
            },
            {
              status: "pending",
              description: "Design and implement the contract comparison logic against a template using Azure OpenAI.",
              employee_name: "Eve Black",
            },
            {
              status: "completed",
              description: "Develop text extraction functionality from Word documents using Azure OpenAI.",
              employee_name: "Frank Blue",
            },
          ],
        },
      ];
      setProjects(mockData);
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.project_name}`, { state: { project } });
  };

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
      </div>
    </div>
  );
}
