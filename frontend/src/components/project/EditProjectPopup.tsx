import { useState } from 'react';
import { Popup } from '@/components/ui/Popup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BACKEND_URL } from '@/data/Data';
import { IProject } from '@/data/Interfaces';
import { useConfirmationPopup } from '@/hooks/useConfirmationPopup';

interface EditProjectPopupProps {
  isOpen: boolean;
  onClose: () => void;
  project: IProject;
  onProjectUpdated: () => void;
}

export function EditProjectPopup({ isOpen, onClose, project, onProjectUpdated }: EditProjectPopupProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const { isOpen: isConfirmOpen, openPopup: openConfirmPopup, closePopup: closeConfirmPopup } = useConfirmationPopup();

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

  const handleDelete = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/project/${project.id}/delete/`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete project');

      closeConfirmPopup();
      onClose();
      // Optionally, redirect to the projects list after deletion
      window.location.href = '/projects';
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <>
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
        <div className="mt-6 flex justify-between space-x-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={openConfirmPopup}>
            Delete Project
          </Button>
          <Button variant="secondary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </Popup>

      {/* Confirmation Popup */}
      <Popup isOpen={isConfirmOpen} onClose={closeConfirmPopup}>
        <h2 className="text-xl font-bold mb-4 text-center">Confirm Deletion</h2>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Are you sure you want to delete this project? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={closeConfirmPopup}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Popup>
    </>
  );
}