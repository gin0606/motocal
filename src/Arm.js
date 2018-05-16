var React = require("react");

var { Button, ButtonGroup, FormControl } = require("react-bootstrap");
var GlobalConst = require("./global_const.js");
var intl = require("./translate.js");

// inject GlobalConst...
var selector = GlobalConst.selector;

var initialState = {
  name: "",
  attack: 0,
  hp: 0,
  armType: "sword",
  skill1: "non",
  skill2: "non",
  slv: 1,
  considerNumberMin: 0,
  considerNumberMax: 1,
  element: "fire",
  element2: "fire"
};

// Arm is a fundamental object corresponding one arm.
class Arm extends React.Component {
  state = initialState;

  componentWillReceiveProps(nextProps) {
    // only fired on Data Load
    if (nextProps.dataName != this.props.dataName) {
      if (
        nextProps.dataForLoad != undefined &&
        this.props.id in nextProps.dataForLoad
      ) {
        var newState = nextProps.dataForLoad[this.props.id];
        this.setState(newState);
        return 0;
      }
    }

    // もし arrayForCopy に自分に該当するキーがあるなら読み込む
    // コピー(またはリセット)後は ArmList に伝えて該当データを消す
    if (nextProps.arrayForCopy != undefined) {
      var state = nextProps.arrayForCopy;
      this.setState(state);
      this.props.copyCompleted(this.props.id);
      return 0;
    }

    if (nextProps.defaultElement != this.props.defaultElement) {
      var newState = this.state;
      newState["element"] = nextProps.defaultElement;
      newState["element2"] = nextProps.defaultElement;
      this.setState(newState);
      this.props.onChange(this.props.id, newState, false);
    }

    if (
      nextProps.addArm != null &&
      nextProps.addArm != this.props.addArm &&
      this.props.id == nextProps.addArmID
    ) {
      var newState = this.treatAddArmFromTemplate(
        this.state,
        nextProps.addArm,
        nextProps.considerNum
      );
      this.setState(newState);
      this.props.onChange(this.props.id, newState, false);
    }
  }

  componentDidMount() {
    var state = this.state;

    // もし dataForLoad に自分に該当するキーがあるなら読み込む
    // (データロード時に新しく増えたコンポーネント用)
    var armlist = this.props.dataForLoad;
    if (
      this.props.dataForLoad != undefined &&
      this.props.id in this.props.dataForLoad
    ) {
      state = this.props.dataForLoad[this.props.id];
      this.setState(state);
      return 0;
    }

    // もし addArmID が自分のIDと同じなら、templateデータを読み込む
    if (this.props.addArm != null && this.props.id == this.props.addArmID) {
      state = this.treatAddArmFromTemplate(
        this.state,
        this.props.addArm,
        this.props.considerNum
      );
      this.setState(state);
    }

    // 初期化後 (何も処理が行われていなくても) state を 上の階層に渡しておく
    // armList では onChange が勝手に上に渡してくれるので必要なし
    this.props.onChange(this.props.id, state, false);
  }

