import React from 'react';
import ComponentDocPc from './pc/ComponentDoc';
import ComponentDocH5 from './h5/ComponentDoc';
import ComponentDocAlipay from './alipay/ComponentDoc';

import '../static/style';

export default class MainContent extends React.Component {
  componentDidMount() {}

  render() {
    let { viewType } = this.props.appConfig;
    let ComponentDoc = {};
    if (viewType === 'pc') {
      ComponentDoc = ComponentDocPc;
    } else if (viewType === 'h5') {
      ComponentDoc = ComponentDocH5;
    } else if (viewType === 'alipay') {
      ComponentDoc = ComponentDocAlipay;
    }

    return (
      <div className="m-page-wrapper mo-global-page-wrapper">
        <div className="m-page">
          <div className="m-compoent-wrapper">
            <div className={`main-wrapper ${viewType}`}>
              <ComponentDoc {...this.props} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
