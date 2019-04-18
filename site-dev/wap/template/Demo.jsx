/* eslint react/no-danger: 0 */
import React from 'react';
import URL from 'url-parse';
import '../static/style';

const { query: { num = 0 } } = new URL(window.location.href, true);

export default class Demo extends React.Component {
  componentDidMount() {}
  render() {
    
    const { demo } = this.props.data.document;
  
    const demoArr = [];
    Object.keys(demo).forEach((k) => {
      demoArr.push(demo[k]);
    });
    const demoSort = demoArr.sort((a, b) => (
      parseInt(a.meta.order, 10) - parseInt(b.meta.order, 10)
    ));

    const style = {};
    if (/(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)) {
      style.minHeight = document.documentElement.clientHeight;
    }
    const item = demoSort[num];

    const DemoEl = (
      <div id={name} style={style} className="demo">
        <div>
          {item.meta.demoType === 'img' && <img src={item.meta.demoUrl} alt={item.meta.demoUrl} style={{ display: 'block', width: '100%' }} />}
          {item.meta.demoType === 'iframe' && <iframe src={item.meta.demoUrl} title="iframe-demo" className="demoIframeInner" style={{ height: '520px' }} />}
          {!item.meta.demoType && <div className="demo-preview-item" id={`${name}-demo-${item.meta.order}`}>
            <div className="demoContainer">{item.preview()}</div>
            {item.style ? <style dangerouslySetInnerHTML={{ __html: item.style }} /> : null}
          </div>}
        </div>
      </div>
    );
    return DemoEl;
  }
}
