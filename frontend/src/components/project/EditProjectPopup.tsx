import { useState } from 'react';
import { Popup } from '@/components/ui/Popup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BACKEND_URL } from '@/data/Data';

interface EditProjectPopupProps {
  isOpen: boolean;
  onClose: () => void;
  project: { id: number; name: string; description: string };
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
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </div>
    </Popup>
  );
}