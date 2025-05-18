import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BACKEND_URL } from '@/data/Data';
import { IProject } from '@/data/Interfaces';
import HttpHook from '@/hooks/HttpHook';
import { useGitTokenCheck } from '@/hooks/useGitTokenCheck';
import { GitTokenError } from '@/components/github/GitTokenError';

export default function ProjectList() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { sendRequest } = HttpHook();
  const { tokenExists, loading: tokenLoading } = useGitTokenCheck();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await sendRequest({
        method: 'get',
        url: `${BACKEND_URL}/rest/projects`,
      });
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // if (tokenExists) {
    //   fetchProjects();
    // }
  }, [tokenExists]);

  if (tokenLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-kage-purple"></div>
      </div>
    );
  }

  if (!tokenExists) {
    return <GitTokenError />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Projects</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            className="rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {project.description ? project.description.split('\n')[0] : ''}
                </p>
                <Button variant="default" onClick={() => navigate(`/projects/${project.id}`)}>
                  View Details
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}