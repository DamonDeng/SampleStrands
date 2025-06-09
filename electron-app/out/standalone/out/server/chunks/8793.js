exports.id = 8793;
exports.ids = [8793];
exports.modules = {

/***/ 38793:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Chat: () => (/* binding */ Chat),
  ChatActions: () => (/* binding */ ChatActions),
  DeleteImageButton: () => (/* binding */ DeleteImageButton),
  DocumentsList: () => (/* binding */ DocumentsList),
  EditMessageModal: () => (/* binding */ EditMessageModal),
  PromptHints: () => (/* binding */ PromptHints),
  SessionConfigModel: () => (/* binding */ SessionConfigModel)
});

// EXTERNAL MODULE: external "next/dist/compiled/react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(56786);
// EXTERNAL MODULE: ./node_modules/use-debounce/dist/index.module.js
var index_module = __webpack_require__(20238);
// EXTERNAL MODULE: external "next/dist/compiled/react"
var react_ = __webpack_require__(18038);
// EXTERNAL MODULE: ./app/utils.ts
var utils = __webpack_require__(92842);
;// CONCATENATED MODULE: ./app/icons/send-white.svg
var _defs, _mask;
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var SvgSendWhite = function SvgSendWhite(props) {
  return /*#__PURE__*/react_.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    width: 16,
    height: 16,
    fill: "none"
  }, props), _defs || (_defs = /*#__PURE__*/react_.createElement("defs", null, /*#__PURE__*/react_.createElement("path", {
    id: "send-white_svg__a",
    d: "M0 0h16v16H0z"
  }))), /*#__PURE__*/react_.createElement("g", null, _mask || (_mask = /*#__PURE__*/react_.createElement("mask", {
    id: "send-white_svg__b",
    fill: "#fff"
  }, /*#__PURE__*/react_.createElement("use", {
    xlinkHref: "#send-white_svg__a"
  }))), /*#__PURE__*/react_.createElement("g", {
    mask: "url(#send-white_svg__b)"
  }, /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#fff",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M0 4.71 6.67 6l1.67 6.67L12.67 0 0 4.71Z",
    transform: "translate(1.333 2)"
  }), /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#fff",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M0 1.89 1.89 0",
    transform: "translate(8.003 6.117)"
  }))));
};
/* harmony default export */ const send_white = (SvgSendWhite);
;// CONCATENATED MODULE: ./app/icons/brain.svg
var brain_defs, brain_mask;
function brain_extends() { brain_extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return brain_extends.apply(this, arguments); }

var SvgBrain = function SvgBrain(props) {
  return /*#__PURE__*/react_.createElement("svg", brain_extends({
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    width: 16,
    height: 16,
    fill: "none"
  }, props), brain_defs || (brain_defs = /*#__PURE__*/react_.createElement("defs", null, /*#__PURE__*/react_.createElement("path", {
    id: "brain_svg__a",
    d: "M0 0h16v16H0z"
  }))), /*#__PURE__*/react_.createElement("g", null, brain_mask || (brain_mask = /*#__PURE__*/react_.createElement("mask", {
    id: "brain_svg__b",
    fill: "#fff"
  }, /*#__PURE__*/react_.createElement("use", {
    xlinkHref: "#brain_svg__a"
  }))), /*#__PURE__*/react_.createElement("g", {
    mask: "url(#brain_svg__b)"
  }, /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M5.01 13.33c-.32-1.06-.82-1.86-1.48-2.38-.98-.78-2.56-.3-3.14-1.11-.58-.8.41-2.29.76-3.17.34-.88-1.33-1.19-1.13-1.44.13-.16.97-.64 2.53-1.44C3 1.26 4.63 0 7.47 0c4.24 0 5.86 3.6 5.86 5.89 0 2.29-1.96 4.76-4.75 5.29-.25.37.11 1.08 1.08 2.15",
    transform: "translate(1.333 1.333)"
  }), /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M2.1 3.33c-.19 1.09.04 1.6.69 1.53.65-.07 1.05-.34 1.18-.81 1.02.28 1.57.04 1.66-.72.12-1.15-.5-2.07-.75-2.07s-.91-.03-.91-.38C3.97.52 3.2.33 2.5.33c-.69 0-.27-.47-1.23-.29C.64.17.26.44.13.88c-.22.84-.16 1.43.19 1.78.35.34.94.56 1.78.67Z",
    transform: "translate(6.374 3.957)"
  }), /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M1.97 0c-.34.21-.8.56-1 .83-.49.69-.88 1.1-.97 1.54",
    transform: "translate(8.193 8.5)"
  }))));
};
/* harmony default export */ const brain = (SvgBrain);
;// CONCATENATED MODULE: ./app/icons/rename.svg
var rename_defs, rename_mask;
function rename_extends() { rename_extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return rename_extends.apply(this, arguments); }

var SvgRename = function SvgRename(props) {
  return /*#__PURE__*/react_.createElement("svg", rename_extends({
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    width: 16,
    height: 16,
    fill: "none"
  }, props), rename_defs || (rename_defs = /*#__PURE__*/react_.createElement("defs", null, /*#__PURE__*/react_.createElement("path", {
    id: "rename_svg__a",
    d: "M0 0h16v16H0z"
  }))), /*#__PURE__*/react_.createElement("g", null, rename_mask || (rename_mask = /*#__PURE__*/react_.createElement("mask", {
    id: "rename_svg__b",
    fill: "#fff"
  }, /*#__PURE__*/react_.createElement("use", {
    xlinkHref: "#rename_svg__a"
  }))), /*#__PURE__*/react_.createElement("g", {
    mask: "url(#rename_svg__b)"
  }, /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M2.83 13.2 13.2 2.83 10.37 0 0 10.37v2.83h2.83Z",
    transform: "translate(1.775 1.3)"
  }), /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "m0 0 2.83 2.83",
    transform: "translate(9.317 4.13)"
  }))));
};
/* harmony default export */ const rename = (SvgRename);
;// CONCATENATED MODULE: ./app/icons/share.svg
var share_defs, share_mask;
function share_extends() { share_extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return share_extends.apply(this, arguments); }

var SvgShare = function SvgShare(props) {
  return /*#__PURE__*/react_.createElement("svg", share_extends({
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    width: 16,
    height: 16,
    fill: "none"
  }, props), share_defs || (share_defs = /*#__PURE__*/react_.createElement("defs", null, /*#__PURE__*/react_.createElement("path", {
    id: "share_svg__a",
    d: "M0 0h16v16H0z"
  }))), /*#__PURE__*/react_.createElement("g", null, share_mask || (share_mask = /*#__PURE__*/react_.createElement("mask", {
    id: "share_svg__b",
    fill: "#fff"
  }, /*#__PURE__*/react_.createElement("use", {
    xlinkHref: "#share_svg__a"
  }))), /*#__PURE__*/react_.createElement("g", {
    mask: "url(#share_svg__b)"
  }, /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M6.67 3.67C1.67 3.67 0 7.33 0 13c0 0 2-5 6.67-5v3.67l6-5.67-6-6v3.67Z",
    transform: "translate(2 1.333)"
  }))));
};
/* harmony default export */ const share = (SvgShare);
;// CONCATENATED MODULE: ./app/icons/return.svg
var return_defs, return_mask;
function return_extends() { return_extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return return_extends.apply(this, arguments); }

var SvgReturn = function SvgReturn(props) {
  return /*#__PURE__*/react_.createElement("svg", return_extends({
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    width: 16,
    height: 16,
    fill: "none"
  }, props), return_defs || (return_defs = /*#__PURE__*/react_.createElement("defs", null, /*#__PURE__*/react_.createElement("path", {
    id: "return_svg__a",
    d: "M0 0h16v16H0z"
  }))), /*#__PURE__*/react_.createElement("g", null, return_mask || (return_mask = /*#__PURE__*/react_.createElement("mask", {
    id: "return_svg__b",
    fill: "#fff"
  }, /*#__PURE__*/react_.createElement("use", {
    xlinkHref: "#return_svg__a"
  }))), /*#__PURE__*/react_.createElement("g", {
    mask: "url(#return_svg__b)"
  }, /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M2.33 0 0 2l2.33 2.33",
    transform: "translate(2 2.667)"
  }), /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M0 0h7.66c2.3 0 4.25 1.87 4.34 4.17.09 2.42-1.91 4.5-4.34 4.5H2",
    transform: "translate(2 4.667)"
  }))));
};
/* harmony default export */ const icons_return = (SvgReturn);
// EXTERNAL MODULE: ./app/icons/copy.svg
var copy = __webpack_require__(53231);
// EXTERNAL MODULE: ./app/icons/three-dots.svg
var three_dots = __webpack_require__(3076);
;// CONCATENATED MODULE: ./app/icons/loading.svg
var _rect, _g;
function loading_extends() { loading_extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return loading_extends.apply(this, arguments); }

var SvgLoading = function SvgLoading(props) {
  return /*#__PURE__*/react_.createElement("svg", loading_extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16,
    fill: "#fff"
  }, props), _rect || (_rect = /*#__PURE__*/react_.createElement("rect", {
    width: "100%",
    height: "100%",
    fill: "none"
  })), _g || (_g = /*#__PURE__*/react_.createElement("g", {
    className: "loading_svg__currentLayer"
  }, /*#__PURE__*/react_.createElement("circle", {
    cx: 4,
    cy: 8,
    r: 1.926,
    fill: "#333"
  }, /*#__PURE__*/react_.createElement("animate", {
    attributeName: "r",
    begin: "0s",
    calcMode: "linear",
    dur: "0.8s",
    from: 2,
    repeatCount: "indefinite",
    to: 2,
    values: "2;1.2;2"
  }), /*#__PURE__*/react_.createElement("animate", {
    attributeName: "fill-opacity",
    begin: "0s",
    calcMode: "linear",
    dur: "0.8s",
    from: 1,
    repeatCount: "indefinite",
    to: 1,
    values: "1;.5;1"
  })), /*#__PURE__*/react_.createElement("circle", {
    cx: 8,
    cy: 8,
    r: 1.274,
    fill: "#333",
    fillOpacity: 0.3
  }, /*#__PURE__*/react_.createElement("animate", {
    attributeName: "r",
    begin: "0s",
    calcMode: "linear",
    dur: "0.8s",
    from: 1.2,
    repeatCount: "indefinite",
    to: 1.2,
    values: "1.2;2;1.2"
  }), /*#__PURE__*/react_.createElement("animate", {
    attributeName: "fill-opacity",
    begin: "0s",
    calcMode: "linear",
    dur: "0.8s",
    from: 0.5,
    repeatCount: "indefinite",
    to: 0.5,
    values: ".5;1;.5"
  })), /*#__PURE__*/react_.createElement("circle", {
    cx: 12,
    cy: 8,
    r: 1.926,
    fill: "#333"
  }, /*#__PURE__*/react_.createElement("animate", {
    attributeName: "r",
    begin: "0s",
    calcMode: "linear",
    dur: "0.8s",
    from: 2,
    repeatCount: "indefinite",
    to: 2,
    values: "2;1.2;2"
  }), /*#__PURE__*/react_.createElement("animate", {
    attributeName: "fill-opacity",
    begin: "0s",
    calcMode: "linear",
    dur: "0.8s",
    from: 1,
    repeatCount: "indefinite",
    to: 1,
    values: "1;.5;1"
  })))));
};
/* harmony default export */ const loading = (SvgLoading);
;// CONCATENATED MODULE: ./app/icons/prompt.svg
var prompt_defs, prompt_mask;
function prompt_extends() { prompt_extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return prompt_extends.apply(this, arguments); }

var SvgPrompt = function SvgPrompt(props) {
  return /*#__PURE__*/react_.createElement("svg", prompt_extends({
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    width: 16,
    height: 16,
    fill: "none"
  }, props), prompt_defs || (prompt_defs = /*#__PURE__*/react_.createElement("defs", null, /*#__PURE__*/react_.createElement("path", {
    id: "prompt_svg__a",
    d: "M0 0h16v16H0z"
  }))), /*#__PURE__*/react_.createElement("g", null, prompt_mask || (prompt_mask = /*#__PURE__*/react_.createElement("mask", {
    id: "prompt_svg__b",
    fill: "#fff"
  }, /*#__PURE__*/react_.createElement("use", {
    xlinkHref: "#prompt_svg__a"
  }))), /*#__PURE__*/react_.createElement("g", {
    mask: "url(#prompt_svg__b)"
  }, /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "m1.367 1.367 1.41 1.41M4.667 0v2m0 0V0m3.295 1.367-1.41 1.41m0 0 1.41-1.41m1.371 3.3h-2m0 0h2m-1.37 3.295-1.41-1.41m0 0 1.41 1.41M4.666 9.333v-2m0 0v2m-3.3-1.37 1.41-1.41m0 0-1.41 1.41M0 4.666h2m0 0H0",
    transform: "translate(5.333 1.333)"
  }), /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M8.01 0 0 8.01",
    transform: "translate(1.848 6.138)"
  }))));
};
/* harmony default export */ const icons_prompt = (SvgPrompt);
// EXTERNAL MODULE: ./app/icons/import.svg
var icons_import = __webpack_require__(36829);
// EXTERNAL MODULE: ./app/icons/max.svg
var max = __webpack_require__(79746);
// EXTERNAL MODULE: ./app/icons/min.svg
var min = __webpack_require__(23380);
// EXTERNAL MODULE: ./app/icons/reload.svg
var reload = __webpack_require__(4925);
;// CONCATENATED MODULE: ./app/icons/break.svg
var break_defs;
function break_extends() { break_extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return break_extends.apply(this, arguments); }

var SvgBreak = function SvgBreak(props) {
  return /*#__PURE__*/react_.createElement("svg", break_extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16,
    fill: "none"
  }, props), /*#__PURE__*/react_.createElement("path", {
    style: {
      fill: "#333",
      opacity: 1
    },
    d: "M13.275-.275c.261.26.392.576.392.945v10.66c0 .37-.131.684-.392.945a1.288 1.288 0 0 1-.945.392H1.67c-.37 0-.684-.13-.945-.392a1.288 1.288 0 0 1-.392-.945V.67c0-.37.13-.684.392-.945.26-.261.576-.392.945-.392h10.66c.369 0 .684.13.945.392zM1.667 11.33c0 .002 0 .003.003.003h10.66c.002 0 .003 0 .003-.003V.67c0-.002 0-.003-.003-.003H1.67c-.002 0-.003 0-.003.003z",
    transform: "translate(1 2)"
  }), /*#__PURE__*/react_.createElement("path", {
    style: {
      fill: "#333",
      opacity: 1
    },
    d: "M9.763 7.507a.666.666 0 0 1-.867 0L7 5.878 5.104 7.506a.665.665 0 0 1-.867.001L2.331 5.878.434 7.506a.66.66 0 0 1-.485.16.66.66 0 0 1-.53-.338.665.665 0 0 1 .147-.834l2.33-2a.666.666 0 0 1 .867 0L4.67 6.123l1.897-1.629a.666.666 0 0 1 .868 0l1.897 1.629 1.906-1.63a.668.668 0 0 1 .867.002l2.33 2a.66.66 0 0 1 .23.455.661.661 0 0 1-.252.575.666.666 0 0 1-.846-.019l-1.897-1.628z",
    transform: "translate(1 2)"
  }), break_defs || (break_defs = /*#__PURE__*/react_.createElement("defs", null, /*#__PURE__*/react_.createElement("path", {
    id: "break_svg__a",
    d: "M0 0h16v16H0z"
  }))));
};
/* harmony default export */ const icons_break = (SvgBreak);
;// CONCATENATED MODULE: ./app/icons/chat-settings.svg
var chat_settings_mask, chat_settings_defs;
function chat_settings_extends() { chat_settings_extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return chat_settings_extends.apply(this, arguments); }

