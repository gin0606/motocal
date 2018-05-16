var React = require("react");
var { Chart } = require("react-google-charts");
var { FormControl } = require("react-bootstrap");
var GlobalConst = require("./global_const.js");
var intl = require("./translate.js");
var selector = GlobalConst.selector;
var supportedSimulationChartSortkeys =
  GlobalConst.supportedSimulationChartSortkeys;
var _ua = GlobalConst._ua;

class SimulationChart extends React.Component {
  constructor(props) {
    super(props);
    var sortKey = props.sortKey;
    if (!(sortKey in supportedSimulationChartSortkeys))
      sortKey = "summedAverageExpectedDamage";

    this.state = {
      sortKey: sortKey
    };
  }

  makeChartOption = (sortKey) => {
    var locale = this.props.locale;

    var options = {};
    for (var key in this.props.data) {
      if (key != "minMaxArr") {
        options[key] = {
          title: key,
          forcelFrame: true,
          hAxis: {
            title: intl.translate("ターン", locale),
            titleTextStyle: { italic: false },
            textStyle: { italic: false },
            gridlines: { count: this.props.maxTurn }
          },
          vAxis: {
            title: intl.translate(
              supportedSimulationChartSortkeys[sortKey],
              locale
            ),
            textStyle: { italic: false },
            minValue: this.props.data["minMaxArr"][sortKey]["min"],
            maxValue: this.props.data["minMaxArr"][sortKey]["max"]
          },
          tooltip: {
            showColorCode: true,
            textStyle: { fontSize: 13 },
            trigger: "selection"
          },
          legend: { position: "top", maxLines: 5, textStyle: { fontSize: 13 } },
          crosshair: { orientation: "both", opacity: 0.8, trigger: "both" },
          chartArea: { left: "10%", top: "10%", width: "85%", height: "80%" },
          lineWidth: 2,
          pointSize: 8,
          selectionMode: "multiple",
          aggregationTarget: "category"
        };
      }
    }

    return options;
  };

  handleEvent = (key, e) => {
    var newState = this.state;
    newState[key] = e.target.value;
    this.setState(newState);
  };

  render() {
    var options = this.state.options;
    var data = this.props.data;
    var sortKey = this.state.sortKey;
    var options = this.makeChartOption(sortKey);

    if (_ua.Mobile) {
      return (
        <div className="HPChart">
          {Object.keys(data).map(function(key, ind) {
            if (key != "minMaxArr") {
              return (
                <Chart
                  chartType="LineChart"
                  className="LineChart"
                  data={data[key][sortKey]}
                  key={key}
                  options={options[key]}
                  graph_id={"LineChart" + ind}
                  width={"98%"}
                  height={"50%"}
                  legend_toggle={true}
                />
              );
            }
          })}
        </div>
      );
    } else {
      if (window.innerWidth > 1000) {
        var width = 98.0 / (Object.keys(data).length - 1);
        if (Object.keys(data).length - 1 > 2) {
          width = 49.0;
        }
      } else {
        var width = 98.0;
      }

      return (
        <div className="HPChart">
          <div style={{ alignItems: "center", textAlign: "center" }}>
            <span>{intl.translate("表示項目", this.props.locale)}</span>
            <FormControl
              componentClass="select"
              value={this.state.sortKey}
              style={{ width: "400px", margin: "2px 5px" }}
              onChange={this.handleEvent.bind(this, "sortKey")}
            >
              {selector[this.props.locale].supported_simulationchartsortkeys}
            </FormControl>
          </div>

          {Object.keys(data).map(function(key, ind) {
            if (key != "minMaxArr") {
              return (
                <Chart
                  chartType="LineChart"
                  className="LineChart"
                  data={data[key][sortKey]}
                  key={key}
                  options={options[key]}
                  graph_id={"LineChart" + ind}
                  width={width + "%"}
                  height={"400px"}
                  legend_toggle={true}
                />
              );
            }
          })}
        </div>
      );
    }
  }
}

module.exports.SimulationChart = SimulationChart;
