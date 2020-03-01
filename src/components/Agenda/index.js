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
function Agenda() {
  const localizer = momentLocalizer(moment); // or globalizeLocalizer
  const [events, setEvents] = useState([]);

  // Render on load
  useEffect(() => {
    console.log('Getting Calendar events..');
    // const { url } = this.props.config;
    const url =
      'https://calendar.google.com/calendar/ical/lanxternal%40gmail.com/private-f388d23f1f83cc355f58062e02966827/basic.ics';
    const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

    const fetchCal = async () => {
      try {
        await axios.get(`${PROXY_URL}${url}`).then(({ data }) => {
          const allEvents = ical.parseICS(data);
          const array = Object.keys(allEvents).map(key => {
            const event = allEvents[key];
            if (event.summary) {
              console.log(event);
              // If not re-ocurring
              if (event.rrule === 'undefined') {
                return {
                  title: event.summary,
                  start: moment(event.start).local(),
                  end: event.end ? moment(event.end).local() : null,
                  location: event.location,
                  allDay: isAllDay(event),
                };
                // Complicated there is a rrule (reoccurance)
                // https://github.com/peterbraden/ical.js/blob/master/example_rrule.js
              } else {
                // When dealing with calendar recurrences, you need a range of dates to query against,
                // because otherwise you can get an infinite number of calendar events.
                //event start
                var rangeStart = moment(event.start);
                // until 7 days after today
                var rangeEnd = moment().add('7 days');

                const startDate = moment(event.start);
                const endDate = moment(event.end);
                // For recurring events, get the set of event start dates that fall within the range
                // of dates we're looking for.
                const dates = event.rrule.between(rangeStart.toDate(), rangeEnd.toDate(), true, function(date, i) {
                  return true;
                });

                // Calculate the duration of the event for use with recurring events.
                const duration = parseInt(endDate.format('x')) - parseInt(startDate.format('x'));

                // Loop through the set of date entries to see which recurrences should be printed.
                for (var i in dates) {
                  var date = dates[i];
                  var curEvent = event;
                  var showRecurrence = true;
                  var curDuration = duration;

                  startDate = moment(date);

                  // Use just the date of the recurrence to look up overrides and exceptions (i.e. chop off time information)
                  var dateLookupKey = date.toISOString().substring(0, 10);

                  // For each date that we're checking, it's possible that there is a recurrence override for that one day.
                  if (curEvent.recurrences != undefined && curEvent.recurrences[dateLookupKey] != undefined) {
                    // We found an override, so for this recurrence, use a potentially different title, start date, and duration.
                    curEvent = curEvent.recurrences[dateLookupKey];
                    startDate = moment(curEvent.start);
                    curDuration = parseInt(moment(curEvent.end).format('x')) - parseInt(startDate.format('x'));
                  }
                  // If there's no recurrence override, check for an exception date.  Exception dates represent exceptions to the rule.
                  else if (curEvent.exdate != undefined && curEvent.exdate[dateLookupKey] != undefined) {
                    // This date is an exception date, which means we should skip it in the recurrence pattern.
                    showRecurrence = false;
                  }

                  // Set the the title and the end date from either the regular event or the recurrence override.
                  var recurrenceTitle = curEvent.summary;
                  endDate = moment(parseInt(startDate.format('x')) + curDuration, 'x');

                  // If this recurrence ends before the start of the date range, or starts after the end of the date range,
                  // don't process it.
                  if (endDate.isBefore(rangeStart) || startDate.isAfter(rangeEnd)) {
                    showRecurrence = false;
                  }

                  if (showRecurrence === true) {
                    console.log('title:' + recurrenceTitle);
                    console.log('startDate:' + startDate.format('MMMM Do YYYY, h:mm:ss a'));
                    console.log('endDate:' + endDate.format('MMMM Do YYYY, h:mm:ss a'));
                    console.log('duration:' + moment.duration(curDuration).humanize());
                    console.log();
                  }
                }
              }
            }
          });
          //console.log(array);
          setEvents(array);
        });
      } catch (e) {
        console.log(e);
      }
    };
    fetchCal();
  }, []);

  const isAllDay = event => {
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
    <div>
      <Calendar
        events={events}
        localizer={localizer}
        defaultView={Views.AGENDA}
        length={numOfDays}
        toolbar={false}
        views={{ agenda: AgendaView }}
        dayPropGetter={customDayPropGetter}
        slotPropGetter={customSlotPropGetter}
        formats={formats}
      />
    </div>
  );
}

export default Agenda;
