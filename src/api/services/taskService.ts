import apiClient from '../apiClient';

import { Task } from '#/entity';

export enum TaskApi {
  Task = '/v1/daily/task',
}

const listTask = (token: string) =>
  apiClient.get<Task[]>({
    url: TaskApi.Task,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

const createTask = (payload: Task & { content: string }, token: string) => {
  return apiClient.post({
    url: TaskApi.Task,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: payload,
  });
};

const updateTask = (payload: Task & { content: string }, token: string) => {
  return apiClient.put({
    url: TaskApi.Task,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: payload,
  });
};

const deleteTask = (taskId: string, token: string) => {
  return apiClient.delete({
    url: `${TaskApi.Task}/${taskId}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export default {
  listTask,
  createTask,
  updateTask,
  deleteTask,
};
