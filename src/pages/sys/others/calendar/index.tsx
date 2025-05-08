import { faker } from '@faker-js/faker';
import { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
//  fullcalendar plugins
import dayGridPlugin from '@fullcalendar/daygrid'; //  dayGridMonth, dayGridWeek, dayGridDay, dayGrid
import interactionPlugin from '@fullcalendar/interaction'; //  click select drag action
import listPlugin from '@fullcalendar/list'; // listWeek view
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'; // timeGridWeek, timeGridDay, timeGrid
import dayjs from 'dayjs';
import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';

import taskService from '@/api/services/taskService';
import Card from '@/components/card';
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
  const [eventInitValue, setEventInitValue] =
    useState<CalendarEventFormFieldType>(DefaultEventInitValue);
  const [eventFormType, setEventFormType] = useState<'add' | 'edit'>('add');

  const { themeMode } = useSettings();
  const { screenMap } = useResponsive();
  const { accessToken } = useUserToken();
  const [, forceRender] = useReducer((x) => x + 1, 0);
  const { setTasks } = useTaskActions();
  const tasks = useTasks();

  useEffect(() => {
    if (screenMap.xs) {
      setView('listWeek');
    }
  }, [screenMap]);

  /** TODO: Đại đại đi rồi refactor cho clean */
  useEffect(() => {
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
  }, [accessToken, setTasks]);

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
        forceRender();
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
        forceRender();
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
        forceRender();
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
    </Card>
  );
}
