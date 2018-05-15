var React = require("react");
var { Button } = require("react-bootstrap");
var intl = require("./translate.js");

var GlobalConst = require("./global_const.js");

var { getTypeBonus, calcCriticalDeviation } = require("./global_logic.js");

var Result = React.createClass({
  onClick: function(e) {
    this.props.onAddToHaisuiData(e.target.id, this.props.summonid);
  },
  render: function() {
    var sw = this.props.switcher;
    var arm = this.props.arm;
    var prof = this.props.prof;
    var onClick = this.onClick;
    var locale = this.props.locale;

    return (
      <tbody className="result">
        {this.props.data.map(function(m, rank) {
          var colSize = 2;
          var tablebody = [];
          var charaDetail = {};

          for (key in m.data) {
            charaDetail[key] = [];
            // { "Djeeta": [<p>攻撃力10000, HP15000</p>, <p>通常攻刃15%</p>, <p>DA 100%</p>], }のような連想配列を作る
          }

          if (sw.switchTotalAttack) {
            tablebody.push(m.data.Djeeta.totalAttack);
            ++colSize;
          }
          if (sw.switchATKandHP) {
            var senryoku =
              parseInt(m.data.Djeeta.displayAttack) +
              parseInt(m.data.Djeeta.displayHP);
            tablebody.push(
              senryoku +
                "\n(" +
                parseInt(m.data.Djeeta.displayAttack) +
                " + " +
                parseInt(m.data.Djeeta.displayHP) +
                ")"
            );
            ++colSize;
          }

          if (sw.switchCharaAttack) {
            for (key in m.data) {
              charaDetail[key].push(
                <span key={key + "-attack"} className="result-chara-detail">
                  <span className="label label-primary">
                    {intl.translate("攻撃力", locale)}
                  </span>{" "}
                  {m.data[key].totalAttack}&nbsp;
                </span>
              );
            }
          }

          if (sw.switchDATA) {
            charaDetail["Djeeta"].push(
              <span key={key + "-da"} className="result-chara-detail">
                <span className="label label-danger">DA</span>{" "}
                {(100.0 * m.data.Djeeta.totalDA).toFixed(1)}%&nbsp;
                <span className="label label-danger">TA</span>{" "}
                {(100.0 * m.data.Djeeta.totalTA).toFixed(1)}%&nbsp;
              </span>
            );
          }

          if (sw.switchCharaDA) {
            for (key in m.data) {
              // switchDATAが指定されていなかったら全員分
              // 指定されていたらDjeetaじゃない場合だけ
              if (!sw.switchDATA || key != "Djeeta") {
                charaDetail[key].push(
                  <span key={key + "-da"} className="result-chara-detail">
                    <span className="label label-danger">DA</span>{" "}
                    {(100.0 * m.data[key].totalDA).toFixed(1)}%&nbsp;
                    <span className="label label-danger">TA</span>{" "}
                    {(100.0 * m.data[key].totalTA).toFixed(1)}%&nbsp;
                  </span>
                );
              }
            }
          }

          if (sw.switchDebuffResistance) {
            for (key in m.data) {
              // 弱体耐性率は%表記のまま扱う
              charaDetail[key].push(
                <span
                  key={key + "-debuffResistance"}
                  className="result-chara-detail"
                >
                  <span className="label label-success">弱体耐性率</span>{" "}
                  {parseInt(m.data[key].debuffResistance)}%&nbsp;
                </span>
              );
            }
          }

          if (sw.switchExpectedAttack) {
            var expectedAttack = parseInt(
              m.data.Djeeta.expectedAttack * m.data.Djeeta.totalAttack
            );
            tablebody.push(
              m.data.Djeeta.expectedAttack.toFixed(4) +
                "\n(" +
                expectedAttack +
                ")"
            );
            ++colSize;
          }

          if (sw.switchCriticalAttack) {
            tablebody.push(m.data.Djeeta.criticalAttack);
            ++colSize;
          }

          if (sw.switchCriticalRatio) {
            if (
              getTypeBonus(prof.element, prof.enemyElement) == 1.5 ||
              prof.enemyElement == "non-but-critical"
            ) {
              tablebody.push(
                m.data.Djeeta.criticalRatio.toFixed(4) +
                  "\n(" +
                  m.data.Djeeta.effectiveCriticalRatio.toFixed(4) +
                  ")"
              );
              ++colSize;
            } else {
              tablebody.push(intl.translate("非有利", locale));
              ++colSize;
            }
          }

          if (sw.switchHP) {
            tablebody.push(
              m.data.Djeeta.totalHP +
                "\n(" +
                parseInt(m.data.Djeeta.totalHP * m.data.Djeeta.remainHP) +
                ")"
            );
            ++colSize;
          }

          if (sw.switchCharaHP) {
            for (key in m.data) {
              charaDetail[key].push(
                <span key={key + "-HP"} className="result-chara-detail">
                  <span className="label label-success">
                    {intl.translate("残HP", locale)} / HP
                  </span>&nbsp;
                  {parseInt(
                    m.data[key].totalHP * m.data[key].remainHP
                  )}&nbsp;/&nbsp;{m.data[key].totalHP}&nbsp;
                </span>
              );
            }
          }

          if (sw.switchAverageAttack) {
            tablebody.push(parseInt(m.data.Djeeta.averageAttack));
            ++colSize;
          }

          if (sw.switchAverageCriticalAttack) {
            tablebody.push(m.data.Djeeta.averageCriticalAttack);
            ++colSize;
          }

          if (sw.switchTotalExpected) {
            tablebody.push(m.data.Djeeta.totalExpected);
            ++colSize;
          }

          if (sw.switchCharaTotalExpected) {
            for (key in m.data) {
              charaDetail[key].push(
                <span key={key + "-PCF"} className="result-chara-detail">
                  <span className="label label-primary">
                    {intl.translate("総回技", locale)}
                  </span>
                  {m.data[key].totalExpected}&nbsp;
                </span>
              );
            }
          }

          if (sw.switchAverageTotalExpected) {
            tablebody.push(m.data.Djeeta.averageTotalExpected);
            ++colSize;
          }

          if (sw.switchPureDamage) {
            tablebody.push(parseInt(m.data.Djeeta.pureDamage));
            ++colSize;
          }

          if (sw.switchCharaPureDamage) {
            for (key in m.data) {
              charaDetail[key].push(
                <span
                  key={key + "-pure-damage"}
                  className="result-chara-detail"
                >
                  <span className="label label-primary">
                    {intl.translate("単攻撃ダメージ(技巧連撃無)", locale)}
                  </span>{" "}
                  {m.data[key].pureDamage.toFixed(0)}&nbsp;
                </span>
              );
            }
          }

          if (sw.switchDamageWithCritical) {
            tablebody.push(parseInt(m.data.Djeeta.damageWithCritical));
            ++colSize;
          }

          if (sw.switchDamageWithMultiple) {
            tablebody.push(parseInt(m.data.Djeeta.damageWithMultiple));
            ++colSize;
          }

          if (sw.switchDamage) {
            tablebody.push(parseInt(m.data.Djeeta.damage));
            ++colSize;
          }

          if (sw.switchOugiGage) {
            tablebody.push(
              m.data.Djeeta.expectedOugiGage.toFixed(2) +
                "%\n(" +
                m.data.Djeeta.expectedTurn.toFixed(2) +
                "T)"
            );
            ++colSize;
          }

          if (sw.switchOugiDamage) {
            tablebody.push(parseInt(m.data.Djeeta.ougiDamage));
            ++colSize;
          }

          if (sw.switchCharaOugiDamage) {
            for (key in m.data) {
              charaDetail[key].push(
                <span
                  key={key + "-ougi-damage"}
                  className="result-chara-detail"
                >
                  <span className="label label-primary">
                    {intl.translate("奥義ダメージ", locale)}
                  </span>{" "}
                  {m.data[key].ougiDamage.toFixed(0)}&nbsp;
                </span>
              );
            }
          }

          if (sw.switchCharaOugiGage) {
            for (key in m.data) {
              charaDetail[key].push(
                <span key={key + "-ougi-gage"} className="result-chara-detail">
                  <span className="label label-primary">
                    {intl.translate("ターン毎の奥義ゲージ上昇量", locale)}
                  </span>{" "}
                  {m.data[key].expectedOugiGage.toFixed(2) +
                    "%\n(" +
                    m.data[key].expectedTurn.toFixed(2) +
                    "T)"}&nbsp;
                </span>
              );
            }
          }

          if (sw.switchChainBurst) {
            tablebody.push(parseInt(m.data.Djeeta.averageChainBurst));
            ++colSize;
          }
          if (sw.switchCycleDamage) {
            tablebody.push(parseInt(m.data.Djeeta.expectedCycleDamagePerTurn));
            ++colSize;
          }

          if (sw.switchCharaCycleDamage) {
            for (key in m.data) {
              charaDetail[key].push(
                <span
                  key={key + "-cycle-damage"}
                  className="result-chara-detail"
                >
                  <span className="label label-primary">
                    {intl.translate("予想ターン毎ダメージ", locale)}
                  </span>{" "}
                  {m.data[key].expectedCycleDamagePerTurn.toFixed(0)}&nbsp;
                </span>
              );
            }
          }

          if (sw.switchAverageCycleDamage) {
            var val = parseInt(m.data.Djeeta.averageCyclePerTurn);
            tablebody.push(val.toString() + " (" + (4 * val).toString() + ")");
            ++colSize;
          }

          if (sw.switchSkillTotal) {
            for (var key in m.data) {
              var mainSkillInfo = [];
              var skilldata = m.data[key].skilldata;

              // 攻刃系スキル用
              var pushSkillInfoElement1 = (
                skillKey,
                label,
                labelType = "primary"
              ) => {
                // 外側のmainSkillInfoとskilldataとlocaleを使う
                if (skilldata[skillKey] != 1.0) {
                  mainSkillInfo.push(
                    <span key={key + "-" + skillKey}>
                      <span className={"label label-" + labelType}>
                        {intl.translate(label, locale)}
                      </span>&nbsp;
                      {(100.0 * (skilldata[skillKey] - 1.0)).toFixed(1)}%&nbsp;
                    </span>
                  );
                }
              };

              pushSkillInfoElement1("normal", "通常攻刃", "danger");
              pushSkillInfoElement1("normalHaisui", "通常背水", "light");
              pushSkillInfoElement1("normalKonshin", "通常渾身", "success");
              pushSkillInfoElement1("element", "属性", "primary");
              pushSkillInfoElement1("magna", "マグナ", "primary");
              pushSkillInfoElement1("magnaHaisui", "マグナ背水", "light");
              pushSkillInfoElement1("magnaKonshin", "マグナ渾身", "success");
              pushSkillInfoElement1("ex", "EX", "primary");
              pushSkillInfoElement1("exHaisui", "EX背水", "light");
              pushSkillInfoElement1("charaHaisui", "キャラ背水", "light");
              pushSkillInfoElement1("hpRatio", "HP増加", "success");
              pushSkillInfoElement1("other", "その他バフ", "primary");

              var multipleAttackSkillInfo = [];
              // 連撃スキル用
              var pushSkillInfoElement2 = (
                skillKey,
                label,
                labelType = "primary"
              ) => {
                // 外側のskillInfoとskilldataとlocaleを使う
                if (skilldata[skillKey] != 0.0) {
                  multipleAttackSkillInfo.push(
                    <span key={key + "-" + skillKey}>
                      <span className={"label label-" + labelType}>
                        {intl.translate(label, locale)}
                      </span>&nbsp;
                      {skilldata[skillKey].toFixed(1)}%&nbsp;
                    </span>
                  );
                }
              };

              pushSkillInfoElement2("normalDA", "DA上昇(通常)", "danger");
              pushSkillInfoElement2("magnaDA", "DA上昇(マグナ)", "danger");
              pushSkillInfoElement2("exDA", "DA上昇(EX)", "danger");
              pushSkillInfoElement2("bahaDA", "DA上昇(バハ)", "danger");
              pushSkillInfoElement2("cosmosDA", "DA上昇(コスモス)", "danger");
              pushSkillInfoElement2("otherDA", "DA上昇(その他)", "danger");
              pushSkillInfoElement2("normalTA", "TA上昇(通常)", "danger");
              pushSkillInfoElement2("magnaTA", "TA上昇(マグナ)", "danger");
              pushSkillInfoElement2("bahaTA", "TA上昇(バハ)", "danger");
              pushSkillInfoElement2("otherTA", "TA上昇(その他)", "danger");

              var criticalInfo = [];
              if (Object.keys(skilldata.criticalArray).length > 0) {
                var sortedKeys = Object.keys(skilldata.criticalArray).sort();
                criticalInfo.push(
                  <table
                    key={key + "-criticalInfoTable"}
                    className="table table-bordered"
                    style={{ marginBottom: "0px" }}
                  >
                    <thead>
                      <tr>
                        <th className="bg-success" style={{ fontSize: "10pt" }}>
                          {intl.translate("技巧倍率", locale)}
                        </th>
                        {sortedKeys.map(function(v, ind) {
                          return (
                            <th
                              key={ind}
                              className="bg-success"
                              style={{ fontSize: "10pt" }}
                            >
                              {parseFloat(v).toFixed(2)}
                              {intl.translate("倍", locale)}
                            </th>
                          );
                        })}
                        <th className="bg-success" style={{ fontSize: "10pt" }}>
                          {intl.translate("標準偏差", locale)}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontSize: "10pt" }}>
                          {intl.translate("発生確率", locale)}
                        </td>
                        {sortedKeys.map(function(v, ind) {
                          return (
                            <td key={ind} style={{ fontSize: "10pt" }}>
                              {(100.0 * skilldata.criticalArray[v]).toFixed(3)}%
                            </td>
                          );
                        })}
                        <td style={{ fontSize: "10pt" }}>
                          {calcCriticalDeviation(
                            skilldata.criticalArray
                          ).toFixed(3)}&nbsp;
                        </td>
                      </tr>
                    </tbody>
                  </table>
                );
              }

              var otherSkillInfo = [];
              // その他スキル用
              var pushSkillInfoElement3 = (
                skillKey,
                label,
                labelType = "primary"
              ) => {
                // 外側のskillInfoとskilldataとlocaleを使う
                if (skilldata[skillKey] != 0.0) {
                  otherSkillInfo.push(
                    <span key={key + "-" + skillKey}>
                      <span className={"label label-" + labelType}>
                        {intl.translate(label, locale)}
                      </span>&nbsp;
                      {(100.0 * skilldata[skillKey]).toFixed(1)}%&nbsp;
                    </span>
                  );
                }
              };
              pushSkillInfoElement3(
                "additionalDamage",
                "追加ダメージ",
                "default"
              );
              pushSkillInfoElement3("damageUP", "与ダメージ上昇", "default");
              pushSkillInfoElement3(
                "damageLimit",
                "ダメージ上限アップ",
                "default"
              );
              pushSkillInfoElement3(
                "ougiDamageLimit",
                "奥義ダメージ上限アップ",
                "default"
              );
              pushSkillInfoElement3(
                "ougiDamageUP",
                "奥義ダメージアップ",
                "default"
              );

              charaDetail[key].push(
                <div key={key + "-mainSkillInfo"}>{mainSkillInfo}</div>
              );
              charaDetail[key].push(
                <div key={key + "-multipleAttackInfo"}>
                  {multipleAttackSkillInfo}
                </div>
              );
              charaDetail[key].push(
                <div key={key + "-criticalInfo"} style={{ margin: "5px 0px" }}>
                  {criticalInfo}
                </div>
              );
              charaDetail[key].push(
                <div key={key + "-otherSkillInfo"}>{otherSkillInfo}</div>
              );
            }
          }

          var res = [
            <tr className="result" key={rank + 1}>
              <td>{rank + 1}</td>
              {tablebody.map(function(am, ind) {
                return <td key={ind}>{am}</td>;
              })}
              {m.armNumbers.map(function(am, ind) {
                if (arm[ind].considerNumberMax != 0) {
                  ++colSize;
                  if (parseInt(am) > 0) {
                    return (
                      <td key={ind}>
                        <span className="text-info">
                          <strong>
                            {am} {intl.translate("本", locale)}
                          </strong>
                        </span>
                      </td>
                    );
                  } else {
                    return (
                      <td key={ind}>
                        <span className="text-muted">
                          {am} {intl.translate("本", locale)}
                        </span>
                      </td>
                    );
                  }
                }
              })}
              <td>
                <Button
                  id={rank}
                  block
                  bsStyle="primary"
                  className="add-graph-button"
                  onClick={onClick}
                >
                  {intl.translate("追加", locale)}
                </Button>
              </td>
            </tr>
          ];

          for (var key in charaDetail) {
            if (charaDetail[key].length > 0) {
              res.push(
                <tr>
                  <td colSpan="3">
                    <span className="text-info">{key}</span>
                  </td>
                  <td style={{ textAlign: "left" }} colSpan={colSize - 3}>
                    {charaDetail[key]}
                  </td>
                </tr>
              );
            }
          }

          return res;
        })}
      </tbody>
    );
  }
});

module.exports.Result = Result;
