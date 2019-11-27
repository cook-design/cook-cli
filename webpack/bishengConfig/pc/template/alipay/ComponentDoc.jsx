import React from 'react';
import DocumentTitle from 'react-document-title';
import { getChildren } from 'jsonml.js/lib/utils';
import Affix from 'antd/lib/affix';
import 'antd/lib/affix/style';

export default class ComponentDoc extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      jumper: null,
    };
  }

  componentDidMount = () => {
    window.addEventListener('load', this.handleInitialHashOnLoad);
    this.renderFix();
  }

  renderFix = () => {
    const $obj = document.querySelectorAll('.markdown h2');
    const jumper = Array.from($obj).map((item, key) => {
      return (
        <li key={key}>
          <a href={`#${item.innerText}`}>{item.innerText}</a>
        </li>
      );
    });
    this.setState({
      jumper,
    }, () => {
      this.bindScroller();
    });
  }

  handleInitialHashOnLoad = () => {
    setTimeout(() => {
      if (!window.location.hash) {
        return;
      }
      const element = document.getElementById(
        decodeURIComponent(window.location.hash.replace('#', '')),
      );
      if (element && document.documentElement.scrollTop === 0) {
        element.scrollIntoView();
      }
    }, 0);
  };

  bindScroller() {
    try {
      if (this.scroller) {
        this.scroller.destroy();
      }
      if (!document.querySelector('.markdown > h2')) {
        return;
      }
      require('intersection-observer'); // eslint-disable-line
      const scrollama = require('scrollama'); // eslint-disable-line
      this.scroller = scrollama();
      this.scroller
        .setup({
          step: '.markdown > h2', // required
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
    } catch (err) {}
  }

  render() {
    const props = this.props;
    const { jumper } = this.state;
    const { api: doc } = props.data.document;
    const { meta } = doc;

    const { title, subtitle } = meta;

    return (
      <DocumentTitle title={`${subtitle} ${title}`}>
        <article>
          <Affix className="toc-affix" offsetTop={16}>
            <ul id="demo-toc" className="toc">
              {jumper}
            </ul>
          </Affix>
          <section className="markdown">
            <h1 className="section-title m-title-h1">
              {meta.title} {meta.subtitle}
            </h1>
            {
              props.utils.toReactComponent(
                ['section', {
                  className: 'markdown api-container',
                }].concat(getChildren(doc.content || ['placeholder'])),
              )
            }
          </section>
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
