import { useState } from 'react';
import { Popup } from '@/components/ui/Popup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BACKEND_URL } from '@/data/Data';
import { IProject } from '@/data/Interfaces';

interface EditProjectPopupProps {
  isOpen: boolean;
  onClose: () => void;
  project: IProject;
  onProjectUpdated: () => void;
}

export function EditProjectPopup({ isOpen, onClose, project, onProjectUpdated }: EditProjectPopupProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);

  const handleSave = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/rest/projects/${project.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) throw new Error('Failed to update project');

      onProjectUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-6 text-center">Edit Project</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Project Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Project Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter project description"
            className="w-full"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Employees</h3>
          <ul className="space-y-2">
            {project.employees.map((employee) => (
              <li
                key={employee.id}
                className="p-3 border rounded-md bg-gray-100 dark:bg-gray-800"
              >
                <p className="font-medium">{employee.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {employee.level} - {employee.department}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={handleSave}>
          Save
        </Button>
      </div>
    </Popup>
  );
}