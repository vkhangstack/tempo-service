import { Button, Dropdown, MenuProps } from 'antd';
import dayjs from 'dayjs';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { IconButton, Iconify } from '@/components/icon';
import { useResponsive } from '@/theme/hooks';

export type HandleMoveArg = 'next' | 'prev' | 'today';
export type ViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
type ViewTypeMenu = {
  key: string;
  label: string;
  view: ViewType;
  icon: ReactNode;
};

type Props = {
  now: Date;
  view: ViewType;
  onMove: (action: HandleMoveArg) => void;
  onCreate: VoidFunction;
  onViewTypeChange: (view: ViewType) => void;
  onDailyTeams: () => void;
};
export default function CalendarHeader({
  now,
  view,
  onMove,
  onCreate,
  onViewTypeChange,
  onDailyTeams,
}: Props) {
  const { screenMap } = useResponsive();
  const { t } = useTranslation();
  const items = useMemo<ViewTypeMenu[]>(
    () => [
      {
        key: '1',
        label: 'Month',
        view: 'dayGridMonth',
        icon: <Iconify icon="mdi:calendar-month-outline" size={18} />,
      },
      {
        key: '2',
        label: 'Week',
        view: 'timeGridWeek',
        icon: <Iconify icon="mdi:calendar-weekend-outline" size={18} />,
      },
      {
        key: '3',
        label: 'Day',
        view: 'timeGridDay',
        icon: <Iconify icon="mdi:calendar-today-outline" size={18} />,
      },
      {
        key: '4',
        label: 'List',
        view: 'listWeek',
        icon: <Iconify icon="mdi:view-agenda-outline" size={18} />,
      },
    ],
    [],
  );

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const selectedViewType = items.find((item) => item.key === e.key)!;
    onViewTypeChange(selectedViewType.view);
  };

  const viewTypeMenu = (view: ViewType) => {
    const { icon, label } = items.find((item) => item.view === view)!;
    return (
      <div className="flex items-center">
        {icon}
        <span className="mx-1 !text-sm font-medium">{label}</span>
        <Iconify icon="solar:alt-arrow-down-outline" size={20} />
      </div>
    );
  };

  return (
    <div className="relative flex items-center justify-between py-5">
      {screenMap.lg && (
        <Dropdown menu={{ items, onClick: handleMenuClick }}>
          <Button type="text" size="small">
            {viewTypeMenu(view)}
          </Button>
        </Dropdown>
      )}

      <div className="flex cursor-pointer items-center justify-center">
        <IconButton>
          <Iconify icon="solar:alt-arrow-left-outline" onClick={() => onMove('prev')} size={20} />
        </IconButton>
        <span className="mx-2 text-base font-bold">{dayjs(now).format('DD MMM YYYY')}</span>
        <IconButton>
          <Iconify icon="solar:alt-arrow-right-outline" onClick={() => onMove('next')} size={20} />
        </IconButton>
      </div>

      <div className="flex items-center">
        <Button className="mr-2" type="primary" onClick={() => onDailyTeams()}>
          {t('calendar.event.dailyTeams')}
        </Button>

        <Button type="primary" onClick={() => onMove('today')}>
          {t('calendar.event.today')}
        </Button>
        <Button className="ml-2" type="primary" onClick={() => onCreate()}>
          <div className=" flex items-center justify-center">
            <Iconify icon="material-symbols:add" size={24} />
            {t('calendar.event.newEvent')}
          </div>
        </Button>
      </div>
    </div>
  );
}