  treatAddArmFromTemplate = (state, newarm, considerNum) => {
    state["name"] = newarm.name;

    var attackCalcFunc = (lv, minlv, atk, minatk, plus, levelWidth) => {
      return Math.floor(
        (lv - minlv) * (parseInt(atk) - parseInt(minatk)) / levelWidth +
          parseInt(minatk) +
          5 * parseInt(plus)
      );
    };
    var hpCalcFunc = (lv, minlv, hp, minhp, plus, levelWidth) => {
      return Math.floor(
        (lv - minlv) * (parseInt(hp) - parseInt(minhp)) / levelWidth +
          parseInt(minhp) +
          parseInt(plus)
      );
    };

    // Lv別処理
    if (newarm.lv == 1) {
      // Lv1の場合だけ特殊 (Lv2になるとステータスが2レベル分上がる)
      state["attack"] = parseInt(newarm.minattack) + 5 * newarm.plus;
      state["hp"] = parseInt(newarm.minhp) + newarm.plus;
    } else {
      var max_level = parseInt(newarm.maxlv);
      if (max_level === 75) {
        state["attack"] = attackCalcFunc(
          newarm.lv,
          0,
          newarm.attack,
          newarm.minattack,
          newarm.plus,
          75.0
        );
        state["hp"] = hpCalcFunc(
          newarm.lv,
          0,
          newarm.hp,
          newarm.minhp,
          newarm.plus,
          75.0
        );
      } else if (max_level === 100) {
        state["attack"] = attackCalcFunc(
          newarm.lv,
          0,
          newarm.attack,
          newarm.minattack,
          newarm.plus,
          100.0
        );
        state["hp"] = hpCalcFunc(
          newarm.lv,
          0,
          newarm.hp,
          newarm.minhp,
          newarm.plus,
          100.0
        );
      } else if (max_level === 120) {
        if (newarm.lv <= 75) {
          // Lv75以下が選択された場合は一段階下の値で処理する
          state["attack"] = attackCalcFunc(
            newarm.lv,
            0,
            newarm.attacklv75,
            newarm.minattack,
            newarm.plus,
            75.0
          );
          state["hp"] = hpCalcFunc(
            newarm.lv,
            0,
            newarm.hplv75,
            newarm.minhp,
            newarm.plus,
            75.0
          );
        } else {
          state["attack"] = attackCalcFunc(
            newarm.lv,
            75,
            newarm.attack,
            newarm.attacklv75,
            newarm.plus,
            45.0
          );
          state["hp"] = hpCalcFunc(
            newarm.lv,
            75,
            newarm.hp,
            newarm.hplv75,
            newarm.plus,
            45.0
          );
        }
      } else if (max_level === 150) {
        if (newarm.lv <= 100) {
          // Lv100以下が選択された場合は一段階下の値で処理する
          state["attack"] = attackCalcFunc(
            newarm.lv,
            0,
            newarm.attacklv100,
            newarm.minattack,
            newarm.plus,
            100.0
          );
          state["hp"] = hpCalcFunc(
            newarm.lv,
            0,
            newarm.hplv100,
            newarm.minhp,
            newarm.plus,
            100.0
          );
        } else {
          state["attack"] = attackCalcFunc(
            newarm.lv,
            100,
            newarm.attack,
            newarm.attacklv100,
            newarm.plus,
            50.0
          );
          state["hp"] = hpCalcFunc(
            newarm.lv,
            100,
            newarm.hp,
            newarm.hplv100,
            newarm.plus,
            50.0
          );
        }
      } else if (max_level === 200) {
        if (newarm.lv <= 100) {
          // Lv100以下が選択された場合は二段階下の値で処理する
          state["attack"] = attackCalcFunc(
            newarm.lv,
            0,
            newarm.attacklv100,
            newarm.minattack,
            newarm.plus,
            100.0
          );
          state["hp"] = hpCalcFunc(
            newarm.lv,
            0,
            newarm.hplv100,
            newarm.minhp,
            newarm.plus,
            100.0
          );
        } else if (newarm.lv <= 150) {
          // Lv150以下が選択された場合は一段階下の値で処理する
          state["attack"] = attackCalcFunc(
            newarm.lv,
            100,
            newarm.attacklv150,
            newarm.attacklv100,
            newarm.plus,
            50.0
          );
          state["hp"] = hpCalcFunc(
            newarm.lv,
            100,
            newarm.hplv150,
            newarm.hplv100,
            newarm.plus,
            50.0
          );
        } else {
          state["attack"] = attackCalcFunc(
            newarm.lv,
            150,
            newarm.attack,
            newarm.attacklv150,
            newarm.plus,
            50.0
          );
          state["hp"] = hpCalcFunc(
            newarm.lv,
            150,
            newarm.hp,
            newarm.hplv150,
            newarm.plus,
            50.0
          );
        }
      }
    }

    if (newarm.lv != parseInt(newarm.maxlv)) state["name"] += "Lv." + newarm.lv;
    if (newarm.plus != 0) state["name"] += "+" + newarm.plus;

    state["armType"] = newarm.type;
    state["element"] = newarm.element;
    state["skill1"] = newarm.skill1;
    state["element2"] = newarm.element2;
    state["skill2"] = newarm.skill2;
    state["slv"] = newarm.slv;
    state["considerNumberMax"] = parseInt(considerNum);

    return state;
  };

  handleEvent = (key, e) => {
    // input の時は親に送らない
    var newState = this.state;
    newState[key] = e.target.value;
    this.setState(newState);
  };

  handleSelectEvent = (key, e) => {
    // Selectの時は親に送ってしまっていい
    var newState = this.state;
    if (key == "considerNumberMin") {
      if (parseInt(e.target.value) > parseInt(this.state.considerNumberMax)) {
        newState["considerNumberMax"] = parseInt(e.target.value);
      }
      newState[key] = parseInt(e.target.value);
    } else if (key == "considerNumberMax") {
      if (parseInt(e.target.value) < parseInt(this.state.considerNumberMin)) {
        newState["considerNumberMin"] = parseInt(e.target.value);
      }
      newState[key] = parseInt(e.target.value);
    } else {
      newState[key] = e.target.value;
    }

    this.setState(newState);
    this.props.onChange(this.props.id, newState, false);
  };

  handleOnBlur = (key, e) => {
    // フォーカスが外れた時だけ変更を親に送る
    if (key == "name") {
      this.props.onChange(this.props.id, this.state, true);
    } else {
      this.props.onChange(this.props.id, this.state, false);
    }
  };

  clickRemoveButton = (e) => {
    var initState = initialState;
    initState["considerNumberMax"] = 0;
    this.props.onRemove(this.props.id, initState);
  };

  clickCopyButton = (e, state) => {
    this.props.onCopy(this.props.id, this.state);
  };

  clickMoveUp = (e) => {
    this.props.onMoveUp(this.props.id);
  };

  clickMoveDown = (e) => {
    this.props.onMoveDown(this.props.id);
  };

  openPresets = (e) => {
    if (e.target.value == "" && this.state.attack == 0) {
      e.target.blur();
      this.setState({ attack: 1 });
      this.props.openPresets();
    }
  };

