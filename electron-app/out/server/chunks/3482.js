"use strict";
exports.id = 3482;
exports.ids = [3482];
exports.modules = {

/***/ 36829:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(18038);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var SvgImport = function SvgImport(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16
  }, props), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
    style: {
      stroke: "none",
      fillRule: "nonzero",
      fill: "#33363f",
      fillOpacity: 1
    },
    d: "m8 9.332-.473.473.473.472.473-.472Zm.668-6c0-.367-.3-.664-.668-.664a.667.667 0 0 0-.668.664Zm-4.473 3.14 3.332 3.333.946-.942-3.336-3.336Zm4.278 3.333 3.332-3.332-.942-.946-3.336 3.336Zm.195-.473v-6H7.332v6Zm0 0"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
    style: {
      fill: "none",
      strokeWidth: 2,
      strokeLinecap: "butt",
      strokeLinejoin: "miter",
      stroke: "#33363f",
      strokeOpacity: 1,
      strokeMiterlimit: 4
    },
    d: "M4.998 16.002v.996c0 1.107.897 2.004 2.004 2.004h9.996a2.003 2.003 0 0 0 2.004-2.004v-.996",
    transform: "scale(.66667)"
  }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SvgImport);

/***/ }),

/***/ 88286:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UK: () => (/* binding */ useChatCommand),
/* harmony export */   YZ: () => (/* binding */ useCommand),
/* harmony export */   x6: () => (/* binding */ ChatCommandPrefix)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(18038);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(99742);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_router_dom__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _locales__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(57254);



function useCommand(commands = {}) {
    const [searchParams, setSearchParams] = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_2__.useSearchParams)();
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(()=>{
        let shouldUpdate = false;
        searchParams.forEach((param, name)=>{
            const commandName = name;
            if (typeof commands[commandName] === "function") {
                commands[commandName](param);
                searchParams.delete(name);
                shouldUpdate = true;
            }
        });
        if (shouldUpdate) {
            setSearchParams(searchParams);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        searchParams,
        commands
    ]);
}
const ChatCommandPrefix = ":";
function useChatCommand(commands = {}) {
    function extract(userInput) {
        return userInput.startsWith(ChatCommandPrefix) ? userInput.slice(1) : userInput;
    }
    function search(userInput) {
        const input = extract(userInput);
        const desc = _locales__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .ZP.Chat.Commands;
        return Object.keys(commands).filter((c)=>c.startsWith(input)).map((c)=>({
                title: desc[c],
                content: ChatCommandPrefix + c
            }));
    }
    function match(userInput) {
        const command = extract(userInput);
        const matched = typeof commands[command] === "function";
        return {
            matched,
            invoke: ()=>matched && commands[command](userInput)
        };
    }
    return {
        match,
        search
    };
}


/***/ })

};
;