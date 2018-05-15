var React = require("react");
var intl = require("./translate.js");
var { FormControl } = require("react-bootstrap");
var buffAmountList = [
  0,
  5,
  10,
  15,
  20,
  25,
  30,
  35,
  40,
  45,
  50,
  55,
  60,
  65,
  70,
  75,
  80,
  85,
  90,
  95,
  100,
  105,
  110,
  115,
  120,
  125,
  130,
  135,
  140,
  145,
  150,
  -5,
  -10,
  -15,
  -20,
  -25,
  -30,
  -35,
  -40,
  -45,
  -50,
  -55,
  -60,
  -65,
  -70,
  -75,
  -80,
  -85,
  -90,
  -95,
  -100
];
var daBuffAmountList = [
  0,
  5,
  10,
  15,
  20,
  25,
  30,
  35,
  40,
  45,
  50,
  55,
  60,
  65,
  70,
  75,
  80,
  85,
  90,
  95,
  100,
  -5,
  -10,
  -15,
  -20,
  -25,
  -30,
  -35,
  -40,
  -45,
  -50,
  -55,
  -60,
  -65,
  -70,
  -75,
  -80,
  -85,
  -90,
  -95,
  -100
];

var select_normalbuffAmount = {
  ja: buffAmountList.map(function(opt) {
    return (
      <option value={"normal_" + opt} key={opt}>
        {intl.translate("通常バフ", "ja")}
        {opt}%
      </option>
    );
  }),
  en: buffAmountList.map(function(opt) {
    return (
      <option value={"normal_" + opt} key={opt}>
        {intl.translate("通常バフ", "en")}
        {opt}%
      </option>
    );
  })
};

var select_elementbuffAmount = {
  ja: buffAmountList.map(function(opt) {
    return (
      <option value={"element_" + opt} key={opt}>
        {intl.translate("属性バフ", "ja")}
        {opt}%
      </option>
    );
  }),
  en: buffAmountList.map(function(opt) {
    return (
      <option value={"element_" + opt} key={opt}>
        {intl.translate("属性バフ", "en")}
        {opt}%
      </option>
    );
  })
};

var select_otherbuffAmount = {
  ja: buffAmountList.map(function(opt) {
    return (
      <option value={"other_" + opt} key={opt}>
        {intl.translate("その他バフ", "ja")}
        {opt}%
      </option>
    );
  }),
  en: buffAmountList.map(function(opt) {
    return (
      <option value={"other_" + opt} key={opt}>
        {intl.translate("その他バフ", "en")}
        {opt}%
      </option>
    );
  })
};

var select_dabuffAmount = {
  ja: daBuffAmountList.map(function(opt) {
    return (
      <option value={"DA_" + opt} key={opt}>
        {intl.translate("DAバフ", "ja")}
        {opt}%
      </option>
    );
  }),
  en: daBuffAmountList.map(function(opt) {
    return (
      <option value={"DA_" + opt} key={opt}>
        {intl.translate("DAバフ", "en")}
        {opt}%
      </option>
    );
  })
};

var select_tabuffAmount = {
  ja: daBuffAmountList.map(function(opt) {
    return (
      <option value={"TA_" + opt} key={opt}>
        {intl.translate("TAバフ", "ja")}
        {opt}%
      </option>
    );
  }),
  en: daBuffAmountList.map(function(opt) {
    return (
      <option value={"TA_" + opt} key={opt}>
        {intl.translate("TAバフ", "en")}
        {opt}%
      </option>
    );
  })
};

var select_ougigagebuffAmount = {
  ja: buffAmountList.map(function(opt) {
    return (
      <option value={"ougiGage_" + opt} key={opt}>
        {intl.translate("奥義ゲージ上昇量", "ja")}
        {opt}%
      </option>
    );
  }),
  en: buffAmountList.map(function(opt) {
    return (
      <option value={"ougiGage_" + opt} key={opt}>
        {intl.translate("奥義ゲージ上昇量", "en")}
        {opt}%
      </option>
    );
  })
};

var select_additionalbuffAmount = {
  ja: buffAmountList.map(function(opt) {
    return (
      <option value={"additionalDamage_" + opt} key={opt}>
        {intl.translate("追加ダメージ", "ja")}
        {opt}%
      </option>
    );
  }),
  en: buffAmountList.map(function(opt) {
    return (
      <option value={"additionalDamage_" + opt} key={opt}>
        {intl.translate("追加ダメージ", "en")}
        {opt}%
      </option>
    );
  })
};

var BuffListForm = React.createClass({
  render: function() {
    var locale = this.props.locale;

    return (
      <FormControl
        componentClass="select"
        name={this.props.name}
        id={this.props.id}
        value={this.props.value}
        onChange={this.props.onChange}
      >
        <optgroup label="通常バフ">{select_normalbuffAmount[locale]}</optgroup>
        <optgroup label="属性バフ">{select_elementbuffAmount[locale]}</optgroup>
        <optgroup label="その他バフ">{select_otherbuffAmount[locale]}</optgroup>
        <optgroup label="DA率">{select_dabuffAmount[locale]}</optgroup>
        <optgroup label="TA率">{select_tabuffAmount[locale]}</optgroup>
        <optgroup label="奥義ゲージ上昇量">
          {select_ougigagebuffAmount[locale]}
        </optgroup>
        <optgroup label="追加ダメージ">
          {select_additionalbuffAmount[locale]}
        </optgroup>
      </FormControl>
    );
  }
});

module.exports.BuffListForm = BuffListForm;
