import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import Dialog from 'rc-dialog';
import 'rc-dialog/assets/index.css';

export default class Demo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fullscreen: false,
      codeExpand: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.expand === undefined) return;

    this.setState({
      codeExpand: nextProps.expand,
    });
  }

  handleCodeExapnd = () => {
    this.setState({ codeExpand: !this.state.codeExpand });
  }

  viewFullscreen = () => {
    this.setState({
      fullscreen: true,
    });
  }

  handleCancel = () => {
    this.setState({
      fullscreen: false,
    });
  }

  renderDemoCode(highlightedCode) {
    const props = this.props;
    return (
      <div className="highlight">
        {props.utils.toReactComponent(highlightedCode)}
      </div>
    );
  }

  render() {
    const { props, state } = this;
    const {
      meta,
      content,
      highlightedCode,
      highlightedStyle,
      utils,
      preview,
      style,
    } = props;

    const codeExpand = this.state.codeExpand;
    const codeBoxClass = classNames({
      'code-box': true,
      expand: codeExpand,
    });

    const localizedTitle = meta.title;
    const localizeIntro = content;
    const introChildren = utils.toReactComponent(['div'].concat(localizeIntro));
    const hsNode = highlightedStyle ? (
      <div key="style" className="highlight">
        <pre>
          <code
            className="css"
            dangerouslySetInnerHTML={{
              __html: highlightedStyle,
            }}
          />
        </pre>
      </div>) : null;

    return (
      <section className={codeBoxClass} id={meta.id}>
        <Dialog title={localizedTitle}
          onClose={this.handleCancel}
          visible={state.fullscreen}
          style={{ width: '900px' }}
          className="code-dialog">
          {this.renderDemoCode(highlightedCode)}
          {hsNode}
        </Dialog>
        <section className="code-box-demo">
          { preview(React, ReactDOM) }
          { style ? <style dangerouslySetInnerHTML={{ __html: style }} /> : null }
        </section>
        <section className="code-box-meta markdown">
          <div className="code-box-title">
            <a>
              {localizedTitle}
            </a>
          </div>
          {introChildren}
          <span
            className="collapse"
            onClick={this.handleCodeExapnd}
          />
          {codeExpand && (
            <span
              className="fullscreen"
              onClick={this.viewFullscreen}
            />
          )}
        </section>
        <section
          className={`highlight-wrapper ${codeExpand ? 'highlight-wrapper-expand' : ''}`}
          key="code"
        >
          {this.renderDemoCode(highlightedCode)}
          {hsNode}
        </section>
      </section>
    );
  }
}
