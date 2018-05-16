var React = require("react");

class AdsenseAdvertisement extends React.Component {
  render() {
    return (
      <div
        ref={"adsense-space-" + this.props.type}
        style={{ display: "inline-block" }}
      />
    );
  }
}

module.exports.AdsenseAdvertisement = AdsenseAdvertisement;
