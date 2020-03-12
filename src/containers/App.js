import React, { Component } from 'react';
import { connect } from 'react-redux';
import BackgroundImage from '../components/BackgroundImage';
import Time from '../components/Time';
import Date from '../components/Date';
import Agenda from '../components/Agenda';
import Rss from '../components/Rss';
import HomeAssistant from '../components/HomeAssistant';
import Info from '../components/Info';
import Axios from 'axios';
import yaml from 'js-yaml';
import { addConfig } from './actions';
import './App.css';

class App extends Component {
  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    this.setState({
      isLoading: true,
      isLoaded: false,
    });

    //	Load Locked Config
    //--------------------------------------------------------//
    Axios.get('./config.yml')
      .then(lockedConfig => {
        const config = yaml.safeLoad(lockedConfig.data);

        //console.log(config.config);

        this.props.addConfig(config.config);

        //	Save
        //--------------------------------------------------------//
        this.setState({
          isLoading: false,
          isLoaded: true,
          hasLoaded: true,
          isError: false,
        });
      })
      .catch(error => {
        this.setState({
          isLoading: false,
          isLoaded: false,
          isError: true,
          hasErrored: true,
        });
        console.error(error);
      });
  };

  render() {
    return (
      <div className="App">
        <BackgroundImage>
          <div className="d-flex h-100 w-100 flex-column">
            <div className="d-flex w-100 flex-row justify-content-between">
              <div className="col-3">
                <Time />
                <Date />
              </div>
            </div>
            <div className="d-flex w-100 flex-row justify-content-between"></div>
            <div className="d-flex flex-row justify-content-between mt-3 agenda-dev">
              <Agenda />
              <div
                className="d-flex flex-row justify-content-between"
                style={{ height: '10%', width: '60%', marginLeft: '5%', marginRight: '20%' }}
              >
                <Rss />
              </div>
            </div>
            <Info />
          </div>
        </BackgroundImage>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    config: state.config,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addConfig: config => {
      dispatch(addConfig(config));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
