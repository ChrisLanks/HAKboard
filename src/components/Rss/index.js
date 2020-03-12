import React, { Component } from 'react';
import RSSParser from 'rss-parser';
import { connect } from 'react-redux';
import { Carousel, CarouselItem } from 'reactstrap';

class Rss extends Component {
  state = { activeIndex: 0, items: [] };

  componentDidMount() {
    this.next();
  }

  next = () => {
    const { activeIndex } = this.state;
    const nextIndex = activeIndex === this.state.items.length - 1 ? 0 : activeIndex + 1;
    this.setState({ activeIndex: nextIndex });
  };

  previous = () => {
    const { activeIndex } = this.state;
    const nextIndex = activeIndex === 0 ? this.state.items.length - 1 : activeIndex - 1;
    this.setState({ activeIndex: nextIndex });
  };

  getRSSfeeds = () => {
    if (this.props.config === undefined) {
      return;
    }
    let parser = new RSSParser();
    const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
    const { url } = this.props.config;

    if (url && this.state.items.length <= 0) {
      (async () => {
        try {
          let feed = await parser.parseURL(PROXY_URL + url);
          this.setState({
            items: feed.items,
          });
        } catch (err) {
          console.log(err);
          this.setState({ error: true, fetching: false });
        }
      })();
    } else {
      return;
    }
  };

  render() {
    this.getRSSfeeds();
    const { items } = this.state;
    //console.log(items);
    const rss = items.map((item, index) => {
      return (
        <CarouselItem key={index} className="w-100">
          <h2>{item.title}</h2>
          <h3 style={{ fontSize: '1em' }}>
            <a style={{ color: 'lightGray', textDecoration: 'unset' }} href={item.link}>
              {item.contentSnippet}
            </a>
          </h3>
        </CarouselItem>
      );
    });

    return (
      <Carousel
        wrap
        interval={10000}
        activeIndex={this.state.activeIndex}
        next={this.next}
        previous={this.previous}
        enableTouch={true}
        keyboard={true}
        mouseEnter={this.previous}
      >
        {rss}
      </Carousel>
    );
  }
}

const mapStateToProps = state => {
  return {
    config: state.config.widgets.rss,
    refresh: state.config.refresh,
  };
};

export default connect(mapStateToProps)(Rss);