var SvgChatSettings = function SvgChatSettings(props) {
  return /*#__PURE__*/react_.createElement("svg", chat_settings_extends({
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    width: 16,
    height: 16,
    fill: "none"
  }, props), /*#__PURE__*/react_.createElement("g", null, chat_settings_mask || (chat_settings_mask = /*#__PURE__*/react_.createElement("mask", {
    id: "chat-settings_svg__b",
    fill: "#fff"
  }, /*#__PURE__*/react_.createElement("use", {
    xlinkHref: "#chat-settings_svg__a"
  }))), /*#__PURE__*/react_.createElement("g", {
    mask: "url(#chat-settings_svg__b)"
  }, /*#__PURE__*/react_.createElement("path", {
    style: {
      fill: "#333",
      opacity: 1
    },
    d: "M6.728 14.598a.665.665 0 0 1-.828.434 7.294 7.294 0 0 1-3.187-1.945.666.666 0 0 1-.026-.896c.207-.241.31-.527.31-.857 0-.37-.13-.685-.389-.944A1.286 1.286 0 0 0 1.663 10h-.08a.662.662 0 0 1-.665-.288.665.665 0 0 1-.098-.235 7.234 7.234 0 0 1 .188-3.675.662.662 0 0 1 .635-.465h.02c.37 0 .684-.13.944-.392.26-.26.39-.574.39-.942 0-.215-.045-.415-.134-.6a.666.666 0 0 1 .148-.78A7.292 7.292 0 0 1 6.034.932a.666.666 0 0 1 .774.34c.11.219.272.394.483.524.216.135.454.202.712.202.254 0 .488-.067.703-.201.211-.131.372-.306.483-.524a.666.666 0 0 1 .773-.34 7.404 7.404 0 0 1 3.03 1.688.664.664 0 0 1 .143.8c-.09.174-.135.368-.135.583 0 .366.13.68.392.941.262.262.575.393.941.393h.03a.664.664 0 0 1 .636.465c.22.695.331 1.43.331 2.201a7.34 7.34 0 0 1-.143 1.474.66.66 0 0 1-.27.411.666.666 0 0 1-.478.115 1 1 0 0 0-.106-.003c-.367 0-.681.13-.941.39-.261.26-.392.574-.392.943 0 .322.106.61.317.865a.662.662 0 0 1 .1.686.671.671 0 0 1-.133.202 7.294 7.294 0 0 1-3.187 1.945.674.674 0 0 1-.503-.047.659.659 0 0 1-.325-.387 1.311 1.311 0 0 0-.477-.667 1.288 1.288 0 0 0-.789-.26c-.297 0-.564.087-.798.26-.23.17-.389.393-.477.667zm3.52-1.032c.626-.253 1.191-.6 1.696-1.042a2.603 2.603 0 0 1-.277-1.19 2.642 2.642 0 0 1 .784-1.888 2.646 2.646 0 0 1 1.51-.753 6.393 6.393 0 0 0-.118-2.067 2.655 2.655 0 0 1-1.394-.738 2.656 2.656 0 0 1-.782-1.884c0-.239.029-.468.087-.687a6.05 6.05 0 0 0-1.693-.954c-.182.22-.398.41-.65.566-.431.268-.9.402-1.408.402-.511 0-.983-.134-1.414-.401a2.632 2.632 0 0 1-.653-.567 5.936 5.936 0 0 0-1.69.957 2.74 2.74 0 0 1-.125 1.72c-.134.319-.324.601-.57.847a2.641 2.641 0 0 1-1.389.738 5.903 5.903 0 0 0-.12 2.069 2.642 2.642 0 0 1 1.509.753 2.654 2.654 0 0 1 .779 1.888c0 .433-.091.831-.274 1.192.504.44 1.068.787 1.692 1.04.172-.272.393-.507.664-.707.47-.348 1-.522 1.591-.522.587 0 1.115.174 1.584.523.27.2.49.435.661.705z"
  }), /*#__PURE__*/react_.createElement("path", {
    style: {
      fill: "#333",
      opacity: 1
    },
    d: "M10.122 10.122a2.987 2.987 0 0 1-2.125.881 2.969 2.969 0 0 1-2.122-.883 2.983 2.983 0 0 1-.64-.955A2.984 2.984 0 0 1 5 7.997a2.974 2.974 0 0 1 .876-2.12A2.974 2.974 0 0 1 7.996 5c.407 0 .797.078 1.169.235.36.151.678.364.955.64a2.969 2.969 0 0 1 .883 2.122 2.987 2.987 0 0 1-.881 2.125zM7.997 6.333c-.461 0-.854.162-1.178.486a1.603 1.603 0 0 0-.486 1.178c0 .462.163.857.488 1.183.324.327.716.49 1.176.49.46 0 .855-.164 1.182-.491.327-.327.491-.721.491-1.182 0-.46-.163-.852-.49-1.176a1.618 1.618 0 0 0-1.183-.488z"
  }))), chat_settings_defs || (chat_settings_defs = /*#__PURE__*/react_.createElement("defs", null, /*#__PURE__*/react_.createElement("path", {
    id: "chat-settings_svg__a",
    d: "M0 0h16v16H0z"
  }))));
};
/* harmony default export */ const chat_settings = (SvgChatSettings);
// EXTERNAL MODULE: ./app/icons/clear.svg
var clear = __webpack_require__(99449);
;// CONCATENATED MODULE: ./app/icons/pin.svg
var pin_mask, pin_defs;
function pin_extends() { pin_extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return pin_extends.apply(this, arguments); }

var SvgPin = function SvgPin(props) {
  return /*#__PURE__*/react_.createElement("svg", pin_extends({
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    width: 16,
    height: 16,
    fill: "none"
  }, props), /*#__PURE__*/react_.createElement("g", null, pin_mask || (pin_mask = /*#__PURE__*/react_.createElement("mask", {
    id: "pin_svg__b",
    fill: "#fff"
  }, /*#__PURE__*/react_.createElement("use", {
    xlinkHref: "#pin_svg__a"
  }))), /*#__PURE__*/react_.createElement("g", {
    mask: "url(#pin_svg__b)"
  }, /*#__PURE__*/react_.createElement("path", {
    style: {
      fill: "#333",
      opacity: 1
    },
    d: "m6.685 8.81-4 5.44-.537-.394-.397-.536 5.42-4.01a.666.666 0 0 1 .866.062l.532.528 2.07 2.063-.471.473-.472-.472c.3-.3.457-.62.472-.963.015-.353-.108-.798-.37-1.333a.665.665 0 0 1 .017-.616l2.36-4.25a.662.662 0 0 1 .679-.336l1.65.24-.096.66-.472.471-3.77-3.77.472-.471.66-.096.24 1.65a.664.664 0 0 1-.337.678l-4.25 2.36a.665.665 0 0 1-.646.001c-.479-.265-.903-.388-1.27-.369-.358.018-.69.18-.996.487l-.471-.471.471-.472 2.06 2.06.52.52a.665.665 0 0 1 .066.867zM5.61 8.02l.537.396-.472.471-.52-.52-2.06-2.06a.665.665 0 0 1 0-.943c.548-.548 1.172-.84 1.87-.875.622-.032 1.283.146 1.984.533l-.322.584-.324-.583 4.25-2.36.324.583-.66.096-.24-1.65a.664.664 0 0 1 .66-.763.665.665 0 0 1 .471.195l3.77 3.77a.666.666 0 0 1-.567 1.131l-1.65-.24.096-.66.583.324-2.36 4.25-.583-.323.599-.293c.36.738.527 1.396.503 1.974-.029.689-.316 1.305-.86 1.85a.664.664 0 0 1-.842.083.667.667 0 0 1-.101-.082l-2.068-2.062-.531-.527.47-.473.396.535-5.42 4.01a.663.663 0 0 1-.791.002.664.664 0 0 1-.142-.932z"
  }))), pin_defs || (pin_defs = /*#__PURE__*/react_.createElement("defs", null, /*#__PURE__*/react_.createElement("path", {
    id: "pin_svg__a",
    d: "M0 0h16v16H0z"
  }))));
};
/* harmony default export */ const pin = (SvgPin);
// EXTERNAL MODULE: ./app/icons/confirm.svg
var icons_confirm = __webpack_require__(77365);
// EXTERNAL MODULE: ./app/icons/cancel.svg
var cancel = __webpack_require__(32064);
;// CONCATENATED MODULE: ./app/icons/image.svg
var image_rect, image_g;
function image_extends() { image_extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return image_extends.apply(this, arguments); }

var SvgImage = function SvgImage(props) {
  return /*#__PURE__*/react_.createElement("svg", image_extends({
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    height: 16,
    width: 16,
    xmlSpace: "preserve"
  }, props), image_rect || (image_rect = /*#__PURE__*/react_.createElement("rect", {
    width: "100%",
    height: "100%"
  })), image_g || (image_g = /*#__PURE__*/react_.createElement("g", {
    className: "image_svg__currentLayer"
  }, /*#__PURE__*/react_.createElement("g", {
    fill: "#333"
  }, /*#__PURE__*/react_.createElement("path", {
    d: "M2.47 2.47h1.977v-.782H1.688v2.76h.781zM11.553 1.688v.781h1.978v1.978h.78V1.688zM13.53 13.53h-1.977v.782h2.759v-2.76h-.781zM2.47 11.553h-.782v2.759h2.76v-.781H2.468zM8.83 6.243c.682 0 1.237-.555 1.237-1.236S9.512 3.77 8.83 3.77a1.238 1.238 0 0 0 0 2.473zM3.77 12.23h8.46V9.71l-1.527-1.611-1.85 1.077-2.578-1.842L3.77 9.977z"
  })))));
};
/* harmony default export */ const icons_image = (SvgImage);
// EXTERNAL MODULE: ./app/icons/plugin.svg
var icons_plugin = __webpack_require__(80464);
;// CONCATENATED MODULE: ./app/icons/light.svg
var light_defs, light_mask;
function light_extends() { light_extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return light_extends.apply(this, arguments); }

var SvgLight = function SvgLight(props) {
  return /*#__PURE__*/react_.createElement("svg", light_extends({
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    width: 16,
    height: 16,
    fill: "none"
  }, props), light_defs || (light_defs = /*#__PURE__*/react_.createElement("defs", null, /*#__PURE__*/react_.createElement("path", {
    id: "light_svg__a",
    d: "M0 0h16v16H0z"
  }))), /*#__PURE__*/react_.createElement("g", null, light_mask || (light_mask = /*#__PURE__*/react_.createElement("mask", {
    id: "light_svg__b",
    fill: "#fff"
  }, /*#__PURE__*/react_.createElement("use", {
    xlinkHref: "#light_svg__a"
  }))), /*#__PURE__*/react_.createElement("g", {
    mask: "url(#light_svg__b)"
  }, /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M8.67 4.33C8.67 1.94 6.73 0 4.33 0 1.94 0 0 1.94 0 4.33a4.334 4.334 0 1 0 8.67 0Z",
    transform: "translate(3.667 3.667)"
  }), /*#__PURE__*/react_.createElement("path", {
    fillRule: "evenodd",
    style: {
      fill: "#333"
    },
    d: "M1.67.83C1.67.37 1.29 0 .83 0 .37 0 0 .37 0 .83c0 .46.37.84.83.84.46 0 .84-.38.84-.84Z",
    transform: "translate(7.167 .333)"
  }), /*#__PURE__*/react_.createElement("path", {
    fillRule: "evenodd",
    style: {
      fill: "#333"
    },
    d: "M1.67.83C1.67.37 1.29 0 .83 0 .37 0 0 .37 0 .83c0 .46.37.84.83.84.46 0 .84-.38.84-.84Z",
    transform: "translate(12 2.333)"
  }), /*#__PURE__*/react_.createElement("path", {
    fillRule: "evenodd",
    style: {
      fill: "#333"
    },
    d: "M1.67.83C1.67.37 1.29 0 .83 0 .37 0 0 .37 0 .83c0 .46.37.84.83.84.46 0 .84-.38.84-.84Z",
    transform: "translate(14 7.167)"
  }), /*#__PURE__*/react_.createElement("path", {
    fillRule: "evenodd",
    style: {
      fill: "#333"
    },
    d: "M1.67.83C1.67.37 1.29 0 .83 0 .37 0 0 .37 0 .83c0 .46.37.84.83.84.46 0 .84-.38.84-.84Z",
    transform: "translate(12 12)"
  }), /*#__PURE__*/react_.createElement("path", {
    fillRule: "evenodd",
    style: {
      fill: "#333"
    },
    d: "M1.67.83C1.67.37 1.29 0 .83 0 .37 0 0 .37 0 .83c0 .46.37.84.83.84.46 0 .84-.38.84-.84Z",
    transform: "translate(7.167 14)"
  }), /*#__PURE__*/react_.createElement("path", {
    fillRule: "evenodd",
    style: {
      fill: "#333"
    },
    d: "M1.67.83C1.67.37 1.29 0 .83 0 .37 0 0 .37 0 .83c0 .46.37.84.83.84.46 0 .84-.38.84-.84Z",
    transform: "translate(2.333 12)"
  }), /*#__PURE__*/react_.createElement("path", {
    fillRule: "evenodd",
    style: {
      fill: "#333"
    },
    d: "M1.67.83C1.67.37 1.29 0 .83 0 .37 0 0 .37 0 .83c0 .46.37.84.83.84.46 0 .84-.38.84-.84Z",
    transform: "translate(.333 7.167)"
  }), /*#__PURE__*/react_.createElement("path", {
    fillRule: "evenodd",
    style: {
      fill: "#333"
    },
    d: "M1.67.83C1.67.37 1.29 0 .83 0 .37 0 0 .37 0 .83c0 .46.37.84.83.84.46 0 .84-.38.84-.84Z",
    transform: "translate(2.333 2.333)"
  }))));
};
/* harmony default export */ const light = (SvgLight);
;// CONCATENATED MODULE: ./app/icons/dark.svg
var dark_defs, dark_mask;
function dark_extends() { dark_extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return dark_extends.apply(this, arguments); }

var SvgDark = function SvgDark(props) {
  return /*#__PURE__*/react_.createElement("svg", dark_extends({
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    width: 16,
    height: 16,
    fill: "none"
  }, props), dark_defs || (dark_defs = /*#__PURE__*/react_.createElement("defs", null, /*#__PURE__*/react_.createElement("path", {
    id: "dark_svg__a",
    d: "M0 0h16v16H0z"
  }))), /*#__PURE__*/react_.createElement("g", null, dark_mask || (dark_mask = /*#__PURE__*/react_.createElement("mask", {
    id: "dark_svg__b",
    fill: "#fff"
  }, /*#__PURE__*/react_.createElement("use", {
    xlinkHref: "#dark_svg__a"
  }))), /*#__PURE__*/react_.createElement("g", {
    mask: "url(#dark_svg__b)"
  }, /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M6.67 0C2.98 0 0 2.98 0 6.67a6.66 6.66 0 0 0 6.67 6.66c3.68 0 6.66-2.98 6.66-6.66 0-.47-.04-.92-.13-1.35a4.251 4.251 0 0 1-4.11 3.16c-2.34 0-4.24-1.89-4.24-4.24 0-1.97 1.34-3.63 3.17-4.1C7.58.05 7.13 0 6.67 0Z",
    transform: "translate(1.333 1.333)"
  }))));
};
/* harmony default export */ const dark = (SvgDark);
;// CONCATENATED MODULE: ./app/icons/auto.svg
var auto_defs, auto_mask;
function auto_extends() { auto_extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return auto_extends.apply(this, arguments); }

var SvgAuto = function SvgAuto(props) {
  return /*#__PURE__*/react_.createElement("svg", auto_extends({
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    width: 16,
    height: 16,
    fill: "none"
  }, props), auto_defs || (auto_defs = /*#__PURE__*/react_.createElement("defs", null, /*#__PURE__*/react_.createElement("path", {
    id: "auto_svg__a",
    d: "M0 0h16v16H0z"
  }))), /*#__PURE__*/react_.createElement("g", null, auto_mask || (auto_mask = /*#__PURE__*/react_.createElement("mask", {
    id: "auto_svg__b",
    fill: "#fff"
  }, /*#__PURE__*/react_.createElement("use", {
    xlinkHref: "#auto_svg__a"
  }))), /*#__PURE__*/react_.createElement("g", {
    mask: "url(#auto_svg__b)"
  }, /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "m0 5.337.73-1.67m3.938 1.67-.73-1.67M.728 3.67 2.33 0l1.61 3.67M.73 3.667h3.21",
    transform: "translate(5.667 5.333)"
  }), /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M13.07 5.33A6.672 6.672 0 0 0 0 5.33l2-.66",
    transform: "translate(1.333 1.333)"
  }), /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M0 0a6.672 6.672 0 0 0 13.07 0l-1.74.67",
    transform: "translate(1.333 9.333)"
  }))));
};
/* harmony default export */ const auto = (SvgAuto);
;// CONCATENATED MODULE: ./app/icons/bottom.svg
var bottom_defs, bottom_mask;
function bottom_extends() { bottom_extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return bottom_extends.apply(this, arguments); }

