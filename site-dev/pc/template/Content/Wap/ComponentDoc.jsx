import React from 'react';
import DocumentTitle from 'react-document-title';
import classNames from 'classnames';
import QRCode from 'qrcode.react';
import { getChildren } from 'jsonml.js/lib/utils';
import URL from 'url-parse';
import querystring from 'querystring';

import Popover from '../../Popover';
import Demo from './Demo';

export default class ComponentDoc extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expandAll: false,
      currentIndex: this.getIndex(props),
      // 收起展开代码的存储数组
      codeExpandList: [],
      toggle: false,
      iframeUrl: '',
    };
  }

  getIndex(props) {
    const linkTo = props.location.hash.replace('#', '');
    const { demo } = props.data.document;
    const demos = Object.keys(demo).map(key => demo[key])
      .filter(demoData => !demoData.meta.hidden);
    const demoSort = demos.sort((a, b) => parseInt(a.meta.order, 10) - parseInt(b.meta.order, 10));
    demos.map((item, index) => {
      item.index = index;
    });
    const targetDemo = demoSort.filter(item => (item.meta.id === linkTo))[0];
    const linkIndex = linkTo && targetDemo ? targetDemo.index : 0;
    return linkIndex;
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({
      currentIndex: 0,
      codeExpandList: [],
      toggle: false,
    });
    this.initExpandAll(nextProps);
  }

  togglePreview = (e) => {
    this.setState({
      currentIndex: e.index,
      toggle: true,
    });
    this.getIframe();
  }

  // 用于控制内部代码的展开和收起
  handleCodeExpandList = (index, type) => {
    const codeExpandList = { ...this.state.codeExpandList };
    codeExpandList[index] = type;
    this.setState({ codeExpandList });
  }

  handleExpandToggle = () => {
    const codeExpandList = {};
    const props = this.props;
    const { demo } = props.data.document;
    const demos = Object.keys(demo).map(key => demo[key])
      .filter(demoData => !demoData.meta.hidden);

    this.setState({
      expandAll: !this.state.expandAll,
      codeExpandList: demos.map((item, index) => codeExpandList[index] = !this.state.expandAll),
    });
  }

  initExpandAll = (nextProps) => {
    const codeExpandList = {};
    const props = nextProps || this.props;
    const { demo } = props.data.document;
    const demos = Object.keys(demo).map(key => demo[key])
      .filter(demoData => !demoData.meta.hidden);

    this.setState({
      expandAll: true,
      codeExpandList: demos.map((item, index) => codeExpandList[index] = true),
    });
  }

  componentDidMount() {
    this.initExpandAll();
  }

  getIframe = () => {
    const { currentIndex } = this.state;
    const { demo } = this.props.data.document;
    const demos = Object.keys(demo).map(key => demo[key])
      .filter(demoData => !demoData.meta.hidden);
    const demoSort = demos.sort((a, b) => parseInt(a.meta.order, 10) - parseInt(b.meta.order, 10));
    const md = demoSort[currentIndex].meta.filename;
    const { hostname, href } = window.location;
    const { query = {} } = new URL(window.location.href, true);
    query.md = md.match(/\w+.md/);
    query.num = currentIndex;
    const isLocal = hostname.match(/(localhost)|(alipay.net)/);
    let iframeUrl = '';
    if (isLocal) {
      iframeUrl = `http://${hostname}:9002/index.html?${querystring.stringify(query)}#/`;
    } else {
      iframeUrl = href.split('/');
      iframeUrl.splice(iframeUrl.length - 2);
      iframeUrl.push(`kitchen-sink/index.html?${querystring.stringify(query)}#/`);
      iframeUrl = iframeUrl.join('/');
    }
    return iframeUrl;
  }

  render() {
    const props = this.props;
    const { api: doc, demo } = props.data.document;
    const { content, meta } = doc;
    const { currentIndex } = this.state;
    const iframeUrl = this.getIframe();
    const demos = Object.keys(demo).map(key => demo[key])
      .filter(demoData => !demoData.meta.hidden);
    const expand = this.state.expandAll;
    const leftChildren = [];

    demos.sort((a, b) => a.meta.order - b.meta.order)
      .forEach((demoData, index) => {
        leftChildren.push(
          <Demo
            togglePreview={this.togglePreview}
            {...demoData}
            handleCodeExpandList={this.handleCodeExpandList}
            codeExpand={this.state.codeExpandList[index]}
            className={currentIndex === index ? 'code-box-target' : ''}
            key={index}
            index={index}
            currentIndex={currentIndex}
            utils={props.utils}
            expand={expand}
            pathname={location.pathname}
          />,
        );
      });
    const expandTriggerClass = classNames({
      'code-box-expand-trigger': true,
      'code-box-expand-trigger-active': expand,
    });

    const PopoverContent = (<div>
      <h4 style={{ margin: '8Px 0 12Px', textAlign: 'center' }}><span>扫二维码查看演示效果</span></h4>
      <QRCode size={144} value={iframeUrl} />
    </div>);

    const { title, subtitle } = meta;

    return (
      <DocumentTitle title={`${subtitle} ${title}`}>
        <article>
          <section className="markdown">
            <h1 className="section-title m-title-h1">
              {meta.title} {meta.subtitle}
              <Popover content={PopoverContent}>
                <span className="m-icon-code" />
              </Popover>
            </h1>
            {
              props.utils.toReactComponent(
                ['section', { className: 'markdown' }]
                  .concat(getChildren(content)),
              )
            }

            <section id="demoTitle" className="demo-title-wrapper">
              <h2 className="m-local-h2">
                <div className="m-locale-item">代码演示</div>
                <div className={expandTriggerClass} onClick={this.handleExpandToggle} />
              </h2>
            </section>
          </section>

          <div id="demo-code" className="clearfix" style={{ paddingRight: 405 }}>
            <div style={{ width: '100%', float: 'left' }}>
              {leftChildren}
            </div>
            <div style={{ width: 405, padding: '0 0 0 26Px', positon: 'relative', float: 'right', minHeight: 300, marginRight: '-405Px' }}>
              <div id="aside-demo" className="aside-demo">
                <div style={{ width: '377Px', height: '620Px' }}>
                  <div className="demo-preview-wrapper">
                    <div className="demo-preview-header">
                      <div className="demo-preview-statbar">
                        <img width="350Px" alt="presentation" style={{ margin: '0 2Px' }} src="https://os.alipayobjects.com/rmsportal/VfVHYcSUxreetec.png" />
                      </div>
                      <div style={{ height: '40Px' }}>
                        <div className="url-box">{iframeUrl}</div>
                      </div>
                    </div>
                    <section className="code-box-demo code-box-demo-preview">
                      <iframe id="demoFrame"
                        name="demoFrame"
                        title="antd-mobile"
                        style={{ width: '377Px', height: '548Px', border: '1Px solid #F7F7F7', borderTop: 'none', boxShadow: '0 2Px 4Px #ebebeb' }}
                        src={iframeUrl}
                      />
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {
            props.utils.toReactComponent(
              ['section', {
                id: 'api',
                className: 'markdown api-container',
              }].concat(getChildren(doc.api || ['placeholder'])),
            )
          }
        </article>
      </DocumentTitle>
    );
  }
}
