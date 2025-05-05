export interface ITask {
    task_id: number;
    description: string;
    status: "to-do" | "in-progress" | "done";
    employee_name: string;
  }
  

export interface IProject {
  id: number;
  name: string;
  description: string;
  tasks?: any[];
  employees?: any[];
}
