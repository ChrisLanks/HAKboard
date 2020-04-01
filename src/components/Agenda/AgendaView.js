import PropTypes from 'prop-types';
import React from 'react';

import * as dates from './dates';
import moment from 'moment';
import { Views, Navigate } from 'react-big-calendar';
import Marquee from 'react-smooth-marquee';

class AgendaView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { length, date, events, accessors, localizer } = this.props;

    let { messages } = localizer;
    let end = dates.add(date, length, 'day');

    let range = dates.range(date, end, 'day');
    const dateWithoutTime = moment(date)
      .local()
      .format('L');

    events = events.filter(event => this.inRange(event, dateWithoutTime, end, accessors));
    events.sort((a, b) => +accessors.start(a) - +accessors.start(b));

    return (
      <div className="rbc-agenda-view">
        {events.length !== 0 ? (
          <React.Fragment>
            <div className="rbc-agenda-content">{range.map((day, idx) => this.renderDay(day, events, idx))}</div>
          </React.Fragment>
        ) : (
          <span className="rbc-agenda-empty">{messages.noEventsInRange}</span>
        )}
      </div>
    );
  }

  isSelected = (event, selected) => {
    if (!event || selected == null) return false;
    return [].concat(selected).indexOf(event) !== -1;
  };

  inRange = (e, start, end, accessors) => {
    let eStart = dates.startOf(accessors.start(e), 'day');
    let eEnd = accessors.end(e);

    let startsBeforeEnd = dates.lte(eStart, end, 'day');
    // when the event is zero duration we need to handle a bit differently
    let endsAfterStart = !dates.eq(eStart, eEnd, 'minutes')
      ? dates.gt(eEnd, start, 'minutes')
      : dates.gte(eEnd, start, 'minutes');
    return startsBeforeEnd && endsAfterStart;
  };

  renderDay = (day, events, dayKey) => {
    let {
      selected,
      getters,
      accessors,
      localizer,
      components: { event: Event, date: AgendaDate },
    } = this.props;

    events = events.filter(e => this.inRange(e, dates.startOf(day, 'day'), dates.endOf(day, 'day'), accessors));

    return events.map((event, idx) => {
      let title = accessors.title(event);
      let end = accessors.end(event);
      let start = accessors.start(event);

      const userProps = getters.eventProp(event, start, end, this.isSelected(event, selected));

      // Nice Formats to see
      const today = moment().format('L');
      const tomorrow = moment()
        .add(1, 'days')
        .format('L');
      const someDay = moment(day).format('L');
      let dateLabel = idx === 0 && localizer.format(day, 'agendaDateFormat');
      if (idx === 0) {
        if (today === someDay) {
          dateLabel = 'Today';
        } else if (tomorrow === someDay) {
          dateLabel = 'Tomorrow';
        }
      }
      let first =
        idx === 0 ? (
          <div rowSpan={events.length} className="rbc-agenda-date-cell">
            {AgendaDate ? <AgendaDate day={day} label={dateLabel} /> : dateLabel}
          </div>
        ) : (
          false
        );

      return (
        <div key={dayKey + '_' + idx} className={userProps.className} style={userProps.style}>
          {first && <h4>{first}</h4>}
          <ul>
            <li>
              <div className="flex-row" style={{ width: '100%' }}>
                <div className="col-sm text-left justify-content-between rbc-agenda-time-cell">
                  {this.timeRangeLabel(day, event)}
                </div>
                <div className="col-sm text-left justify-content-between rbc-agenda-event-cell">
                  {Event ? (
                    <Event event={event} title={title} />
                  ) : title.length > 20 ? (
                    <Marquee velocity={0.05}>{title}</Marquee>
                  ) : (
                    title
                  )}
                </div>
              </div>
            </li>
          </ul>
        </div>
      );
    }, []);
  };

  timeRangeLabel = (day, event) => {
    let { accessors, localizer, components } = this.props;

    let labelClass = '',
      TimeComponent = components.time,
      label = localizer.messages.allDay;

    let end = accessors.end(event);
    let start = accessors.start(event);

    // Do we care to make this prettier?
    if (!accessors.allDay(event)) {
      if (dates.eq(start, end)) {
        label = localizer.format(start, 'agendaTimeFormat');
      } else if (dates.eq(start, end, 'day')) {
        label = localizer.format({ start, end }, 'agendaTimeRangeFormat');
      } else if (dates.eq(day, start, 'day')) {
        label = localizer.format(start, 'agendaTimeFormat');
      } else if (dates.eq(day, end, 'day')) {
        label = localizer.format(end, 'agendaTimeFormat');
      }
    }

    if (dates.gt(day, start, 'day')) labelClass = 'rbc-continues-prior';
    if (dates.lt(day, end, 'day')) labelClass += ' rbc-continues-after';

    return (
      <span className={labelClass.trim()}>
        {TimeComponent ? <TimeComponent event={event} day={day} label={label} /> : label}
      </span>
    );
  };
}

AgendaView.propTypes = {
  events: PropTypes.array,
  date: PropTypes.instanceOf(Date),
  length: PropTypes.number.isRequired,

  selected: PropTypes.object,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,
};

AgendaView.defaultProps = {
  length: 30,
};

AgendaView.range = (start, { length = AgendaView.defaultProps.length }) => {
  let end = dates.add(start, length, 'day');
  return { start, end };
};

AgendaView.navigate = (date, action, { length = AgendaView.defaultProps.length }) => {
  switch (action) {
    case Navigate.PREVIOUS:
      return dates.add(date, -length, 'day');

    case Navigate.NEXT:
      return dates.add(date, length, 'day');

    default:
      return date;
  }
};

AgendaView.title = (start, { length = AgendaView.defaultProps.length, localizer }) => {
  let end = dates.add(start, length, 'day');
  return localizer.format({ start, end }, 'agendaHeaderFormat');
};

export default AgendaView;
