var React = require("react");
var intl = require("./translate.js");
var { FormControl, Label, Button, ButtonGroup } = require("react-bootstrap");
var { ColP } = require("./ColP.js");
var GlobalConst = require("./global_const.js");

// inject GlobalConst...
var selector = GlobalConst.selector;

var Summon = React.createClass({
  getInitialState: function() {
    return {
      selfSummonType: "magna",
      selfSummonAmount: 100,
      selfSummonAmount2: 0,
      selfElement: "fire",
      friendSummonType: "element",
      friendSummonAmount: 80,
      friendSummonAmount2: 0,
      friendElement: "fire",
      attack: 0,
      hp: 0,
      hpBonus: 0,
      DA: 0,
      TA: 0,
      criticalRatio: 0.0
    };
  },
  componentDidMount: function() {
    var state = this.state;

    // もし dataForLoad に自分に該当するキーがあるなら読み込む
    // (データロード時に新しく増えた場合)
    if (this.props.dataForLoad != undefined) {
      var summon = this.props.dataForLoad;

      if (this.props.id in summon) {
        state = summon[this.props.id];
        this.setState(state);
        return 0;
      }
    }

    // 初期化後 state を 上の階層に渡しておく
    // summonList では onChange が勝手に上に渡してくれるので必要なし
    this.props.onChange(this.props.id, state);
  },
  componentWillReceiveProps: function(nextProps) {
    // データロード時のみ読み込み
    if (nextProps.dataName != this.props.dataName) {
      // 対応するIDが無い場合は undefined が飛んでくる
      if (nextProps.dataForLoad != undefined) {
        var summon = nextProps.dataForLoad;

        if (this.props.id in summon) {
          this.setState(summon[this.props.id]);
        }
      }
      return 0;
    }

    // もし arrayForCopy に自分に該当するキーがあるなら読み込む
    // コピー(またはリセット)後はSummonListに伝えて該当データを消す
    if (nextProps.arrayForCopy != undefined) {
      var state = nextProps.arrayForCopy;
      this.setState(state);
      this.props.copyCompleted(this.props.id);
      return 0;
    }

    if (nextProps.defaultElement != this.props.defaultElement) {
      var newState = this.state;
      newState["selfElement"] = nextProps.defaultElement;
      newState["friendElement"] = nextProps.defaultElement;
      this.setState(newState);
      this.props.onChange(this.props.id, newState);
    }
  },
  handleEvent: function(key, e) {
    var newState = this.state;
    newState[key] = e.target.value;
    this.setState(newState);
  },
  handleSelectEvent: function(key, e) {
    var newState = this.state;
    newState[key] = e.target.value;
    this.setState(newState);
    this.props.onChange(this.props.id, newState);
  },
  handleOnBlur: function(e) {
    this.props.onChange(this.props.id, this.state);
  },
  clickRemoveButton: function(e) {
    this.props.onRemove(this.props.id, this.getInitialState());
  },
  clickCopyButton: function(e, state) {
    this.props.onCopy(this.props.id, this.state);
  },
  clickMoveUp: function(e) {
    this.props.onMoveUp(this.props.id);
  },
  clickMoveDown: function(e) {
    this.props.onMoveDown(this.props.id);
  },
  handleSummonAmountChange(type, ind, e) {
    var newState = this.state;
    if (type == "self") {
      if (ind == 0) {
        newState["selfSummonAmount"] = e.target.value;
      } else {
        newState["selfSummonAmount2"] = e.target.value;
      }
    } else {
      if (ind == 0) {
        newState["friendSummonAmount"] = e.target.value;
      } else {
        newState["friendSummonAmount2"] = e.target.value;
      }
    }
    this.setState(newState);
    this.props.onChange(this.props.id, newState);
  },
  render: function() {
    var locale = this.props.locale;

    var selfSummon = [{ label: "", input: "select" }, { input: "hidden" }];
    if (this.state.selfSummonType == "odin") {
      selfSummon[1] = {
        label: intl.translate("キャラ", locale) + " ",
        input: "select"
      };
      selfSummon[0].label = intl.translate("属性", locale) + " ";
    }
    var friendSummon = [{ label: "", input: "select" }, { input: "hidden" }];
    if (this.state.friendSummonType == "odin") {
      friendSummon[1] = {
        label: intl.translate("キャラ", locale) + " ",
        input: "select"
      };
      friendSummon[0].label = intl.translate("属性", locale) + " ";
    }
    return (
      <ColP sxs={12} ssm={6} smd={4} className="col-no-bordered">
        <h3>
          <Label bsStyle="primary">Summon No.{this.props.id + 1}</Label>
        </h3>

        <table className="table table-sm table-bordered table-responsive">
          <tbody>
            <tr>
              <th rowSpan={3} className="bg-primary">
                {intl.translate("自分の石", locale)}
              </th>
              <td>
                <FormControl
                  componentClass="select"
                  value={this.state.selfElement}
                  onChange={this.handleSelectEvent.bind(this, "selfElement")}
                >
                  {selector[locale].summonElements}
                </FormControl>
              </td>
            </tr>
            <tr>
              <td>
                <FormControl
                  componentClass="select"
                  value={this.state.selfSummonType}
                  onChange={this.handleSelectEvent.bind(this, "selfSummonType")}
                >
                  {selector[locale].summons}
                </FormControl>
              </td>
            </tr>
            <tr>
              <td>
                {selfSummon[0].label}
                <FormControl
                  componentClass="select"
                  value={this.state.selfSummonAmount}
                  onChange={this.handleSummonAmountChange.bind(this, "self", 0)}
                >
                  {selector.summonAmounts}
                </FormControl>
                {selfSummon[1].label}
                <FormControl
                  componentClass="select"
                  className={selfSummon[1].input}
                  value={this.state.selfSummonAmount2}
                  onChange={this.handleSummonAmountChange.bind(this, "self", 1)}
                >
                  {selector.summonAmounts}
                </FormControl>
              </td>
            </tr>
            <tr>
              <th rowSpan={3} className="bg-primary">
                {intl.translate("フレの石", locale)}
              </th>
              <td>
                <FormControl
                  componentClass="select"
                  value={this.state.friendElement}
                  onChange={this.handleSelectEvent.bind(this, "friendElement")}
                >
                  {selector[locale].summonElements}
                </FormControl>
              </td>
            </tr>
            <tr>
              <td>
                <FormControl
                  componentClass="select"
                  value={this.state.friendSummonType}
                  onChange={this.handleSelectEvent.bind(
                    this,
                    "friendSummonType"
                  )}
                >
                  {selector[locale].summons}
                </FormControl>
              </td>
            </tr>
            <tr>
              <td>
                {friendSummon[0].label}
                <FormControl
                  componentClass="select"
                  value={this.state.friendSummonAmount}
                  onChange={this.handleSummonAmountChange.bind(
                    this,
                    "friend",
                    0
                  )}
                >
                  {selector.summonAmounts}
                </FormControl>
                {friendSummon[1].label}
                <FormControl
                  componentClass="select"
                  className={friendSummon[1].input}
                  value={this.state.friendSummonAmount2}
                  onChange={this.handleSummonAmountChange.bind(
                    this,
                    "friend",
                    1
                  )}
                >
                  {selector.summonAmounts}
                </FormControl>
              </td>
            </tr>
            <tr>
              <th className="bg-primary">
                {intl.translate("合計攻撃力", locale)}
              </th>
              <td>
                <FormControl
                  type="number"
                  min="0"
                  value={this.state.attack}
                  onBlur={this.handleOnBlur}
                  onChange={this.handleEvent.bind(this, "attack")}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-primary">{intl.translate("合計HP", locale)}</th>
              <td>
                <FormControl
                  type="number"
                  min="0"
                  value={this.state.hp}
                  onBlur={this.handleOnBlur}
                  onChange={this.handleEvent.bind(this, "hp")}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-primary">{intl.translate("HP加護", locale)}</th>
              <td>
                <FormControl
                  type="number"
                  min="0"
                  value={this.state.hpBonus}
                  onBlur={this.handleOnBlur}
                  onChange={this.handleEvent.bind(this, "hpBonus")}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-primary">{intl.translate("DA加護", locale)}</th>
              <td>
                <FormControl
                  type="number"
                  min="0"
                  value={this.state.DA}
                  onBlur={this.handleOnBlur}
                  onChange={this.handleEvent.bind(this, "DA")}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-primary">{intl.translate("TA加護", locale)}</th>
              <td>
                <FormControl
                  type="number"
                  min="0"
                  value={this.state.TA}
                  onBlur={this.handleOnBlur}
                  onChange={this.handleEvent.bind(this, "TA")}
                />
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
      </ColP>
    );
  }
});

module.exports.Summon = Summon;
