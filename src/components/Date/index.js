import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

class Date extends Component {
  state = { time: null };

  componentDidMount = () => {
    const time = moment().format('HH:mm');
    this.setState({ time });
    setTimeout(this.getNewDate, 1000);
  };

  getNewDate = () => {
    const { day } = this.state;
    const newday = moment().format('dddd ');
    const newdate = moment().format(' MMMM D');
    if (day !== newday) this.setState({ day: newday, date: newdate });
    setTimeout(this.getNewDate, 1000 * 60);
  };

  render() {
    const { day, date } = this.state;
    return (
      <div className="d-flex flex-column ml-3 mb-0">
        <div className="d-flex flex-row">
          <h4 style={{ color: '#fff' }}>
            <b className="mr-3">{day}</b> {date}
          </h4>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    config: state.config.widgets.clock,
  };
};

export default connect(mapStateToProps)(Date);
