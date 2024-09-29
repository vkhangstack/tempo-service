import { Alert, Button, Drawer, Tooltip } from 'antd';
import Color from 'color';
import { CSSProperties, useMemo, useState } from 'react';

import { IconButton, Iconify, SvgIcon } from '@/components/icon';
import LocalePicker from '@/components/locale-picker';
import Logo from '@/components/logo';
import { useSettings } from '@/store/settingStore';
import { useResponsive, useThemeToken } from '@/theme/hooks';
import { getBytes, getMB } from '@/utils/buffer';
import { dateToTimestamps, formatDate } from '@/utils/date';
import { allStorage } from '@/utils/storage';

import AccountDropdown from '../_common/account-dropdown';
import BreadCrumb from '../_common/bread-crumb';
import { keyDataEvent } from '../_common/enum';
import NoticeButton from '../_common/notice';
import SearchBar from '../_common/search-bar';
import SettingButton from '../_common/setting-button';

import { NAV_COLLAPSED_WIDTH, NAV_WIDTH, HEADER_HEIGHT, OFFSET_HEADER_HEIGHT } from './config';
import Nav from './nav';

import { ThemeLayout } from '#/enum';

type Props = {
  className?: string;
  offsetTop?: boolean;
};
export default function Header({ className = '', offsetTop = false }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { themeLayout, breadCrumb } = useSettings();
  const { colorBgElevated, colorBorder, colorPrimary } = useThemeToken();
  const [warning, setWarning] = useState(false);
  const { screenMap } = useResponsive();

  const headerStyle: CSSProperties = {
    position: themeLayout === ThemeLayout.Horizontal ? 'relative' : 'fixed',
    borderBottom:
      themeLayout === ThemeLayout.Horizontal
        ? `1px dashed ${Color(colorBorder).alpha(0.6).toString()}`
        : '',
    backgroundColor: Color(colorBgElevated).alpha(1).toString(),
  };

  if (themeLayout === ThemeLayout.Horizontal) {
    headerStyle.width = '100vw';
  } else if (screenMap.md) {
    headerStyle.right = '0px';
    headerStyle.left = 'auto';
    headerStyle.width = `calc(100% - ${
      themeLayout === ThemeLayout.Vertical ? NAV_WIDTH : NAV_COLLAPSED_WIDTH
    }px)`;
  } else {
    headerStyle.width = '100vw';
  }

  const handleRefresh = () => {
    const dataLocal = localStorage.getItem(keyDataEvent);

    if (!dataLocal) {
      return;
    }

    const events: any[] = JSON.parse(dataLocal as string);

    // Sort events by 'start' date in descending order
    const sortedEvents = events.sort(
      (a, b) => dateToTimestamps(b.start) - dateToTimestamps(a.start),
    );

    // Group events by the 'start' date (formatted as yyyy-mm-dd)
    const groupedByDate = sortedEvents.reduce((acc, event) => {
      const eventDate = formatDate(event.start);
      if (!acc[eventDate]) {
        acc[eventDate] = [];
      }
      acc[eventDate].push(event);
      return acc;
    }, {});

    // Get the last 3 distinct days
    const lastThreeDays = Object.keys(groupedByDate).slice(0, 3);

    // Collect all events from the last 3 distinct days
    const result = lastThreeDays.flatMap((date) => groupedByDate[date]);

    localStorage.setItem(keyDataEvent, JSON.stringify(result));

    window.location.reload();
  };

  useMemo(() => {
    const items = allStorage();
    const bytes = getBytes(items as unknown as string);
    const mb = getMB(bytes);

    if (mb > 5 - 0.3) {
      setWarning(true);
    }
  }, []);

  return (
    <>
      <header className={`z-20 w-full ${className}`} style={headerStyle}>
        <div
          className="flex flex-grow items-center justify-between px-4 text-gray backdrop-blur xl:px-6 2xl:px-10"
          style={{
            height: offsetTop ? OFFSET_HEADER_HEIGHT : HEADER_HEIGHT,
            transition: 'height 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          }}
        >
          <div className="flex items-baseline">
            {themeLayout !== ThemeLayout.Horizontal ? (
              <IconButton onClick={() => setDrawerOpen(true)} className="h-10 w-10 md:hidden">
                <SvgIcon icon="ic-menu" size="24" />
              </IconButton>
            ) : (
              <Logo />
            )}
            <div className="ml-4 hidden md:block">{breadCrumb ? <BreadCrumb /> : null}</div>
          </div>

          <div className="flex">
            {warning && (
              <div className="group flex items-center justify-between gap-2 pr-4">
                <Alert
                  // description="Note: The application will retain your data for the last 3 days."
                  message="Storage space has exceeded the limit. Please clean up to continue using."
                  className="pr-20"
                />
                <Tooltip
                  title="The application will retain your data for the last 3 days."
                  color={colorPrimary}
                >
                  <Button className="h-full" onClick={handleRefresh}>
                    Refresh{' '}
                  </Button>
                </Tooltip>
              </div>
            )}
            <SearchBar />
            <LocalePicker />
            <IconButton
              className="cursor-pointer"
              onClick={() => window.open('https://phamvankhang.name.vn')}
            >
              <Tooltip title="✨ Author" color={colorPrimary}>
                <Iconify icon="openmoji:authority" size={24} />
              </Tooltip>
            </IconButton>

            {/* <span
                onClick={() => window.open('https://phamvankhang.name.vn')}
                className="absolute top-8 h-6 w-20 scale-0 cursor-pointer rounded bg-gray-400 p-1 text-xs text-gray-100 group-hover:scale-100"
              >
              </span> */}

            {/* <IconButton onClick={() => window.open('https://github.com/d3george/slash-admin')}>
              <Iconify icon="mdi:github" size={24} />
            </IconButton> */}
            {/* <IconButton onClick={() => window.open('https://discord.gg/fXemAXVNDa')}>
              <Iconify icon="carbon:logo-discord" size={24} />
            </IconButton> */}
            <NoticeButton />
            <SettingButton />
            <AccountDropdown />
          </div>
        </div>
      </header>
      <Drawer
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        closeIcon={false}
        styles={{
          header: {
            display: 'none',
          },
          body: {
            padding: 0,
            overflow: 'hidden',
          },
        }}
        width="auto"
      >
        <Nav closeSideBarDrawer={() => setDrawerOpen(false)} />
      </Drawer>
    </>
  );
}
