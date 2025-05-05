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
        body: JSON.stringify({ name: name, description: description }),
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
      <h2 className="text-xl font-bold mb-4">Edit Project</h2>
      <div className="space-y-4">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project Name" />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Project Description"
        />
      </div>
      <div className="mt-4 flex justify-end space-x-2">
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