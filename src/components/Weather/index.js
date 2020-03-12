import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import WeatherDay from './WeatherDay';
import Axios from 'axios';

class Weather extends Component {
  state = { data: null };
  componentDidUpdate() {
    const { data } = this.state;
    const { refresh } = this.props;
    if (!data || refresh) {
      this.getWeather();
    }
  }

  getWeather = () => {
    const { widgets } = this.props.config;
    const { weather } = widgets;

    if (weather.longitude && weather.latitude) {
      const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
      Axios.get(
        `${PROXY_URL}https://api.darksky.net/forecast/${weather.dark_sky_secret}/${weather.latitude},${weather.longitude}?exclude=minutely,hourly&lang=en&units=us `,
      ).then(({ data }) => {
        this.setState({ data });
      });
    }
  };

  getMaxTemp = days => {
    const { data } = this.state;
    const dayData = data.daily.data.find(day => moment.unix(day.time).isSame(moment().add(days, 'days'), 'day'));
    return dayData.temperatureMax.toFixed(1);
  };

  getMinTemp = days => {
    const { data } = this.state;
    const dayData = data.daily.data.find(day => moment.unix(day.time).isSame(moment().add(days, 'days'), 'day'));
    return dayData.temperatureMin.toFixed(1);
  };

  getIcon = days => {
    const { data } = this.state;
    const dayData = data.daily.data.find(day => moment.unix(day.time).isSame(moment().add(days, 'days'), 'day'));
    return dayData.icon;
  };

  render() {
    const { data } = this.state;
    console.log(data);
    if (!data) return null;
    return (
      <div className="d-flex flex-row justify-content-between w-100" style={{ height: '10%' }}>
        <div className="d-flex flex-fill flex-grow flex-column m-3 align-items-start">
          <h6>{data.currently.summary}</h6>
          <p>Feels Like</p>
          <h2>{data.currently.apparentTemperature.toFixed(1)}°F</h2>
        </div>
        {[0, 1, 2, 3, 4].map(index => {
          return (
            <WeatherDay
              day={
                index !== 0
                  ? moment()
                      .add(index, 'days')
                      .format('ddd')
                  : 'Today'
              }
              icon={this.getIcon(index)}
              maxTemp={this.getMaxTemp(index)}
              minTemp={this.getMinTemp(index)}
            />
          );
        })}
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

export default connect(mapStateToProps)(Weather);
