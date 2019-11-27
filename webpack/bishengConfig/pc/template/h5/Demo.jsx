import React from 'react';
import classNames from 'classnames';
import Dialog from 'rc-dialog';
import 'rc-dialog/assets/index.css';

export default class Demo extends React.Component {
  state = {
    fullscreen: false,
  };

  handleCodeExapnd = () => {
    const { handleCodeExpandList, index, codeExpand } = this.props;
    handleCodeExpandList(index, !codeExpand);
  }

  handleClick = (e) => {
    const { togglePreview, index, currentIndex } = this.props;

    if (index !== currentIndex && e.target.className !== 'collapse anticon anticon-circle-o-right' &&
      e.target.className !== 'fullscreen anticon anticon-arrow-salt') {
      togglePreview({
        index,
      });
    }
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

  /* eslint-enable react/jsx-indent */
  render() {
    const { props, state } = this;
    const {
      meta,
      content,
      highlightedCode,
      highlightedStyle,
      codeExpand,
      className,
      utils,
    } = props;

    const codeBoxClass = classNames({
      'code-box': true,
      [className]: className,
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
      <section className={codeBoxClass} id={meta.id} onClick={this.handleClick}>
        <Dialog title={localizedTitle}
          onClose={this.handleCancel}
          visible={state.fullscreen}
          style={{ width: '900px' }}
          className="code-dialog">
          {this.renderDemoCode(highlightedCode)}
          {hsNode}
        </Dialog>
        <section className="code-box-meta markdown">
          <div className="h-notice">鼠标点一下，可演示代码</div>
          <div className="code-box-title">
            <a>{localizedTitle}</a>
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
