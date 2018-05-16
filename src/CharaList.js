var React = require("react");
var intl = require("./translate.js");
var {
  FormControl,
  Button,
  Panel,
  PanelGroup,
  Modal,
  Glyphicon
} = require("react-bootstrap");
var { RegisteredChara } = require("./RegisteredChara.js");
var GlobalConst = require("./global_const.js");
var { Chara } = require("./Chara.js");

// inject GlobalConst...
var selector = GlobalConst.selector;
var _ua = GlobalConst._ua;

class CharaList extends React.Component {
  constructor(props) {
    super(props);
    var charas = [];
    for (var i = 0; i < props.charaNum; i++) {
      charas.push(i);
    }

    this.state = {
      charalist: [],
      charas: charas,
      defaultElement: "fire",
      addChara: null,
      addCharaID: -1,
      openPresets: false,
      arrayForCopy: {}
    };
  }

  updateCharaNum = (num) => {
    var charas = this.state.charas;

    if (charas.length < num) {
      var maxvalue = Math.max.apply(null, charas);
      for (var i = 0; i < num - charas.length; i++) {
        charas.push(i + maxvalue + 1);
      }
    } else {
      // ==の場合は考えなくてよい (問題がないので)
      while (charas.length > num) {
        charas.pop();
      }
    }
    this.setState({ charas: charas });
  };

  closePresets = () => {
    this.setState({ openPresets: false });
  };

  openPresets = () => {
    this.setState({ openPresets: true });
  };

  componentDidMount() {
    if (this.props.dataForLoad != undefined) {
      this.setState({ charalist: this.props.dataForLoad });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataName != this.props.dataName) {
      this.setState({ charalist: nextProps.dataForLoad });
      this.updateCharaNum(nextProps.charaNum);
      return 0;
    }

    if (parseInt(nextProps.charaNum) < parseInt(this.props.charaNum)) {
      var newcharalist = this.state.charalist;
      while (newcharalist.length > nextProps.charaNum) {
        newcharalist.pop();
      }
      this.setState({ charalist: newcharalist });
    }
    this.updateCharaNum(nextProps.charaNum);
  }

  handleOnChange = (key, state, isSubtle) => {
    var newcharalist = this.state.charalist;
    newcharalist[key] = state;
    this.setState({ charalist: newcharalist });
    this.setState({ addChara: null });
    this.props.onChange(newcharalist, isSubtle);
  };

  handleEvent = (key, e) => {
    var newState = this.state;
    newState[key] = e.target.value;
    newState["addChara"] = null;
    this.setState(newState);
  };

  handleOnRemove = (id, initialState) => {
    // arrayForCopy に initial state を入れておいて、
    // componentWillReceivePropsで読み出されるようにする
    var newArrayForCopy = this.state.arrayForCopy;
    newArrayForCopy[id] = JSON.parse(JSON.stringify(initialState));
    this.setState({ arrayForCopy: newArrayForCopy });

    var newcharalist = this.state.charalist;
    newcharalist[id] = initialState;
    this.setState({ charalist: newcharalist });

    // Root へ変化を伝搬
    this.props.onChange(newcharalist, false);
  };

  copyCompleted = (id) => {
    var state = this.state;
    delete state["arrayForCopy"][id];
    this.setState(state);
  };

  handleMoveUp = (id) => {
    if (id > 0) {
      var newcharas = this.state.charas;

      // charas swap
      newcharas.splice(id - 1, 2, newcharas[id], newcharas[id - 1]);
      this.setState({ charas: newcharas });

      // charalist swap
      var newcharalist = this.state.charalist;
      newcharalist.splice(id - 1, 2, newcharalist[id], newcharalist[id - 1]);
      this.setState({ charalist: newcharalist });
      // Root へ変化を伝搬
      this.props.onChange(newcharalist, false);
    }
  };

  handleMoveDown = (id) => {
    if (id < this.props.charaNum - 1) {
      var newcharas = this.state.charas;

      // charas swap
      newcharas.splice(id, 2, newcharas[id + 1], newcharas[id]);
      this.setState({ charas: newcharas });

      // charalist swap
      var newcharalist = this.state.charalist;
      newcharalist.splice(id, 2, newcharalist[id + 1], newcharalist[id]);
      this.setState({ charalist: newcharalist });
      // Root へ変化を伝搬
      this.props.onChange(newcharalist, false);
    }
  };

  addTemplateChara = (templateChara) => {
    var minimumID = -1;
    for (var key in this.state.charalist) {
      if (this.state.charalist[key].name == "") {
        minimumID = key;
        break;
      }
    }
    if (minimumID >= 0) {
      this.setState({ addChara: templateChara });
      this.setState({ addCharaID: minimumID });
      if (_ua.Mobile || _ua.Tablet) {
        alert(intl.translate("追加しました", this.props.locale));
      }
    } else {
      var newKey = this.props.pleaseAddCharaNum() - 1;

      if (newKey >= 0) {
        this.setState({ addChara: templateChara });
        this.setState({ addCharaID: newKey });
        if (_ua.Mobile || _ua.Tablet) {
          alert(intl.translate("追加しました", this.props.locale));
        }
      } else {
        alert(intl.translate("キャラがいっぱい", this.props.locale));
      }
    }
  };

  render() {
    var locale = this.props.locale;
    var charas = this.state.charas;
    var charalist = this.state.charalist;
    var hChange = this.handleOnChange;
    var dataName = this.props.dataName;
    var defaultElement = this.state.defaultElement;
    var addChara = this.state.addChara;
    var addCharaID = this.state.addCharaID;
    var handleOnRemove = this.handleOnRemove;
    var handleMoveUp = this.handleMoveUp;
    var handleMoveDown = this.handleMoveDown;
    var openPresets = this.openPresets;
    var dataForLoad = this.props.dataForLoad;
    var arrayForCopy = this.state.arrayForCopy;
    var copyCompleted = this.copyCompleted;

    // view 用
    var panel_style = { textAlign: "left" };

    return (
      <div className="charaList">
        <Button
          block
          bsStyle="success"
          bsSize="large"
          onClick={this.openPresets}
        >
          <i className="fa fa-folder-open" aria-hidden="true" />
          {intl.translate("キャラテンプレート", locale)}
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
          {charas.map(function(c, ind) {
            return (
              <Panel
                key={c}
                bsStyle="default"
                style={panel_style}
                eventKey={c}
                header={
                  <span>
                    {ind < 3 ? "Front " : "Sub "}
                    {ind + 1}:{" "}
                    {charalist[ind] != null ? charalist[ind].name : ""}
                    &nbsp;<Glyphicon glyph="pencil" />
                  </span>
                }
              >
                <Chara
                  key={c}
                  onChange={hChange}
                  onRemove={handleOnRemove}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  id={ind}
                  dataName={dataName}
                  defaultElement={defaultElement}
                  addChara={addChara}
                  addCharaID={addCharaID}
                  locale={locale}
                  openPresets={openPresets}
                  dataForLoad={dataForLoad}
                  copyCompleted={copyCompleted}
                  arrayForCopy={arrayForCopy[ind]}
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
            <RegisteredChara onClick={this.addTemplateChara} locale={locale} />
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

module.exports.CharaList = CharaList;
