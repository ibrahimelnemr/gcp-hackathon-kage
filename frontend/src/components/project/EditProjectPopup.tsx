import { useState } from 'react';
import { Popup } from '@/components/ui/Popup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BACKEND_URL } from '@/data/Data';
import { IProject } from '@/data/Interfaces';
import { useConfirmationPopup } from '@/hooks/useConfirmationPopup';
import HttpHook from '@/hooks/HttpHook';

interface EditProjectPopupProps {
  isOpen: boolean;
  onClose: () => void;
  project: IProject;
  onProjectUpdated: () => void;
}

export function EditProjectPopup({ isOpen, onClose, project, onProjectUpdated }: EditProjectPopupProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const { sendRequest } = HttpHook();
 
  const handleSave = async () => {
    try {
      await sendRequest({
        method: 'patch',
        url: `${BACKEND_URL}/rest/projects/${project.id}/`,
        body: { name, description },
      });

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