import { Popup } from '@/components/ui/Popup';
import { Button } from '@/components/ui/button';
import { useConfirmationPopup } from '@/hooks/useConfirmationPopup';
import { BACKEND_URL } from '@/data/Data';
import HttpHook from '@/hooks/HttpHook';

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

export function SettingsPopup({ isOpen, onClose, projectId }: SettingsPopupProps) {
  const { isOpen: isConfirmOpen, openPopup: openConfirmPopup, closePopup: closeConfirmPopup } = useConfirmationPopup();
  const { sendRequest } = HttpHook();

  const handleDelete = async () => {
    try {
      await sendRequest({
        method: 'delete',
        url: `${BACKEND_URL}/project/${projectId}/delete/`,
      });

      closeConfirmPopup();
      onClose();
      // Redirect to the projects list after deletion
      window.location.href = '/projects';
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <>
      <Popup isOpen={isOpen} onClose={onClose}>
        <h2 className="text-2xl font-bold mb-6 text-center">Project Settings</h2>
        <div className="space-y-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={openConfirmPopup}
          >
            Delete Project
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