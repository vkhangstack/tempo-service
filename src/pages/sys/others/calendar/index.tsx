import { faker } from '@faker-js/faker';
import { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
//  fullcalendar plugins
import dayGridPlugin from '@fullcalendar/daygrid'; //  dayGridMonth, dayGridWeek, dayGridDay, dayGrid
import interactionPlugin from '@fullcalendar/interaction'; //  click select drag action
import listPlugin from '@fullcalendar/list'; // listWeek view
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'; // timeGridWeek, timeGridDay, timeGrid
import { Modal } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import taskService from '@/api/services/taskService';
import Card from '@/components/card';
import { useCopyToClipboard } from '@/hooks/event/use-copy-to-clipboard';
import { useSettings } from '@/store/settingStore';
import { useTaskActions, useTasks } from '@/store/taskStore';
import { useUserToken } from '@/store/userStore';
import { useResponsive } from '@/theme/hooks';

import CalendarEvent from './calendar-event';
import CalendarEventForm, { CalendarEventFormFieldType } from './calendar-event-form';
import CalendarHeader, { HandleMoveArg, ViewType } from './calendar-header';
import { StyledCalendar } from './styles';

const DefaultEventInitValue = {
  id: faker.string.uuid(),
  title: '',
  description: '',
  allDay: false,
  start: dayjs(),
  end: dayjs(),
  color: '',
  isDaily: false,
};
export default function Calendar() {
  const fullCalendarRef = useRef<FullCalendar>(null);
  const [view, setView] = useState<ViewType>('dayGridMonth');
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [dailyTeams, setDailyTeams] = useState(false);
  const [eventInitValue, setEventInitValue] =
    useState<CalendarEventFormFieldType>(DefaultEventInitValue);
  const [eventFormType, setEventFormType] = useState<'add' | 'edit'>('add');
  const [quillFull, setQuillFull] = useState('');
  const [textCopy, setTextCopy] = useState('');
  const { copyFn } = useCopyToClipboard();

  const { themeMode } = useSettings();
  const { screenMap } = useResponsive();
  const { accessToken } = useUserToken();
  const { setTasks } = useTaskActions();
  const tasks = useTasks();
  useEffect(() => {
    if (screenMap.xs) {
      setView('listWeek');
    }
  }, [screenMap]);

  const getListTask = () => {
    if (!accessToken) {
      return;
    }
    taskService
      .listTask(accessToken as string)
      .then((res) => {
        if (!res || res.length === 0) {
          return;
        }
        const newData: any[] = res?.map((item: any) => {
          return {
            // ...item,
            id: String(item.id),
            title: item.title,
            allDay: item.allDay,
            color: item?.textColor as string,
            description: item.content,
            start: dayjs(item.start).toDate(),
            end: dayjs(item.end).toDate(),
            isDaily: item.isDaily,
            // backgroundColor: '#fff',
            // textColor: item?.backgroundColor as string,
            // backgroundColor: undefined,
          };
        });
        setTasks(newData);
      })
      .catch((err) => {
        console.error(err);
      });
  };
  /** TODO: Đại đại đi rồi refactor cho clean */
  useEffect(() => {
    getListTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  /**
   * calendar header events
   */
  const handleMove = (action: HandleMoveArg) => {
    const calendarApi = fullCalendarRef.current!.getApi();
    switch (action) {
      case 'prev':
        calendarApi.prev();
        break;
      case 'next':
        calendarApi.next();
        break;
      case 'today':
        calendarApi.today();
        break;
      default:
        break;
    }
    setDate(calendarApi.getDate());
  };
  const handleDailyTeams = () => {
    // Lấy task hôm qua và hôm nay
    let titleFirst = '𝗬𝗲𝘀𝘁𝗲𝗿𝗱𝗮𝘆:';
    const taskYesterday = tasks.find((item) => {
      if (!item?.start) {
        return '';
      }
      if (dayjs().day() === 1) {
        // Nếu hôm nay là thứ 2 thì lấy thứ 6 tuần trước
        // return dayjs(item?.start).isSame(dayjs().subtract(3, 'day'), 'day') && item.title === 'daily';
        titleFirst = '𝗟𝗮𝘀𝘁 𝗙𝗿𝗶𝗱𝗮𝘆:';
        return (
          dayjs(item?.start).isSame(dayjs().subtract(3, 'day'), 'day') && item.title === 'daily'
        );
      }

      return dayjs(item?.start).isSame(dayjs().subtract(1, 'day'), 'day') && item.title === 'daily';
    });

    const taskToday = tasks.find((item) => {
      return dayjs(item?.start).isSame(dayjs(), 'day') && item.title === 'daily';
    });

    const content = `<p><strong>Yesterday:</strong></p>${
      taskYesterday
        ? `${
            taskYesterday?.description?.startsWith('<ul><li>')
              ? taskYesterday?.description
              : `<ul><li>${taskYesterday?.description}</li></ul>`
          }`
        : '<ul><li>No tasks found</li></ul>'
    }<p><strong>Today:</strong></p>${
      taskToday
        ? `${
            taskToday?.description?.startsWith('<ul><li>')
              ? taskToday?.description
              : `<ul><li>${taskToday?.description}</li></ul>`
          }`
        : '<ul><li>No tasks found</li></ul>'
    }`;

    const tmp = `${titleFirst}
    ${taskYesterday?.description
      ?.split(/<li>(.*?)<\/li>/g)
      .filter((item) => item !== '' && item !== '<ul>' && item !== '</ul>')
      .map((item) => `- ${item}`)
      .join(
        `
    `,
      )
      .replaceAll('- </ul>', '')
      .replaceAll('- <ul>', '')}}
𝗧𝗼𝗱𝗮𝘆:
    ${taskToday?.description
      ?.split(/<li>(.*?)<\/li>/g)
      .filter((item) => item !== '' && item !== '<ul>' && item !== '</ul>')
      .map((item) => `- ${item}`)
      .join(
        `
    `,
      )
      .replaceAll('- </ul>', '')
      .replaceAll('- <ul>', '')}`;
    setQuillFull(content);
    setTextCopy(tmp);
    setDailyTeams(true);
  };
  const handleViewTypeChange = (view: ViewType) => {
    setView(view);
  };

  useLayoutEffect(() => {
    const calendarApi = fullCalendarRef.current!.getApi();
    setTimeout(() => {
      calendarApi.changeView(view);
    });
  }, [view]);

  /**
   * calendar grid events
   */
  // select date range
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear date selection
    setOpen(true);
    setEventFormType('add');
    setEventInitValue({
      id: faker.string.uuid(),
      title: '',
      description: '',
      start: dayjs(selectInfo.startStr),
      end: dayjs(selectInfo.endStr),
      allDay: selectInfo.allDay,
      isDaily: false,
    });
  };

  /**
   * calendar event events
   */
  // click event and open modal
  const handleEventClick = (arg: EventClickArg) => {
    const { title, extendedProps, allDay, start, end, backgroundColor, id } = arg.event;
    setOpen(true);
    setEventFormType('edit');
    const newEventValue: CalendarEventFormFieldType = {
      id,
      title,
      allDay,
      color: backgroundColor,
      description: extendedProps.description,
      isDaily: extendedProps.isDaily,
    };
    if (start) {
      newEventValue.start = dayjs(start);
    }

    if (end) {
      newEventValue.end = dayjs(end);
    }
    setEventInitValue(newEventValue);
  };
  const handleCancel = () => {
    setEventInitValue(DefaultEventInitValue);
    setOpen(false);
    setEventFormType('add');
  };
  // edit event
  const handleEdit = (values: CalendarEventFormFieldType, token?: string) => {
    const { id, title = '', description, start, end, allDay = false, color, isDaily } = values;
    const calendarApi = fullCalendarRef.current!.getApi();
    const oldEvent = calendarApi.getEventById(id);

    const newEvent: any = {
      id,
      title,
      allDay,
      color,
      extendedProps: {
        description,
        isDaily,
      },
    };
    if (start) newEvent.start = start.toDate();
    if (end) newEvent.end = end.toDate();

    oldEvent?.remove();
    calendarApi.addEvent(newEvent);

    taskService
      .updateTask(
        {
          id: values.id,
          title,
          content: description ?? '',
          start: newEvent.start as any,
          end: newEvent.end as any,
          allDay,
          textColor: color as string,
          backgroundColor: '#ffffff',
          isDaily,
          token,
        },
        accessToken as string,
      )
      .then(() => {
        getListTask();
      })
      .catch((err) => console.error(err));
  };
  // create event
  const handleCreate = (values: CalendarEventFormFieldType, token?: string) => {
    const calendarApi = fullCalendarRef.current!.getApi();
    const { title = '', description, start, end, allDay = false, color, isDaily } = values;

    const newEvent: EventInput = {
      id: faker.string.uuid(),
      title,
      allDay,
      color,
      extendedProps: {
        description,
        isDaily,
      },
    };
    if (start) newEvent.start = start.toDate();
    if (end) newEvent.end = end.toDate();

    /** TODO: Đại đại đi rồi refactor cho clean */
    taskService
      .createTask(
        {
          title,
          content: description ?? '',
          start: start as any,
          end: end as any,
          allDay,
          textColor: color as string,
          backgroundColor: '#ffffff',
          isDaily,
          token,
        },
        accessToken as string,
      )
      .then((res) => {
        if (!res || res.length === 0) {
          return;
        }

        newEvent.id = String(res.id);
        calendarApi.addEvent(newEvent);
        getListTask();
      })
      .catch((err) => console.error(err));
  };
  // delete event
  const handleDelete = (id: string) => {
    const calendarApi = fullCalendarRef.current!.getApi();
    const oldEvent = calendarApi.getEventById(id);
    oldEvent?.remove();

    taskService
      .deleteTask(id, accessToken as string)
      .then(() => {
        getListTask();
      })
      .catch((err) => console.error(err));
  };

  return (
    <Card className="h-full w-full">
      <div className="h-full w-full">
        <StyledCalendar $themeMode={themeMode}>
          <CalendarHeader
            now={date}
            view={view}
            onMove={handleMove}
            onCreate={() => setOpen(true)}
            onViewTypeChange={handleViewTypeChange}
            onDailyTeams={handleDailyTeams}
          />
          <FullCalendar
            ref={fullCalendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialDate={date}
            initialView={screenMap.xs ? 'listWeek' : view}
            events={tasks as any[]}
            eventContent={CalendarEvent}
            editable
            selectable
            selectMirror
            dayMaxEvents
            headerToolbar={false}
            select={handleDateSelect}
            eventClick={handleEventClick}
          />
        </StyledCalendar>
      </div>
      <CalendarEventForm
        open={open}
        type={eventFormType}
        initValues={eventInitValue}
        onCancel={handleCancel}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />
      <Modal
        open={dailyTeams}
        title="Preview Daily Teams"
        width={screenMap.xs ? '100%' : '50%'}
        onCancel={() => setDailyTeams(false)}
        onOk={() => copyFn(textCopy)}
        okText="Copy"
      >
        {/* <Editor id="full-editor" value={quillFull} onChange={setQuillFull} readOnly theme="snow" /> */}
        <div className="mt-2 flex items-center justify-between rounded-xl border-gray-300 bg-gray-200 p-4">
          <div dangerouslySetInnerHTML={{ __html: quillFull }} />
        </div>
      </Modal>
    </Card>
  );
}
