var React = require("react");
var { Thumbnail, Modal } = require("react-bootstrap");

class HPChartHowTo extends React.Component {
  render() {
    return (
      <Modal
        className="hpChartTutotial"
        show={this.props.show}
        onHide={this.props.onHide}
      >
        <Modal.Header closeButton>
          <Modal.Title>HP Chartsの使い方</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            HPチャート機能は「保存された武器編成の攻撃力等を、残りHP割合ごとに再計算する」機能です。
          </p>
          <h2>1.</h2>
          <p>適当に編成を計算した後、グラフを見たい編成をグラフに加えます。</p>
          <Thumbnail
            alt="HPチャート操作1"
            src="./otherImages/hpChartTutorial1.png"
          />
          <h2>2.</h2>
          <p>
            グラフに加えると、「背水渾身チャートを開く」ボタンが有効化されるので、クリックします。
          </p>
          <h2>3.</h2>
          <p>
            「優先する項目」に設定されている値を描画したグラフが表示されます。
          </p>
          <Thumbnail
            alt="HPチャート操作1"
            src="./otherImages/hpChartTutorial2.png"
          />
          <p className="text-danger">
            まだサポートされていない要素が「優先する項目」に設定されている場合、"総合攻撃力"のグラフに変更されます。
          </p>
          <h2>4.</h2>
          <p>上部の選択ボタンで、他の要素を表示することも可能です。</p>
          <Thumbnail
            alt="HPチャート操作1"
            src="./otherImages/hpChartTutorial3.png"
          />
          <h2>5.</h2>
          <p>
            複数の召喚石組み合わせが設定されている場合、複数のグラフが作成されます。
          </p>
          <Thumbnail
            alt="HPチャート操作1"
            src="./otherImages/hpChartTutorial4.png"
          />
          <p className="text-danger">
            現在は、ある組み合わせをグラフに保存すると、全てのグラフに追加されるようになっています。
            これを召喚石別にするかどうかは、今後検討します。
          </p>
          <h2>注記</h2>
          <p>
            編成として保存されるのは「武器の組み合わせの本数」のみです。
            そのため、武器攻撃力やバフ量などを変更した場合、結果のグラフも自動的に変更されます。
          </p>
          <p className="text-danger">
            武器枠の数が追加/削除された場合、武器枠のデータがリセットされた場合は、
            保存されている編成はリセットされてしまいますのでご注意下さい。
            これは、武器組み合わせのみを保存しているため、誤って組み合わせで再計算されることを防ぐためです。
          </p>
          <p>
            また、現在「追加した特定のグラフを削除する」機能は実装されておりませんので、
            グラフが多くなりすぎてしまった場合、全削除を行い、保存されている編成をリセットしてください。
          </p>
          <p>ご要望・不具合等あればお知らせ下さい。</p>
        </Modal.Body>
      </Modal>
    );
  }
}

module.exports.HPChartHowTo = HPChartHowTo;
