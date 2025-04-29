import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Clock, CheckCircle, Circle } from 'lucide-react';

interface Task {
  task_id: number;
  description: string;
  status: "to-do" | "in-progress" | "done";
  employee_name: string;
}

interface TaskBoardProps {
  tasks: Task[];
}

export function TaskBoard({ tasks: initialTasks }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Move task to next status
  const moveTaskForward = (taskId: number) => {
    setTasks(currentTasks =>
      currentTasks.map(task => {
        if (task.task_id === taskId) {
          if (task.status === "to-do") return { ...task, status: "in-progress" };
          if (task.status === "in-progress") return { ...task, status: "done" };
        }
        return task;
      })
    );
  };

  // Move task to previous status
  const moveTaskBackward = (taskId: number) => {
    setTasks(currentTasks =>
      currentTasks.map(task => {
        if (task.task_id === taskId) {
          if (task.status === "done") return { ...task, status: "in-progress" };
          if (task.status === "in-progress") return { ...task, status: "to-do" };
        }
        return task;
      })
    );
  };

  // Filter tasks by status
  const todoTasks = tasks.filter(task => task.status === "to-do");
  const inProgressTasks = tasks.filter(task => task.status === "in-progress");
  const doneTasks = tasks.filter(task => task.status === "done");

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <Circle className="h-4 w-4 mr-2 text-yellow-500" />
            To Do ({todoTasks.length})
          </h3>
          {todoTasks.map(task => (
            <Card key={task.task_id} className="bg-background border-gray-700">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500">
                    Task #{task.task_id}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveTaskForward(task.task_id)}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">{task.description}</p>
                <div className="text-xs text-muted-foreground">{task.employee_name}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* In Progress Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <Clock className="h-4 w-4 mr-2 text-blue-500" />
            In Progress ({inProgressTasks.length})
          </h3>
          {inProgressTasks.map(task => (
            <Card key={task.task_id} className="bg-background border-gray-700">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">
                    Task #{task.task_id}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveTaskBackward(task.task_id)}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveTaskForward(task.task_id)}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">{task.description}</p>
                <div className="text-xs text-muted-foreground">{task.employee_name}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Done Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            Done ({doneTasks.length})
          </h3>
          {doneTasks.map(task => (
            <Card key={task.task_id} className="bg-background border-gray-700">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                    Task #{task.task_id}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveTaskBackward(task.task_id)}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">{task.description}</p>
                <div className="text-xs text-muted-foreground">{task.employee_name}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
