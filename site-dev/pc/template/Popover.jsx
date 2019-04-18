import React from 'react';
import './Popover.less';

export default class Popover extends React.Component {
  static defaultProps = {
    content: {},
  }

  constructor(props) {
    super(props);

    this.state = {
      status: false,
    };
  }

  handleMouseEnter = () => {
    this.setState({
      status: true,
    });
  }

  handleMouseLeave = () => {
    this.setState({
      status: false,
    });
  }

  render() {
    const { children, content } = this.props;
    const { status } = this.state;

    return (
      <div className="mo-popover"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {children}
        <div className="inner">
          {status ? content : null}
        </div>
      </div>
    );
  }
}
