var React = require("react");
var { Button, FormControl, Modal, Image } = require("react-bootstrap");

var GlobalConst = require("./global_const.js");
var _ua = GlobalConst._ua;
var selector = GlobalConst.selector;

var { SendRequest } = require("./SendRequest.js");
var intl = require("./translate.js");

class RegisteredChara extends React.Component {
  state = {
    filterText: "",
    filterElement: "all",
    charaData: {},
    limit: 50,
    openSendRequest: false
  };

  componentDidMount() {
    $.ajax({
      url: "./charaData.json",
      dataType: "json",
      cache: false,
      timeout: 10000,
      success: function(data) {
        this.setState({ charaData: data });
      }.bind(this),
      error: function(xhr, status, err) {
        alert(
          "Error!: キャラデータの取得に失敗しました。\nstatus: " +
            status +
            "\nerror message: " +
            err.toString()
        );
        console.log("xhr:", xhr);
        console.log("status:", status);
        console.log("error: ", err);
      }.bind(this)
    });
  }

  clickedTemplate = (e) => {
    this.props.onClick(this.state.charaData[e.target.getAttribute("id")]);
  };

  handleEvent = (key, e) => {
    var newState = this.state;
    newState[key] = e.target.value;
    this.setState(newState);
  };

  openSendRequest = (e) => {
    this.setState({ openSendRequest: true });
  };

  closeSendRequest = (e) => {
    this.setState({ openSendRequest: false });
  };

  render() {
    var clickedTemplate = this.clickedTemplate;
    var filterText = this.state.filterText;
    var filterElement = this.state.filterElement;
    var charaData = this.state.charaData;
    var limit = this.state.limit;
    var displayed_count = 0;
    var locale = this.props.locale;

    if (_ua.Mobile || _ua.Tablet) {
      return (
        <div className="charaTemplate">
          <span>検索:</span>
          <FormControl
            type="text"
            placeholder={intl.translate("キャラ名", locale)}
            value={this.state.filterText}
            onChange={this.handleEvent.bind(this, "filterText")}
          />
          <FormControl
            componentClass="select"
            value={this.state.filterElement}
            onChange={this.handleEvent.bind(this, "filterElement")}
          >
            {selector[locale].filterelements}
          </FormControl>
          <div className="charaTemplateContent">
            {Object.keys(charaData).map(function(key, ind) {
              var charaName = charaData[key][locale];
              if (
                filterElement == "all" ||
                charaData[key].element == filterElement
              ) {
                if (filterText == "" || charaName.indexOf(filterText) != -1) {
                  if (displayed_count < limit) {
                    displayed_count++;
                    return (
                      <div className="onechara" key={key}>
                        <p>{charaName}</p>
                        <br />
                        <Image
                          rounded
                          onClick={clickedTemplate}
                          id={key}
                          src={charaData[key].imageURL}
                          alt={key}
                        />
                      </div>
                    );
                  } else {
                    return "";
                  }
                }
              }
              return "";
            })}
          </div>
        </div>
      );
    } else {
      return (
        <div className="charaTemplate">
          <span>検索:</span>
          <FormControl
            type="text"
            placeholder={intl.translate("キャラ名", locale)}
            value={this.state.filterText}
            onChange={this.handleEvent.bind(this, "filterText")}
          />
          <FormControl
            componentClass="select"
            value={this.state.filterElement}
            onChange={this.handleEvent.bind(this, "filterElement")}
          >
            {selector[locale].filterelements}
          </FormControl>
          <div className="charaTemplateContent">
            {Object.keys(charaData).map(function(key, ind) {
              var charaName = charaData[key][locale];
              if (
                filterElement == "all" ||
                charaData[key].element == filterElement
              ) {
                if (filterText == "" || charaName.indexOf(filterText) != -1) {
                  return (
                    <div className="onechara" key={key}>
                      <p>{charaName}</p>
                      <br />
                      <Image
                        rounded
                        onClick={clickedTemplate}
                        id={key}
                        src={charaData[key].imageURL}
                        alt={key}
                      />
                    </div>
                  );
                }
              }
              return "";
            })}
          </div>

          {locale == "en" ? (
            <p className="text-danger">
              Help me English translation of templates on&nbsp;
              <a
                href="https://docs.google.com/spreadsheets/d/12R-ZQD8xy1dYYoFxjcWNN0mva1NaDIQB1XSY95jfSKg/edit"
                target="_blank"
              >
                Google Spreadsheet
              </a>!
            </p>
          ) : null}
          <Button onClick={this.openSendRequest} bsStyle="danger">
            {intl.translate("追加要望を送る", locale)}
          </Button>

          <Modal
            show={this.state.openSendRequest}
            onHide={this.closeSendRequest}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {intl.translate("キャラ追加要望", locale)}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <SendRequest
                locale={locale}
                type={intl.translate("キャラ", locale)}
                issueNumber={29}
                closeSendRequest={this.closeSendRequest}
              />
            </Modal.Body>
          </Modal>
        </div>
      );
    }
  }
}

module.exports.RegisteredChara = RegisteredChara;
