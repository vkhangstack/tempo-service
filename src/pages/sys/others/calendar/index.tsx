import { faker } from '@faker-js/faker';
import { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
//  fullcalendar plugins
import dayGridPlugin from '@fullcalendar/daygrid'; //  dayGridMonth, dayGridWeek, dayGridDay, dayGrid
import interactionPlugin from '@fullcalendar/interaction'; //  click select drag action
import listPlugin from '@fullcalendar/list'; // listWeek view
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'; // timeGridWeek, timeGridDay, timeGrid
import dayjs from 'dayjs';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import Card from '@/components/card';
import { useSettings } from '@/store/settingStore';
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
const keyDataEvent = 'events';
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

  useEffect(() => {
    if (screenMap.xs) {
      setView('listWeek');
    }
  }, [screenMap]);

  useMemo(() => {
    const dataLocal = localStorage.getItem(keyDataEvent);
    if (!dataLocal) {
      localStorage.setItem(keyDataEvent, JSON.stringify([]));
      setDataEvents([]);
    }

    setDataEvents(JSON.parse(dataLocal as string));
  }, []);
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
    let dataLocal: any = localStorage.getItem(keyDataEvent);
    if (dataLocal) {
      dataLocal = JSON.parse(dataLocal);
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < dataLocal.length; i++) {
        if (dataLocal[i].id === id) {
          dataLocal[i].title = title; // Update title if provided
          dataLocal[i].extendedProps.description = description; // Update start date if provided
          dataLocal[i].allDay = allDay; // Update end date if provided
          dataLocal[i].color = color;
          localStorage.setItem(keyDataEvent, JSON.stringify(dataLocal));
          break;
        }
      }
    }

    setDataEvents(dataLocal);
    /** logic set localStorage */
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

    calendarApi.addEvent(newEvent);

    /** logic set localStorage */
    let dataLocal: any = localStorage.getItem(keyDataEvent);
    if (!dataLocal) {
      dataLocal = [];
    }
    dataLocal = JSON.parse(dataLocal as string);
    dataLocal.push(newEvent);
    localStorage.setItem(keyDataEvent, JSON.stringify(dataLocal));
    setDataEvents(dataLocal);
    /** logic set localStorage */
  };
  // delete event
  const handleDelete = (id: string) => {
    const calendarApi = fullCalendarRef.current!.getApi();
    const oldEvent = calendarApi.getEventById(id);
    oldEvent?.remove();
    /** logic set localStorage */
    setDataEvents((oldEvent) => {
      const newEvent = oldEvent?.filter((event: EventInput) => event.id !== id);
      localStorage.setItem(keyDataEvent, JSON.stringify(newEvent));
      return newEvent;
    });
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