var SvgBottom = function SvgBottom(props) {
  return /*#__PURE__*/react_.createElement("svg", bottom_extends({
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    width: 16,
    height: 16,
    fill: "none"
  }, props), bottom_defs || (bottom_defs = /*#__PURE__*/react_.createElement("defs", null, /*#__PURE__*/react_.createElement("path", {
    id: "bottom_svg__a",
    d: "M0 0h16v16H0z"
  }))), /*#__PURE__*/react_.createElement("g", null, bottom_mask || (bottom_mask = /*#__PURE__*/react_.createElement("mask", {
    id: "bottom_svg__b",
    fill: "#fff"
  }, /*#__PURE__*/react_.createElement("use", {
    xlinkHref: "#bottom_svg__a"
  }))), /*#__PURE__*/react_.createElement("g", {
    mask: "url(#bottom_svg__b)"
  }, /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M8 0 4 4 0 0",
    transform: "translate(4 4)"
  }), /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M8 0 4 4 0 0",
    transform: "translate(4 8)"
  }))));
};
/* harmony default export */ const bottom = (SvgBottom);
;// CONCATENATED MODULE: ./app/icons/pause.svg
var pause_defs, pause_mask;
function pause_extends() { pause_extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return pause_extends.apply(this, arguments); }

var SvgPause = function SvgPause(props) {
  return /*#__PURE__*/react_.createElement("svg", pause_extends({
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    width: 16,
    height: 16,
    fill: "none"
  }, props), pause_defs || (pause_defs = /*#__PURE__*/react_.createElement("defs", null, /*#__PURE__*/react_.createElement("path", {
    id: "pause_svg__a",
    d: "M0 0h16v16H0z"
  }))), /*#__PURE__*/react_.createElement("g", null, pause_mask || (pause_mask = /*#__PURE__*/react_.createElement("mask", {
    id: "pause_svg__b",
    fill: "#fff"
  }, /*#__PURE__*/react_.createElement("use", {
    xlinkHref: "#pause_svg__a"
  }))), /*#__PURE__*/react_.createElement("g", {
    mask: "url(#pause_svg__b)"
  }, /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M13.33 6.67A6.66 6.66 0 0 0 6.67 0C2.98 0 0 2.98 0 6.67a6.66 6.66 0 0 0 6.67 6.66c3.68 0 6.66-2.98 6.66-6.66Z",
    transform: "translate(1.333 1.333)"
  }), /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M0 0v4",
    transform: "translate(6.333 6)"
  }), /*#__PURE__*/react_.createElement("path", {
    style: {
      stroke: "#333",
      strokeWidth: 1.3333333333333333,
      strokeOpacity: 1,
      strokeDasharray: "0 0"
    },
    d: "M0 0v4",
    transform: "translate(9.667 6)"
  }))));
};
/* harmony default export */ const pause = (SvgPause);
;// CONCATENATED MODULE: ./app/icons/robot.svg
var robot_mask, robot_defs;
function robot_extends() { robot_extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return robot_extends.apply(this, arguments); }

