var React = require("react");
var {
  ControlLabel,
  Button,
  ButtonGroup,
  ButtonToolbar,
  Collapse,
  DropdownButton,
  MenuItem,
  FormControl,
  Modal
} = require("react-bootstrap");
var Simulator = require("./simulator.js");
var { Result } = require("./result.js");
var { HPChart } = require("./HPChart.js");
var { AdsenseAdvertisement } = require("./AdsenseAdvertisement.js");
var { ControlAutoUpdate } = require("./ControlAutoUpdate.js");
var { StoredListEditor } = require("./StoredListEditor.js");

var intl = require("./translate.js");
var { HPChartHowTo } = require("./HPChartHowTo.js");

var GlobalConst = require("./global_const.js");

var { ElementColorLabel } = require("./ElementColorLabel.js");

var selector = GlobalConst.selector;
var Jobs = GlobalConst.Jobs;
var keyTypes = GlobalConst.keyTypes;
var summonTypes = GlobalConst.summonTypes;
var summonElementTypes = GlobalConst.summonElementTypes;
var _ua = GlobalConst._ua;
var getElementColorLabel = GlobalConst.getElementColorLabel;

var {
  isCosmos,
  isValidResult,
  checkNumberofRaces,
  calcCombinations,
  treatSupportAbility,
  calcOneCombination,
  initializeTotals,
  getTesukatoripokaAmount,
  getTotalBuff,
  getInitialTotals,
  getTypeBonusStr
} = require("./global_logic.js");

