import { Popup } from '@/components/ui/Popup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConfirmationPopup } from '@/hooks/useConfirmationPopup';
import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { BACKEND_URL } from '@/data/Data';
import { usePopupHandler } from '@/hooks/usePopupHandler';
import HttpHook from '@/hooks/HttpHook';

interface EmployeePopupProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  employees: { id: number; name: string; level: string; department: string; email: string }[];
  onEmployeeUpdated: () => void;
}

export function EmployeePopup({ isOpen, onClose, projectId, employees, onEmployeeUpdated }: EmployeePopupProps) {
  const { isOpen: isConfirmOpen, openPopup: openConfirmPopup, closePopup: closeConfirmPopup } = useConfirmationPopup();
  const { isOpen: isAddEmployeeOpen, openPopup: openAddEmployeePopup, closePopup: closeAddEmployeePopup } = usePopupHandler();
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const { sendRequest } = HttpHook();

  const handleRemoveEmployee = async () => {
    try {
      await sendRequest({
        method: 'delete',
        url: `${BACKEND_URL}/project/${projectId}/employees/${selectedEmployee}/remove/`,
      });

      closeConfirmPopup();
      onEmployeeUpdated();
    } catch (error) {
      console.error('Error removing employee:', error);
    }
  };

  const handleAddEmployee = async (employeeData: { name: string; level: string; department: string; email: string }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/project/${projectId}/employees/add/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) throw new Error('Failed to add employee');

      closeAddEmployeePopup();
      onEmployeeUpdated();
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  return (
    <>
      <Popup isOpen={isOpen} onClose={onClose}>
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Manage Employees</h2>
        <ul className="space-y-4">
          {employees.map((employee) => (
            <li
              key={employee.id}
              className="flex justify-between items-center p-3 border border-border rounded-md bg-card text-card-foreground"
            >
              <div>
                <p className="font-medium">{employee.name}</p>
                <p className="text-sm text-muted-foreground">
                  {employee.level} - {employee.department} - {employee.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedEmployee(employee.id);
                  openConfirmPopup();
                }}
                className="p-2 rounded-full bg-destructive hover:bg-destructive/80 text-white transition-colors"
                aria-label="Remove Employee"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
        <Button
          variant="secondary"
          className="w-full mt-4"
          onClick={openAddEmployeePopup}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Employee
        </Button>
      </Popup>

      {/* Confirmation Popup */}
      <Popup isOpen={isConfirmOpen} onClose={closeConfirmPopup}>
        <h2 className="text-xl font-bold mb-4 text-center text-foreground">Confirm Removal</h2>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Are you sure you want to remove this employee from the project?
        </p>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={closeConfirmPopup}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRemoveEmployee}>
            Remove
          </Button>
        </div>
      </Popup>

      {/* Add Employee Popup */}
      <Popup isOpen={isAddEmployeeOpen} onClose={closeAddEmployeePopup}>
        <h2 className="text-xl font-bold mb-4 text-center text-foreground">Add Employee</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            handleAddEmployee({
              name: formData.get('name') as string,
              level: formData.get('level') as string,
              department: formData.get('department') as string,
              email: formData.get('email') as string,
            });
          }}
        >
          <div className="space-y-4">
            <Input name="name" placeholder="Name" required className="w-full bg-card text-card-foreground border border-border rounded-md p-2" />
            <Input name="level" placeholder="Level (e.g., Senior Consultant)" required className="w-full bg-card text-card-foreground border border-border rounded-md p-2" />
            <Input name="department" placeholder="Department" required className="w-full bg-card text-card-foreground border border-border rounded-md p-2" />
            <Input name="email" type="email" placeholder="Email" required className="w-full bg-card text-card-foreground border border-border rounded-md p-2" />
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <Button variant="outline" onClick={closeAddEmployeePopup}>
              Cancel
            </Button>
            <Button variant="default" type="submit">
              Add
            </Button>
          </div>
        </form>
      </Popup>
    </>
  );
}