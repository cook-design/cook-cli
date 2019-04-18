import React from 'react';
import PropTypes from 'prop-types';
import '../../static/style';

export default class Index extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
  }

  componentDidMount() {}

  render() {
    const { children } = this.props;
    return (
      <div className="m-page-wrapper mo-global-page-wrapper">
        <div className="m-page">
          <div className="m-compoent-wrapper">
            {children}
          </div>
        </div>
      </div>
    );
  }
}
