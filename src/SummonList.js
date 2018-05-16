var React = require("react");
var intl = require("./translate.js");
var { FormControl, Row, Grid } = require("react-bootstrap");
var { Summon } = require("./summon.js");

var GlobalConst = require("./global_const.js");

// inject GlobalConst...
var selector = GlobalConst.selector;

class SummonList extends React.Component {
  constructor(props) {
    super(props);
    // summonsはkey管理のためだけの配列
    // summonsのindexが表示順 = Summonのprops.idになる
    var sm = [];
    for (var i = 0; i < props.summonNum; i++) {
      sm.push(i);
    }

    this.state = {
      smlist: [],
      defaultElement: "fire",
      summons: sm,
      arrayForCopy: {}
    };
  }

  updateSummonNum = (num) => {
    var summons = this.state.summons;

    if (summons.length < num) {
      var maxvalue = Math.max.apply(null, summons);
      for (var i = 0; i < num - summons.length; i++) {
        summons.push(i + maxvalue + 1);
      }
    } else {
      // ==の場合は考えなくてよい (問題がないので)
      while (summons.length > num) {
        summons.pop();
      }
    }
    this.setState({ summons: summons });
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataName != this.props.dataName) {
      this.setState({ smlist: nextProps.dataForLoad });
      this.updateSummonNum(nextProps.summonNum);
      return 0;
    }

    if (parseInt(nextProps.summonNum) < parseInt(this.props.summonNum)) {
      var newsmlist = this.state.smlist;
      while (newsmlist.length > nextProps.summonNum) {
        newsmlist.pop();
      }
      this.setState({ smlist: newsmlist });
    }
    this.updateSummonNum(nextProps.summonNum);
  }

  handleOnCopy = (id, state) => {
    if (id < this.props.summonNum - 1) {
      // arrayForCopyにコピー対象のstateを入れておいて、
      // componentWillReceivePropsで読み出されるようにする
      var newArrayForCopy = this.state.arrayForCopy;
      newArrayForCopy[id + 1] = JSON.parse(JSON.stringify(state));
      this.setState({ arrayForCopy: newArrayForCopy });

      // smlist側の更新
      var newsmlist = this.state.smlist;
      newsmlist[id + 1] = JSON.parse(JSON.stringify(state));
      this.setState({ smlist: newsmlist });

      // Root へ変化を伝搬
      this.props.onChange(newsmlist);
    }
  };

  handleOnRemove = (id, initialState) => {
    // arrayForCopyに初期stateを入れておいて、
    // componentWillReceivePropsで読み出されるようにする
    var newArrayForCopy = this.state.arrayForCopy;
    newArrayForCopy[id] = initialState;
    this.setState({ arrayForCopy: newArrayForCopy });

    // smlist側の更新
    var newsmlist = this.state.smlist;
    newsmlist[id] = initialState;
    this.setState({ smlist: newsmlist });

    // Root へ変化を伝搬
    this.props.onChange(newsmlist);
  };

  copyCompleted = (id) => {
    var state = this.state;
    delete state["arrayForCopy"][id];
    this.setState(state);
  };

  handleMoveUp = (id) => {
    if (id > 0) {
      var newsummons = this.state.summons;

      // charas swap
      newsummons.splice(id - 1, 2, newsummons[id], newsummons[id - 1]);
      this.setState({ summons: newsummons });

      // charalist swap
      var newsmlist = this.state.smlist;
      newsmlist.splice(id - 1, 2, newsmlist[id], newsmlist[id - 1]);
      this.setState({ smlist: newsmlist });

      // Root へ変化を伝搬
      this.props.onChange(newsmlist);
    }
  };

  handleMoveDown = (id) => {
    if (id < this.props.summonNum - 1) {
      var newsummons = this.state.summons;

      // charas swap
      newsummons.splice(id, 2, newsummons[id + 1], newsummons[id]);
      this.setState({ summons: newsummons });

      // charalist swap
      var newsmlist = this.state.smlist;
      newsmlist.splice(id, 2, newsmlist[id + 1], newsmlist[id]);
      this.setState({ smlist: newsmlist });
      // Root へ変化を伝搬
      this.props.onChange(newsmlist);
    }
  };

  handleOnChange = (key, state) => {
    var newsmlist = this.state.smlist;
    newsmlist[key] = state;
    this.setState({ smlist: newsmlist });
    this.props.onChange(newsmlist);
  };

  handleEvent = (key, e) => {
    var newState = this.state;
    newState[key] = e.target.value;
    this.setState(newState);
  };

  render() {
    var locale = this.props.locale;
    var summons = this.state.summons;
    var hChange = this.handleOnChange;
    var hRemove = this.handleOnRemove;
    var hCopy = this.handleOnCopy;
    var hMoveUp = this.handleMoveUp;
    var hMoveDown = this.handleMoveDown;
    var dataName = this.props.dataName;
    var defaultElement = this.state.defaultElement;
    var dataForLoad = this.props.dataForLoad;
    var arrayForCopy = this.state.arrayForCopy;
    var copyCompleted = this.copyCompleted;

    return (
      <div className="summonList">
        <span>{intl.translate("属性一括変更", locale)}</span>
        <FormControl
          componentClass="select"
          value={this.state.defaultElement}
          onChange={this.handleEvent.bind(this, "defaultElement")}
        >
          {" "}
          {selector[locale].summonElements}{" "}
        </FormControl>
        <h3 className="margin-top"> {intl.translate("召喚石", locale)} </h3>
        <Grid fluid>
          <Row>
            {summons.map(function(sm, ind) {
              return (
                <Summon
                  key={sm}
                  onRemove={hRemove}
                  onCopy={hCopy}
                  onChange={hChange}
                  onMoveUp={hMoveUp}
                  onMoveDown={hMoveDown}
                  id={ind}
                  dataName={dataName}
                  defaultElement={defaultElement}
                  copyCompleted={copyCompleted}
                  locale={locale}
                  dataForLoad={dataForLoad}
                  arrayForCopy={arrayForCopy[ind]}
                />
              );
            })}
          </Row>
        </Grid>
      </div>
    );
  }
}

module.exports.SummonList = SummonList;
