var React = require("react");
var { Tooltip, OverlayTrigger } = require("react-bootstrap");

module.exports.TextWithTooltip = class extends React.Component {
  static propTypes = {
    tooltip: React.PropTypes.string.isRequired
  };

  render() {
    var tooltip = <Tooltip id={this.props.id}>{this.props.tooltip}</Tooltip>;

    return (
      <OverlayTrigger
        overlay={tooltip}
        placement="top"
        delayShow={300}
        delayHide={150}
      >
        {this.props.children}
      </OverlayTrigger>
    );
  }
};
