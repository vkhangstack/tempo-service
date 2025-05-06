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
import { keyDataEvent } from '@/layouts/_common/enum';
import { useSettings } from '@/store/settingStore';
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
};
export default function Calendar() {
  const fullCalendarRef = useRef<FullCalendar>(null);
  const [view, setView] = useState<ViewType>('dayGridMonth');
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [eventInitValue, setEventInitValue] =
    useState<CalendarEventFormFieldType>(DefaultEventInitValue);
  const [eventFormType, setEventFormType] = useState<'add' | 'edit'>('add');
  const [dataEvents, setDataEvents] = useState<any[]>([]);

  const { themeMode } = useSettings();
  const { screenMap } = useResponsive();
  const { accessToken } = useUserToken();
  const [, forceRender] = useReducer((x) => x + 1, 0);

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
        const newData = res?.map((item: any) => {
          return {
            ...item,
            color: item?.backgroundColor as string,
            description: item.content,
            start: dayjs(item.start).toDate(),
            end: dayjs(item.end).toDate(),
            backgroundColor: '#fff',
            textColor: item?.backgroundColor as string,
          };
        });

        setDataEvents(newData);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [accessToken]);

  console.log('dataE', dataEvents);
  // useMemo(() => {
  //   const dataLocal = localStorage.getItem(keyDataEvent);
  //   if (!dataLocal || dataLocal === '' || dataLocal === '[]') {
  //     localStorage.setItem(keyDataEvent, JSON.stringify([]));
  //   }
  //   setDataEvents(JSON.parse(dataLocal as string));
  // }, []);
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
  const handleEdit = (values: CalendarEventFormFieldType) => {
    const { id, title = '', description, start, end, allDay = false, color } = values;
    const calendarApi = fullCalendarRef.current!.getApi();
    const oldEvent = calendarApi.getEventById(id);

    const newEvent: any = {
      id,
      title,
      allDay,
      color,
      extendedProps: {
        description,
      },
    };
    if (start) newEvent.start = start.toDate();
    if (end) newEvent.end = end.toDate();

    oldEvent?.remove();
    calendarApi.addEvent(newEvent);
    /** logic set localStorage */
    // let dataLocal: any = localStorage.getItem(keyDataEvent);
    // if (dataLocal) {
    //   dataLocal = JSON.parse(dataLocal);
    //   // eslint-disable-next-line no-plusplus
    //   for (let i = 0; i < dataLocal.length; i++) {
    //     if (dataLocal[i].id === id) {
    //       dataLocal[i].title = newEvent.title; // Update title if provided
    //       dataLocal[i].extendedProps.description = newEvent.extendedProps.description; // Update start date if provided
    //       dataLocal[i].allDay = newEvent.allDay; // Update end date if provided
    //       dataLocal[i].color = newEvent.color;
    //       dataLocal[i].start = newEvent.start;
    //       dataLocal[i].end = newEvent.end;
    //       localStorage.setItem(keyDataEvent, JSON.stringify(dataLocal));
    //       break;
    //     }
    //   }
    // }
    /** logic set localStorage */

    taskService
      .updateTask(
        {
          id: Number(values.id),
          title,
          content: description ?? '',
          start: newEvent.start as any,
          end: newEvent.end as any,
          allDay,
          textColor: color as string,
          backgroundColor: '#ffffff',
        },
        accessToken as string,
      )
      .then(() => {
        // if (res) {
        //   setDataEvents(res);
        // }
        forceRender();
      })
      .catch((err) => console.error(err));
  };
  // create event
  const handleCreate = (values: CalendarEventFormFieldType) => {
    const calendarApi = fullCalendarRef.current!.getApi();
    const { title = '', description, start, end, allDay = false, color } = values;

    const newEvent: EventInput = {
      id: faker.string.uuid(),
      title,
      allDay,
      color,
      extendedProps: {
        description,
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
        },
        accessToken as string,
      )
      .then((res) => {
        if (!res || res.length === 0) {
          return;
        }

        dataEvents.push({
          ...res,
          description: res.content,
          start: dayjs(res.start).toDate(),
          end: dayjs(res.end).toDate(),
        });

        newEvent.id = String(res.id);
        calendarApi.addEvent(newEvent);
        setDataEvents(dataEvents);
      })
      .catch((err) => console.error(err));
  };
  // delete event
  const handleDelete = (id: string) => {
    const calendarApi = fullCalendarRef.current!.getApi();
    const oldEvent = calendarApi.getEventById(id);
    oldEvent?.remove();
    /** logic set localStorage */

    const dataLocal = localStorage.getItem(keyDataEvent);
    const dataEvents = JSON.parse(dataLocal as string);

    const newEvent = dataEvents?.filter((event: EventInput) => event.id !== id);
    localStorage.setItem(keyDataEvent, JSON.stringify(newEvent));

    /** logic set localStorage */
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
            events={dataEvents}
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
