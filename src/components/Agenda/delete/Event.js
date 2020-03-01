import React, { Component } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { connect } from 'react-redux';
import Axios from 'axios';
import ical from 'ical';

export default class Event extends Component {
  // props event

  componentDidUpdate() {
    const { events } = this.state;
    const { config } = this.props;
    const { refresh } = this.props;
  }

  /* isAllDay = event => {
    const a = moment(event.start);
    const b = moment(event.start).startOf('day');

    const c = moment(event.end);
    const d = moment(event.start)
      .add(1, 'days')
      .startOf('day');

    return a.isSame(b) && c.isSame(d);
  };*/

  render() {
    const { event } = this.props;
    if (event === undefined) return <div></div>;
    console.log(event);
    let { hour, min, ampm } = '99';
    if (event.start) {
      hour = moment(event.start).format('h');
      min = moment(event.start).format('mm');
      ampm = moment(event.start).format('A');
    }

    return (
      <div className="w-100 ">
        <div classNmae="time">
          <div className="hour">{hour}</div>
          <div className="minute">
            {min}
            {ampm}
          </div>
          <div className="title">{event.title ? event.title : 'Busy'}</div>
        </div>
      </div>
    );
  }
}