var SvgRobot = function SvgRobot(props) {
  return /*#__PURE__*/react_.createElement("svg", robot_extends({
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    width: 16,
    height: 16,
    fill: "none"
  }, props), /*#__PURE__*/react_.createElement("g", null, robot_mask || (robot_mask = /*#__PURE__*/react_.createElement("mask", {
    id: "robot_svg__b",
    fill: "#fff"
  }, /*#__PURE__*/react_.createElement("use", {
    xlinkHref: "#robot_svg__a"
  }))), /*#__PURE__*/react_.createElement("g", {
    mask: "url(#robot_svg__b)"
  }, /*#__PURE__*/react_.createElement("path", {
    style: {
      fill: "#333",
      opacity: 1
    },
    d: "M3.67 13.67h8.66c.002 0 .003-.001.003-.003V6.334H3.67c-.002 0-.003 0-.003.003v7.33c0 .002 0 .003.003.003zm0 1.333c-.37 0-.684-.13-.945-.391a1.288 1.288 0 0 1-.392-.945v-7.33c0-.37.13-.685.392-.946.26-.26.576-.391.945-.391h8.66c.37 0 .684.13.945.391.261.261.392.577.392.946v7.33c0 .369-.13.684-.392.945a1.288 1.288 0 0 1-.945.391z"
  }), /*#__PURE__*/react_.createElement("path", {
    style: {
      fill: "#333",
      opacity: 1
    },
    d: "M9.819 6.127a.666.666 0 0 1-1.05-.81l1.67-2.67a.665.665 0 0 1 1.107-.034.663.663 0 0 1 .023.74l-1.67 2.67a.665.665 0 0 1-.08.104zM7.293 5.434a.665.665 0 0 1-1.01.779.665.665 0 0 1-.178-.19l-1.67-2.67a.665.665 0 0 1 .952-.896.665.665 0 0 1 .178.19l1.67 2.67a.665.665 0 0 1 .058.117z"
  }), /*#__PURE__*/react_.createElement("path", {
    style: {
      fill: "#333",
      opacity: 1
    },
    d: "M11.337 2.333c-.003 0-.004.001-.004.004l-.001-.01a.007.007 0 0 0 .005.003h-.007v.007c0-.002 0-.004-.002-.005l.009.001zm0-1.333c.366 0 .679.131.939.394.258.261.387.575.387.943 0 .364-.13.676-.39.936s-.572.39-.936.39c-.368 0-.682-.129-.943-.388A1.273 1.273 0 0 1 10 2.337c0-.37.13-.685.391-.946.262-.26.577-.391.946-.391zM4.67 2.333c-.002 0-.003.001-.003.004 0-.005 0-.008-.002-.01a.007.007 0 0 0 .005.003h-.006v.007c0-.002-.001-.004-.003-.005l.009.001zM4.67 1c.366 0 .679.131.939.394.258.261.388.575.388.943 0 .364-.13.676-.39.936s-.573.39-.937.39c-.367 0-.681-.129-.943-.388a1.273 1.273 0 0 1-.394-.938c0-.37.13-.685.392-.946.26-.26.576-.391.945-.391zM6.663 10.003h2.67c.184 0 .34-.065.469-.194a.655.655 0 0 0 .195-.479.638.638 0 0 0-.196-.467.638.638 0 0 0-.468-.196h-2.67a.638.638 0 0 0-.467.196A.638.638 0 0 0 6 9.33c0 .188.065.347.195.479.128.13.284.194.468.194zm0 1.334a1.974 1.974 0 0 1-1.416-.59 2.001 2.001 0 0 1 1.416-3.413h2.67a1.99 1.99 0 0 1 1.41.587 1.99 1.99 0 0 1 .587 1.409 2.002 2.002 0 0 1-1.997 2.007zM2 10.663h1.003a.666.666 0 1 1 0 1.334h-1.67a.666.666 0 0 1-.666-.667V8a.665.665 0 0 1 .666-.667h1.67a.665.665 0 0 1 .555 1.037.665.665 0 0 1-.555.297H2zM14.8 7.346a.664.664 0 0 1 .537.654v3.33a.666.666 0 0 1-.667.667H13a.666.666 0 1 1 0-1.334h1.003V8.667H13a.665.665 0 0 1-.471-1.138.664.664 0 0 1 .471-.196h1.67c.044 0 .087.005.13.013z"
  }))), robot_defs || (robot_defs = /*#__PURE__*/react_.createElement("defs", null, /*#__PURE__*/react_.createElement("path", {
    id: "robot_svg__a",
    d: "M0 0h16v16H0z"
  }))));
};
/* harmony default export */ const robot = (SvgRobot);
// EXTERNAL MODULE: ./app/icons/cloud-success.svg
var cloud_success = __webpack_require__(27994);
// EXTERNAL MODULE: ./app/store/index.ts + 3 modules
var store = __webpack_require__(36278);
// EXTERNAL MODULE: ./app/store/bedrock-models.ts
var bedrock_models = __webpack_require__(34342);
// EXTERNAL MODULE: ./app/utils/bedrock-models.ts
var utils_bedrock_models = __webpack_require__(20880);
// EXTERNAL MODULE: ./node_modules/next/dist/shared/lib/app-dynamic.js
var app_dynamic = __webpack_require__(99121);
var app_dynamic_default = /*#__PURE__*/__webpack_require__.n(app_dynamic);
// EXTERNAL MODULE: ./app/client/controller.ts
var controller = __webpack_require__(82564);
// EXTERNAL MODULE: ./app/store/prompt.ts
var store_prompt = __webpack_require__(16975);
// EXTERNAL MODULE: ./app/locales/index.ts + 19 modules
var locales = __webpack_require__(57254);
// EXTERNAL MODULE: ./app/components/button.tsx
var components_button = __webpack_require__(39378);
// EXTERNAL MODULE: ./app/components/chat.module.scss
var chat_module = __webpack_require__(48563);
var chat_module_default = /*#__PURE__*/__webpack_require__.n(chat_module);
// EXTERNAL MODULE: ./app/components/ui-lib.tsx + 3 modules
var ui_lib = __webpack_require__(24552);
// EXTERNAL MODULE: ./node_modules/react-router-dom/dist/umd/react-router-dom.production.min.js
var react_router_dom_production_min = __webpack_require__(99742);
// EXTERNAL MODULE: ./app/constant.ts
var constant = __webpack_require__(43684);
// EXTERNAL MODULE: ./app/components/emoji.tsx + 1 modules
var emoji = __webpack_require__(85563);
// EXTERNAL MODULE: ./app/components/mask.tsx
var mask = __webpack_require__(94417);
// EXTERNAL MODULE: ./app/store/mask.ts
var store_mask = __webpack_require__(73706);
// EXTERNAL MODULE: ./app/command.ts
var command = __webpack_require__(88286);
// EXTERNAL MODULE: ./app/utils/format.ts
var format = __webpack_require__(4643);
// EXTERNAL MODULE: ./app/components/exporter.module.scss
var exporter_module = __webpack_require__(35878);
var exporter_module_default = /*#__PURE__*/__webpack_require__.n(exporter_module);
;// CONCATENATED MODULE: ./app/icons/bedrock_16.png
/* harmony default export */ const bedrock_16 = ({"src":".//_next/static/media/bedrock_16.2d95477f.png","height":24,"width":24,"blurDataURL":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAAGFBMVEUApYoDqI5TxLIyuKJpzLwgsZl30MKK18o7CqA/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nB2LyQkAQQzD5COZ/jtesuCHBDISgISwJ6fz3Hfg7TqAk7WBabrh4irzH7l9EvAAharQ9xEAAAAASUVORK5CYII=","blurWidth":8,"blurHeight":8});
// EXTERNAL MODULE: ./app/icons/download.svg
var download = __webpack_require__(24624);
// EXTERNAL MODULE: ./app/components/message-selector.module.scss
var message_selector_module = __webpack_require__(85345);
var message_selector_module_default = /*#__PURE__*/__webpack_require__.n(message_selector_module);
;// CONCATENATED MODULE: ./app/components/message-selector.tsx









function useShiftRange() {
    const [startIndex, setStartIndex] = (0,react_.useState)();
    const [endIndex, setEndIndex] = (0,react_.useState)();
    const [shiftDown, setShiftDown] = (0,react_.useState)(false);
    const onClickIndex = (index)=>{
        if (shiftDown && startIndex !== undefined) {
            setEndIndex(index);
        } else {
            setStartIndex(index);
            setEndIndex(undefined);
        }
    };
    (0,react_.useEffect)(()=>{
        const onKeyDown = (e)=>{
            if (e.key !== "Shift") return;
            setShiftDown(true);
        };
        const onKeyUp = (e)=>{
            if (e.key !== "Shift") return;
            setShiftDown(false);
            setStartIndex(undefined);
            setEndIndex(undefined);
        };
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("keydown", onKeyDown);
        return ()=>{
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, []);
    return {
        onClickIndex,
        startIndex,
        endIndex
    };
}
function useMessageSelector() {
    const [selection, setSelection] = (0,react_.useState)(new Set());
    const updateSelection = (updater)=>{
        const newSelection = new Set(selection);
        updater(newSelection);
        setSelection(newSelection);
    };
    return {
        selection,
        updateSelection
    };
}
function MessageSelector(props) {
    const chatStore = (0,store/* useChatStore */.aK)();
    const session = chatStore.currentSession();
    const isValid = (m)=>m.content && !m.isError && !m.streaming;
    const allMessages = (0,react_.useMemo)(()=>{
        let startIndex = Math.max(0, session.clearContextIndex ?? 0);
        if (startIndex === session.messages.length - 1) {
            startIndex = 0;
        }
        return session.messages.slice(startIndex);
    }, [
        session.messages,
        session.clearContextIndex
    ]);
    const messages = (0,react_.useMemo)(()=>allMessages.filter((m, i)=>m.id && // message must have id
            isValid(m) && (i >= allMessages.length - 1 || isValid(allMessages[i + 1]))), [
        allMessages
    ]);
    const messageCount = messages.length;
    const config = (0,store/* useAppConfig */.MG)();
    const [searchInput, setSearchInput] = (0,react_.useState)("");
    const [searchIds, setSearchIds] = (0,react_.useState)(new Set());
    const isInSearchResult = (id)=>{
        return searchInput.length === 0 || searchIds.has(id);
    };
    const doSearch = (text)=>{
        const searchResults = new Set();
        if (text.length > 0) {
            messages.forEach((m)=>(0,utils/* getMessageTextContent */.YK)(m).includes(text) ? searchResults.add(m.id) : null);
        }
        setSearchIds(searchResults);
    };
    // for range selection
    const { startIndex, endIndex, onClickIndex } = useShiftRange();
    const selectAll = ()=>{
        props.updateSelection((selection)=>messages.forEach((m)=>selection.add(m.id)));
    };
    (0,react_.useEffect)(()=>{
        if (props.defaultSelectAll) {
            selectAll();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    (0,react_.useEffect)(()=>{
        if (startIndex === undefined || endIndex === undefined) {
            return;
        }
        const [start, end] = [
            startIndex,
            endIndex
        ].sort((a, b)=>a - b);
        props.updateSelection((selection)=>{
            for(let i = start; i <= end; i += 1){
                selection.add(messages[i].id ?? i);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        startIndex,
        endIndex
    ]);
    const LATEST_COUNT = 4;
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: (message_selector_module_default())["message-selector"],
        children: [
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: (message_selector_module_default())["message-filter"],
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx("input", {
                        type: "text",
                        placeholder: locales/* default */.ZP.Select.Search,
                        className: (message_selector_module_default())["filter-item"] + " " + (message_selector_module_default())["search-bar"],
                        value: searchInput,
                        onInput: (e)=>{
                            setSearchInput(e.currentTarget.value);
                            doSearch(e.currentTarget.value);
                        }
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: (message_selector_module_default()).actions,
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx(components_button/* IconButton */.h, {
                                text: locales/* default */.ZP.Select.All,
                                bordered: true,
                                className: (message_selector_module_default())["filter-item"],
                                onClick: selectAll
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx(components_button/* IconButton */.h, {
                                text: locales/* default */.ZP.Select.Latest,
                                bordered: true,
                                className: (message_selector_module_default())["filter-item"],
                                onClick: ()=>props.updateSelection((selection)=>{
                                        selection.clear();
                                        messages.slice(messageCount - LATEST_COUNT).forEach((m)=>selection.add(m.id));
                                    })
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx(components_button/* IconButton */.h, {
                                text: locales/* default */.ZP.Select.Clear,
                                bordered: true,
                                className: (message_selector_module_default())["filter-item"],
                                onClick: ()=>props.updateSelection((selection)=>selection.clear())
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: (message_selector_module_default()).messages,
                children: messages.map((m, i)=>{
                    if (!isInSearchResult(m.id)) return null;
                    const id = m.id ?? i;
                    const isSelected = props.selection.has(id);
                    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: `${(message_selector_module_default()).message} ${props.selection.has(m.id) && (message_selector_module_default())["message-selected"]}`,
                        onClick: ()=>{
                            props.updateSelection((selection)=>{
                                selection.has(id) ? selection.delete(id) : selection.add(id);
                            });
                            onClickIndex(i);
                        },
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: (message_selector_module_default()).avatar,
                                children: m.role === "user" ? /*#__PURE__*/ jsx_runtime_.jsx(emoji/* Avatar */.qE, {
                                    avatar: config.avatar
                                }) : /*#__PURE__*/ jsx_runtime_.jsx(mask.MaskAvatar, {
                                    avatar: session.mask.avatar,
                                    model: m.model || session.mask.modelConfig.model
                                })
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                className: (message_selector_module_default()).body,
                                children: [
                                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                        className: (message_selector_module_default()).date,
                                        children: new Date(m.date).toLocaleString()
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                        className: `${(message_selector_module_default()).content} one-line`,
                                        children: (0,utils/* getMessageTextContent */.YK)(m)
                                    })
                                ]
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: (message_selector_module_default()).checkbox,
                                children: /*#__PURE__*/ jsx_runtime_.jsx("input", {
                                    type: "checkbox",
                                    checked: isSelected
                                })
                            })
                        ]
                    }, i);
                })
            })
        ]
    });
}

// EXTERNAL MODULE: ./node_modules/next/image.js
var next_image = __webpack_require__(48421);
var image_default = /*#__PURE__*/__webpack_require__.n(next_image);
// EXTERNAL MODULE: ./node_modules/html-to-image/lib/index.js
var lib = __webpack_require__(61311);
// EXTERNAL MODULE: ./app/config/client.ts + 2 modules
var client = __webpack_require__(39463);
// EXTERNAL MODULE: ./app/client/api.ts + 3 modules
var client_api = __webpack_require__(40163);
;// CONCATENATED MODULE: ./app/components/exporter.tsx
/* eslint-disable @next/next/no-img-element */ 






















const Markdown = app_dynamic_default()(async ()=>(await Promise.all(/* import() */[__webpack_require__.e(6329), __webpack_require__.e(8914)]).then(__webpack_require__.bind(__webpack_require__, 68914))).Markdown, {
    loadableGenerated: {
        modules: [
            "/Users/mingxuan/Desktop/workspace/SampleStrands/app/components/exporter.tsx -> " + "./markdown"
        ]
    },
    loading: ()=>/*#__PURE__*/ jsx_runtime_.jsx(three_dots/* default */.Z, {})
});
function ExportMessageModal(props) {
    return /*#__PURE__*/ jsx_runtime_.jsx("div", {
        className: "modal-mask",
        children: /*#__PURE__*/ jsx_runtime_.jsx(ui_lib/* Modal */.u_, {
            title: locales/* default */.ZP.Export.Title,
            onClose: props.onClose,
            footer: /*#__PURE__*/ jsx_runtime_.jsx("div", {
                style: {
                    width: "100%",
                    textAlign: "center",
                    fontSize: 14,
                    opacity: 0.5
                },
                children: locales/* default */.ZP.Exporter.Description.Title
            }),
            children: /*#__PURE__*/ jsx_runtime_.jsx("div", {
                style: {
                    minHeight: "40vh"
                },
                children: /*#__PURE__*/ jsx_runtime_.jsx(MessageExporter, {})
            })
        })
    });
}
function useSteps(steps) {
    const stepCount = steps.length;
    const [currentStepIndex, setCurrentStepIndex] = (0,react_.useState)(0);
    const nextStep = ()=>setCurrentStepIndex((currentStepIndex + 1) % stepCount);
    const prevStep = ()=>setCurrentStepIndex((currentStepIndex - 1 + stepCount) % stepCount);
    return {
        currentStepIndex,
        setCurrentStepIndex,
        nextStep,
        prevStep,
        currentStep: steps[currentStepIndex]
    };
}
function Steps(props) {
    const steps = props.steps;
    const stepCount = steps.length;
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: (exporter_module_default()).steps,
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: (exporter_module_default())["steps-progress"],
                children: /*#__PURE__*/ jsx_runtime_.jsx("div", {
                    className: (exporter_module_default())["steps-progress-inner"],
                    style: {
                        width: `${(props.index + 1) / stepCount * 100}%`
                    }
                })
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: (exporter_module_default())["steps-inner"],
                children: steps.map((step, i)=>{
                    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: `${(exporter_module_default()).step} ${(exporter_module_default())[i <= props.index ? "step-finished" : ""]} ${i === props.index && (exporter_module_default())["step-current"]} clickable`,
                        onClick: ()=>{
                            props.onStepChange?.(i);
                        },
                        role: "button",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                className: (exporter_module_default())["step-index"],
                                children: i + 1
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                className: (exporter_module_default())["step-name"],
                                children: step.name
                            })
                        ]
                    }, i);
                })
            })
        ]
    });
}
function MessageExporter() {
    const steps = [
        {
            name: locales/* default */.ZP.Export.Steps.Select,
            value: "select"
        },
        {
            name: locales/* default */.ZP.Export.Steps.Preview,
            value: "preview"
        }
    ];
    const { currentStep, setCurrentStepIndex, currentStepIndex } = useSteps(steps);
    const formats = [
        "text",
        "image",
        "json"
    ];
    const [exportConfig, setExportConfig] = (0,react_.useState)({
        format: "image",
        includeContext: true
    });
    function updateExportConfig(updater) {
        const config = {
            ...exportConfig
        };
        updater(config);
        setExportConfig(config);
    }
    const chatStore = (0,store/* useChatStore */.aK)();
    const session = chatStore.currentSession();
    const { selection, updateSelection } = useMessageSelector();
    const selectedMessages = (0,react_.useMemo)(()=>{
        const ret = [];
        if (exportConfig.includeContext) {
            ret.push(...session.mask.context);
        }
        ret.push(...session.messages.filter((m)=>selection.has(m.id)));
        return ret;
    }, [
        exportConfig.includeContext,
        session.messages,
        session.mask.context,
        selection
    ]);
    function preview() {
        if (exportConfig.format === "text") {
            return /*#__PURE__*/ jsx_runtime_.jsx(MarkdownPreviewer, {
                messages: selectedMessages,
                topic: session.topic
            });
        } else if (exportConfig.format === "json") {
            return /*#__PURE__*/ jsx_runtime_.jsx(JsonPreviewer, {
                messages: selectedMessages,
                topic: session.topic
            });
        } else {
            return /*#__PURE__*/ jsx_runtime_.jsx(ImagePreviewer, {
                messages: selectedMessages,
                topic: session.topic
            });
        }
    }
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx(Steps, {
                steps: steps,
                index: currentStepIndex,
                onStepChange: setCurrentStepIndex
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: (exporter_module_default())["message-exporter-body"],
                style: currentStep.value !== "select" ? {
                    display: "none"
                } : {},
                children: [
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)(ui_lib/* List */.aV, {
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx(ui_lib/* ListItem */.HC, {
                                title: locales/* default */.ZP.Export.Format.Title,
                                subTitle: locales/* default */.ZP.Export.Format.SubTitle,
                                children: /*#__PURE__*/ jsx_runtime_.jsx(ui_lib/* Select */.Ph, {
                                    value: exportConfig.format,
                                    onChange: (e)=>updateExportConfig((config)=>config.format = e.currentTarget.value),
                                    children: formats.map((f)=>/*#__PURE__*/ jsx_runtime_.jsx("option", {
                                            value: f,
                                            children: f
                                        }, f))
                                })
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx(ui_lib/* ListItem */.HC, {
                                title: locales/* default */.ZP.Export.IncludeContext.Title,
                                subTitle: locales/* default */.ZP.Export.IncludeContext.SubTitle,
                                children: /*#__PURE__*/ jsx_runtime_.jsx("input", {
                                    type: "checkbox",
                                    checked: exportConfig.includeContext,
                                    onChange: (e)=>{
                                        updateExportConfig((config)=>config.includeContext = e.currentTarget.checked);
                                    }
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx(MessageSelector, {
                        selection: selection,
                        updateSelection: updateSelection,
                        defaultSelectAll: true
                    })
                ]
            }),
            currentStep.value === "preview" && /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: (exporter_module_default())["message-exporter-body"],
                children: preview()
            })
        ]
    });
}
function RenderExport(props) {
    const domRef = (0,react_.useRef)(null);
    (0,react_.useEffect)(()=>{
        if (!domRef.current) return;
        const dom = domRef.current;
        const messages = Array.from(dom.getElementsByClassName(constant/* EXPORT_MESSAGE_CLASS_NAME */.yY));
        if (messages.length !== props.messages.length) {
            return;
        }
        const renderMsgs = messages.map((v, i)=>{
            const [role, _] = v.id.split(":");
            return {
                id: i.toString(),
                role: role,
                content: role === "user" ? v.textContent ?? "" : v.innerHTML,
                date: ""
            };
        });
        props.onRender(renderMsgs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return /*#__PURE__*/ jsx_runtime_.jsx("div", {
        ref: domRef,
        children: props.messages.map((m, i)=>/*#__PURE__*/ jsx_runtime_.jsx("div", {
                id: `${m.role}:${i}`,
                className: constant/* EXPORT_MESSAGE_CLASS_NAME */.yY,
                children: /*#__PURE__*/ jsx_runtime_.jsx(Markdown, {
                    content: (0,utils/* getMessageTextContent */.YK)(m),
                    defaultShow: true
                })
            }, i))
    });
}
function PreviewActions(props) {
    const [loading, setLoading] = (0,react_.useState)(false);
    const [shouldExport, setShouldExport] = (0,react_.useState)(false);
    const config = (0,store/* useAppConfig */.MG)();
    const onRenderMsgs = (msgs)=>{
        setShouldExport(false);
        var api;
        if (config.modelConfig.model.startsWith("gemini")) {
            api = new client_api/* ClientApi */.ti(constant/* ModelProvider */.k8.GeminiPro);
        } else {
            api = new client_api/* ClientApi */.ti(constant/* ModelProvider */.k8.GPT);
        }
        api.share(msgs).then((res)=>{
            if (!res) return;
            (0,ui_lib/* showModal */.K4)({
                title: locales/* default */.ZP.Export.Share,
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx("input", {
                        type: "text",
                        value: res,
                        style: {
                            width: "100%",
                            maxWidth: "unset"
                        },
                        readOnly: true,
                        onClick: (e)=>e.currentTarget.select()
                    }, "input")
                ],
                actions: [
                    /*#__PURE__*/ jsx_runtime_.jsx(components_button/* IconButton */.h, {
                        icon: /*#__PURE__*/ jsx_runtime_.jsx(copy/* default */.Z, {}),
                        text: locales/* default */.ZP.Chat.Actions.Copy,
                        onClick: ()=>(0,utils/* copyToClipboard */.vQ)(res)
                    }, "copy")
                ]
            });
            setTimeout(()=>{
                window.open(res, "_blank");
            }, 800);
        }).catch((e)=>{
            console.error("[Share]", e);
            (0,ui_lib/* showToast */.CF)((0,format/* prettyObject */.B)(e));
        }).finally(()=>setLoading(false));
    };
    const share = async ()=>{
        if (props.messages?.length) {
            setLoading(true);
            setShouldExport(true);
        }
    };
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
        children: [
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: (exporter_module_default())["preview-actions"],
                children: [
                    props.showCopy && /*#__PURE__*/ jsx_runtime_.jsx(components_button/* IconButton */.h, {
                        text: locales/* default */.ZP.Export.Copy,
                        bordered: true,
                        shadow: true,
                        icon: /*#__PURE__*/ jsx_runtime_.jsx(copy/* default */.Z, {}),
                        onClick: props.copy
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx(components_button/* IconButton */.h, {
                        text: locales/* default */.ZP.Export.Download,
                        bordered: true,
                        shadow: true,
                        icon: /*#__PURE__*/ jsx_runtime_.jsx(download/* default */.Z, {}),
                        onClick: props.download
                    })
                ]
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                style: {
                    position: "fixed",
                    right: "200vw",
                    pointerEvents: "none"
                },
                children: shouldExport && /*#__PURE__*/ jsx_runtime_.jsx(RenderExport, {
                    messages: props.messages ?? [],
                    onRender: onRenderMsgs
                })
            })
        ]
    });
}
function ExportAvatar(props) {
    if (props.avatar === store_mask/* DEFAULT_MASK_AVATAR */._G) {
        return /*#__PURE__*/ jsx_runtime_.jsx("img", {
            src: bedrock_16.src,
            width: 30,
            height: 30,
            alt: "bot",
            className: "user-avatar"
        });
    }
    return /*#__PURE__*/ jsx_runtime_.jsx(emoji/* Avatar */.qE, {
        avatar: props.avatar
    });
}
function ImagePreviewer(props) {
    const chatStore = (0,store/* useChatStore */.aK)();
    const session = chatStore.currentSession();
    const mask = session.mask;
    const config = (0,store/* useAppConfig */.MG)();
    const previewRef = (0,react_.useRef)(null);
    const copy = ()=>{
        (0,ui_lib/* showToast */.CF)(locales/* default */.ZP.Export.Image.Toast);
        const dom = previewRef.current;
        if (!dom) return;
        (0,lib.toBlob)(dom).then((blob)=>{
            if (!blob) return;
            try {
                navigator.clipboard.write([
                    new ClipboardItem({
                        "image/png": blob
                    })
                ]).then(()=>{
                    (0,ui_lib/* showToast */.CF)(locales/* default */.ZP.Copy.Success);
                    refreshPreview();
                });
            } catch (e) {
                console.error("[Copy Image] ", e);
                (0,ui_lib/* showToast */.CF)(locales/* default */.ZP.Copy.Failed);
            }
        });
    };
    const isMobile = (0,utils/* useMobileScreen */.S0)();
    const download = async ()=>{
        (0,ui_lib/* showToast */.CF)(locales/* default */.ZP.Export.Image.Toast);
        const dom = previewRef.current;
        if (!dom) return;
        const isApp = (0,client/* getClientConfig */.Z)()?.isApp;
        try {
            const blob = await (0,lib.toPng)(dom);
            if (!blob) return;
            if (isMobile || isApp && window.__TAURI__) {
                if (isApp && window.__TAURI__) {
                    const result = await window.__TAURI__.dialog.save({
                        defaultPath: `${props.topic}.png`,
                        filters: [
                            {
                                name: "PNG Files",
                                extensions: [
                                    "png"
                                ]
                            },
                            {
                                name: "All Files",
                                extensions: [
                                    "*"
                                ]
                            }
                        ]
                    });
                    if (result !== null) {
                        const response = await fetch(blob);
                        const buffer = await response.arrayBuffer();
                        const uint8Array = new Uint8Array(buffer);
                        await window.__TAURI__.fs.writeBinaryFile(result, uint8Array);
                        (0,ui_lib/* showToast */.CF)(locales/* default */.ZP.Download.Success);
                    } else {
                        (0,ui_lib/* showToast */.CF)(locales/* default */.ZP.Download.Failed);
                    }
                } else {
                    (0,ui_lib/* showImageModal */.vi)(blob);
                }
            } else {
                const link = document.createElement("a");
                link.download = `${props.topic}.png`;
                link.href = blob;
                link.click();
                refreshPreview();
            }
        } catch (error) {
            (0,ui_lib/* showToast */.CF)(locales/* default */.ZP.Download.Failed);
        }
    };
    const refreshPreview = ()=>{
        const dom = previewRef.current;
        if (dom) {
            dom.innerHTML = dom.innerHTML; // Refresh the content of the preview by resetting its HTML for fix a bug glitching
        }
    };
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: (exporter_module_default())["image-previewer"],
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx(PreviewActions, {
                copy: copy,
                download: download,
                showCopy: !isMobile,
                messages: props.messages
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: `${(exporter_module_default())["preview-body"]} ${(exporter_module_default())["default-theme"]}`,
                ref: previewRef,
                children: [
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: (exporter_module_default())["chat-info"],
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: (exporter_module_default()).logo + " no-dark",
                                children: /*#__PURE__*/ jsx_runtime_.jsx((image_default()), {
                                    src: "/assets/bedrock.png",
                                    alt: "Bedrock",
                                    width: 50,
                                    height: 50
                                })
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                        className: (exporter_module_default())["main-title"],
                                        children: "Sample Client for Amazon Bedrock"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                        className: (exporter_module_default())["sub-title"],
                                        children: "aws-samples/sample-client-for-amazon-bedrock"
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                        className: (exporter_module_default()).icons,
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx(ExportAvatar, {
                                                avatar: config.avatar
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                                className: (exporter_module_default())["icon-space"],
                                                children: "&"
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx(ExportAvatar, {
                                                avatar: mask.avatar
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                        className: (exporter_module_default())["chat-info-item"],
                                        children: [
                                            locales/* default */.ZP.Exporter.Model,
                                            ": ",
                                            mask.modelConfig.model
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                        className: (exporter_module_default())["chat-info-item"],
                                        children: [
                                            locales/* default */.ZP.Exporter.Messages,
                                            ": ",
                                            props.messages.length
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                        className: (exporter_module_default())["chat-info-item"],
                                        children: [
                                            locales/* default */.ZP.Exporter.Topic,
                                            ": ",
                                            session.topic
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                        className: (exporter_module_default())["chat-info-item"],
                                        children: [
                                            locales/* default */.ZP.Exporter.Time,
                                            ":",
                                            " ",
                                            new Date(props.messages.at(-1)?.date ?? Date.now()).toLocaleString()
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    props.messages.map((m, i)=>{
                        return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                            className: (exporter_module_default()).message + " " + (exporter_module_default())["message-" + m.role],
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                    className: (exporter_module_default()).avatar,
                                    children: /*#__PURE__*/ jsx_runtime_.jsx(ExportAvatar, {
                                        avatar: m.role === "user" ? config.avatar : mask.avatar
                                    })
                                }),
                                /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                    className: (exporter_module_default()).body,
                                    children: [
                                        /*#__PURE__*/ jsx_runtime_.jsx(Markdown, {
                                            content: (0,utils/* getMessageTextContent */.YK)(m),
                                            fontSize: config.fontSize,
                                            defaultShow: true
                                        }),
                                        (0,utils/* getMessageImages */.Bs)(m).length == 1 && /*#__PURE__*/ jsx_runtime_.jsx("img", {
                                            src: (0,utils/* getMessageImages */.Bs)(m)[0],
                                            alt: "message",
                                            className: (exporter_module_default())["message-image"]
                                        }, i),
                                        (0,utils/* getMessageImages */.Bs)(m).length > 1 && /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                            className: (exporter_module_default())["message-images"],
                                            style: {
                                                "--image-count": (0,utils/* getMessageImages */.Bs)(m).length
                                            },
                                            children: (0,utils/* getMessageImages */.Bs)(m).map((src, i)=>/*#__PURE__*/ jsx_runtime_.jsx("img", {
                                                    src: src,
                                                    alt: "message",
                                                    className: (exporter_module_default())["message-image-multi"]
                                                }, i))
                                        })
                                    ]
                                })
                            ]
                        }, i);
                    })
                ]
            })
        ]
    });
}
function MarkdownPreviewer(props) {
    const mdText = `# ${props.topic}\n\n` + props.messages.map((m)=>{
        return m.role === "user" ? `## ${locales/* default */.ZP.Export.MessageFromYou}:\n${(0,utils/* getMessageTextContent */.YK)(m)}` : `## ${locales/* default */.ZP.Export.MessageFromChatGPT}:\n${(0,utils/* getMessageTextContent */.YK)(m).trim()}`;
    }).join("\n\n");
    const copy = ()=>{
        (0,utils/* copyToClipboard */.vQ)(mdText);
    };
    const download = ()=>{
        (0,utils/* downloadAs */.CP)(mdText, `${props.topic}.md`);
    };
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx(PreviewActions, {
                copy: copy,
                download: download,
                showCopy: true,
                messages: props.messages
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: "markdown-body",
                children: /*#__PURE__*/ jsx_runtime_.jsx("pre", {
                    className: (exporter_module_default())["export-content"],
                    children: mdText
                })
            })
        ]
    });
}
function JsonPreviewer(props) {
    const msgs = {
        messages: [
            {
                role: "system",
                content: `${locales/* default */.ZP.FineTuned.Sysmessage} ${props.topic}`
            },
            ...props.messages.map((m)=>({
                    role: m.role,
                    content: m.content,
                    date: m.date,
                    model: m.model
                }))
        ]
    };
    const mdText = "```json\n" + JSON.stringify(msgs, null, 2) + "\n```";
    const minifiedJson = JSON.stringify(msgs);
    const copy = ()=>{
        (0,utils/* copyToClipboard */.vQ)(minifiedJson);
    };
    const download = ()=>{
        (0,utils/* downloadAs */.CP)(JSON.stringify(msgs), `${props.topic}.json`);
    };
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx(PreviewActions, {
                copy: copy,
                download: download,
                showCopy: false,
                messages: props.messages
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: "markdown-body",
                onClick: copy,
                children: /*#__PURE__*/ jsx_runtime_.jsx(Markdown, {
                    content: mdText
                })
            })
        ]
    });
}

