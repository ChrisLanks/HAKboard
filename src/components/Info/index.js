import React, { Component } from 'react';
import { Carousel, CarouselItem } from 'reactstrap';
import Weather from '../Weather';
import Traffic from '../Traffic';
import Todoist from '../Todoist';
import HomeAssistant from '../HomeAssistant';

const bottomItems = [<Weather />, <Traffic />];
// const bottomItems = [<Todoist />,  <HomeAssistant />];

export default class Info extends Component {
  state = { activeIndex: 0 };

  componentDidMount() {
    this.next();
  }

  next = () => {
    const { activeIndex } = this.state;
    const nextIndex = activeIndex === bottomItems.length - 1 ? 0 : activeIndex + 1;
    this.setState({ activeIndex: nextIndex });
  };

  previous = () => {
    const { activeIndex } = this.state;
    const nextIndex = activeIndex === 0 ? bottomItems.length - 1 : activeIndex - 1;
    this.setState({ activeIndex: nextIndex });
  };

  render() {
    const { activeIndex } = this.state;

    const slides = bottomItems.map((item, index) => {
      return (
        <CarouselItem key={index} className="w-100">
          {item}
        </CarouselItem>
      );
    });

    return (
      <div className="d-flex flex-row flex-fill flex-grow align-items-end m-3">
        <Carousel
          wrap
          className="w-100"
          interval={10000}
          activeIndex={activeIndex}
          next={this.next}
          previous={this.previous}
          enableTouch={true}
          keyboard={true}
          mouseEnter={this.next}
        >
          {slides}
        </Carousel>
      </div>
    );
  }
}
