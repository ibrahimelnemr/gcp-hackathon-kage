export interface Task {
    task_id: number;
    description: string;
    status: "to-do" | "in-progress" | "done";
    employee_name: string;
  }
  