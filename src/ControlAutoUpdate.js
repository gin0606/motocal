var React = require("react");
var { Button, ButtonGroup } = require("react-bootstrap");

var intl = require("./translate.js");

var ControlAutoUpdate = React.createClass({
  render: function() {
    var locale = this.props.locale;
    var gstyle = this.props.mobile ? { width: "100%" } : {};
    var style = this.props.mobile ? { width: "50%" } : {};
    if (this.props.autoupdate) {
      return (
        <ButtonGroup style={gstyle}>
          <Button
            bsStyle="primary"
            style={style}
            onClick={this.props.forceResultUpdate}
          >
            {intl.translate("結果を更新", locale)}
          </Button>
          <Button
            bsStyle="danger"
            style={style}
            onClick={this.props.switchAutoUpdate}
          >
            {intl.translate("自動更新: OFF", locale)}
          </Button>
        </ButtonGroup>
      );
    } else {
      return (
        <ButtonGroup style={gstyle}>
          <Button
            bsStyle="primary"
            style={style}
            disabled
            onClick={this.props.forceResultUpdate}
          >
            {intl.translate("結果を更新", locale)}
          </Button>
          <Button
            bsStyle="primary"
            style={style}
            onClick={this.props.switchAutoUpdate}
          >
            {intl.translate("自動更新: ON", locale)}
          </Button>
        </ButtonGroup>
      );
    }
  }
});

module.exports.ControlAutoUpdate = ControlAutoUpdate;
