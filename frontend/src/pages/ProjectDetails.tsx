import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Task {
  status: string;
  description: string;
  employee_name: string | null;
  employee_level: string | null;
  employee_department: string | null;
}

export default function ProjectDetails() {
  const location = useLocation();
  const { project } = location.state as { project: { project_name: string; tasks: Task[] } };
  const [tasks, setTasks] = useState(project.tasks);

  const updateTaskStatus = (index: number, newStatus: string) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].status = newStatus;
    setTasks(updatedTasks);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{project.project_name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task, index) => (
          <Card key={index} className="bg-card border-border">
            <CardHeader>
              <CardTitle>{task.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Assigned to: {task.employee_name || "Unassigned"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Status: {task.status}
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => updateTaskStatus(index, "pending")}
                >
                  Mark as Pending
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => updateTaskStatus(index, "in-progress")}
                >
                  Mark as In Progress
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => updateTaskStatus(index, "completed")}
                >
                  Mark as Completed
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}