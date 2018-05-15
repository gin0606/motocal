var React = require("react");
var ReactDOM = require("react-dom");

var AdsenseAdvertisement = React.createClass({
  render: function() {
    return (
      <div
        ref={"adsense-space-" + this.props.type}
        style={{ display: "inline-block" }}
      />
    );
  }
});

module.exports.AdsenseAdvertisement = AdsenseAdvertisement;
