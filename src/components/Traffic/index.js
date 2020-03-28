import React, { Component } from 'react';
import { connect } from 'react-redux';
import Axios from 'axios';
import ReactSVG from 'react-svg';
import { add, str } from 'timelite/time';

class Traffic extends Component {
  state = { distance: null, duration: null, extremes: null };
  componentDidUpdate() {
    const { distance, duration } = this.state;
    const { refresh } = this.props;
    if (!(distance || duration) || refresh) {
      console.log('REFRESHING: ', refresh);
      if (refresh) {
        //this.setState({ duration: null });
        //this.setState({ distance: null });
        //this.setState({ refresh: false });
      }
      this.fetchTimeToWork();
    }
  }

  fetchTimeToWork = () => {
    const { directions = [{}], widgets = [] } = this.props.config;
    const { traffic = {} } = widgets;
    const { google_traffic_api_key: apiKey } = traffic;

    for (let dir of directions) {
      let { start, end, mode } = dir;
      // Convert spaces to %20
      start = start ? encodeURIComponent(start.trim()) : null;
      end = end ? encodeURIComponent(end.trim()) : null;

      if (start && end) {
        let urlMode = ''; // Defaults to driving
        if (mode === 'train') {
          urlMode = '&mode=transit&transit_mode=train';
        } else if (mode === 'walking') {
          urlMode = '&mode=walking';
        }

        const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
        console.log(
          `${PROXY_URL}https://maps.googleapis.com/maps/api/distancematrix/json?origins=${start}&destinations=${end}&key=${apiKey}&units=imperial${urlMode}`,
        );
        Axios.get(
          `${PROXY_URL}https://maps.googleapis.com/maps/api/distancematrix/json?origins=${start}&destinations=${end}&key=${apiKey}&units=imperial${urlMode}`,
        ).then(({ data }) => {
          console.log(data);
          if (data.status === 'OK') {
            // Duration Traveling
            let dur = data.rows[0].elements[0].duration.text;
            let days2Hours = null;
            // Format it for the add library...
            if (dur.includes('day') || dur.includes('days')) {
              // truncate everything after the pattern & pattern itself, convert to a number
              const numOfDays = parseInt(dur.substr(0, dur.search(/ day(s?) /)), 10);
              //console.log('numOfDays: ' + numOfDays);
              days2Hours = numOfDays * 24;
              //console.log('days2Hours: ' + days2Hours);

              dur = dur.replace(/[0-9]* day(s?) /, '');
            }
            if (dur.includes('hour') || dur.includes('hours')) {
              dur = dur.replace(/ hour(s?) /, ':');
            } else {
              dur = '00:' + dur;
            }
            dur = dur.replace(/ min(s?)/, ':');
            dur += '00';

            // If we had days earlier, add them as hours to dur
            if (days2Hours !== null) {
              dur = str(add([dur, `${days2Hours}:00:00`]));
            }
            const combinedDur = this.state.duration ? str(add([this.state.duration, dur])) : dur;
            this.setState({ duration: combinedDur });

            // Distance Traveling //
            let dist = data.rows[0].elements[0].distance.text;

            // Format it for the add library...
            let numInMiles = 0;
            if (dist.includes(' ft') || dist.includes('feet')) {
              // truncate everything after the pattern & pattern itself, convert to a number
              const numOfFeet = parseFloat(dist.substr(0, dist.search(/ ft/)));
              console.log('numOfFeet: ' + numOfFeet);
              numInMiles = numOfFeet * 0.000189394; // 1 foot in a mile is that decimal in miles
              console.log('numInMiles: ' + numInMiles);
            } else {
              // miles
              numInMiles = parseFloat(dist.replace(/ mi/, ''));
            }
            const combinedMiles = this.state.distance + numInMiles;
            this.setState({ distance: combinedMiles });
          }
        });
      }
    }
  };

  formatDurationNicely = () => {
    const { duration } = this.state;
    const durArr = duration.split(':');
    let hourLabel = 'hours';
    let minLabel = 'minutes';
    let hour = durArr[0];
    let min = durArr[1];
    if (durArr[0] === '01') {
      hourLabel = 'hour';
    } else if (durArr[1] === '01') {
      minLabel = 'minute';
    }
    // fix starting with 0
    if (durArr[0].startsWith('0')) {
      hour = hour.substring(1);
    }
    if (durArr[1].startsWith('0')) {
      min = min.substring(1);
    }

    return `${hour} ${hourLabel} ${min} ${minLabel}`;
  };

  render() {
    const { distance, duration } = this.state;
    return (
      <div className="d-flex flex-row justify-content-between w-100" style={{ height: '10%' }}>
        <div className="d-flex flex-column m-3 align-items-start">
          <h5>Commute Time</h5>
          <h6>Time to get to work</h6>
          <div className="d-flex flex-row">
            <ReactSVG src={`/assets/icons/${'map'}.svg`} style={{ width: '30px' }} />
            <h3 className="ml-3">{duration ? this.formatDurationNicely() : 'Unsure'}</h3>
          </div>
          <h6>{distance ? distance : 'Unsure'}</h6>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    config: state.config,
    refresh: state.config.refresh,
  };
};

export default connect(mapStateToProps)(Traffic);