var ResultList = React.createClass({
  calculateResult: function(newprops) {
    var prof = newprops.profile;
    var arml = newprops.armlist;
    var summon = newprops.summon;
    var chara = newprops.chara;

    if (
      prof != undefined &&
      arml != undefined &&
      summon != undefined &&
      chara != undefined
    ) {
      var totalBuff = getTotalBuff(prof);

      // 後から追加したパラメータはNaNなことがあるので追加処理
      // sortKey がNaNでないならそちらを使う、NaNなら総合攻撃力で
      var sortkey = "averageCyclePerTurn";
      var sortkeyname = "予想ターン毎ダメージのパーティ平均値";
      if (newprops.sortKey == newprops.sortKey) {
        sortkey = newprops.sortKey;
        sortkeyname = keyTypes[sortkey];
      }

      // combinationsが変更されていないなら古いやつを使う
      if (this.state.previousArmlist != null) {
        var isCombinationChanged = false;
        if (this.state.previousArmlist.length != arml.length) {
          isCombinationChanged = true;
        }
        if (!isCombinationChanged) {
          for (var i = 0; i < arml.length; i = (i + 1) | 0) {
            if (
              arml[i].considerNumberMax !=
                this.state.previousArmlist[i].considerNumberMax ||
              arml[i].considerNumberMin !=
                this.state.previousArmlist[i].considerNumberMin
            ) {
              isCombinationChanged = true;
            }
            // コスモス武器になったか、コスモス武器じゃなくなったかでコンビネーションが変わる
            if (isCosmos(arml[i]) != isCosmos(this.state.previousArmlist[i])) {
              isCombinationChanged = true;
            }
          }
        }
        if (isCombinationChanged) {
          var combinations = calcCombinations(arml);
          this.setState({ previousArmlist: JSON.parse(JSON.stringify(arml)) });
          this.setState({
            previousCombinations: JSON.parse(JSON.stringify(combinations))
          });
        } else {
          var combinations = this.state.previousCombinations;
        }
      } else {
        var combinations = calcCombinations(arml);
        this.setState({ previousArmlist: JSON.parse(JSON.stringify(arml)) });
        this.setState({
          previousCombinations: JSON.parse(JSON.stringify(combinations))
        });
      }

      var res = [];
      var minSortKey = [];
      for (var i = 0; i < summon.length; i++) {
        res[i] = [];
        minSortKey[i] = -1;
      }

      var totals = getInitialTotals(prof, chara, summon);
      treatSupportAbility(totals, chara);
      var itr = combinations.length;
      var totalItr = itr * summon.length * Object.keys(totals).length;

      // 前処理に必要な値があればここで用意
      var minHP =
        prof.minimumHP == undefined ? undefined : parseInt(prof.minimumHP);

      for (var i = 0; i < itr; i = (i + 1) | 0) {
        var oneres = calcOneCombination(
          combinations[i],
          summon,
          prof,
          arml,
          totals,
          totalBuff
        );
        for (var j = 0; j < summon.length; j++) {
          // 各結果に対して前処理
          if (isValidResult(oneres[j], minHP)) {
            if (res[j].length < 10) {
              //  まずminSortkeyを更新する
              if (
                minSortKey[j] < 0 ||
                minSortKey[j] > oneres[j].Djeeta[sortkey]
              ) {
                minSortKey[j] = oneres[j].Djeeta[sortkey];
              }
              res[j].push({ data: oneres[j], armNumbers: combinations[i] });
            } else {
              // minSortkey より大きいものだけpush
              if (oneres[j].Djeeta[sortkey] >= minSortKey[j]) {
                // 11番目に追加する
                res[j].push({ data: oneres[j], armNumbers: combinations[i] });

                // 10番目まででminSortkey[j]と一致するものを消す
                var spliceid = -1;
                for (var k = 0; k < 10; k = (k + 1) | 0) {
                  if (res[j][k].data.Djeeta[sortkey] == minSortKey[j]) {
                    spliceid = k;
                  }
                }
                res[j].splice(spliceid, 1);
                minSortKey[j] = -1;

                // 10個の配列になったので、もう一度最小値を計算する
                for (var k = 0; k < 10; k = (k + 1) | 0) {
                  if (
                    minSortKey[j] < 0 ||
                    minSortKey[j] > res[j][k].data.Djeeta[sortkey]
                  ) {
                    minSortKey[j] = res[j][k].data.Djeeta[sortkey];
                  }
                }
              }
            }
          }
        }
        initializeTotals(totals);
      }
      // この時点で summonres は"各召喚石に対応する結果データの連想配列 を並べた配列"の配列になっているはず

      for (var i = 0; i < summon.length; i++) {
        if (sortkey == "ATKandHP") {
          res[i].sort(function(a, b) {
            if (
              a.data.Djeeta.displayAttack + a.data.Djeeta.displayHP <
              b.data.Djeeta.displayAttack + b.data.Djeeta.displayHP
            )
              return 1;
            if (
              a.data.Djeeta.displayAttack + a.data.Djeeta.displayHP >
              b.data.Djeeta.displayAttack + b.data.Djeeta.displayHP
            )
              return -1;
            return 0;
          });
        } else {
          res[i].sort(function(a, b) {
            if (a["data"]["Djeeta"][sortkey] < b["data"]["Djeeta"][sortkey])
              return 1;
            if (a["data"]["Djeeta"][sortkey] > b["data"]["Djeeta"][sortkey])
              return -1;
            return 0;
          });
        }
        while (res[i].length > 10) {
          res[i].pop();
        }
      }

      return {
        summon: summon,
        result: res,
        sortkeyname: sortkeyname,
        totalItr: totalItr
      };
    } else {
      return { summon: summon, result: [] };
    }
  },
  getInitialState: function() {
    return {
      switchTotalAttack: 1,
      switchATKandHP: 0,
      switchHP: 1,
      switchCharaHP: 0,
      switchDATA: 0,
      switchExpectedAttack: 0,
      switchSkillTotal: 0,
      switchCharaExpectedAttack: 0,
      switchCriticalRatio: 0,
      switchCriticalAttack: 0,
      switchCharaAttack: 0,
      switchCharaDA: 0,
      switchCharaTotalExpected: 0,
      switchCharaCycleDamage: 0,
      switchCharaPureDamage: 0,
      switchCharaOugiDamage: 0,
      switchCharaOugiGage: 0,
      switchAverageAttack: 1,
      switchAverageCriticalAttack: 0,
      switchTotalExpected: 0,
      switchAverageTotalExpected: 0,
      switchDamage: 0,
      switchPureDamage: 0,
      switchDamageWithCritical: 0,
      switchDamageWithMultiple: 0,
      switchOugiGage: 0,
      switchOugiDamage: 0,
      switchCycleDamage: 0,
      switchAverageCycleDamage: 1,
      switchDebuffResistance: 0,
      switchChainBurst: 0,
      disableAutoResultUpdate: 0,
      result: { summon: this.props.summon, result: [] },
      chartSortKey: "totalAttack",
      chartData: {},
      storedList: { combinations: [], armlist: [], names: [] },
      openHPChart: false,
      displayRealHP: false,
      openSimulator: false,
      openDisplayElementTable: false,
      openHPChartTutorial: false,
      openShowStoredList: false,
      ChartButtonActive: false,
      previousArmlist: null,
      previousCombinations: null
    };
  },
  closeHPChart: function() {
    this.setState({ openHPChart: false });
  },
  closeSimulator: function() {
    this.setState({ openSimulator: false });
  },
  closeHPChartTutorial: function() {
    this.setState({ openHPChartTutorial: false });
  },
  openHPChartTutorial: function() {
    this.setState({ openHPChartTutorial: true });
  },
  componentWillReceiveProps: function(nextProps) {
    if (
      this.state.disableAutoResultUpdate != 1 &&
      (nextProps.noResultUpdate == undefined || !nextProps.noResultUpdate)
    ) {
      var allresult = this.calculateResult(nextProps);
      this.setState({ result: allresult });
    }

    // armlistが変更されていないかcheck => 変更されてたら今までの分消す
    var isArmValid = true;
    for (var i = 0; i < this.state.storedList.combinations.length; i++) {
      if (nextProps.armlist.length != this.state.storedList.armlist[i].length) {
        isArmValid = false;
        continue;
      }
      for (var k = 0; k < nextProps.armlist.length; k++) {
        // 名前と攻撃力が同時に変更されていた場合、削除や追加などが起こっていると予想される
        if (
          nextProps.armlist[k].name !=
            this.state.storedList.armlist[i][k].name &&
          nextProps.armlist[k].attack !=
            this.state.storedList.armlist[i][k].attack
        ) {
          isArmValid = false;
          break;
        }
      }
    }
    if (!isArmValid) {
      this.setState({
        storedList: { combinations: [], armlist: [], names: [] }
      });
      this.setState({ ChartButtonActive: false });
    }
  },
  handleEvent: function(key, e) {
    var newState = this.state;
    newState[key] = newState[key] == 0 ? 1 : 0;

    // 自動更新ONにしたらUPDATEする
    if (key == "disableAutoResultUpdate" && newState[key] == 0) {
      newState["result"] = this.calculateResult(this.props);
    }
    this.setState(newState);
  },
  openHPChart: function(e) {
    var sortkey = "averageCyclePerTurn";
    var sortkeyname = "予想ターン毎ダメージのパーティ平均値";
    if (this.props.sortKey == this.props.sortKey) {
      sortkey = this.props.sortKey;
      sortkeyname = keyTypes[sortkey];
    }
    this.setState({ chartSortKey: sortkey });
    this.setState({ openHPChart: true });
  },
  addHaisuiData: function(id, summonid) {
    var newStored = this.state.storedList;
    var newCombinations = this.state.result.result[summonid][id].armNumbers;
    newStored["combinations"].push(JSON.parse(JSON.stringify(newCombinations)));
    newStored["armlist"].push(JSON.parse(JSON.stringify(this.props.armlist)));

    var title = "";
    for (var i = 0; i < this.props.armlist.length; i++) {
      if (newCombinations[i] > 0) {
        var name =
          this.props.armlist[i].name == ""
            ? "武器" + i.toString() + ""
            : this.props.armlist[i].name;
        title += name + newCombinations[i] + "本\n";
      }
    }
    newStored["names"].push(title);

    this.setState({ storedList: newStored });
    this.setState({ ChartButtonActive: true });
  },
  openSimulator: function() {
    this.setState({ openSimulator: true });
    this.setState({ chartSortKey: "averageExpectedDamage" });
  },
  switchDisplayRealHP: function(e) {
    this.setState({ displayRealHP: !this.state.displayRealHP });
    this.openHPChart(!this.state.displayRealHP);
  },
  resetStoredList: function(e) {
    this.setState({
      storedList: { combinations: [], armlist: [], names: [] },
      openShowStoredList: false,
      openHPChart: false,
      openSimulator: false,
      ChartButtonActive: false
    });
  },
  openStoredList: function(e) {
    this.setState({ openShowStoredList: true });
  },
  closeStoredList: function(e) {
    this.setState({ openShowStoredList: false });
  },
  removeOneStoredList: function(e) {
    var targetIndex = parseInt(e.target.id);
    var newCombinations = this.state.storedList.combinations;
    newCombinations.splice(targetIndex, 1);
    var newArmList = this.state.storedList.armlist;
    newArmList.splice(targetIndex, 1);
    var newNames = this.state.storedList.names;
    newNames.splice(targetIndex, 1);

    if (newArmList.length == 0) {
      this.resetStoredList();
    } else {
      this.setState({
        storedList: {
          combinations: newCombinations,
          armlist: newArmList,
          names: newNames
        }
      });
      if (this.state.openHPChart) {
        this.openHPChart();
      } else if (this.state.openSimulator) {
        this.openSimulator();
      }
    }
  },
  handleStoredListNameChange: function(ind, newName) {
    var newStoredList = this.state.storedList;
    newStoredList.names[ind] = newName;
    this.setState({ storedList: newStoredList });
  },
  forceResultUpdate: function() {
    this.setState({ result: this.calculateResult(this.props) });
  },
  openDisplayTable: function() {
    this.setState({
      openDisplayElementTable: !this.state.openDisplayElementTable
    });
  },
  render: function() {
    var locale = this.props.locale;

    var res = this.state.result;
    var prof = this.props.profile;
    var arm = this.props.armlist;
    var chara = this.props.chara;
    var summon = this.props.summon;

    // テスカトリポカ計算用
    var races = checkNumberofRaces(chara);
    var tesukatoripoka = getTesukatoripokaAmount;

    var result = res.result;
    var onAddToHaisuiData = this.addHaisuiData;

    var switcher = this.state;
    var armnames = [];
    for (var i = 0; i < arm.length; i++) {
      if (arm[i].considerNumberMax != 0) {
        var armname = arm[i].name;
        if (armname == "") {
          armname = intl.translate("武器", locale) + (i + 1).toString();
        }
        armnames.push(armname);
      }
    }

    var tableheader = [];
    if (switcher.switchTotalAttack) {
      tableheader.push(intl.translate("攻撃力(二手技巧無し)", locale));
    }
    if (switcher.switchATKandHP) {
      tableheader.push(intl.translate("戦力", locale));
    }
    if (switcher.switchExpectedAttack) {
      tableheader.push(intl.translate("期待攻撃回数", locale));
    }
    if (switcher.switchCriticalAttack) {
      tableheader.push(intl.translate("技巧期待攻撃力", locale));
    }
    if (switcher.switchCriticalRatio) {
      tableheader.push(intl.translate("技巧期待値", locale));
    }
    if (switcher.switchHP) {
      tableheader.push("HP\n(" + intl.translate("残HP", locale) + ")");
    }
    if (switcher.switchAverageAttack) {
      tableheader.push(intl.translate("パーティ平均攻撃力", locale));
    }
    if (switcher.switchAverageCriticalAttack) {
      tableheader.push(intl.translate("技巧平均攻撃力", locale));
    }
    if (switcher.switchTotalExpected) {
      tableheader.push(intl.translate("総合*回数*技巧", locale));
    }
    if (switcher.switchAverageTotalExpected) {
      tableheader.push(intl.translate("総回技の平均", locale));
    }
    if (switcher.switchPureDamage) {
      tableheader.push(intl.translate("単攻撃ダメージ(技巧連撃無)", locale));
    }
    if (switcher.switchDamageWithCritical) {
      tableheader.push(intl.translate("単攻撃ダメージ(技巧有)", locale));
    }
    if (switcher.switchDamageWithMultiple) {
      tableheader.push(intl.translate("単攻撃ダメージ(連撃有)", locale));
    }
    if (switcher.switchDamage) {
      tableheader.push(intl.translate("単攻撃ダメージ(技巧連撃有)", locale));
    }
    if (switcher.switchOugiGage) {
      tableheader.push(intl.translate("ターン毎の奥義ゲージ上昇量", locale));
    }
    if (switcher.switchOugiDamage) {
      tableheader.push(intl.translate("奥義ダメージ", locale));
    }
    if (switcher.switchChainBurst) {
      tableheader.push(intl.translate("チェインバースト", locale));
    }
    if (switcher.switchCycleDamage) {
      tableheader.push(intl.translate("予想ターン毎ダメージ", locale));
    }
    if (switcher.switchAverageCycleDamage) {
      tableheader.push(
        intl.translate("パーティ平均予想ターン毎ダメージ", locale) +
          " (" +
          intl.translate("四人合計値", locale) +
          ")"
      );
    }

    var job = prof.job == undefined ? Jobs["none"].name : Jobs[prof.job].name;
    var charaInfoStr =
      intl.translate("ジータさん", locale) +
      "(" +
      intl.translate(job, locale) +
      ") HP";
    if (prof.remainHP != undefined) {
      charaInfoStr +=
        parseInt(prof.remainHP) < parseInt(prof.hp) ? prof.remainHP : prof.hp;
    } else {
      charaInfoStr += prof.hp;
    }
    charaInfoStr +=
      "% (" +
      intl.translate(getTypeBonusStr(prof.element, prof.enemyElement), locale) +
      ")";
    var charaInfo = [
      <span key={0}>
        {getElementColorLabel(prof.element, locale)}&nbsp;{charaInfoStr}
      </span>
    ];
    for (var i = 0; i < chara.length; i++) {
      if (chara[i].name != "" && chara[i].isConsideredInAverage) {
        charaInfoStr = chara[i].name + " HP";
        if (chara[i].remainHP != undefined) {
          charaInfoStr +=
            parseInt(chara[i].remainHP) < parseInt(prof.hp)
              ? chara[i].remainHP
              : prof.hp;
        } else {
          charaInfoStr += prof.hp;
        }
        charaInfoStr +=
          "% (" +
          intl.translate(
            getTypeBonusStr(chara[i].element, prof.enemyElement),
            locale
          ) +
          ")";
        charaInfo.push(
          <span key={i + 1}>
            &nbsp;/&nbsp;{getElementColorLabel(chara[i].element, locale)}&nbsp;{
              charaInfoStr
            }
          </span>
        );
      }
    }
    var buffInfoStr =
      intl.translate("通常バフ", locale) + prof.normalBuff + "%, ";
    buffInfoStr +=
      intl.translate("属性バフ", locale) + prof.elementBuff + "%, ";
    buffInfoStr +=
      intl.translate("その他バフ", locale) + prof.otherBuff + "%, ";
    buffInfoStr += intl.translate("DAバフ", locale) + prof.daBuff + "%, ";
    buffInfoStr += intl.translate("TAバフ", locale) + prof.taBuff + "%, ";
    buffInfoStr +=
      intl.translate("追加ダメージバフ", locale) +
      (prof.additionalDamageBuff == undefined
        ? "0"
        : prof.additionalDamageBuff) +
      "%, ";
    buffInfoStr += intl.translate("敵防御固有値", locale) + prof.enemyDefense;

    if (_ua.Mobile || _ua.Tablet) {
      var changeSortKey = (
        <FormControl
          componentClass="select"
          style={{ width: "100%", padding: "0" }}
          value={this.props.sortKey}
          onChange={this.props.onChangeSortkey}
        >
          {" "}
          {selector[locale].ktypes}{" "}
        </FormControl>
      );
      return (
        <div className="resultList">
          <Button block onClick={this.openDisplayTable}>
            {intl.translate("表示項目切替", locale)}
          </Button>
          <Collapse in={this.state.openDisplayElementTable}>
            <table
              style={{
                width: "100%",
                textAlign: "center",
                marginBottom: "2px"
              }}
              className="table table-bordered"
            >
              <tbody>
                <tr>
                  <td
                    onClick={this.handleEvent.bind(this, "switchTotalAttack")}
                    className={
                      this.state.switchTotalAttack == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    攻撃力(二手技巧無し){" "}
                  </td>
                  <td
                    onClick={this.handleEvent.bind(this, "switchATKandHP")}
                    className={
                      this.state.switchATKandHP == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    戦力
                  </td>
                  <td
                    onClick={this.handleEvent.bind(this, "switchHP")}
                    className={
                      this.state.switchHP == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    HP
                  </td>
                </tr>
                <tr>
                  <td
                    onClick={this.handleEvent.bind(this, "switchDATA")}
                    className={
                      this.state.switchDATA == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    連続攻撃率
                  </td>
                  <td
                    onClick={this.handleEvent.bind(
                      this,
                      "switchExpectedAttack"
                    )}
                    className={
                      this.state.switchExpectedAttack == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    期待攻撃回数
                  </td>
                  <td
                    onClick={this.handleEvent.bind(this, "switchCriticalRatio")}
                    className={
                      this.state.switchCriticalRatio == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    技巧期待値
                  </td>
                </tr>
                <tr>
                  <td
                    onClick={this.handleEvent.bind(
                      this,
                      "switchCriticalAttack"
                    )}
                    className={
                      this.state.switchCriticalAttack == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    技巧期待値*攻撃力
                  </td>
                  <td
                    onClick={this.handleEvent.bind(this, "switchAverageAttack")}
                    className={
                      this.state.switchAverageAttack == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    パーティ平均攻撃力(二手技巧無し)
                  </td>
                  <td
                    onClick={this.handleEvent.bind(
                      this,
                      "switchAverageCriticalAttack"
                    )}
                    className={
                      this.state.switchAverageCriticalAttack == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    技巧平均攻撃力{" "}
                  </td>
                </tr>
                <tr>
                  <td
                    onClick={this.handleEvent.bind(this, "switchTotalExpected")}
                    className={
                      this.state.switchTotalExpected == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    総合*期待回数*技巧期待値
                  </td>
                  <td
                    onClick={this.handleEvent.bind(
                      this,
                      "switchAverageTotalExpected"
                    )}
                    className={
                      this.state.switchAverageTotalExpected == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    総回技のパーティ平均値
                  </td>
                  <td
                    onClick={this.handleEvent.bind(this, "switchCycleDamage")}
                    className={
                      this.state.switchCycleDamage == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    予想ターン毎ダメージ{" "}
                  </td>
                </tr>
                <tr>
                  <td
                    onClick={this.handleEvent.bind(
                      this,
                      "switchAverageCycleDamage"
                    )}
                    className={
                      this.state.switchAverageCycleDamage == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    予想ターン毎ダメージの平均値{" "}
                  </td>
                  <td
                    onClick={this.handleEvent.bind(this, "switchDamage")}
                    className={
                      this.state.switchDamage == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    単攻撃ダメージ
                  </td>
                  <td
                    onClick={this.handleEvent.bind(this, "switchOugiGage")}
                    className={
                      this.state.switchOugiGage == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    奥義ゲージ上昇期待値{" "}
                  </td>
                </tr>
                <tr>
                  <td
                    onClick={this.handleEvent.bind(this, "switchOugiDamage")}
                    className={
                      this.state.switchOugiDamage == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    奥義ダメージ{" "}
                  </td>
                  <td
                    onClick={this.handleEvent.bind(this, "switchChainBurst")}
                    className={
                      this.state.switchChainBurst == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    チェインバースト{" "}
                  </td>
                  <td
                    onClick={this.handleEvent.bind(this, "switchCharaAttack")}
                    className={
                      this.state.switchCharaAttack == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    キャラ攻撃力
                  </td>
                </tr>
                <tr>
                  <td
                    onClick={this.handleEvent.bind(this, "switchCharaHP")}
                    className={
                      this.state.switchCharaHP == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    キャラHP
                  </td>
                  <td
                    onClick={this.handleEvent.bind(this, "switchCharaDA")}
                    className={
                      this.state.switchCharaDA == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    キャラ連続攻撃率
                  </td>
                  <td
                    onClick={this.handleEvent.bind(
                      this,
                      "switchCharaTotalExpected"
                    )}
                    className={
                      this.state.switchCharaTotalExpected == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    キャラ総回技値
                  </td>
                </tr>
                <tr>
                  <td
                    onClick={this.handleEvent.bind(
                      this,
                      "switchCharaCycleDamage"
                    )}
                    className={
                      this.state.switchCharaCycleDamage == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    キャラ予想ターン毎ダメージ{" "}
                  </td>
                  <td
                    onClick={this.handleEvent.bind(
                      this,
                      "switchCharaPureDamage"
                    )}
                    className={
                      this.state.switchCharaPureDamage == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    キャラ単攻撃ダメージ
                  </td>
                  <td
                    onClick={this.handleEvent.bind(
                      this,
                      "switchCharaOugiDamage"
                    )}
                    className={
                      this.state.switchCharaOugiDamage == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    キャラ奥義ダメージ
                  </td>
                </tr>
                <tr>
                  <td
                    onClick={this.handleEvent.bind(this, "switchCharaOugiGage")}
                    className={
                      this.state.switchCharaOugiGage == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    キャラ奥義ゲージ上昇量
                  </td>
                  <td
                    onClick={this.handleEvent.bind(this, "switchSkillTotal")}
                    className={
                      this.state.switchSkillTotal == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    スキル合計値
                  </td>
                  <td
                    onClick={this.handleEvent.bind(
                      this,
                      "switchDebuffResistance"
                    )}
                    className={
                      this.state.switchDebuffResistance == 1
                        ? "display-checked"
                        : "display-unchecked"
                    }
                  >
                    {" "}
                    弱体耐性率
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </Collapse>
          <ControlAutoUpdate
            mobile
            autoupdate={this.state.disableAutoResultUpdate}
            switchAutoUpdate={this.handleEvent.bind(
              this,
              "disableAutoResultUpdate"
            )}
            forceResultUpdate={this.forceResultUpdate}
            locale={locale}
          />
          <hr />
          <p>
            {intl.translate("優先項目", locale)}:{changeSortKey}
          </p>
          <hr />
          <Button
            block
            bsStyle="success"
            onClick={this.openHPChart}
            disabled={!this.state.ChartButtonActive}
          >
            {intl.translate("背水グラフ", locale)}
          </Button>
          <hr />
          {summon.map(function(s, summonindex) {
            var selfSummonHeader = "";
            if (s.selfSummonType == "odin") {
              selfSummonHeader =
                summonElementTypes[s.selfElement].name +
                "属性攻" +
                s.selfSummonAmount +
                "キャラ攻" +
                s.selfSummonAmount2;
            } else if (s.selfSummonType == "elementByRace") {
              selfSummonHeader =
                summonElementTypes[s.selfElement].name +
                "属性(種族数)" +
                tesukatoripoka(parseInt(s.selfSummonAmount), races);
            } else {
              selfSummonHeader =
                summonElementTypes[s.selfElement].name +
                summonTypes[s.selfSummonType] +
                s.selfSummonAmount;
            }

            var friendSummonHeader = "";
            if (s.friendSummonType == "odin") {
              friendSummonHeader =
                summonElementTypes[s.friendElement].name +
                "属性攻" +
                s.friendSummonAmount +
                "キャラ攻" +
                s.friendSummonAmount2;
            } else if (s.friendSummonType == "elementByRace") {
              friendSummonHeader =
                summonElementTypes[s.friendElement].name +
                "属性(種族数)" +
                tesukatoripoka(parseInt(s.friendSummonAmount), races);
            } else {
              friendSummonHeader =
                summonElementTypes[s.friendElement].name +
                summonTypes[s.friendSummonType] +
                s.friendSummonAmount;
            }

            return (
              <div key={summonindex} className="result">
                <p> No.{summonindex + 1} </p>
                <ElementColorLabel element={s.selfElement}>
                  {selfSummonHeader}
                </ElementColorLabel>
                <ElementColorLabel element="all">+</ElementColorLabel>
                <ElementColorLabel element={s.friendElement}>
                  {friendSummonHeader}
                </ElementColorLabel>
                <hr style={{ margin: "10px 0px" }} />
                <div className="charainfo">
                  <div>{charaInfo}</div>
                  <div>
                    {getElementColorLabel(prof.enemyElement, locale)}{" "}
                    {intl.translate("敵の属性", locale)}
                  </div>
                </div>
                <table className="table table-bordered">
                  <thead className="result">
                    <tr>
                      <th>{intl.translate("順位", locale)}</th>
                      {tableheader.map(function(m, ind) {
                        return <th key={ind}>{m}</th>;
                      })}
                      {armnames.map(function(m, ind) {
                        if (ind == 0) {
                          return <th key={ind}>{m}</th>;
                        } else {
                          return <th key={ind}>{m}</th>;
                        }
                      })}
                      <th>{intl.translate("グラフ", locale)}</th>
                    </tr>
                  </thead>
                  <Result
                    key={summonindex}
                    summonid={summonindex}
                    data={result[summonindex]}
                    switcher={switcher}
                    arm={arm}
                    prof={prof}
                    onAddToHaisuiData={onAddToHaisuiData}
                    locale={locale}
                  />
                </table>
              </div>
            );
          })}
          <Modal
            className="hpChart"
            show={this.state.openHPChart}
            onHide={this.closeHPChart}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {intl.translate("背水渾身グラフ", locale)}
              </Modal.Title>
              <div className="charainfo" style={{ float: "left" }}>
                {charaInfo}
                <div>
                  {getElementColorLabel(prof.enemyElement, locale)}{" "}
                  {intl.translate("敵の属性", locale)}
                </div>
                <span>{buffInfoStr}</span>
              </div>
              <ButtonGroup block vertical>
                <Button bsStyle="info" onClick={this.openHPChartTutorial}>
                  {intl.translate("使い方", locale)}
                </Button>
                <Button bsStyle="primary" onClick={this.openStoredList}>
                  {intl.translate("保存された編成を編集", locale)}
                </Button>
                <Button bsStyle="danger" onClick={this.resetStoredList}>
                  {intl.translate("保存された編成を削除", locale)}
                </Button>
                {this.state.displayRealHP ? (
                  <Button bsStyle="default" onClick={this.switchDisplayRealHP}>
                    {intl.translate("HP割合で表示", locale)}
                  </Button>
                ) : (
                  <Button bsStyle="default" onClick={this.switchDisplayRealHP}>
                    {intl.translate("実際のHPで表示", locale)}
                  </Button>
                )}
              </ButtonGroup>
            </Modal.Header>
            <Modal.Body>
              <HPChart
                chara={chara}
                prof={prof}
                armlist={arm}
                summon={summon}
                sortKey={this.state.chartSortKey}
                locale={locale}
                storedList={this.state.storedList}
                displayRealHP={this.state.displayRealHP}
              />
              <HPChartHowTo
                show={this.state.openHPChartTutorial}
                onHide={this.closeHPChartTutorial}
              />
            </Modal.Body>
          </Modal>
          <StoredListEditor
            className="hpChartTutotial"
            show={this.state.openShowStoredList}
            onHide={this.closeStoredList}
            storedList={this.state.storedList}
            removeOneStoredList={this.removeOneStoredList}
            locale={locale}
          />
        </div>
      );
    } else {
      var changeSortKey = (
        <FormControl
          componentClass="select"
          style={{ width: "350px" }}
          value={this.props.sortKey}
          onChange={this.props.onChangeSortkey}
        >
          {" "}
          {selector[locale].ktypes}{" "}
        </FormControl>
      );
      return (
        <div className="resultList">
          <ControlLabel>{intl.translate("表示項目切替", locale)}</ControlLabel>
          <ButtonToolbar>
            <DropdownButton
              title={intl.translate("攻撃力・HP・連撃率", locale)}
              id="atk-hp-etcs"
            >
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchTotalAttack")}
                active={this.state.switchTotalAttack == 1 ? true : false}
              >
                {intl.translate("攻撃力(二手技巧無し)", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchATKandHP")}
                active={this.state.switchATKandHP == 1 ? true : false}
              >
                {intl.translate("戦力", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchHP")}
                active={this.state.switchHP == 1 ? true : false}
              >
                HP
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchDATA")}
                active={this.state.switchDATA == 1 ? true : false}
              >
                {intl.translate("連撃率", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchExpectedAttack")}
                active={this.state.switchExpectedAttack == 1 ? true : false}
              >
                {intl.translate("期待攻撃回数", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchCriticalRatio")}
                active={this.state.switchCriticalRatio == 1 ? true : false}
              >
                {intl.translate("技巧期待値", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchCriticalAttack")}
                active={this.state.switchCriticalAttack == 1 ? true : false}
              >
                {intl.translate("技巧期待攻撃力", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchTotalExpected")}
                active={this.state.switchTotalExpected == 1 ? true : false}
              >
                {intl.translate("総合*回数*技巧", locale)}
              </MenuItem>
            </DropdownButton>

            <DropdownButton
              title={intl.translate("パーティ平均攻撃力", locale)}
              id="party-averafed-atk"
            >
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchAverageAttack")}
                active={this.state.switchAverageAttack == 1 ? true : false}
              >
                {intl.translate("パーティ平均攻撃力", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(
                  this,
                  "switchAverageCriticalAttack"
                )}
                active={
                  this.state.switchAverageCriticalAttack == 1 ? true : false
                }
              >
                {intl.translate("技巧平均攻撃力", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(
                  this,
                  "switchAverageTotalExpected"
                )}
                active={
                  this.state.switchAverageTotalExpected == 1 ? true : false
                }
              >
                {intl.translate("総回技の平均", locale)}
              </MenuItem>
            </DropdownButton>

            <DropdownButton
              title={intl.translate("予測ダメージ", locale)}
              id="expected-damage"
            >
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchCycleDamage")}
                active={this.state.switchCycleDamage == 1 ? true : false}
              >
                {" "}
                {intl.translate("予想ターン毎ダメージ", locale)}{" "}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(
                  this,
                  "switchAverageCycleDamage"
                )}
                active={this.state.switchAverageCycleDamage == 1 ? true : false}
              >
                {" "}
                {intl.translate(
                  "パーティ平均予想ターン毎ダメージ",
                  locale
                )}{" "}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchPureDamage")}
                active={this.state.switchPureDamage == 1 ? true : false}
              >
                {" "}
                {intl.translate("単攻撃ダメージ(技巧連撃無)", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(
                  this,
                  "switchDamageWithCritical"
                )}
                active={this.state.switchDamageWithCritical == 1 ? true : false}
              >
                {" "}
                {intl.translate("単攻撃ダメージ(技巧有)", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(
                  this,
                  "switchDamageWithMultiple"
                )}
                active={this.state.switchDamageWithMultiple == 1 ? true : false}
              >
                {" "}
                {intl.translate("単攻撃ダメージ(連撃有)", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchDamage")}
                active={this.state.switchDamage == 1 ? true : false}
              >
                {" "}
                {intl.translate("単攻撃ダメージ(技巧連撃有)", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchOugiDamage")}
                active={this.state.switchOugiDamage == 1 ? true : false}
              >
                {" "}
                {intl.translate("奥義ダメージ", locale)}{" "}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchChainBurst")}
                active={this.state.switchChainBurst == 1 ? true : false}
              >
                {" "}
                {intl.translate("チェインバースト", locale)}{" "}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchOugiGage")}
                active={this.state.switchOugiGage == 1 ? true : false}
              >
                {" "}
                {intl.translate("ターン毎の奥義ゲージ上昇量", locale)}{" "}
              </MenuItem>
            </DropdownButton>

            <DropdownButton
              title={intl.translate("キャラ情報・スキル合計値", locale)}
              id="chara-and-skill-info"
            >
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchCharaAttack")}
                active={this.state.switchCharaAttack == 1 ? true : false}
              >
                {intl.translate("キャラ", locale)}
                {intl.translate("攻撃力", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchCharaHP")}
                active={this.state.switchCharaHP == 1 ? true : false}
              >
                {intl.translate("キャラ", locale)}HP
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchCharaDA")}
                active={this.state.switchCharaDA == 1 ? true : false}
              >
                {intl.translate("キャラ", locale)}
                {intl.translate("連撃率", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(
                  this,
                  "switchCharaTotalExpected"
                )}
                active={this.state.switchCharaTotalExpected == 1 ? true : false}
              >
                {intl.translate("キャラ", locale)}
                {intl.translate("総回技", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchCharaCycleDamage")}
                active={this.state.switchCharaCycleDamage == 1 ? true : false}
              >
                {intl.translate("キャラ", locale)}
                {intl.translate("予想ターン毎ダメージ", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchCharaPureDamage")}
                active={this.state.switchCharaPureDamage == 1 ? true : false}
              >
                {intl.translate("キャラ", locale)}
                {intl.translate("単攻撃ダメージ(技巧連撃無)", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchCharaOugiDamage")}
                active={this.state.switchCharaOugiDamage == 1 ? true : false}
              >
                {intl.translate("キャラ", locale)}
                {intl.translate("奥義ダメージ", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchCharaOugiGage")}
                active={this.state.switchCharaOugiDamage == 1 ? true : false}
              >
                {intl.translate("キャラ", locale)}
                {intl.translate("ターン毎の奥義ゲージ上昇量", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchSkillTotal")}
                active={this.state.switchSkillTotal == 1 ? true : false}
              >
                {intl.translate("スキル合計", locale)}
              </MenuItem>
              <MenuItem
                onClick={this.handleEvent.bind(this, "switchDebuffResistance")}
                active={this.state.switchDebuffResistance == 1 ? true : false}
              >
                {intl.translate("弱体耐性率", locale)}
              </MenuItem>
            </DropdownButton>
            <ControlAutoUpdate
              autoupdate={this.state.disableAutoResultUpdate}
              switchAutoUpdate={this.handleEvent.bind(
                this,
                "disableAutoResultUpdate"
              )}
              forceResultUpdate={this.forceResultUpdate}
              locale={locale}
            />
          </ButtonToolbar>

          <hr />

          <ButtonGroup style={{ width: "100%" }}>
            <Button
              block
              style={{ float: "left", width: "50%", margin: "0px" }}
              bsStyle="success"
              bsSize="large"
              onClick={this.openHPChart}
              disabled={!this.state.ChartButtonActive}
            >
              {intl.translate("背水グラフ", locale)}
            </Button>
            <Button
              block
              style={{ float: "left", width: "50%", margin: "0px" }}
              bsStyle="success"
              bsSize="large"
              onClick={this.openSimulator}
              disabled={!this.state.ChartButtonActive}
            >
              {intl.translate("ダメージシミュレータを開く", locale)}
            </Button>
          </ButtonGroup>

          <div style={{ width: "1050px" }}>
            <AdsenseAdvertisement locale={locale} type="pc-1" />
            <AdsenseAdvertisement locale={locale} type="pc-2" />
          </div>

          {summon.map(function(s, summonindex) {
            var selfSummonHeader = "";
            if (s.selfSummonType == "odin") {
              selfSummonHeader =
                intl.translate(summonElementTypes[s.selfElement].name, locale) +
                intl.translate("属性攻", locale) +
                s.selfSummonAmount +
                intl.translate("キャラ攻", locale) +
                s.selfSummonAmount2;
            } else if (s.selfSummonType == "elementByRace") {
              selfSummonHeader =
                intl.translate(summonElementTypes[s.selfElement].name, locale) +
                intl.translate("属性(種族数)", locale) +
                tesukatoripoka(parseInt(s.selfSummonAmount), races);
            } else {
              selfSummonHeader =
                intl.translate(summonElementTypes[s.selfElement].name, locale) +
                intl.translate(summonTypes[s.selfSummonType], locale) +
                s.selfSummonAmount;
            }

            var friendSummonHeader = "";
            if (s.friendSummonType == "odin") {
              friendSummonHeader =
                intl.translate(
                  summonElementTypes[s.friendElement].name,
                  locale
                ) +
                intl.translate("属性攻", locale) +
                s.friendSummonAmount +
                intl.translate("キャラ攻", locale) +
                s.friendSummonAmount2;
            } else if (s.friendSummonType == "elementByRace") {
              friendSummonHeader =
                intl.translate(
                  summonElementTypes[s.friendElement].name,
                  locale
                ) +
                intl.translate("属性(種族数)", locale) +
                tesukatoripoka(parseInt(s.friendSummonAmount), races);
            } else {
              friendSummonHeader =
                intl.translate(
                  summonElementTypes[s.friendElement].name,
                  locale
                ) +
                intl.translate(summonTypes[s.friendSummonType], locale) +
                s.friendSummonAmount;
            }

            return (
              <div
                style={{ textAlign: "left" }}
                key={summonindex}
                className="result"
              >
                <h2> No.{summonindex + 1} </h2>
                <ElementColorLabel element={s.selfElement}>
                  {selfSummonHeader}
                </ElementColorLabel>
                <ElementColorLabel element="all">+</ElementColorLabel>
                <ElementColorLabel element={s.friendElement}>
                  {friendSummonHeader}
                </ElementColorLabel>
                <hr style={{ margin: "10px 0px 5px 0px" }} />
                <div className="charainfo" style={{ float: "left" }}>
                  {charaInfo}
                  <div>
                    {getElementColorLabel(prof.enemyElement, locale)}{" "}
                    {intl.translate("敵の属性", locale)}
                  </div>
                  <span>{buffInfoStr}</span>
                </div>
                <div style={{ textAlign: "right", float: "right" }}>
                  <span>
                    {intl.translate("優先項目", locale)}: {changeSortKey}
                  </span>
                </div>
                <table className="table table-bordered">
                  <thead className="result">
                    <tr>
                      <th>{intl.translate("順位", locale)}</th>
                      {tableheader.map(function(m, ind) {
                        return <th key={ind}>{m}</th>;
                      })}
                      {armnames.map(function(m, ind) {
                        if (ind == 0) {
                          return <th key={ind}>{m}</th>;
                        } else {
                          return <th key={ind}>{m}</th>;
                        }
                      })}
                      <th>{intl.translate("グラフ", locale)}</th>
                    </tr>
                  </thead>
                  <Result
                    key={summonindex}
                    summonid={summonindex}
                    data={result[summonindex]}
                    switcher={switcher}
                    arm={arm}
                    prof={prof}
                    onAddToHaisuiData={onAddToHaisuiData}
                    locale={locale}
                  />
                </table>
              </div>
            );
          })}
          <hr />

          <Modal
            className="hpChart"
            show={this.state.openHPChart}
            onHide={this.closeHPChart}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {intl.translate("背水渾身グラフ", locale)}
              </Modal.Title>
              <div className="charainfo" style={{ float: "left" }}>
                {charaInfo}
                <div>
                  {getElementColorLabel(prof.enemyElement, locale)}{" "}
                  {intl.translate("敵の属性", locale)}
                </div>
                <span>{buffInfoStr}</span>
              </div>
              <div style={{ float: "right" }}>
                <Button bsStyle="info" onClick={this.openHPChartTutorial}>
                  {intl.translate("使い方", locale)}
                </Button>
                <Button bsStyle="primary" onClick={this.openStoredList}>
                  {intl.translate("保存された編成を編集", locale)}
                </Button>
                <Button bsStyle="danger" onClick={this.resetStoredList}>
                  {intl.translate("保存された編成を削除", locale)}
                </Button>
                {this.state.displayRealHP ? (
                  <Button bsStyle="default" onClick={this.switchDisplayRealHP}>
                    {intl.translate("HP割合で表示", locale)}
                  </Button>
                ) : (
                  <Button bsStyle="default" onClick={this.switchDisplayRealHP}>
                    {intl.translate("実際のHPで表示", locale)}
                  </Button>
                )}
              </div>
            </Modal.Header>
            <Modal.Body>
              <HPChart
                chara={chara}
                prof={prof}
                armlist={arm}
                summon={summon}
                sortKey={this.state.chartSortKey}
                locale={locale}
                storedList={this.state.storedList}
                displayRealHP={this.state.displayRealHP}
              />
              <HPChartHowTo
                show={this.state.openHPChartTutorial}
                onHide={this.closeHPChartTutorial}
              />
            </Modal.Body>
          </Modal>
          <Modal
            className="hpChart"
            show={this.state.openSimulator}
            onHide={this.closeSimulator}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {intl.translate("ダメージシミュレータ", locale)}
              </Modal.Title>
              <div className="charainfo" style={{ float: "left" }}>
                {charaInfo}
                <div>
                  {getElementColorLabel(prof.enemyElement, locale)}{" "}
                  {intl.translate("敵の属性", locale)}
                </div>
                <span>{buffInfoStr}</span>
              </div>
              <div style={{ float: "right" }}>
                <Button bsStyle="primary" onClick={this.openStoredList}>
                  {intl.translate("保存された編成を編集", locale)}
                </Button>
                <Button bsStyle="danger" onClick={this.resetStoredList}>
                  {intl.translate("保存された編成を削除", locale)}
                </Button>
              </div>
            </Modal.Header>
            <Modal.Body>
              <Simulator
                chara={chara}
                prof={prof}
                armlist={arm}
                summon={summon}
                dataName={this.props.dataName}
                dataForLoad={this.props.simulator}
                locale={locale}
                onChange={this.props.onChangeSimulationData}
                storedList={this.state.storedList}
                sortKey={this.state.chartSortKey}
              />
            </Modal.Body>
          </Modal>
          <StoredListEditor
            className="hpChartTutotial"
            show={this.state.openShowStoredList}
            onHide={this.closeStoredList}
            storedList={this.state.storedList}
            removeOneStoredList={this.removeOneStoredList}
            locale={locale}
            handleStoredListNameChange={this.handleStoredListNameChange}
          />
        </div>
      );
    }
  }
});

module.exports.ResultList = ResultList;
