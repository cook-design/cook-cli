import React from 'react';
import DocumentTitle from 'react-document-title';
import classNames from 'classnames';
import Affix from 'antd/lib/affix';
import { getChildren } from 'jsonml.js/lib/utils';
import Demo from './Demo';
import 'antd/lib/affix/style';

export default class ComponentDoc extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expandAll: false,
    };
  }

  componentDidMount = () => {
    this.bindScroller();
  }

  handleExpandToggle = () => {
    this.setState({
      expandAll: !this.state.expandAll,
    });
  }

  bindScroller() {
    if (this.scroller) {
      this.scroller.destroy();
    }
    if (!document.querySelector('.code-box')) {
      return;
    }
    require('intersection-observer'); // eslint-disable-line
    const scrollama = require('scrollama'); // eslint-disable-line
    this.scroller = scrollama();
    this.scroller
      .setup({
        step: '.code-box', // required
        offset: 0,
      })
      .onStepEnter(({ element }) => {
        [].forEach.call(document.querySelectorAll('.toc-affix li a'), node => {
          node.className = ''; // eslint-disable-line
        });
        const currentNode = document.querySelectorAll(`.toc-affix li a[href="#${element.id}"]`)[0];
        if (currentNode) {
          currentNode.className = 'current';
        }
      });
  }

  render() {
    const props = this.props;
    const { api: doc, demo = {} } = props.data.document;
    const { meta } = doc;
    const demos = Object.keys(demo).map(key => demo[key])
      .filter(demoData => !demoData.meta.hidden);
    const expand = this.state.expandAll;
    const isSingleCol = meta.cols === 1;
    const leftChildren = [];
    const rightChildren = [];

    demos.sort((a, b) => a.meta.order - b.meta.order)
      .forEach((demoData, index) => {
        if (index % 2 === 0 || isSingleCol) {
          leftChildren.push(
            <Demo
              {...demoData}
              key={index}
              utils={props.utils}
              expand={expand}
              pathname={location.pathname}
            />,
          );
        } else {
          rightChildren.push(
            <Demo
              {...demoData}
              key={index}
              utils={props.utils}
              expand={expand}
              pathname={location.pathname}
            />,
          );
        }
      });
    const expandTriggerClass = classNames({
      'code-box-expand-trigger': true,
      'code-box-expand-trigger-active': expand,
    });

    const { title, subtitle, chinese, english } = meta;

    const jumper = demos.map(demo => {
      const { title = '' } = demo.meta;
      return (
        <li key={demo.meta.id} title={title}>
          <a href={`#${demo.meta.id}`}>{title}</a>
        </li>
      );
    });

    return (
      <DocumentTitle title={title}>
        <article>
          <Affix className="toc-affix" offsetTop={16}>
            <ul id="demo-toc" className="toc">
              {jumper}
            </ul>
          </Affix>
          <section className="markdown">
            <h1>
              {title || english}
              {
                (!subtitle && !chinese) ? null : <span className="subtitle">{subtitle || chinese}</span>
              }
            </h1>
            {
              props.utils.toReactComponent(
                ['section', {
                  className: 'markdown api-container',
                }].concat(getChildren(doc.content || ['placeholder'])),
              )
            }
            {demos.length > 0 && <h2 className="m-local-h2">
              <div className="m-locale-item">代码演示</div>
              <div className={expandTriggerClass} onClick={this.handleExpandToggle} />
            </h2>}
          </section>
          <div className="m-code" style={{ margin: (isSingleCol) ? '0' : '0 -8px' }}>
            <div className={isSingleCol ?
              'm-col code-boxes-col-1-1' :
              'm-col code-boxes-col-2-1'
            }
            >
              {leftChildren}
            </div>
            {
              isSingleCol ? null : <div className="m-col code-boxes-col-2-1" span="12">{rightChildren}</div>
            }
          </div>
          {
            props.utils.toReactComponent(
              ['section', {
                className: 'markdown api-container',
              }].concat(getChildren(doc.api || ['placeholder'])),
            )
          }
        </article>
      </DocumentTitle>
    );
  }
}