  render() {
    var locale = this.props.locale;

    return (
      <div className="chara-content">
        <table className="table table-sm table-bordered table-responsive">
          <tbody>
            <tr>
              <th className="bg-primary">{intl.translate("武器名", locale)}</th>
              <td>
                <FormControl
                  type="text"
                  placeholder={intl.translate("武器名", locale)}
                  value={this.state.name}
                  onBlur={this.handleOnBlur.bind(this, "name")}
                  onFocus={this.openPresets}
                  onChange={this.handleEvent.bind(this, "name")}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-primary">{intl.translate("攻撃力", locale)}</th>
              <td>
                <FormControl
                  type="number"
                  placeholder="0以上の整数"
                  min="0"
                  value={this.state.attack}
                  onBlur={this.handleOnBlur.bind(this, "attack")}
                  onChange={this.handleEvent.bind(this, "attack")}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-primary">HP</th>
              <td>
                <FormControl
                  type="number"
                  placeholder="0以上の整数"
                  min="0"
                  value={this.state.hp}
                  onBlur={this.handleOnBlur.bind(this, "hp")}
                  onChange={this.handleEvent.bind(this, "hp")}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-primary">{intl.translate("種類", locale)}</th>
              <td>
                <FormControl
                  componentClass="select"
                  value={this.state.armType}
                  onChange={this.handleSelectEvent.bind(this, "armType")}
                >
                  {" "}
                  {selector[locale].armtypes}{" "}
                </FormControl>
              </td>
            </tr>
            <tr>
              <th className="bg-primary">
                {intl.translate("スキル", locale)}1
              </th>
              <td>
                <FormControl
                  componentClass="select"
                  value={this.state.element}
                  onChange={this.handleSelectEvent.bind(this, "element")}
                >
                  {" "}
                  {selector[locale].elements}{" "}
                </FormControl>
                <FormControl
                  componentClass="select"
                  value={this.state.skill1}
                  onChange={this.handleSelectEvent.bind(this, "skill1")}
                >
                  {" "}
                  {selector[locale].skills}
                </FormControl>
                <br />
              </td>
            </tr>
            <tr>
              <th className="bg-primary">
                {intl.translate("スキル", locale)}2
              </th>
              <td>
                <FormControl
                  componentClass="select"
                  value={this.state.element2}
                  onChange={this.handleSelectEvent.bind(this, "element2")}
                >
                  {" "}
                  {selector[locale].elements}{" "}
                </FormControl>
                <FormControl
                  componentClass="select"
                  value={this.state.skill2}
                  onChange={this.handleSelectEvent.bind(this, "skill2")}
                >
                  {" "}
                  {selector[locale].skills}
                </FormControl>
                <br />
              </td>
            </tr>
            <tr>
              <th className="bg-primary">SLv</th>
              <td>
                <FormControl
                  componentClass="select"
                  value={this.state.slv}
                  onChange={this.handleSelectEvent.bind(this, "slv")}
                >
                  {" "}
                  {selector.slv}{" "}
                </FormControl>
              </td>
            </tr>
            <tr>
              <th className="bg-primary">
                {intl.translate("最小本数", locale)}
              </th>
              <td>
                <FormControl
                  componentClass="select"
                  value={this.state.considerNumberMin}
                  onChange={this.handleSelectEvent.bind(
                    this,
                    "considerNumberMin"
                  )}
                >
                  {" "}
                  {selector.consider}{" "}
                </FormControl>
              </td>
            </tr>
            <tr>
              <th className="bg-primary">
                {intl.translate("最大本数", locale)}
              </th>
              <td>
                <FormControl
                  componentClass="select"
                  value={this.state.considerNumberMax}
                  onChange={this.handleSelectEvent.bind(
                    this,
                    "considerNumberMax"
                  )}
                >
                  {" "}
                  {selector.consider}{" "}
                </FormControl>
              </td>
            </tr>
          </tbody>
        </table>
        <ButtonGroup style={{ width: "100%" }}>
          <Button
            bsStyle="default"
            style={{ width: "25%", margin: "2px 0px 2px 0px" }}
            onClick={this.clickMoveUp}
          >
            <i className="fa fa-angle-double-up" aria-hidden="true" />
            {intl.translate("前へ", locale)}
          </Button>
          <Button
            bsStyle="danger"
            style={{ width: "25%", margin: "2px 0px 2px 0px" }}
            onClick={this.clickRemoveButton}
          >
            {intl.translate("削除", locale)}
          </Button>
          <Button
            bsStyle="info"
            style={{ width: "25%", margin: "2px 0px 2px 0px" }}
            onClick={this.clickCopyButton}
          >
            {intl.translate("下にコピー", locale)}
          </Button>
          <Button
            bsStyle="default"
            style={{ width: "25%", margin: "2px 0px 2px 0px" }}
            onClick={this.clickMoveDown}
          >
            <i className="fa fa-angle-double-down" aria-hidden="true" />
            {intl.translate("後へ", locale)}
          </Button>
        </ButtonGroup>
      </div>
    );
  }
}

module.exports.Arm = Arm;
