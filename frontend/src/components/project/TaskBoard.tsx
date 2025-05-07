import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Clock, CheckCircle, Circle, Edit } from 'lucide-react';
import { ITask } from '@/data/Interfaces';
import { usePopupHandler } from '@/hooks/usePopupHandler';
import { TaskEditPopup } from './TaskEditPopup';
import { BACKEND_URL } from '@/data/Data';
import HttpHook from '@/hooks/HttpHook';

interface TaskBoardProps {
  tasks: ITask[];
  projectId: number; 
}

export function TaskBoard({ tasks: initialTasks, projectId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<ITask[]>(initialTasks);
  const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null); // Track the loading state for a specific task
  const { isOpen: isEditTaskOpen, openPopup: openEditTaskPopup, closePopup: closeEditTaskPopup } = usePopupHandler();
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const { sendRequest } = HttpHook();

  const fetchTasks = async () => {
    try {
      const data = await sendRequest({
        method: 'get',
        url: `${BACKEND_URL}/project/${projectId}/tasks/`,
      });

      // Ensure tasks have an `id` field
      const mappedTasks = data.map((task: any) => ({
        task_id: task.task_id, // Ensure task_id is mapped correctly
        description: task.description,
        status: task.status,
        employee_name: task.employee_name,
        employee_id: task.employee_id,
      }));

      setTasks(mappedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const moveTask = async (taskId: number, direction: 'forward' | 'backward') => {
    const task = tasks.find((t) => t.task_id === taskId);
    if (!task) return;

    let newStatus = task.status;
    if (direction === 'forward') {
      if (task.status === 'to-do') newStatus = 'in-progress';
      else if (task.status === 'in-progress') newStatus = 'done';
    } else if (direction === 'backward') {
      if (task.status === 'done') newStatus = 'in-progress';
      else if (task.status === 'in-progress') newStatus = 'to-do';
    }

    try {
      setLoadingTaskId(taskId); // Set the loading state for the task
      await sendRequest({
        method: 'patch',
        url: `${BACKEND_URL}/tasks/${taskId}/update/`,
        body: { status: newStatus },
      });
      fetchTasks(); // Refresh tasks after updating
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setLoadingTaskId(null); // Clear the loading state
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <Circle className="h-4 w-4 mr-2 text-yellow-500" />
            To Do ({tasks.filter((task) => task.status === 'to-do').length})
          </h3>
          {tasks
            .filter((task) => task.status === 'to-do')
            .map((task) => (
              <Card key={task.task_id} className="bg-background border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500">
                      Task #{task.task_id}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveTask(task.task_id, 'forward')}
                        className="h-8 w-8"
                        disabled={loadingTaskId === task.task_id} // Disable button while loading
                      >
                        {loadingTaskId === task.task_id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-yellow-500"></div>
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTask(task);
                          openEditTaskPopup();
                        }}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">{task.description}</p>
                  <div className="text-xs text-muted-foreground">{task.employee_name || 'Unassigned'}</div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* In Progress Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <Clock className="h-4 w-4 mr-2 text-blue-500" />
            In Progress ({tasks.filter((task) => task.status === 'in-progress').length})
          </h3>
          {tasks
            .filter((task) => task.status === 'in-progress')
            .map((task) => (
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
                        onClick={() => moveTask(task.task_id, 'backward')}
                        className="h-8 w-8"
                        disabled={loadingTaskId === task.task_id} // Disable button while loading
                      >
                        {loadingTaskId === task.task_id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                        ) : (
                          <ChevronLeft className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveTask(task.task_id, 'forward')}
                        className="h-8 w-8"
                        disabled={loadingTaskId === task.task_id} // Disable button while loading
                      >
                        {loadingTaskId === task.task_id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTask(task);
                          openEditTaskPopup();
                        }}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">{task.description}</p>
                  <div className="text-xs text-muted-foreground">{task.employee_name || 'Unassigned'}</div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Done Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            Done ({tasks.filter((task) => task.status === 'done').length})
          </h3>
          {tasks
            .filter((task) => task.status === 'done')
            .map((task) => (
              <Card key={task.task_id} className="bg-background border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                      Task #{task.task_id}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveTask(task.task_id, 'backward')}
                        className="h-8 w-8"
                        disabled={loadingTaskId === task.task_id} // Disable button while loading
                      >
                        {loadingTaskId === task.task_id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
                        ) : (
                          <ChevronLeft className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTask(task);
                          openEditTaskPopup();
                        }}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">{task.description}</p>
                  <div className="text-xs text-muted-foreground">{task.employee_name || 'Unassigned'}</div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Task Edit Popup */}
      {selectedTask && (
        <TaskEditPopup
          isOpen={isEditTaskOpen}
          onClose={closeEditTaskPopup}
          task={selectedTask}
          projectId={projectId}
          onTaskUpdated={fetchTasks}
        />
      )}
    </div>
  );
}
