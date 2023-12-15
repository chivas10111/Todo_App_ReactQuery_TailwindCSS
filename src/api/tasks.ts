import axios from 'axios';

export type TaskType = {
  userId?: number;
  id?: number;
  title?: string;
  completed?: boolean;
};

export function getTasks(userId?: number) {
  const url = userId
    ? `http://localhost:3000/users/${userId}/todos`
    : 'http://localhost:3000/todos';

  return axios.get<TaskType[]>(url).then((res) => res.data);
}

export function addTasks(newTask: TaskType): Promise<TaskType> {
  const url = 'http://localhost:3000/todos';

  return axios.post<TaskType>(url, newTask)
    .then((res) => res.data);
}

export function updateTasks(updatedTask: TaskType): Promise<TaskType> {
  const url = `http://localhost:3000/todos/${updatedTask.id}`;

  return axios.put<TaskType>(url, updatedTask).then((res) => res.data);
}

export function getTask(taskId?: number) {
  const url = `http://localhost:3000/todos/${taskId}`;

  return axios.get<TaskType>(url).then((res) => res.data);
}

export function deleteTask(taskId?: number) {
  const url = `http://localhost:3000/todos/${taskId}`;

  return axios.delete(url).then(() => {
    console.log(`Task with ID ${taskId} deleted successfully`);
  });
}



