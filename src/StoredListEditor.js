var React = require("react");
var { Button, FormControl, Modal } = require("react-bootstrap");
var intl = require("./translate.js");

var { TextWithTooltip } = require("./TextWithTooltip.js");

var StoredListEditor = React.createClass({
  handleNameChange: function(e) {
    var newName = e.target.value;
    var ind = e.target.getAttribute("name");
    this.props.handleStoredListNameChange(ind, newName);
  },
  render: function() {
    var locale = this.props.locale;
    var combinations = this.props.storedList.combinations;
    var armlist = this.props.storedList.armlist;
    var names = this.props.storedList.names;
    var removeOneStoredList = this.props.removeOneStoredList;
    var handleNameChange = this.handleNameChange;

    return (
      <Modal
        className="storedListEditor"
        show={this.props.show}
        onHide={this.props.onHide}
      >
        <Modal.Header closeButton>
          <Modal.Title>{intl.translate("保存済みの編成", locale)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>編成名(Optional)</th>
                  {armlist.length != 0
                    ? armlist[0].map(function(arm, ind) {
                        if (arm.name != "") {
                          return <th key={ind}>{arm.name}</th>;
                        } else {
                          return (
                            <th key={ind}>
                              {intl.translate("武器", locale)}
                              {ind}
                            </th>
                          );
                        }
                      })
                    : ""}
                  <th>{intl.translate("操作", locale)}</th>
                </tr>
              </thead>
              <tbody>
                {combinations.map(function(v, ind) {
                  return (
                    <tr key={ind}>
                      <td>{ind}</td>
                      <TextWithTooltip
                        tooltip={intl.translate("保存済みリスト名説明", locale)}
                        id="tooltip-storedlist-name"
                      >
                        <td>
                          <FormControl
                            componentClass="textarea"
                            style={{
                              width: "100%",
                              minWidth: "300px",
                              height: "120px"
                            }}
                            name={ind}
                            value={names[ind]}
                            onChange={handleNameChange}
                          />
                        </td>
                      </TextWithTooltip>
                      {v.map(function(num, ind2) {
                        return (
                          <td key={ind2}>
                            {num}
                            {intl.translate("本", locale)}
                          </td>
                        );
                      })}
                      <td>
                        <Button
                          id={ind}
                          onClick={removeOneStoredList}
                          bsStyle="primary"
                        >
                          {intl.translate("削除", locale)}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
});

module.exports.StoredListEditor = StoredListEditor;
