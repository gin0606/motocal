var React = require("react");

var {
  Button,
  FormControl,
  Modal,
  Panel,
  PanelGroup
} = require("react-bootstrap");
var GlobalConst = require("./global_const.js");
var { RegisteredArm } = require("./RegisteredArm.js");
var intl = require("./translate.js");

// inject GlobalConst...
var selector = GlobalConst.selector;
var _ua = GlobalConst._ua;

var { Arm } = require("./Arm.js");

// ArmList has a number of Arm objects.
class ArmList extends React.Component {
  constructor(props) {
    super(props);
    var al = [];
    for (var i = 0; i < props.armNum; i++) al[i] = [];

    var arms = [];
    for (var i = 0; i < props.armNum; i++) {
      arms.push(i);
    }

    this.state = {
      // 武器リストをRootに渡すための連想配列
      alist: al,
      // 武器リストを管理するための連想配列
      // indexによって保存データとの対応を取り、
      // その値をkeyとして使うことでコンポーネントの削除などを行う
      arms: arms,
      defaultElement: "fire",
      addArm: null,
      addArmID: -1,
      considerNum: 1,
      openPresets: false,
      arrayForCopy: {}
    };
  }

  closePresets = () => {
    this.setState({ openPresets: false });
  };

  openPresets = () => {
    this.setState({ openPresets: true });
  };

