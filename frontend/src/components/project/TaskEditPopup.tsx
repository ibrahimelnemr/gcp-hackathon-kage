import { Popup } from '@/components/ui/Popup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BACKEND_URL } from '@/data/Data';
import { ITask } from '@/data/Interfaces';
import { useEffect, useState } from 'react';

interface TaskEditPopupProps {
  isOpen: boolean;
  onClose: () => void;
  task: ITask;
  projectId: number;
  onTaskUpdated: () => void;
}

export function TaskEditPopup({ isOpen, onClose, task, projectId, onTaskUpdated }: TaskEditPopupProps) {
  const [description, setDescription] = useState(task.description);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(task.employee_id || null);
  const [employees, setEmployees] = useState<{ id: number; name: string }[]>([]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/project/${projectId}/employees/list/`);
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();

      // Ensure the response is an array
      if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        console.error('Unexpected response format for employees:', data);
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  const handleSave = async () => {
    try {
      await fetch(`${BACKEND_URL}/tasks/${task.task_id}/update/`, {  // Correct URL
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          employee_id: selectedEmployee,
        }),
      });
      onTaskUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4 text-center text-foreground">Edit Task</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">Task Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            className="w-full bg-card text-card-foreground border border-border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">Assign to Employee</label>
          <select
            value={selectedEmployee || ''}
            onChange={(e) => setSelectedEmployee(Number(e.target.value))}
            className="w-full bg-card text-card-foreground border border-border rounded-md p-2"
          >
            <option value="">Unassigned</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="default" onClick={handleSave}>
          Save
        </Button>
      </div>
    </Popup>
  );
}