import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { Menu, MenuProps } from 'antd';
import Color from 'color';
import { m } from 'framer-motion';
// eslint-disable-next-line import/no-unresolved
import packageApp from 'package.json';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { useLocation, useMatches, useNavigate } from 'react-router-dom';

import MotionContainer from '@/components/animate/motion-container';
import { varSlide } from '@/components/animate/variants';
import Logo from '@/components/logo';
import Scrollbar from '@/components/scrollbar';
import { useRouteToMenuFn, usePermissionRoutes, useFlattenedRoutes } from '@/router/hooks';
import { menuFilter } from '@/router/utils';
import { useSettingActions, useSettings } from '@/store/settingStore';
import { useThemeToken } from '@/theme/hooks';

import { NAV_COLLAPSED_WIDTH, NAV_WIDTH } from './config';

import { ThemeLayout } from '#/enum';

const slideInLeft = varSlide({ distance: 10 }).inLeft;

type Props = {
  closeSideBarDrawer?: () => void;
};
export default function Nav(props: Props) {
  const navigate = useNavigate();
  const matches = useMatches();
  const { pathname } = useLocation();

  const { colorPrimary, colorTextBase, colorBgElevated, colorBorder } = useThemeToken();
  const settings = useSettings();
  const { themeLayout } = settings;
  const { setSettings } = useSettingActions();

  const menuStyle: CSSProperties = {
    background: colorBgElevated,
  };

  const routeToMenuFn = useRouteToMenuFn();
  const permissionRoutes = usePermissionRoutes();
  const menuList = useMemo(() => {
    const menuRoutes = menuFilter(permissionRoutes);
    return routeToMenuFn(menuRoutes);
  }, [routeToMenuFn, permissionRoutes]);

  const flattenedRoutes = useFlattenedRoutes();

  /**
   * state
   */
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [menuMode, setMenuMode] = useState<MenuProps['mode']>('inline');

  useEffect(() => {
    if (themeLayout === ThemeLayout.Vertical) {
      const openKeys = matches
        .filter((match) => match.pathname !== '/')
        .map((match) => match.pathname);
      setOpenKeys(openKeys);
    }
  }, [matches, themeLayout]);

  useEffect(() => {
    if (themeLayout === ThemeLayout.Vertical) {
      setCollapsed(false);
      setMenuMode('inline');
    }
    if (themeLayout === ThemeLayout.Mini) {
      setCollapsed(true);
      setMenuMode('inline');
    }
  }, [themeLayout]);

  /**
   * events
   */
  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    setOpenKeys(keys);
  };
  const onClick: MenuProps['onClick'] = ({ key }) => {
    const nextLink = flattenedRoutes?.find((el) => el.key === key);

    if (nextLink?.hideTab && nextLink?.frameSrc) {
      window.open(nextLink?.frameSrc, '_blank');
      return;
    }

    navigate(key);
    props?.closeSideBarDrawer?.();
  };

  const setThemeLayout = (themeLayout: ThemeLayout) => {
    setSettings({
      ...settings,
      themeLayout,
    });
  };

  const toggleCollapsed = () => {
    if (!collapsed) {
      setThemeLayout(ThemeLayout.Mini);
    } else {
      setThemeLayout(ThemeLayout.Vertical);
    }
    setCollapsed(!collapsed);
  };

  return (
    <div
      className="flex h-full flex-col"
      style={{
        width: collapsed ? NAV_COLLAPSED_WIDTH : NAV_WIDTH,
        borderRight: `1px dashed ${Color(colorBorder).alpha(0.6).toString()}`,
      }}
    >
      <div className="relative flex h-20 items-center justify-center py-4">
        <MotionContainer className="flex items-center">
          <Logo />
          {themeLayout !== ThemeLayout.Mini && (
            <m.div variants={slideInLeft}>
              <span className="ml-2 text-xl font-bold" style={{ color: colorPrimary }}>
                Tempo Service
              </span>
            </m.div>
          )}
        </MotionContainer>
        <button
          onClick={toggleCollapsed}
          className="absolute right-0 top-7 z-50 hidden h-6 w-6 translate-x-1/2 cursor-pointer select-none rounded-full text-center !text-gray md:block"
          style={{ color: colorTextBase, borderColor: colorTextBase, fontSize: 16 }}
        >
          {collapsed ? <MenuUnfoldOutlined size={20} /> : <MenuFoldOutlined size={20} />}
        </button>
      </div>

      <Scrollbar
        style={{
          height: 'calc(100vh - 70px)',
        }}
      >
        {/* <!-- Sidebar Menu --> */}
        <Menu
          mode={menuMode}
          items={menuList}
          className="h-full !border-none"
          defaultOpenKeys={openKeys}
          defaultSelectedKeys={[pathname]}
          selectedKeys={[pathname]}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          onClick={onClick}
          style={menuStyle}
          inlineCollapsed={collapsed}
        />
      </Scrollbar>
      {!collapsed && (
        <span
          className="w-64bg-none absolute bottom-0 left-0 p-6 text-left font-serif text-sm"
          style={{ color: colorPrimary }}
        >
          Version: {packageApp.version}
        </span>
      )}
    </div>
  );
}
