var React = require("react");
var { Tooltip, OverlayTrigger } = require("react-bootstrap");
var intl = require("./translate.js");

module.exports.ElementColorLabel = class extends React.Component {
  static propTypes = {
    element: React.PropTypes.string.isRequired
  };

  render() {
    var element = this.props.element;

    if (element == "fire")
      return (
        <span className="label label-danger" style={{ fontSize: "12pt" }}>
          {this.props.children}
        </span>
      );
    if (element == "water")
      return (
        <span className="label label-primary" style={{ fontSize: "12pt" }}>
          {this.props.children}
        </span>
      );
    if (element == "earth")
      return (
        <span className="label label-warning" style={{ fontSize: "12pt" }}>
          {this.props.children}
        </span>
      );
    if (element == "wind")
      return (
        <span className="label label-success" style={{ fontSize: "12pt" }}>
          {this.props.children}
        </span>
      );
    if (element == "light")
      return (
        <span className="label label-light" style={{ fontSize: "12pt" }}>
          {this.props.children}
        </span>
      );
    if (element == "dark")
      return (
        <span className="label label-dark" style={{ fontSize: "12pt" }}>
          {this.props.children}
        </span>
      );
    if (element == "non" || element == "non-but-critical")
      return (
        <span className="label label-non" style={{ fontSize: "12pt" }}>
          {this.props.children}
        </span>
      );
    return (
      <span className="label label-default" style={{ fontSize: "12pt" }}>
        {this.props.children}
      </span>
    );
  }
};