;// CONCATENATED MODULE: ./app/components/chat.tsx
/* __next_internal_client_entry_do_not_use__ SessionConfigModel,PromptHints,DocumentsList,ChatActions,EditMessageModal,DeleteImageButton,Chat auto */ 


































// Import Bedrock model system


















const chat_Markdown = app_dynamic_default()(async ()=>(await Promise.all(/* import() */[__webpack_require__.e(6329), __webpack_require__.e(8914)]).then(__webpack_require__.bind(__webpack_require__, 68914))).Markdown, {
    loadableGenerated: {
        modules: [
            "/Users/mingxuan/Desktop/workspace/SampleStrands/app/components/chat.tsx -> " + "./markdown"
        ]
    },
    loading: ()=>/*#__PURE__*/ jsx_runtime_.jsx(three_dots/* default */.Z, {})
});
function SessionConfigModel(props) {
    const chatStore = (0,store/* useChatStore */.aK)();
    const session = chatStore.currentSession();
    const maskStore = (0,store_mask/* useMaskStore */.Zy)();
    const navigate = (0,react_router_dom_production_min.useNavigate)();
    return /*#__PURE__*/ jsx_runtime_.jsx("div", {
        className: "modal-mask",
        children: /*#__PURE__*/ jsx_runtime_.jsx(ui_lib/* Modal */.u_, {
            title: locales/* default */.ZP.Context.Edit,
            onClose: ()=>props.onClose(),
            actions: [
                /*#__PURE__*/ jsx_runtime_.jsx(components_button/* IconButton */.h, {
                    icon: /*#__PURE__*/ jsx_runtime_.jsx(reload/* default */.Z, {}),
                    bordered: true,
                    text: locales/* default */.ZP.Chat.Config.Reset,
                    onClick: async ()=>{
                        if (await (0,ui_lib/* showConfirm */.i0)(locales/* default */.ZP.Memory.ResetConfirm)) {
                            chatStore.updateCurrentSession((session)=>session.memoryPrompt = "");
                        }
                    }
                }, "reset"),
                /*#__PURE__*/ jsx_runtime_.jsx(components_button/* IconButton */.h, {
                    icon: /*#__PURE__*/ jsx_runtime_.jsx(copy/* default */.Z, {}),
                    bordered: true,
                    text: locales/* default */.ZP.Chat.Config.SaveAs,
                    onClick: ()=>{
                        navigate(constant/* Path */.y$.Masks);
                        setTimeout(()=>{
                            maskStore.create(session.mask);
                        }, 500);
                    }
                }, "copy")
            ],
            children: /*#__PURE__*/ jsx_runtime_.jsx(mask.MaskConfig, {
                mask: session.mask,
                updateMask: (updater)=>{
                    const mask = {
                        ...session.mask
                    };
                    updater(mask);
                    chatStore.updateCurrentSession((session)=>session.mask = mask);
                },
                shouldSyncFromGlobal: true,
                extraListItems: session.mask.modelConfig.sendMemory ? /*#__PURE__*/ jsx_runtime_.jsx(ui_lib/* ListItem */.HC, {
                    className: "copyable",
                    title: `${locales/* default */.ZP.Memory.Title} (${session.lastSummarizeIndex} of ${session.messages.length})`,
                    subTitle: session.memoryPrompt || locales/* default */.ZP.Memory.EmptyContent
                }) : /*#__PURE__*/ jsx_runtime_.jsx(jsx_runtime_.Fragment, {})
            })
        })
    });
}
function PromptToast(props) {
    const chatStore = (0,store/* useChatStore */.aK)();
    const session = chatStore.currentSession();
    const context = session.mask.context;
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: (chat_module_default())["prompt-toast"],
        children: [
            props.showToast && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: (chat_module_default())["prompt-toast-inner"] + " clickable",
                role: "button",
                onClick: ()=>props.setShowModal(true),
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx(brain, {}),
                    /*#__PURE__*/ jsx_runtime_.jsx("span", {
                        className: (chat_module_default())["prompt-toast-content"],
                        children: locales/* default */.ZP.Context.Toast(context.length)
                    })
                ]
            }),
            props.showModal && /*#__PURE__*/ jsx_runtime_.jsx(SessionConfigModel, {
                onClose: ()=>props.setShowModal(false)
            })
        ]
    }, "prompt-toast");
}
function useSubmitHandler() {
    const config = (0,store/* useAppConfig */.MG)();
    const submitKey = config.submitKey;
    const isComposing = (0,react_.useRef)(false);
    (0,react_.useEffect)(()=>{
        const onCompositionStart = ()=>{
            isComposing.current = true;
        };
        const onCompositionEnd = ()=>{
            isComposing.current = false;
        };
        window.addEventListener("compositionstart", onCompositionStart);
        window.addEventListener("compositionend", onCompositionEnd);
        return ()=>{
            window.removeEventListener("compositionstart", onCompositionStart);
            window.removeEventListener("compositionend", onCompositionEnd);
        };
    }, []);
    const shouldSubmit = (e)=>{
        if (e.key !== "Enter") return false;
        if (e.key === "Enter" && (e.nativeEvent.isComposing || isComposing.current)) return false;
        return config.submitKey === store/* SubmitKey */.mQ.AltEnter && e.altKey || config.submitKey === store/* SubmitKey */.mQ.CtrlEnter && e.ctrlKey || config.submitKey === store/* SubmitKey */.mQ.ShiftEnter && e.shiftKey || config.submitKey === store/* SubmitKey */.mQ.MetaEnter && e.metaKey || config.submitKey === store/* SubmitKey */.mQ.Enter && !e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey;
    };
    return {
        submitKey,
        shouldSubmit
    };
}
function PromptHints(props) {
    const noPrompts = props.prompts.length === 0;
    const [selectIndex, setSelectIndex] = (0,react_.useState)(0);
    const selectedRef = (0,react_.useRef)(null);
    (0,react_.useEffect)(()=>{
        setSelectIndex(0);
    }, [
        props.prompts.length
    ]);
    (0,react_.useEffect)(()=>{
        let isComposing = false;
        const onCompositionStart = ()=>{
            isComposing = true;
        };
        const onCompositionEnd = ()=>{
            isComposing = false;
        };
        const onKeyDown = (e)=>{
            if (isComposing || e.isComposing) {
                return;
            }
            if (noPrompts || e.metaKey || e.altKey || e.ctrlKey) {
                return;
            }
            // arrow up / down to select prompt
            const changeIndex = (delta)=>{
                e.stopPropagation();
                e.preventDefault();
                const nextIndex = Math.max(0, Math.min(props.prompts.length - 1, selectIndex + delta));
                setSelectIndex(nextIndex);
                selectedRef.current?.scrollIntoView({
                    block: "center"
                });
            };
            if (e.key === "ArrowUp") {
                changeIndex(1);
            } else if (e.key === "ArrowDown") {
                changeIndex(-1);
            } else if (e.key === "Enter") {
                const selectedPrompt = props.prompts.at(selectIndex);
                if (selectedPrompt) {
                    props.onPromptSelect(selectedPrompt);
                }
            }
        };
        document.addEventListener("compositionstart", onCompositionStart);
        document.addEventListener("compositionend", onCompositionEnd);
        window.addEventListener("keydown", onKeyDown);
        return ()=>{
            document.removeEventListener("compositionstart", onCompositionStart);
            document.removeEventListener("compositionend", onCompositionEnd);
            window.removeEventListener("keydown", onKeyDown);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        props.prompts.length,
        selectIndex
    ]);
    if (noPrompts) return null;
    return /*#__PURE__*/ jsx_runtime_.jsx("div", {
        className: (chat_module_default())["prompt-hints"],
        children: props.prompts.map((prompt, i)=>/*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                ref: i === selectIndex ? selectedRef : null,
                className: (chat_module_default())["prompt-hint"] + ` ${i === selectIndex ? (chat_module_default())["prompt-hint-selected"] : ""}`,
                onClick: ()=>props.onPromptSelect(prompt),
                onMouseEnter: ()=>setSelectIndex(i),
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                        className: (chat_module_default())["hint-title"],
                        children: prompt.title
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                        className: (chat_module_default())["hint-content"],
                        children: prompt.content
                    })
                ]
            }, prompt.title + i.toString()))
    });
}
function DocumentsList(props) {
    const [showMessage, setShowMessage] = (0,react_.useState)(false);
    const [message, setMessage] = (0,react_.useState)("");
    async function localLoadDocument() {
        const files = [];
        //pdf | csv | doc | docx | xls | xlsx | html | txt | md
        files.push(...await new Promise((res, rej)=>{
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "application/pdf,.csv,.txt,.md,.docx,doc,.xlsx,xls,";
            fileInput.multiple = false;
            fileInput.onchange = (event)=>{
                const files = event.target.files;
                const fileExtension = files[0].name.split(".").pop()?.toLowerCase();
                const fileName = files[0].name.split(".")[0].replace(" ", "");
                if ((0,utils/* checkFileExtension */.iC)(fileExtension)) {
                    (0,utils/* readFileAsBytes */.Bq)(files[0]).then((data)=>{
                        /*原生的doc 功能 name 不支持全角字符，比如 公司季度财务报表（2024）.xlsx,所以改为计算sha1作为文件名 */ console.log(`fileName: ${fileName}, format: ${fileExtension}, size :${files[0].size}`);
                        (0,utils/* calculateSHA1 */.DR)(fileName).then((sha1Hash)=>{
                            const doc = {
                                name: sha1Hash,
                                format: fileExtension,
                                size: files[0].size,
                                source: {
                                    "bytes": data
                                }
                            };
                            props.onDocumentBytesSelect(doc);
                            props.setFiles([
                                {
                                    file: files[0].name,
                                    size: files[0].size
                                }
                            ]);
                        }).catch((error)=>console.error(error));
                    }).catch((error)=>console.error(`Failed to read ${files[0]},${error}`));
                } else {
                    setShowMessage(true);
                    setMessage(`${files[0].name}, [${fileExtension}] type not supported`);
                    setTimeout(()=>{
                        setShowMessage(false);
                        setMessage("");
                    }, 3000);
                }
            /*remove text extract use native document block*/ // if (fileExtension === "pdf") {
            //   pdfToText(files[0])
            //     .then((text) => {
            //       props.onDocumentSelect(text ?? "");
            //       props.setFiles([{ file: files[0].name, size: files[0].size }]);
            //     })
            //     .catch((error) =>
            //       console.error("Failed to extract text from pdf"),
            //     );
            // } else if (fileExtension === "docx") {
            //   extractTextFromDocx(files[0])
            //     .then((text) => {
            //       props.onDocumentSelect(text ?? "");
            //       props.setFiles([{ file: files[0].name, size: files[0].size }]);
            //     })
            //     .catch((error) =>
            //       console.error("Failed to extract text from pdf"),
            //     );
            // } else if (fileExtension === "xlsx") {
            //   extractTextFromXlsx(files[0])
            //     .then((text) => {
            //       props.onDocumentSelect(text ?? "");
            //       props.setFiles([{ file: files[0].name, size: files[0].size }]);
            //     })
            //     .catch((error) =>
            //       console.error("Failed to extract text from pdf"),
            //     );
            // } else {
            //   readTXTFile(files[0])
            //     .then((text) => {
            //       props.onDocumentSelect(text ?? "");
            //       props.setFiles([{ file: files[0].name, size: files[0].size }]);
            //     })
            //     .catch((error) =>
            //       console.error("Failed to extract text from pdf"),
            //     );
            // }
            };
            fileInput.click();
        }));
        const filesLength = files.length;
        if (filesLength > 3) {
            files.splice(3, filesLength - 3);
        }
    }
    const deleteDocument = async (file)=>{
        if (confirm(`Are you sure you want to delete ${file} ?`)) {
            props.setFiles([]);
            props.onDocumentBytesSelect(undefined);
        }
    };
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        children: [
            showMessage && /*#__PURE__*/ jsx_runtime_.jsx("div", {
                children: message
            }),
            props.showDocumentsList === true && /*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx(components_button/* IconButton */.h, {
                        icon: /*#__PURE__*/ jsx_runtime_.jsx(cloud_success/* default */.Z, {}),
                        text: "Load PDF/Word/Excel/TXT/CSV/MD File",
                        bordered: true,
                        onClick: ()=>{
                            console.log("upload"), localLoadDocument();
                        }
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("hr", {})
                ]
            }),
            props.showDocumentsList === true && props.files.map((document1, idx)=>/*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                    children: [
                        document1.file,
                        " , size: ",
                        (document1.size / 1024).toFixed(2),
                        "/kb",
                        " ",
                        /*#__PURE__*/ jsx_runtime_.jsx("button", {
                            className: (chat_module_default())["icon-button"],
                            onClick: ()=>{
                                deleteDocument(document1.file);
                            },
                            style: {
                                cursor: "pointer"
                            },
                            children: "x"
                        }),
                        /*#__PURE__*/ jsx_runtime_.jsx("p", {
                            children: " "
                        })
                    ]
                }, document1.file))
        ]
    });
}
function ClearContextDivider() {
    const chatStore = (0,store/* useChatStore */.aK)();
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: (chat_module_default())["clear-context"],
        onClick: ()=>chatStore.updateCurrentSession((session)=>session.clearContextIndex = undefined),
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: (chat_module_default())["clear-context-tips"],
                children: locales/* default */.ZP.Context.Clear
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: (chat_module_default())["clear-context-revert-btn"],
                children: locales/* default */.ZP.Context.Revert
            })
        ]
    });
}
function ChatAction(props) {
    const iconRef = (0,react_.useRef)(null);
    const textRef = (0,react_.useRef)(null);
    const [width, setWidth] = (0,react_.useState)({
        full: 16,
        icon: 16
    });
    function updateWidth() {
        if (!iconRef.current || !textRef.current) return;
        const getWidth = (dom)=>dom.getBoundingClientRect().width;
        const textWidth = getWidth(textRef.current);
        const iconWidth = getWidth(iconRef.current);
        setWidth({
            full: textWidth + iconWidth,
            icon: iconWidth
        });
    }
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: `${(chat_module_default())["chat-input-action"]} clickable`,
        onClick: ()=>{
            props.onClick();
            setTimeout(updateWidth, 1);
        },
        onMouseEnter: updateWidth,
        onTouchStart: updateWidth,
        style: {
            "--icon-width": `${width.icon}px`,
            "--full-width": `${width.full}px`
        },
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                ref: iconRef,
                className: (chat_module_default()).icon,
                children: props.icon
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: (chat_module_default()).text,
                ref: textRef,
                children: props.text
            })
        ]
    });
}
function useScrollToBottom(scrollRef, detach = false) {
    // for auto-scroll
    const [autoScroll, setAutoScroll] = (0,react_.useState)(true);
    function scrollDomToBottom() {
        const dom = scrollRef.current;
        if (dom) {
            requestAnimationFrame(()=>{
                setAutoScroll(true);
                dom.scrollTo(0, dom.scrollHeight);
            });
        }
    }
    // auto scroll
    (0,react_.useEffect)(()=>{
        if (autoScroll && !detach) {
            scrollDomToBottom();
        }
    });
    return {
        scrollRef,
        autoScroll,
        setAutoScroll,
        scrollDomToBottom
    };
}
function ChatActions(props) {
    const config = (0,store/* useAppConfig */.MG)();
    const navigate = (0,react_router_dom_production_min.useNavigate)();
    const chatStore = (0,store/* useChatStore */.aK)();
    // Bedrock models store
    const bedrockStore = (0,bedrock_models.useBedrockModelsStore)();
    const activeModels = bedrockStore.getActiveModels();
    const modelsByProvider = bedrockStore.getModelsByProvider();
    // switch themes
    const theme = config.theme;
    function nextTheme() {
        const themes = [
            store/* Theme */.Q2.Auto,
            store/* Theme */.Q2.Light,
            store/* Theme */.Q2.Dark
        ];
        const themeIndex = themes.indexOf(theme);
        const nextIndex = (themeIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        config.update((config)=>config.theme = nextTheme);
    }
    // stop all responses
    const couldStop = controller/* ChatControllerPool */.L.hasPending();
    const stopAll = ()=>controller/* ChatControllerPool */.L.stopAll();
    // switch model - now using Bedrock models
    const currentModelId = chatStore.currentSession().mask.modelConfig.model;
    const currentModel = bedrockStore.getModelById(currentModelId);
    const [showModelSelector, setShowModelSelector] = (0,react_.useState)(false);
    const [showUploadImage, setShowUploadImage] = (0,react_.useState)(false);
    (0,react_.useEffect)(()=>{
        // Check if current model supports vision using Bedrock model structure
        const show = currentModel ? (0,utils_bedrock_models/* isVisionModel */.Xf)(currentModel) : false;
        setShowUploadImage(show);
        if (!show) {
            props.setAttachImages([]);
            props.setUploading(false);
        }
        // if current model is not available, switch to first available model
        if (!currentModel && activeModels.length > 0) {
            const nextModel = activeModels[0];
            chatStore.updateCurrentSession((session)=>session.mask.modelConfig.model = nextModel.modelId);
            (0,ui_lib/* showToast */.CF)(nextModel.modelName);
        }
    }, [
        chatStore,
        currentModelId,
        currentModel,
        activeModels
    ]);
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: (chat_module_default())["chat-input-actions"],
        children: [
            couldStop && /*#__PURE__*/ jsx_runtime_.jsx(ChatAction, {
                onClick: stopAll,
                text: locales/* default */.ZP.Chat.InputActions.Stop,
                icon: /*#__PURE__*/ jsx_runtime_.jsx(pause, {})
            }),
            !props.hitBottom && /*#__PURE__*/ jsx_runtime_.jsx(ChatAction, {
                onClick: props.scrollToBottom,
                text: locales/* default */.ZP.Chat.InputActions.ToBottom,
                icon: /*#__PURE__*/ jsx_runtime_.jsx(bottom, {})
            }),
            props.hitBottom && /*#__PURE__*/ jsx_runtime_.jsx(ChatAction, {
                onClick: props.showPromptModal,
                text: locales/* default */.ZP.Chat.InputActions.Settings,
                icon: /*#__PURE__*/ jsx_runtime_.jsx(chat_settings, {})
            }),
            showUploadImage && /*#__PURE__*/ jsx_runtime_.jsx(ChatAction, {
                onClick: props.uploadImage,
                text: locales/* default */.ZP.Chat.InputActions.UploadImage,
                icon: props.uploading ? /*#__PURE__*/ jsx_runtime_.jsx(loading, {}) : /*#__PURE__*/ jsx_runtime_.jsx(icons_image, {})
            }),
            /*#__PURE__*/ jsx_runtime_.jsx(ChatAction, {
                onClick: nextTheme,
                text: locales/* default */.ZP.Chat.InputActions.Theme[theme],
                icon: /*#__PURE__*/ jsx_runtime_.jsx(jsx_runtime_.Fragment, {
                    children: theme === store/* Theme */.Q2.Auto ? /*#__PURE__*/ jsx_runtime_.jsx(auto, {}) : theme === store/* Theme */.Q2.Light ? /*#__PURE__*/ jsx_runtime_.jsx(light, {}) : theme === store/* Theme */.Q2.Dark ? /*#__PURE__*/ jsx_runtime_.jsx(dark, {}) : null
                })
            }),
            /*#__PURE__*/ jsx_runtime_.jsx(ChatAction, {
                onClick: props.showPromptHints,
                text: locales/* default */.ZP.Chat.InputActions.Prompt,
                icon: /*#__PURE__*/ jsx_runtime_.jsx(icons_prompt, {})
            }),
            /*#__PURE__*/ jsx_runtime_.jsx(ChatAction, {
                onClick: ()=>{
                    navigate(constant/* Path */.y$.Agents);
                },
                text: "Agents",
                icon: /*#__PURE__*/ jsx_runtime_.jsx(icons_plugin/* default */.Z, {})
            }),
            /*#__PURE__*/ jsx_runtime_.jsx(ChatAction, {
                onClick: ()=>{
                    (0,utils/* readFromFile */.j2)().then((content)=>{
                        try {
                            const session = JSON.parse(content);
                            chatStore.importSession(session);
                            navigate(constant/* Path */.y$.Chat);
                        } catch  {}
                    });
                },
                text: locales/* default */.ZP.Chat.InputActions.ImportSession,
                icon: /*#__PURE__*/ jsx_runtime_.jsx(icons_import/* default */.Z, {})
            }),
            /*#__PURE__*/ jsx_runtime_.jsx(ChatAction, {
                text: locales/* default */.ZP.Chat.InputActions.Clear,
                icon: /*#__PURE__*/ jsx_runtime_.jsx(icons_break, {}),
                onClick: ()=>{
                    chatStore.updateCurrentSession((session)=>{
                        if (session.clearContextIndex === session.messages.length) {
                            session.clearContextIndex = undefined;
                        } else {
                            session.clearContextIndex = session.messages.length;
                            session.memoryPrompt = ""; // will clear memory
                        }
                    });
                }
            }),
            /*#__PURE__*/ jsx_runtime_.jsx(ChatAction, {
                onClick: ()=>setShowModelSelector(true),
                text: currentModel?.modelName || "Select Model",
                icon: /*#__PURE__*/ jsx_runtime_.jsx(robot, {})
            }),
            /*#__PURE__*/ jsx_runtime_.jsx(ChatAction, {
                onClick: ()=>{
                    props.showDocuments(), console.log("document upload");
                },
                text: "Documents",
                icon: /*#__PURE__*/ jsx_runtime_.jsx(cloud_success/* default */.Z, {})
            }),
            showModelSelector && /*#__PURE__*/ jsx_runtime_.jsx(ui_lib/* Selector */.Qf, {
                defaultSelectedValue: currentModelId,
                items: Object.entries(modelsByProvider).flatMap(([provider, models])=>models.map((model)=>({
                            title: `${model.modelName}${model.isReasoningModel ? " (Reasoning)" : ""}${(0,utils_bedrock_models/* isVisionModel */.Xf)(model) ? " (Vision)" : ""}`,
                            value: model.modelId
                        }))),
                onClose: ()=>setShowModelSelector(false),
                onSelection: (s)=>{
                    if (s.length === 0) return;
                    const selectedModel = bedrockStore.getModelById(s[0]);
                    if (selectedModel) {
                        chatStore.updateCurrentSession((session)=>{
                            session.mask.modelConfig.model = s[0];
                            session.mask.syncGlobalConfig = false;
                        });
                        (0,ui_lib/* showToast */.CF)(selectedModel.modelName);
                    }
                }
            })
        ]
    });
}
function EditMessageModal(props) {
    const chatStore = (0,store/* useChatStore */.aK)();
    const session = chatStore.currentSession();
    const [messages, setMessages] = (0,react_.useState)(session.messages.slice());
    return /*#__PURE__*/ jsx_runtime_.jsx("div", {
        className: "modal-mask",
        children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)(ui_lib/* Modal */.u_, {
            title: locales/* default */.ZP.Chat.EditMessage.Title,
            onClose: props.onClose,
            actions: [
                /*#__PURE__*/ jsx_runtime_.jsx(components_button/* IconButton */.h, {
                    text: locales/* default */.ZP.UI.Cancel,
                    icon: /*#__PURE__*/ jsx_runtime_.jsx(cancel/* default */.Z, {}),
                    onClick: ()=>{
                        props.onClose();
                    }
                }, "cancel"),
                /*#__PURE__*/ jsx_runtime_.jsx(components_button/* IconButton */.h, {
                    type: "primary",
                    text: locales/* default */.ZP.UI.Confirm,
                    icon: /*#__PURE__*/ jsx_runtime_.jsx(icons_confirm/* default */.Z, {}),
                    onClick: ()=>{
                        chatStore.updateCurrentSession((session)=>session.messages = messages);
                        props.onClose();
                    }
                }, "ok")
            ],
            children: [
                /*#__PURE__*/ jsx_runtime_.jsx(ui_lib/* List */.aV, {
                    children: /*#__PURE__*/ jsx_runtime_.jsx(ui_lib/* ListItem */.HC, {
                        title: locales/* default */.ZP.Chat.EditMessage.Topic.Title,
                        subTitle: locales/* default */.ZP.Chat.EditMessage.Topic.SubTitle,
                        children: /*#__PURE__*/ jsx_runtime_.jsx("input", {
                            type: "text",
                            value: session.topic,
                            onInput: (e)=>chatStore.updateCurrentSession((session)=>session.topic = e.currentTarget.value)
                        })
                    })
                }),
                /*#__PURE__*/ jsx_runtime_.jsx(mask.ContextPrompts, {
                    context: messages,
                    updateContext: (updater)=>{
                        const newMessages = messages.slice();
                        updater(newMessages);
                        setMessages(newMessages);
                    }
                })
            ]
        })
    });
}
function DeleteImageButton(props) {
    return /*#__PURE__*/ jsx_runtime_.jsx("div", {
        className: (chat_module_default())["delete-image"],
        onClick: props.deleteImage,
        children: /*#__PURE__*/ jsx_runtime_.jsx(clear/* default */.Z, {})
    });
}
function _Chat() {
    const chatStore = (0,store/* useChatStore */.aK)();
    const session = chatStore.currentSession();
    const config = (0,store/* useAppConfig */.MG)();
    const fontSize = config.fontSize;
    // Bedrock models store for model validation and selection
    const bedrockModelsStore = (0,bedrock_models.useBedrockModelsStore)();
    const activeModels = bedrockModelsStore.getActiveModels();
    // Initialize with a valid Bedrock model if current model is not found
    (0,react_.useEffect)(()=>{
        const currentModelId = session.mask.modelConfig.model;
        const currentModel = bedrockModelsStore.getModelById(currentModelId);
        if (!currentModel && activeModels.length > 0) {
            console.log(`[Chat] Current model ${currentModelId} not found in Bedrock models, switching to ${activeModels[0].modelId}`);
            chatStore.updateCurrentSession((session)=>{
                session.mask.modelConfig.model = activeModels[0].modelId;
            });
        }
    }, [
        session.mask.modelConfig.model,
        bedrockModelsStore,
        activeModels,
        chatStore
    ]);
    const [showExport, setShowExport] = (0,react_.useState)(false);
    const inputRef = (0,react_.useRef)(null);
    const [userInput, setUserInput] = (0,react_.useState)("");
    const [isLoading, setIsLoading] = (0,react_.useState)(false);
    const { submitKey, shouldSubmit } = useSubmitHandler();
    const scrollRef = (0,react_.useRef)(null);
    const isScrolledToBottom = scrollRef?.current ? Math.abs(scrollRef.current.scrollHeight - (scrollRef.current.scrollTop + scrollRef.current.clientHeight)) <= 1 : false;
    const { setAutoScroll, scrollDomToBottom } = useScrollToBottom(scrollRef, isScrolledToBottom);
    const [hitBottom, setHitBottom] = (0,react_.useState)(true);
    const isMobileScreen = (0,utils/* useMobileScreen */.S0)();
    const navigate = (0,react_router_dom_production_min.useNavigate)();
    const [attachImages, setAttachImages] = (0,react_.useState)([]);
    const [uploading, setUploading] = (0,react_.useState)(false);
    const [attachDocument, setAttachDocument] = (0,react_.useState)();
    const [files, setFiles] = (0,react_.useState)([]);
    // prompt hints
    const promptStore = (0,store_prompt/* usePromptStore */.f)();
    const [promptHints, setPromptHints] = (0,react_.useState)([]);
    const [showDocuments, setShowDocuments] = (0,react_.useState)(false);
    const onSearch = (0,index_module/* useDebouncedCallback */.y1)((text)=>{
        const matchedPrompts = promptStore.search(text);
        setPromptHints(matchedPrompts);
    }, 100, {
        leading: true,
        trailing: true
    });
    // auto grow input
    const [inputRows, setInputRows] = (0,react_.useState)(2);
    const measure = (0,index_module/* useDebouncedCallback */.y1)(()=>{
        const rows = inputRef.current ? (0,utils/* autoGrowTextArea */.lx)(inputRef.current) : 1;
        const inputRows = Math.min(20, Math.max(2 + Number(!isMobileScreen), rows));
        setInputRows(inputRows);
    }, 100, {
        leading: true,
        trailing: true
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (0,react_.useEffect)(measure, [
        userInput
    ]);
    // chat commands shortcuts
    const chatCommands = (0,command/* useChatCommand */.UK)({
        new: ()=>chatStore.newSession(),
        newm: ()=>navigate(constant/* Path */.y$.NewChat),
        prev: ()=>chatStore.nextSession(-1),
        next: ()=>chatStore.nextSession(1),
        clear: ()=>chatStore.updateCurrentSession((session)=>session.clearContextIndex = session.messages.length),
        del: ()=>chatStore.deleteSession(chatStore.currentSessionIndex)
    });
    // only search prompts when user input is short
    const SEARCH_TEXT_LIMIT = 30;
    const onInput = (text)=>{
        setUserInput(text);
        const n = text.trim().length;
        // clear search results
        if (n === 0) {
            setPromptHints([]);
        } else if (text.startsWith(command/* ChatCommandPrefix */.x6)) {
            setPromptHints(chatCommands.search(text));
        } else if (!config.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
            // check if need to trigger auto completion
            if (text.startsWith("/")) {
                let searchText = text.slice(1);
                onSearch(searchText);
            }
        }
    };
    const doSubmit = (userInput)=>{
        if (userInput.trim() === "") return;
        const matchCommand = chatCommands.match(userInput);
        if (matchCommand.matched) {
            setUserInput("");
            setPromptHints([]);
            matchCommand.invoke();
            return;
        }
        setIsLoading(true);
        chatStore.onUserInput(userInput, attachImages, attachDocument).then(()=>setIsLoading(false));
        setAttachImages([]);
        localStorage.setItem(constant/* LAST_INPUT_KEY */.Sb, userInput);
        setUserInput("");
        setFiles([]);
        setAttachDocument(undefined);
        setShowDocuments(false);
        setPromptHints([]);
        if (!isMobileScreen) inputRef.current?.focus();
        setAutoScroll(true);
    };
    const onPromptSelect = (prompt)=>{
        setTimeout(()=>{
            setPromptHints([]);
            const matchedChatCommand = chatCommands.match(prompt.content);
            if (matchedChatCommand.matched) {
                // if user is selecting a chat command, just trigger it
                matchedChatCommand.invoke();
                setUserInput("");
            } else {
                // or fill the prompt
                setUserInput(prompt.content);
            }
            inputRef.current?.focus();
        }, 30);
    };
    // stop response
    const onUserStop = (messageId)=>{
        controller/* ChatControllerPool */.L.stop(session.id, messageId);
    };
    (0,react_.useEffect)(()=>{
        chatStore.updateCurrentSession((session)=>{
            const stopTiming = Date.now() - constant/* REQUEST_TIMEOUT_MS */.tb;
            session.messages.forEach((m)=>{
                // check if should stop all stale messages
                if (m.isError || new Date(m.date).getTime() < stopTiming) {
                    if (m.streaming) {
                        m.streaming = false;
                    }
                    if (m.content.length === 0) {
                        m.isError = true;
                        m.content = (0,format/* prettyObject */.B)({
                            error: true,
                            message: "empty response"
                        });
                    }
                }
            });
            // auto sync mask config from global config
            if (session.mask.syncGlobalConfig) {
                console.log("[Mask] syncing from global, name = ", session.mask.name);
                session.mask.modelConfig = {
                    ...config.modelConfig
                };
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // check if should send message
    const onInputKeyDown = (e)=>{
        // if ArrowUp and no userInput, fill with last input
        if (e.key === "ArrowUp" && userInput.length <= 0 && !(e.metaKey || e.altKey || e.ctrlKey)) {
            setUserInput(localStorage.getItem(constant/* LAST_INPUT_KEY */.Sb) ?? "");
            e.preventDefault();
            return;
        }
        if (shouldSubmit(e) && promptHints.length === 0) {
            doSubmit(userInput);
            e.preventDefault();
        }
    };
    const onRightClick = (e, message)=>{
        // copy to clipboard
        if ((0,utils/* selectOrCopy */.Ri)(e.currentTarget, (0,utils/* getMessageTextContent */.YK)(message))) {
            if (userInput.length === 0) {
                setUserInput((0,utils/* getMessageTextContent */.YK)(message));
            }
            e.preventDefault();
        }
    };
    const deleteMessage = (msgId)=>{
        chatStore.updateCurrentSession((session)=>session.messages = session.messages.filter((m)=>m.id !== msgId));
    };
    const onDelete = (msgId)=>{
        deleteMessage(msgId);
    };
    const onResend = (message)=>{
        // when it is resending a message
        // 1. for a user's message, find the next bot response
        // 2. for a bot's message, find the last user's input
        // 3. delete original user input and bot's message
        // 4. resend the user's input
        const resendingIndex = session.messages.findIndex((m)=>m.id === message.id);
        if (resendingIndex < 0 || resendingIndex >= session.messages.length) {
            console.error("[Chat] failed to find resending message", message);
            return;
        }
        let userMessage;
        let botMessage;
        if (message.role === "assistant") {
            // if it is resending a bot's message, find the user input for it
            botMessage = message;
            for(let i = resendingIndex; i >= 0; i -= 1){
                if (session.messages[i].role === "user") {
                    userMessage = session.messages[i];
                    break;
                }
            }
        } else if (message.role === "user") {
            // if it is resending a user's input, find the bot's response
            userMessage = message;
            for(let i = resendingIndex; i < session.messages.length; i += 1){
                if (session.messages[i].role === "assistant") {
                    botMessage = session.messages[i];
                    break;
                }
            }
        }
        if (userMessage === undefined) {
            console.error("[Chat] failed to resend", message);
            return;
        }
        // delete the original messages
        deleteMessage(userMessage.id);
        deleteMessage(botMessage?.id);
        // resend the message
        setIsLoading(true);
        const textContent = (0,utils/* getMessageTextContent */.YK)(userMessage);
        const images = (0,utils/* getMessageImages */.Bs)(userMessage);
        chatStore.onUserInput(textContent, images, attachDocument).then(()=>setIsLoading(false));
        inputRef.current?.focus();
    };
    const onPinMessage = (message)=>{
        chatStore.updateCurrentSession((session)=>session.mask.context.push(message));
        (0,ui_lib/* showToast */.CF)(locales/* default */.ZP.Chat.Actions.PinToastContent, {
            text: locales/* default */.ZP.Chat.Actions.PinToastAction,
            onClick: ()=>{
                setShowPromptModal(true);
            }
        });
    };
    const context = (0,react_.useMemo)(()=>{
        return session.mask.hideContext ? [] : session.mask.context.slice();
    }, [
        session.mask.context,
        session.mask.hideContext
    ]);
    const accessStore = (0,store/* useAccessStore */._X)();
    if (context.length === 0 && session.messages.at(0)?.content !== store/* BOT_HELLO */.ux.content) {
        const copiedHello = Object.assign({}, store/* BOT_HELLO */.ux);
        if (!accessStore.isAuthorized()) {
            copiedHello.content = locales/* default */.ZP.Error.Unauthorized;
        }
        context.push(copiedHello);
    }
    // preview messages
    const renderMessages = (0,react_.useMemo)(()=>{
        return context.concat(session.messages).concat(isLoading ? [
            {
                ...(0,store/* createMessage */.tn)({
                    role: "assistant",
                    content: "……"
                }),
                preview: true
            }
        ] : []).concat(userInput.length > 0 && config.sendPreviewBubble ? [
            {
                ...(0,store/* createMessage */.tn)({
                    role: "user",
                    content: userInput
                }),
                preview: true
            }
        ] : []);
    }, [
        config.sendPreviewBubble,
        context,
        isLoading,
        session.messages,
        userInput
    ]);
    const [msgRenderIndex, _setMsgRenderIndex] = (0,react_.useState)(Math.max(0, renderMessages.length - constant/* CHAT_PAGE_SIZE */.nS));
    function setMsgRenderIndex(newIndex) {
        newIndex = Math.min(renderMessages.length - constant/* CHAT_PAGE_SIZE */.nS, newIndex);
        newIndex = Math.max(0, newIndex);
        _setMsgRenderIndex(newIndex);
    }
    const messages = (0,react_.useMemo)(()=>{
        const endRenderIndex = Math.min(msgRenderIndex + 3 * constant/* CHAT_PAGE_SIZE */.nS, renderMessages.length);
        return renderMessages.slice(msgRenderIndex, endRenderIndex);
    }, [
        msgRenderIndex,
        renderMessages
    ]);
    const onChatBodyScroll = (e)=>{
        const bottomHeight = e.scrollTop + e.clientHeight;
        const edgeThreshold = e.clientHeight;
        const isTouchTopEdge = e.scrollTop <= edgeThreshold;
        const isTouchBottomEdge = bottomHeight >= e.scrollHeight - edgeThreshold;
        const isHitBottom = bottomHeight >= e.scrollHeight - (isMobileScreen ? 4 : 10);
        const prevPageMsgIndex = msgRenderIndex - constant/* CHAT_PAGE_SIZE */.nS;
        const nextPageMsgIndex = msgRenderIndex + constant/* CHAT_PAGE_SIZE */.nS;
        if (isTouchTopEdge && !isTouchBottomEdge) {
            setMsgRenderIndex(prevPageMsgIndex);
        } else if (isTouchBottomEdge) {
            setMsgRenderIndex(nextPageMsgIndex);
        }
        setHitBottom(isHitBottom);
        setAutoScroll(isHitBottom);
    };
    function scrollToBottom() {
        setMsgRenderIndex(renderMessages.length - constant/* CHAT_PAGE_SIZE */.nS);
        scrollDomToBottom();
    }
    // clear context index = context length + index in messages
    const clearContextIndex = (session.clearContextIndex ?? -1) >= 0 ? session.clearContextIndex + context.length - msgRenderIndex : -1;
    const [showPromptModal, setShowPromptModal] = (0,react_.useState)(false);
    const clientConfig = (0,react_.useMemo)(()=>(0,client/* getClientConfig */.Z)(), []);
    const autoFocus = !isMobileScreen; // wont auto focus on mobile screen
    const showMaxIcon = !isMobileScreen && !clientConfig?.isApp;
    (0,command/* useCommand */.YZ)({
        fill: setUserInput,
        submit: (text)=>{
            doSubmit(text);
        },
        code: (text)=>{
            if (accessStore.disableFastLink) return;
            console.log("[Command] got code from url: ", text);
            (0,ui_lib/* showConfirm */.i0)(locales/* default */.ZP.URLCommand.Code + `code = ${text}`).then((res)=>{
                if (res) {
                    accessStore.update((access)=>access.accessCode = text);
                }
            });
        },
        settings: (text)=>{
            if (accessStore.disableFastLink) return;
            try {
                const payload = JSON.parse(text);
                console.log("[Command] got settings from url: ", payload);
                if (payload.key || payload.url) {
                    (0,ui_lib/* showConfirm */.i0)(locales/* default */.ZP.URLCommand.Settings + `\n${JSON.stringify(payload, null, 4)}`).then((res)=>{
                        if (!res) return;
                        if (payload.key) {
                            accessStore.update((access)=>access.openaiApiKey = payload.key);
                        }
                        if (payload.url) {
                            accessStore.update((access)=>access.openaiUrl = payload.url);
                        }
                    });
                }
            } catch  {
                console.error("[Command] failed to get settings from url: ", text);
            }
        }
    });
    // edit / insert message modal
    const [isEditingMessage, setIsEditingMessage] = (0,react_.useState)(false);
    // remember unfinished input
    (0,react_.useEffect)(()=>{
        // try to load from local storage
        const key = (0,constant/* UNFINISHED_INPUT */.AI)(session.id);
        const mayBeUnfinishedInput = localStorage.getItem(key);
        if (mayBeUnfinishedInput && userInput.length === 0) {
            setUserInput(mayBeUnfinishedInput);
            localStorage.removeItem(key);
        }
        const dom = inputRef.current;
        return ()=>{
            localStorage.setItem(key, dom?.value ?? "");
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const handlePaste = (0,react_.useCallback)(async (event)=>{
        const currentModelId = chatStore.currentSession().mask.modelConfig.model;
        const currentModel = bedrockModelsStore.getModelById(currentModelId);
        if (!currentModel || !(0,utils_bedrock_models/* isVisionModel */.Xf)(currentModel)) {
            return;
        }
        const items = (event.clipboardData || window.clipboardData).items;
        for (const item of items){
            if (item.kind === "file" && item.type.startsWith("image/")) {
                event.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    const images = [];
                    images.push(...attachImages);
                    images.push(...await new Promise((res, rej)=>{
                        setUploading(true);
                        const imagesData = [];
                        (0,utils/* compressImage */.hv)(file, 256 * 1024).then((dataUrl)=>{
                            imagesData.push(dataUrl);
                            setUploading(false);
                            res(imagesData);
                        }).catch((e)=>{
                            setUploading(false);
                            rej(e);
                        });
                    }));
                    const imagesLength = images.length;
                    if (imagesLength > 10) {
                        images.splice(10, imagesLength - 10);
                    }
                    setAttachImages(images);
                }
            }
        }
    }, [
        attachImages,
        chatStore,
        bedrockModelsStore
    ]);
    async function uploadImage() {
        const images = [];
        images.push(...attachImages);
        images.push(...await new Promise((res, rej)=>{
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/png, image/jpeg, image/webp, image/heic, image/heif";
            fileInput.multiple = true;
            fileInput.onchange = (event)=>{
                setUploading(true);
                const files = event.target.files;
                const imagesData = [];
                for(let i = 0; i < files.length; i++){
                    const file = event.target.files[i];
                    (0,utils/* compressImage */.hv)(file, 256 * 1024).then((dataUrl)=>{
                        imagesData.push(dataUrl);
                        if (imagesData.length === files.length) {
                            setUploading(false);
                            res(imagesData);
                        }
                    }).catch((e)=>{
                        setUploading(false);
                        rej(e);
                    });
                }
            };
            fileInput.click();
        }));
        const imagesLength = images.length;
        if (imagesLength > 10) {
            images.splice(10, imagesLength - 10);
        }
        setAttachImages(images);
    }
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: (chat_module_default()).chat,
        children: [
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: "window-header",
                "data-tauri-drag-region": true,
                children: [
                    isMobileScreen && /*#__PURE__*/ jsx_runtime_.jsx("div", {
                        className: "window-actions",
                        children: /*#__PURE__*/ jsx_runtime_.jsx("div", {
                            className: "window-action-button",
                            children: /*#__PURE__*/ jsx_runtime_.jsx(components_button/* IconButton */.h, {
                                icon: /*#__PURE__*/ jsx_runtime_.jsx(icons_return, {}),
                                bordered: true,
                                title: locales/* default */.ZP.Chat.Actions.ChatList,
                                onClick: ()=>navigate(constant/* Path */.y$.Home)
                            })
                        })
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: `window-header-title ${(chat_module_default())["chat-body-title"]}`,
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: `window-header-main-title ${(chat_module_default())["chat-body-main-title"]}`,
                                onClickCapture: ()=>setIsEditingMessage(true),
                                children: !session.topic ? store/* DEFAULT_TOPIC */.HX : session.topic
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: "window-header-sub-title",
                                children: locales/* default */.ZP.Chat.SubTitle(session.messages.length)
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontSize: "10px"
                                },
                                children: (()=>{
                                    const currentModelId = session.mask.modelConfig?.model ?? "";
                                    const currentModel = bedrockModelsStore.getModelById(currentModelId);
                                    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                                children: currentModel?.modelName || currentModelId
                                            }),
                                            currentModel?.isReasoningModel && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("label", {
                                                style: {
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px"
                                                },
                                                children: [
                                                    /*#__PURE__*/ jsx_runtime_.jsx("input", {
                                                        type: "checkbox",
                                                        style: {
                                                            margin: 0
                                                        },
                                                        checked: session.mask.modelConfig?.reasoning_config?.type === "enabled",
                                                        onChange: (e)=>{
                                                            chatStore.updateCurrentSession((session)=>{
                                                                if (!session.mask.modelConfig.reasoning_config) {
                                                                    session.mask.modelConfig.reasoning_config = {
                                                                        type: e.target.checked ? "enabled" : "disabled",
                                                                        budget_tokens: Math.min(1024, session.mask.modelConfig.max_tokens || 1024)
                                                                    };
                                                                } else {
                                                                    session.mask.modelConfig.reasoning_config.type = e.target.checked ? "enabled" : "disabled";
                                                                }
                                                            });
                                                        }
                                                    }),
                                                    /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                                        children: "Reasoning"
                                                    })
                                                ]
                                            })
                                        ]
                                    });
                                })()
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: "window-actions",
                        children: [
                            !isMobileScreen && /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: "window-action-button",
                                children: /*#__PURE__*/ jsx_runtime_.jsx(components_button/* IconButton */.h, {
                                    icon: /*#__PURE__*/ jsx_runtime_.jsx(rename, {}),
                                    bordered: true,
                                    onClick: ()=>setIsEditingMessage(true)
                                })
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: "window-action-button",
                                children: /*#__PURE__*/ jsx_runtime_.jsx(components_button/* IconButton */.h, {
                                    icon: /*#__PURE__*/ jsx_runtime_.jsx(share, {}),
                                    bordered: true,
                                    title: locales/* default */.ZP.Chat.Actions.Export,
                                    onClick: ()=>{
                                        setShowExport(true);
                                    }
                                })
                            }),
                            showMaxIcon && /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: "window-action-button",
                                children: /*#__PURE__*/ jsx_runtime_.jsx(components_button/* IconButton */.h, {
                                    icon: config.tightBorder ? /*#__PURE__*/ jsx_runtime_.jsx(min/* default */.Z, {}) : /*#__PURE__*/ jsx_runtime_.jsx(max/* default */.Z, {}),
                                    bordered: true,
                                    onClick: ()=>{
                                        config.update((config)=>config.tightBorder = !config.tightBorder);
                                    }
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx(PromptToast, {
                        showToast: !hitBottom,
                        showModal: showPromptModal,
                        setShowModal: setShowPromptModal
                    })
                ]
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: (chat_module_default())["chat-body"],
                ref: scrollRef,
                onScroll: (e)=>onChatBodyScroll(e.currentTarget),
                onMouseDown: ()=>inputRef.current?.blur(),
                onTouchStart: ()=>{
                    inputRef.current?.blur();
                    setAutoScroll(false);
                },
                children: messages.map((message, i)=>{
                    const isUser = message.role === "user";
                    const isContext = i < context.length;
                    const showActions = i > 0 && !(message.preview || message.content.length === 0) && !isContext;
                    const showTyping = message.preview || message.streaming;
                    const shouldShowClearContextDivider = i === clearContextIndex - 1;
                    let metrics = "";
                    if (config.metrics && message.metrics && typeof message.metrics == "object") {
                        for (const [key, value] of Object.entries(message.metrics)){
                            metrics += `${key} : ${value}  `;
                        }
                    }
                    //console.log(`Total message is ` + Object.entries(message).map(([key, value]) => `${key}: ${value}`).join(', '));
                    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)(react_.Fragment, {
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: isUser ? (chat_module_default())["chat-message-user"] : (chat_module_default())["chat-message"],
                                children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                    className: (chat_module_default())["chat-message-container"],
                                    children: [
                                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                            className: (chat_module_default())["chat-message-header"],
                                            children: [
                                                /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                                    className: (chat_module_default())["chat-message-avatar"],
                                                    children: [
                                                        /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                            className: (chat_module_default())["chat-message-edit"],
                                                            children: /*#__PURE__*/ jsx_runtime_.jsx(components_button/* IconButton */.h, {
                                                                icon: /*#__PURE__*/ jsx_runtime_.jsx(rename, {}),
                                                                onClick: async ()=>{
                                                                    const newMessage = await (0,ui_lib/* showPrompt */.G5)(locales/* default */.ZP.Chat.Actions.Edit, (0,utils/* getMessageTextContent */.YK)(message), 10);
                                                                    let newContent = newMessage;
                                                                    const images = (0,utils/* getMessageImages */.Bs)(message);
                                                                    if (images.length > 0) {
                                                                        newContent = [
                                                                            {
                                                                                type: "text",
                                                                                text: newMessage
                                                                            }
                                                                        ];
                                                                        for(let i = 0; i < images.length; i++){
                                                                            newContent.push({
                                                                                type: "image_url",
                                                                                image_url: {
                                                                                    url: images[i]
                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                    chatStore.updateCurrentSession((session)=>{
                                                                        const m = session.mask.context.concat(session.messages).find((m)=>m.id === message.id);
                                                                        if (m) {
                                                                            m.content = newContent;
                                                                        }
                                                                    });
                                                                }
                                                            })
                                                        }),
                                                        isUser ? /*#__PURE__*/ jsx_runtime_.jsx(emoji/* Avatar */.qE, {
                                                            avatar: config.avatar
                                                        }) : /*#__PURE__*/ jsx_runtime_.jsx(jsx_runtime_.Fragment, {
                                                            children: [
                                                                "system"
                                                            ].includes(message.role) ? /*#__PURE__*/ jsx_runtime_.jsx(emoji/* Avatar */.qE, {
                                                                avatar: "2699-fe0f"
                                                            }) : /*#__PURE__*/ jsx_runtime_.jsx(mask.MaskAvatar, {
                                                                avatar: session.mask.avatar,
                                                                model: message.model || session.mask.modelConfig.model
                                                            })
                                                        })
                                                    ]
                                                }),
                                                showActions && /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                    className: (chat_module_default())["chat-message-actions"],
                                                    children: /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                        className: (chat_module_default())["chat-input-actions"],
                                                        children: message.streaming ? /*#__PURE__*/ jsx_runtime_.jsx(ChatAction, {
                                                            text: locales/* default */.ZP.Chat.Actions.Stop,
                                                            icon: /*#__PURE__*/ jsx_runtime_.jsx(pause, {}),
                                                            onClick: ()=>onUserStop(message.id ?? i)
                                                        }) : /*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
                                                            children: [
                                                                /*#__PURE__*/ jsx_runtime_.jsx(ChatAction, {
                                                                    text: locales/* default */.ZP.Chat.Actions.Retry,
                                                                    icon: /*#__PURE__*/ jsx_runtime_.jsx(reload/* default */.Z, {}),
                                                                    onClick: ()=>onResend(message)
                                                                }),
                                                                (i > 1 || messages.length === 2) && /*#__PURE__*/ jsx_runtime_.jsx(ChatAction, {
                                                                    text: locales/* default */.ZP.Chat.Actions.Delete,
                                                                    icon: /*#__PURE__*/ jsx_runtime_.jsx(clear/* default */.Z, {}),
                                                                    onClick: ()=>onDelete(message.id ?? i)
                                                                }),
                                                                /*#__PURE__*/ jsx_runtime_.jsx(ChatAction, {
                                                                    text: locales/* default */.ZP.Chat.Actions.Pin,
                                                                    icon: /*#__PURE__*/ jsx_runtime_.jsx(pin, {}),
                                                                    onClick: ()=>onPinMessage(message)
                                                                }),
                                                                /*#__PURE__*/ jsx_runtime_.jsx(ChatAction, {
                                                                    text: locales/* default */.ZP.Chat.Actions.Copy,
                                                                    icon: /*#__PURE__*/ jsx_runtime_.jsx(copy/* default */.Z, {}),
                                                                    onClick: ()=>(0,utils/* copyToClipboard */.vQ)((0,utils/* getMessageTextContent */.YK)(message))
                                                                })
                                                            ]
                                                        })
                                                    })
                                                })
                                            ]
                                        }),
                                        showTyping && /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                            className: (chat_module_default())["chat-message-status"],
                                            children: locales/* default */.ZP.Chat.Typing
                                        }),
                                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                            className: (chat_module_default())["chat-message-item"],
                                            children: [
                                                /*#__PURE__*/ jsx_runtime_.jsx(chat_Markdown, {
                                                    content: (0,utils/* getMessageTextContent */.YK)(message),
                                                    loading: (message.preview || message.streaming) && message.content.length === 0 && !isUser,
                                                    onContextMenu: (e)=>onRightClick(e, message),
                                                    onDoubleClickCapture: ()=>{
                                                        if (!isMobileScreen) return;
                                                        setUserInput((0,utils/* getMessageTextContent */.YK)(message));
                                                    },
                                                    fontSize: fontSize,
                                                    parentRef: scrollRef,
                                                    defaultShow: i >= messages.length - 6
                                                }),
                                                (0,utils/* getMessageImages */.Bs)(message).length == 1 && /*#__PURE__*/ jsx_runtime_.jsx("img", {
                                                    className: (chat_module_default())["chat-message-item-image"],
                                                    src: (0,utils/* getMessageImages */.Bs)(message)[0],
                                                    alt: ""
                                                }),
                                                (0,utils/* getMessageImages */.Bs)(message).length > 1 && /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                    className: (chat_module_default())["chat-message-item-images"],
                                                    style: {
                                                        "--image-count": (0,utils/* getMessageImages */.Bs)(message).length
                                                    },
                                                    children: (0,utils/* getMessageImages */.Bs)(message).map((image, index)=>{
                                                        return /*#__PURE__*/ jsx_runtime_.jsx("img", {
                                                            className: (chat_module_default())["chat-message-item-image-multi"],
                                                            src: image,
                                                            alt: ""
                                                        }, index);
                                                    })
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                            className: (chat_module_default())["chat-message-action-date"],
                                            children: isContext ? locales/* default */.ZP.Chat.IsContext : message.date.toLocaleString()
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                            className: (chat_module_default())["chat-message-action-metrics"],
                                            children: metrics
                                        })
                                    ]
                                })
                            }),
                            shouldShowClearContextDivider && /*#__PURE__*/ jsx_runtime_.jsx(ClearContextDivider, {})
                        ]
                    }, message.id);
                })
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: (chat_module_default())["chat-input-panel"],
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx(PromptHints, {
                        prompts: promptHints,
                        onPromptSelect: onPromptSelect
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx(DocumentsList, {
                        showDocumentsList: showDocuments,
                        files: files,
                        setFiles: setFiles,
                        onDocumentBytesSelect: (data)=>{
                            setAttachDocument(data);
                        }
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx(ChatActions, {
                        uploadImage: uploadImage,
                        setAttachImages: setAttachImages,
                        setUploading: setUploading,
                        showPromptModal: ()=>setShowPromptModal(true),
                        scrollToBottom: scrollToBottom,
                        hitBottom: hitBottom,
                        uploading: uploading,
                        showPromptHints: ()=>{
                            // Click again to close
                            if (promptHints.length > 0) {
                                setPromptHints([]);
                                return;
                            }
                            inputRef.current?.focus();
                            setUserInput("/");
                            onSearch("");
                        },
                        showDocuments: ()=>{
                            console.log("showdocuments");
                            setShowDocuments(!showDocuments);
                        }
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("label", {
                        className: `${(chat_module_default())["chat-input-panel-inner"]} ${attachImages.length != 0 ? (chat_module_default())["chat-input-panel-inner-attach"] : ""}`,
                        htmlFor: "chat-input",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("textarea", {
                                id: "chat-input",
                                ref: inputRef,
                                className: (chat_module_default())["chat-input"],
                                placeholder: locales/* default */.ZP.Chat.Input(submitKey),
                                onInput: (e)=>onInput(e.currentTarget.value),
                                value: userInput,
                                onKeyDown: onInputKeyDown,
                                onFocus: scrollToBottom,
                                onClick: scrollToBottom,
                                onPaste: handlePaste,
                                rows: inputRows,
                                autoFocus: autoFocus,
                                style: {
                                    fontSize: config.fontSize
                                }
                            }),
                            attachImages.length != 0 && /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: (chat_module_default())["attach-images"],
                                children: attachImages.map((image, index)=>{
                                    return /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                        className: (chat_module_default())["attach-image"],
                                        style: {
                                            backgroundImage: `url("${image}")`
                                        },
                                        children: /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                            className: (chat_module_default())["attach-image-mask"],
                                            children: /*#__PURE__*/ jsx_runtime_.jsx(DeleteImageButton, {
                                                deleteImage: ()=>{
                                                    setAttachImages(attachImages.filter((_, i)=>i !== index));
                                                }
                                            })
                                        })
                                    }, index);
                                })
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx(components_button/* IconButton */.h, {
                                icon: /*#__PURE__*/ jsx_runtime_.jsx(send_white, {}),
                                text: locales/* default */.ZP.Chat.Send,
                                className: (chat_module_default())["chat-input-send"],
                                type: "primary",
                                onClick: ()=>doSubmit(userInput)
                            })
                        ]
                    })
                ]
            }),
            showExport && /*#__PURE__*/ jsx_runtime_.jsx(ExportMessageModal, {
                onClose: ()=>setShowExport(false)
            }),
            isEditingMessage && /*#__PURE__*/ jsx_runtime_.jsx(EditMessageModal, {
                onClose: ()=>{
                    setIsEditingMessage(false);
                }
            })
        ]
    }, session.id);
}
function Chat() {
    const chatStore = (0,store/* useChatStore */.aK)();
    const sessionIndex = chatStore.currentSessionIndex;
    return /*#__PURE__*/ jsx_runtime_.jsx(_Chat, {}, sessionIndex);
}


