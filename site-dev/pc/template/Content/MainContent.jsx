import React from 'react';

import ComponentDocPc from './Pc/ComponentDoc';
import ComponentDocWap from './Wap/ComponentDoc';

export default class MainContent extends React.Component {
  componentDidMount() {}

  render() {
    let { platform } = this.props.themeConfig;
    platform = platform.toLowerCase();

    let ComponentDoc = {};
    if (platform.indexOf('pc') > -1 || platform.indexOf('plugin') > -1) {
      ComponentDoc = ComponentDocPc;
    } else {
      ComponentDoc = ComponentDocWap;
    }
    return (
      <div className="main-wrapper">
        <ComponentDoc {...this.props} />
      </div>
    );
  }
}
