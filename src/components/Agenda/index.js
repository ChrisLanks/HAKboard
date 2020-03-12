import React, { useState, useEffect } from 'react';
import { Calendar, Views, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { connect } from 'react-redux';
import axios from 'axios';
import ical from 'ical';
import './index.scss';
import AgendaView from './AgendaView.js';
import { RRule, RRuleSet, rrulestr } from 'rrule';

const customDayPropGetter = date => {
  if (date.getDate() === 7 || date.getDate() === 15)
    return {
      className: 'special-day',
      style: {
        border: 'solid 3px ' + (date.getDate() === 7 ? '#faa' : '#afa'),
      },
    };
  else return {};
};

const customSlotPropGetter = date => {
  if (date.getDate() === 7 || date.getDate() === 15)
    return {
      className: 'special-day',
    };
  else return {};
};

// What displays the agenda
function Agenda(props) {
  const localizer = momentLocalizer(moment); // or globalizeLocalizer
  const [events, setEvents] = useState([]);

  // Render on load
  useEffect(() => {
    if (props.config === undefined) {
      return;
    }
    console.log('Getting Calendar events..');
    const { url } = props.config;
    const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

    const fetchCal = async () => {
      try {
        await axios.get(`${PROXY_URL}${url}`).then(({ data }) => {
          const allEvents = ical.parseICS(data);
          let array = Object.keys(allEvents).map(key => {
            const event = allEvents[key];
            if (event.summary) {
              //console.log(event);
              // If not re-ocurring
              if (event.rrule === undefined) {
                return {
                  title: event.summary,
                  start: moment(event.start).local(),
                  end: event.end ? moment(event.end).local() : null,
                  location: event.location,
                  allDay: isAllDay(event),
                };
                // Complicated if there is a rrule (reoccurance)
                // https://github.com/peterbraden/ical.js/blob/master/example_rrule.js
              } else {
                let reocurringEvents = [];

                // When dealing with calendar recurrences, you need a range of dates to query against,
                // because otherwise you can get an infinite number of calendar events.
                //event start
                const rangeStart = moment(event.start).local();
                // until 7 days after today
                const rangeEnd = moment()
                  .add(7, 'days')
                  .local();

                let startDate = moment(event.start);
                let endDate = moment(event.end);
                // For recurring events, get the set of event start dates that fall within the range
                // of dates we're looking for.
                const dates = event.rrule.between(rangeStart.toDate(), rangeEnd.toDate(), true, function(date, i) {
                  return true;
                });

                // Calculate the duration of the event for use with recurring events.
                const duration = parseInt(endDate.format('x')) - parseInt(startDate.format('x'));

                // Loop through the set of date entries to see which recurrences should be printed.
                for (var i in dates) {
                  const date = dates[i];
                  let curEvent = event;
                  let showRecurrence = true;
                  let curDuration = duration;

                  startDate = moment(date).local();

                  // Use just the date of the recurrence to look up overrides and exceptions (i.e. chop off time information)
                  const dateLookupKey = date.toISOString().substring(0, 10);

                  // For each date that we're checking, it's possible that there is a recurrence override for that one day.
                  if (curEvent.recurrences != undefined && curEvent.recurrences[dateLookupKey] !== undefined) {
                    // We found an override, so for this recurrence, use a potentially different title, start date, and duration.
                    curEvent = curEvent.recurrences[dateLookupKey];
                    startDate = moment(curEvent.start).local();
                    curDuration = parseInt(moment(curEvent.end).format('x')) - parseInt(startDate.format('x'));
                  }
                  // If there's no recurrence override, check for an exception date.  Exception dates represent exceptions to the rule.
                  else if (curEvent.exdate != undefined && curEvent.exdate[dateLookupKey] !== undefined) {
                    // This date is an exception date, which means we should skip it in the recurrence pattern.
                    showRecurrence = false;
                  }

                  // Set the the title and the end date from either the regular event or the recurrence override.
                  const recurrenceTitle = curEvent.summary;
                  endDate = moment(parseInt(startDate.format('x')) + curDuration, 'x');

                  // If this recurrence ends before the start of the date range, or starts after the end of the date range,
                  // don't process it.
                  if (endDate.isBefore(rangeStart) || startDate.isAfter(rangeEnd)) {
                    showRecurrence = false;
                  }

                  if (showRecurrence === true) {
                    reocurringEvents.push({
                      title: recurrenceTitle,
                      start: startDate.local(),
                      end: endDate ? moment(new Date(endDate)).local() : null,
                      location: curEvent.location,
                      allDay: isAllDay(curEvent),
                    });
                  }
                }
                return reocurringEvents;
              }
            }
          });

          // Loop through entire array of objects and append arrays as objects to end.
          array.forEach(function(eventsRange, index) {
            if (Array.isArray(eventsRange)) {
              for (let i = eventsRange.length - 1; i >= 0; i--) {
                array.push(eventsRange[i]);
              }
            }
          });
          // Clean up arrays that weren't removed for some reason
          array = array.filter(e => e && e.title !== undefined);
          setEvents(array);
        });
      } catch (e) {
        console.log(e);
      }
    };
    fetchCal();
  }, [props]);

  const isAllDay = event => {
    if (event.rrule !== undefined) {
      return false;
    }
    const a = moment(event.start).local();
    const b = moment(event.start)
      .startOf('day')
      .local();

    const c = moment(event.end).local();
    const d = moment(event.start)
      .add(1, 'days')
      .startOf('day')
      .local();

    return a.isSame(b) && c.isSame(d);
  };

  let formats = {
    agendaDateFormat: 'MMMM, dddd D',
  };

  const numOfDays = 7;
  return (
    <Calendar
      events={events}
      localizer={localizer}
      defaultView={Views.AGENDA}
      length={numOfDays}
      toolbar={false}
      // Custom Agenda
      views={{ agenda: AgendaView }}
      dayPropGetter={customDayPropGetter}
      slotPropGetter={customSlotPropGetter}
      formats={formats}
      className={'agenda'}
    />
  );
}

const mapStateToProps = state => {
  return {
    config: state.config.widgets.calendar,
    refresh: state.config.refresh,
  };
};

export default connect(mapStateToProps)(Agenda);