/***/ }),

/***/ 35878:
/***/ ((module) => {

// Exports
module.exports = {
	"message-exporter-body": "exporter_message-exporter-body__ieezO",
	"export-content": "exporter_export-content__bLZvx",
	"steps": "exporter_steps__6n3hv",
	"steps-progress": "exporter_steps-progress__BaZCB",
	"steps-progress-inner": "exporter_steps-progress-inner__Bx3Y4",
	"steps-inner": "exporter_steps-inner__EVqvK",
	"step": "exporter_step__WhCEO",
	"step-finished": "exporter_step-finished__eBg9d",
	"step-current": "exporter_step-current__oh5Mc",
	"step-index": "exporter_step-index__bWRYR",
	"step-name": "exporter_step-name__aj81m",
	"preview-actions": "exporter_preview-actions__EdSLJ",
	"image-previewer": "exporter_image-previewer__uKfNQ",
	"preview-body": "exporter_preview-body__qK5Zf",
	"chat-info": "exporter_chat-info__N_j5m",
	"icons": "exporter_icons__7WRoV",
	"logo": "exporter_logo__zu13e",
	"main-title": "exporter_main-title__jjxAd",
	"sub-title": "exporter_sub-title__p1RCl",
	"icon-space": "exporter_icon-space__u_tMK",
	"chat-info-item": "exporter_chat-info-item__3D12j",
	"message": "exporter_message__3aahS",
	"avatar": "exporter_avatar__fGOtt",
	"body": "exporter_body__gcKIl",
	"message-image": "exporter_message-image__ofOeC",
	"message-images": "exporter_message-images__oJoIX",
	"message-image-multi": "exporter_message-image-multi__jzQdX",
	"message-assistant": "exporter_message-assistant__sDmHi",
	"message-user": "exporter_message-user__2t254"
};


/***/ }),

/***/ 85345:
/***/ ((module) => {

// Exports
module.exports = {
	"message-selector": "message-selector_message-selector__dOKbo",
	"message-filter": "message-selector_message-filter__Q5XSd",
	"search-bar": "message-selector_search-bar__4E5gq",
	"actions": "message-selector_actions__MyZCT",
	"messages": "message-selector_messages__GbOLr",
	"message": "message-selector_message___TaV9",
	"message-selected": "message-selector_message-selected__b3mDv",
	"avatar": "message-selector_avatar__HCJ8t",
	"body": "message-selector_body__rKEIZ",
	"date": "message-selector_date__vc48w",
	"content": "message-selector_content__Z9W8L",
	"checkbox": "message-selector_checkbox__erPyd"
};


/***/ })

};
;