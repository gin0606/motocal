var React = require("react");
var { Button, FormControl } = require("react-bootstrap");

var intl = require("./translate.js");
var { githubAPItoken } = require("./secret_consts.js");

class SendRequest extends React.Component {
  state = {
    name: "",
    message: "",
    yourname: "",
    sendingMessage: false
  };

  sendRequestToGithub = () => {
    if (this.state.name != "") {
      this.setState({ sendingMessage: true });
      var sendData = { body: "" };
      if (this.yourname != "") {
        sendData["body"] += "投稿者: " + this.state.yourname + "\n";
      }

      sendData["body"] +=
        "種別: " +
        this.props.type +
        "\n" +
        this.props.type +
        "名: " +
        this.state.name +
        "\n";

      if (this.message != "") {
        sendData["body"] += "メッセージ:" + this.state.message + "\n";
      }

      $.ajax({
        url:
          "https://api.github.com/repos/hoshimi/motocal/issues/" +
          this.props.issueNumber +
          "/comments",
        type: "post",
        data: JSON.stringify(sendData),
        beforeSend: function(xhr) {
          xhr.setRequestHeader("Authorization", "token " + githubAPItoken);
          xhr.setRequestHeader("Accept", "application/vnd.github.v3+json");
        },
        success: function(data) {
          alert(intl.translate("送信成功", this.props.locale));
          this.setState({ sendingMessage: false });
          this.props.closeSendRequest();
        }.bind(this),
        error: function(xhr, status, err) {
          this.setState({ sendingMessage: false });
          this.props.closeSendRequest();
        }.bind(this)
      });
    } else {
      if (this.props.locale == "ja") {
        alert("要望した" + this.props.type + "名が空です");
      } else {
        alert(this.props.type + " name must not be empty.");
      }
    }
  };

  handleEvent = (key, e) => {
    var newState = this.state;
    newState[key] = e.target.value;
    this.setState(newState);
  };

  render() {
    var locale = this.props.locale;

    return (
      <div className="sendRequestForm">
        <p>
          {" "}
          <a href="https://github.com/hoshimi/motocal">
            {" "}
            github.com / motocal{" "}
          </a>{" "}
        </p>
        <p>{intl.translate("要望送信メッセージ", locale)}</p>
        <table className="table table-bordered">
          <tbody>
            <tr>
              <th className="bg-primary">
                {intl.translate("要望種別", locale)}
              </th>
              <td>{this.props.type}</td>
            </tr>
            <tr>
              <th className="bg-primary">
                {this.props.type}
                {intl.translate("名", locale)}
              </th>
              <td>
                <FormControl
                  type="text"
                  value={this.state.name}
                  onChange={this.handleEvent.bind(this, "name")}
                  style={{ textAlign: "left" }}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-primary">
                {intl.translate("メッセージ", locale)}
              </th>
              <td>
                <FormControl
                  componentClass="textarea"
                  value={this.state.message}
                  onChange={this.handleEvent.bind(this, "message")}
                  style={{ textAlign: "left", height: "200px" }}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-primary">
                {intl.translate("あなたのお名前", locale)}
              </th>
              <td>
                <FormControl
                  type="text"
                  value={this.state.yourname}
                  onChange={this.handleEvent.bind(this, "yourname")}
                  style={{ textAlign: "left" }}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <Button
          bsStyle="primary"
          onClick={this.sendRequestToGithub}
          disabled={this.sendingMessage}
        >
          {intl.translate("送信", locale)}
        </Button>
      </div>
    );
  }
}

module.exports.SendRequest = SendRequest;