  updateArmNum = (num) => {
    var arms = this.state.arms;
    if (arms.length < num) {
      var maxvalue = Math.max.apply(null, arms);
      for (var i = 0; i < num - arms.length; i++) {
        arms.push(i + maxvalue + 1);
      }
    } else {
      // ==の場合は考えなくてよい (問題がないので)
      while (arms.length > num) {
        arms.pop();
      }
    }
    this.setState({ arms: arms });
  };

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.dataName != this.props.dataName &&
      Array.isArray(nextProps.dataForLoad)
    ) {
      this.setState({ alist: nextProps.dataForLoad });
      this.updateArmNum(nextProps.armNum);
      return 0;
    }

    // iPadなどで一度数字が消された場合NaNになる
    if (!isNaN(parseInt(nextProps.armNum))) {
      // 今回のarmNumが小さくなったらalistも切り落とす (前回がNaNの場合も行う)
      if (
        isNaN(parseInt(this.props.armNum)) ||
        parseInt(nextProps.armNum) < parseInt(this.props.armNum)
      ) {
        var newalist = this.state.alist;
        while (newalist.length > nextProps.armNum) {
          newalist.pop();
        }
        this.setState({ alist: newalist });
      }
      this.updateArmNum(nextProps.armNum);
    }
  }

  handleOnCopy = (id, state) => {
    if (id < this.props.armNum - 1) {
      // arrayForCopyにコピー対象のstateを入れておいて、
      // componentWillReceivePropsで読み出されるようにする
      var newArrayForCopy = this.state.arrayForCopy;
      newArrayForCopy[id + 1] = JSON.parse(JSON.stringify(state));
      this.setState({ arrayForCopy: newArrayForCopy });

      var newalist = this.state.alist;
      newalist[id + 1] = JSON.parse(JSON.stringify(state));
      this.setState({ alist: newalist });

      // Root へ変化を伝搬
      this.props.onChange(newalist, false);
    }
  };

  handleOnRemove = (id, initialState) => {
    // arrayForCopyに初期stateを入れておいて、
    // componentWillReceivePropsで読み出されるようにする
    var newArrayForCopy = this.state.arrayForCopy;
    newArrayForCopy[id] = initialState;
    this.setState({ arrayForCopy: newArrayForCopy });

    var newalist = this.state.alist;
    newalist[id] = initialState;
    this.setState({ alist: newalist });

    // Root へ変化を伝搬
    this.props.onChange(newalist, false);
  };

  handleMoveUp = (id) => {
    if (id > 0) {
      var newarms = this.state.arms;

      // swap
      newarms.splice(id - 1, 2, newarms[id], newarms[id - 1]);
      this.setState({ arms: newarms });

      var newalist = this.state.alist;
      newalist.splice(id - 1, 2, newalist[id], newalist[id - 1]);
      this.setState({ alist: newalist });

      // Root へ変化を伝搬
      this.props.onChange(newalist, false);
    }
  };

  handleMoveDown = (id) => {
    if (id < this.props.armNum - 1) {
      var newarms = this.state.arms;

      // charas swap
      newarms.splice(id, 2, newarms[id + 1], newarms[id]);
      this.setState({ arms: newarms });

      // charalist swap
      var newalist = this.state.alist;
      newalist.splice(id, 2, newalist[id + 1], newalist[id]);
      this.setState({ alist: newalist });
      // Root へ変化を伝搬
      this.props.onChange(newalist, false);
    }
  };

  copyCompleted = (id) => {
    var state = this.state;
    delete state["arrayForCopy"][id];
    this.setState(state);
  };

  handleOnChange = (key, state, isSubtle) => {
    var newalist = this.state.alist;
    newalist[key] = state;
    this.setState({ alist: newalist });
    this.setState({ addArm: null });
    this.props.onChange(newalist, isSubtle);
  };

  handleEvent = (key, e) => {
    var newState = this.state;
    newState[key] = e.target.value;
    newState["addArm"] = null;
    this.setState(newState);
  };

  addTemplateArm = (templateArm, considerNum) => {
    var minimumID = -1;
    for (var key in this.state.alist) {
      if (this.state.alist[key].name == "") {
        minimumID = key;
        break;
      }
    }
    if (minimumID >= 0) {
      this.setState({ addArm: templateArm });
      this.setState({ addArmID: minimumID });
      this.setState({ considerNum: considerNum });
      if (_ua.Mobile || _ua.Tablet) {
        alert("追加しました。");
      }
    } else {
      var newKey = this.props.pleaseAddArmNum() - 1;
      if (newKey >= 0) {
        this.setState({ addArm: templateArm });
        this.setState({ addArmID: newKey });
        this.setState({ considerNum: considerNum });
        if (_ua.Mobile || _ua.Tablet) {
          alert("追加しました。");
        }
      } else {
        alert("武器がいっぱいです。");
      }
    }
  };

  render() {
    var locale = this.props.locale;
    var dataName = this.props.dataName;
    var arms = this.state.arms;
    var alist = this.state.alist;
    var hChange = this.handleOnChange;
    var hRemove = this.handleOnRemove;
    var hCopy = this.handleOnCopy;
    var hMoveUp = this.handleMoveUp;
    var hMoveDown = this.handleMoveDown;
    var defaultElement = this.state.defaultElement;
    var addArm = this.state.addArm;
    var addArmID = this.state.addArmID;
    var considerNum = this.state.considerNum;
    var openPresets = this.openPresets;
    var dataForLoad = this.props.dataForLoad;
    var arrayForCopy = this.state.arrayForCopy;
    var copyCompleted = this.copyCompleted;

    // view 用
    var panel_style = { textAlign: "left" };

    return (
      <div className="armList">
        <Button
          block
          bsStyle="success"
          bsSize="large"
          onClick={this.openPresets}
        >
          <i className="fa fa-folder-open" aria-hidden="true" />
          {intl.translate("武器テンプレート", locale)}
        </Button>
        <br />
        <span>{intl.translate("属性一括変更", locale)}</span>
        <FormControl
          componentClass="select"
          value={this.state.defaultElement}
          onChange={this.handleEvent.bind(this, "defaultElement")}
        >
          {" "}
          {selector[locale].elements}{" "}
        </FormControl>

        <PanelGroup defaultActiveKey={0} accordion>
          {arms.map(function(arm, ind) {
            return (
              <Panel
                key={arm}
                bsStyle="default"
                style={panel_style}
                eventKey={arm}
                header={
                  <span>
                    {ind + 1}: {alist[ind] != null ? alist[ind].name : ""}
                    &nbsp;{" "}
                    {alist[ind] != null && alist[ind].name != ""
                      ? alist[ind].considerNumberMax + "本"
                      : ""}
                  </span>
                }
              >
                <Arm
                  key={arm}
                  onChange={hChange}
                  onRemove={hRemove}
                  onCopy={hCopy}
                  onMoveUp={hMoveUp}
                  onMoveDown={hMoveDown}
                  addArm={addArm}
                  addArmID={addArmID}
                  considerNum={considerNum}
                  id={ind}
                  keyid={arm}
                  dataName={dataName}
                  defaultElement={defaultElement}
                  locale={locale}
                  openPresets={openPresets}
                  dataForLoad={dataForLoad}
                  arrayForCopy={arrayForCopy[ind]}
                  copyCompleted={copyCompleted}
                />
              </Panel>
            );
          })}
        </PanelGroup>

        <Modal show={this.state.openPresets} onHide={this.closePresets}>
          <Modal.Header closeButton>
            <Modal.Title>Presets</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <RegisteredArm onClick={this.addTemplateArm} locale={locale} />
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

module.exports.ArmList = ArmList;
