var React = require("react");

class AdsenseAdvertisement extends React.Component {
  showUpAdsense() {
    var adsense = document.getElementById(
      "adsense-original-div-" + this.props.type
    );
    adsense.className = "";
    ReactDOM.findDOMNode(
      this.refs["adsense-space-" + this.props.type]
    ).appendChild(adsense);
  }

  componentDidMount() {
    this.showUpAdsense();
  }

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
