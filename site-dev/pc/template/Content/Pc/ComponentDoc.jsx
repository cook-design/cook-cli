import React from 'react';
import DocumentTitle from 'react-document-title';
import classNames from 'classnames';
import { getChildren } from 'jsonml.js/lib/utils';
import Demo from './Demo';

export default class ComponentDoc extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expandAll: false,
    };
  }

  handleExpandToggle = () => {
    this.setState({
      expandAll: !this.state.expandAll,
    });
  }

  render() {
    const props = this.props;
    const { api: doc, demo } = props.data.document;
    const { content, meta } = doc;
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
    return (
      <DocumentTitle title={`${subtitle || chinese || ''} ${title || english} - Ant Design`}>
        <article>
          <section className="markdown">
            <h1>
              {title || english}
              {
                (!subtitle && !chinese) ? null : <span className="subtitle">{subtitle || chinese}</span>
              }
            </h1>
            {
              props.utils.toReactComponent(
                ['section', { className: 'markdown' }]
                  .concat(getChildren(content)),
              )
            }
            <h2 className="m-local-h2">
              <div className="m-locale-item">代码演示</div>
              <div className={expandTriggerClass} onClick={this.handleExpandToggle} />
            </h2>
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
