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

export default {
  listTask,
};
