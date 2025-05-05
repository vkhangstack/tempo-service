import { faker } from '@faker-js/faker';
import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { create } from 'zustand';

import userService, { SignInReq } from '@/api/services/userService';
import { getItem, removeItem, setItem } from '@/utils/storage';

import { UserInfo, UserToken } from '#/entity';
import { PermissionType, StorageEnum } from '#/enum';

const { VITE_APP_HOMEPAGE: HOMEPAGE } = import.meta.env;

type UserStore = {
  userInfo: Partial<UserInfo>;
  userToken: UserToken;
  //  actions action
  actions: {
    setUserInfo: (userInfo: UserInfo) => void;
    setUserToken: (token: UserToken) => void;
    clearUserInfoAndToken: () => void;
  };
};

const useUserStore = create<UserStore>((set) => ({
  userInfo: getItem<UserInfo>(StorageEnum.User) || {},
  userToken: getItem<UserToken>(StorageEnum.Token) || {},
  actions: {
    setUserInfo: (userInfo) => {
      set({ userInfo });
      setItem(StorageEnum.User, userInfo);
    },
    setUserToken: (userToken) => {
      set({ userToken });
      setItem(StorageEnum.Token, userToken);
    },
    clearUserInfoAndToken() {
      set({ userInfo: {}, userToken: {} });
      removeItem(StorageEnum.User);
      removeItem(StorageEnum.Token);
    },
  },
}));

export const useUserInfo = () => useUserStore((state) => state.userInfo);
export const useUserToken = () => useUserStore((state) => state.userToken);
export const useUserPermission = () => useUserStore((state) => state.userInfo.permissions);
export const useUserActions = () => useUserStore((state) => state.actions);

export const useSignIn = () => {
  const navigatge = useNavigate();
  const { message } = App.useApp();
  const { setUserToken, setUserInfo } = useUserActions();

  const signInMutation = useMutation({
    mutationFn: userService.signin,
  });

  const signIn = async (data: SignInReq) => {
    try {
      const res = await signInMutation.mutateAsync(data);
      const { user, accessToken, refreshToken } = res;
      setUserToken({ accessToken, refreshToken });
      setUserInfo({
        id: user.id.toString(),
        username: 'admin',
        email: faker.internet.email(),
        avatar: faker.image.avatarGitHub(),
        role: {
          id: '4281707933534332',
          name: 'Admin',
          label: 'admin',
          status: 1,
          order: 1,
          desc: 'Super Admin',
          permission: [],
        },
        permissions: [
          {
            id: '3981225257359246',
            parentId: '',
            label: 'sys.menu.calendar',
            name: 'Calendar',
            icon: 'solar:calendar-bold-duotone',
            type: PermissionType.MENU,
            route: 'calendar',
            component: '/sys/others/calendar/index.tsx',
          },
          {
            id: '3513985683886393',
            parentId: '',
            label: 'sys.menu.kanban',
            name: 'kanban',
            icon: 'solar:clipboard-bold-duotone',
            type: PermissionType.MENU,
            route: 'kanban',
            component: '/sys/others/kanban/index.tsx',
          },
        ],
      });
      navigatge(HOMEPAGE, { replace: true });
    } catch (err) {
      message.warning({
        content: err.message,
        duration: 3,
      });
    }
  };

  return signIn;
};

export default useUserStore;
