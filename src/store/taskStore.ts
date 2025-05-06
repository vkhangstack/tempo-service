import { useQuery } from '@tanstack/react-query';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { create } from 'zustand';

import taskService from '@/api/services/taskService';
import { getItem, removeItem, setItem } from '@/utils/storage';

import { useUserToken } from './userStore';

import { Task } from '#/entity';
import { StorageEnum } from '#/enum';

type TaskStore = {
  tasks: Task[];
  actions: {
    setTasks: (task: Task[]) => void;
    clearTasks: () => void;
  };
};

const useTaskStore = create<TaskStore>((set) => ({
  tasks: getItem<Task[]>(StorageEnum.Task) || [],
  actions: {
    setTasks: (tasks: Task[]) => {
      set({ tasks });
      setItem(StorageEnum.Task, tasks);
    },
    clearTasks(): void {
      removeItem(StorageEnum.Task);
    },
  },
}));
export const useTasks = () => useTaskStore((state) => state.tasks);
export const useTaskActions = () => useTaskStore((state) => state.actions);

export const useGetTask = () => {
  const navigatge = useNavigate();
  App.useApp();
  const { accessToken } = useUserToken();
  console.log('accessToken', accessToken);

  if (!accessToken) {
    navigatge('/login', { replace: true });
    return;
  }

  // eslint-disable-next-line consistent-return, react-hooks/rules-of-hooks
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async (): Promise<Array<Task>> => {
      return taskService.listTask(accessToken as string);
    },
  });

  // const { data, error, isLoading } = useQuery({
  //   queryKey: ['tasks'],
  //   queryFn: () => taskService.listTask(accessToken),
  // });

  // return data;

  // const getTasks = async () => {
  //   try {
  //     console.log('first');
  //     const res =  ;

  //     console.log('res', res);
  //   } catch (error) {
  //     message.warning({
  //       content: error.message,
  //       duration: 3,
  //     });
  //   }
  // };

  // return getTasks  ;
};
