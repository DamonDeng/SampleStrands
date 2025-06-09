exports.id = 4417;
exports.ids = [4417];
exports.modules = {

/***/ 94417:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ContextPrompts: () => (/* binding */ ContextPrompts),
/* harmony export */   MaskAvatar: () => (/* binding */ MaskAvatar),
/* harmony export */   MaskConfig: () => (/* binding */ MaskConfig),
/* harmony export */   MaskPage: () => (/* binding */ MaskPage)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(56786);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _button__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(39378);
/* harmony import */ var _error__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(31057);
/* harmony import */ var _mask_module_scss__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(95073);
/* harmony import */ var _mask_module_scss__WEBPACK_IMPORTED_MODULE_28___default = /*#__PURE__*/__webpack_require__.n(_mask_module_scss__WEBPACK_IMPORTED_MODULE_28__);
/* harmony import */ var _icons_download_svg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(24624);
/* harmony import */ var _icons_upload_svg__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(62030);
/* harmony import */ var _icons_edit_svg__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(54095);
/* harmony import */ var _icons_add_svg__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(31935);
/* harmony import */ var _icons_close_svg__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(54299);
/* harmony import */ var _icons_delete_svg__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(77360);
/* harmony import */ var _icons_eye_svg__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(61221);
/* harmony import */ var _icons_copy_svg__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(53231);
/* harmony import */ var _icons_drag_svg__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(3276);
/* harmony import */ var https__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(95687);
/* harmony import */ var https__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(https__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(57310);
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(url__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var _store_mask__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(73706);
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(36278);
/* harmony import */ var _client_api__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(40163);
/* harmony import */ var _ui_lib__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(24552);
/* harmony import */ var _emoji__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(85563);
/* harmony import */ var _locales__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(57254);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(99742);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(react_router_dom__WEBPACK_IMPORTED_MODULE_27__);
/* harmony import */ var _chat_module_scss__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(48563);
/* harmony import */ var _chat_module_scss__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(_chat_module_scss__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(18038);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(92842);
/* harmony import */ var _model_config__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(80663);
/* harmony import */ var _constant__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(43684);
/* harmony import */ var _masks__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(8586);
/* harmony import */ var _hello_pangea_dnd__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(41423);






























// drag and drop helper function
function reorder(list, startIndex, endIndex) {
    const result = [
        ...list
    ];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
}
function MaskAvatar(props) {
    return props.avatar !== _store_mask__WEBPACK_IMPORTED_MODULE_14__/* .DEFAULT_MASK_AVATAR */ ._G ? /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_emoji__WEBPACK_IMPORTED_MODULE_18__/* .Avatar */ .qE, {
        avatar: props.avatar
    }) : /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_emoji__WEBPACK_IMPORTED_MODULE_18__/* .Avatar */ .qE, {
        model: props.model
    });
}
function MaskConfig(props) {
    const [showPicker, setShowPicker] = (0,react__WEBPACK_IMPORTED_MODULE_20__.useState)(false);
    const updateConfig = (updater)=>{
        if (props.readonly) return;
        const config = {
            ...props.mask.modelConfig
        };
        updater(config);
        props.updateMask((mask)=>{
            mask.modelConfig = config;
            // if user changed current session mask, it will disable auto sync
            mask.syncGlobalConfig = false;
        });
    };
    const copyMaskLink = ()=>{
        const maskLink = `${location.protocol}//${location.host}/#${_constant__WEBPACK_IMPORTED_MODULE_23__/* .Path */ .y$.NewChat}?mask=${props.mask.id}`;
        (0,_utils__WEBPACK_IMPORTED_MODULE_21__/* .copyToClipboard */ .vQ)(maskLink);
    };
    const globalConfig = (0,_store__WEBPACK_IMPORTED_MODULE_15__/* .useAppConfig */ .MG)();
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(ContextPrompts, {
                context: props.mask.context,
                updateContext: (updater)=>{
                    const context = props.mask.context.slice();
                    updater(context);
                    props.updateMask((mask)=>mask.context = context);
                }
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .List */ .aV, {
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .ListItem */ .HC, {
                        title: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Config.Avatar,
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .Popover */ .J2, {
                            content: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_emoji__WEBPACK_IMPORTED_MODULE_18__/* .AvatarPicker */ .aR, {
                                onEmojiClick: (emoji)=>{
                                    props.updateMask((mask)=>mask.avatar = emoji);
                                    setShowPicker(false);
                                }
                            }),
                            open: showPicker,
                            onClose: ()=>setShowPicker(false),
                            children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                onClick: ()=>setShowPicker(true),
                                style: {
                                    cursor: "pointer"
                                },
                                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(MaskAvatar, {
                                    avatar: props.mask.avatar,
                                    model: props.mask.modelConfig.model
                                })
                            })
                        })
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .ListItem */ .HC, {
                        title: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Config.Name,
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                            type: "text",
                            value: props.mask.name,
                            onInput: (e)=>props.updateMask((mask)=>{
                                    mask.name = e.currentTarget.value;
                                })
                        })
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .ListItem */ .HC, {
                        title: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Config.HideContext.Title,
                        subTitle: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Config.HideContext.SubTitle,
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                            type: "checkbox",
                            checked: props.mask.hideContext,
                            onChange: (e)=>{
                                props.updateMask((mask)=>{
                                    mask.hideContext = e.currentTarget.checked;
                                });
                            }
                        })
                    }),
                    !props.shouldSyncFromGlobal ? /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .ListItem */ .HC, {
                        title: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Config.Share.Title,
                        subTitle: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Config.Share.SubTitle,
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                            icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_copy_svg__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z, {}),
                            text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Config.Share.Action,
                            onClick: copyMaskLink
                        })
                    }) : null,
                    props.shouldSyncFromGlobal ? /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .ListItem */ .HC, {
                        title: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Config.Sync.Title,
                        subTitle: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Config.Sync.SubTitle,
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                            type: "checkbox",
                            checked: props.mask.syncGlobalConfig,
                            onChange: async (e)=>{
                                const checked = e.currentTarget.checked;
                                if (checked && await (0,_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .showConfirm */ .i0)(_locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Config.Sync.Confirm)) {
                                    props.updateMask((mask)=>{
                                        mask.syncGlobalConfig = checked;
                                        mask.modelConfig = {
                                            ...globalConfig.modelConfig
                                        };
                                    });
                                } else if (!checked) {
                                    props.updateMask((mask)=>{
                                        mask.syncGlobalConfig = checked;
                                    });
                                }
                            }
                        })
                    }) : null
                ]
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .List */ .aV, {
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_model_config__WEBPACK_IMPORTED_MODULE_22__/* .ModelConfigList */ .j, {
                        modelConfig: {
                            ...props.mask.modelConfig
                        },
                        updateConfig: updateConfig
                    }),
                    props.extraListItems
                ]
            })
        ]
    });
}
function ContextPromptItem(props) {
    const [focusingInput, setFocusingInput] = (0,react__WEBPACK_IMPORTED_MODULE_20__.useState)(false);
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_25___default()["context-prompt-row"]),
        children: [
            !focusingInput && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_25___default()["context-drag"]),
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_drag_svg__WEBPACK_IMPORTED_MODULE_11__/* ["default"] */ .Z, {})
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .Select */ .Ph, {
                        value: props.prompt.role,
                        className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_25___default()["context-role"]),
                        onChange: (e)=>props.update({
                                ...props.prompt,
                                role: e.target.value
                            }),
                        children: _client_api__WEBPACK_IMPORTED_MODULE_16__/* .ROLES */ .K$.map((r)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                value: r,
                                children: r
                            }, r))
                    })
                ]
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .Input */ .II, {
                value: (0,_utils__WEBPACK_IMPORTED_MODULE_21__/* .getMessageTextContent */ .YK)(props.prompt),
                type: "text",
                className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_25___default()["context-content"]),
                rows: focusingInput ? 5 : 1,
                onFocus: ()=>setFocusingInput(true),
                onBlur: ()=>{
                    setFocusingInput(false);
                    // If the selection is not removed when the user loses focus, some
                    // extensions like "Translate" will always display a floating bar
                    window?.getSelection()?.removeAllRanges();
                },
                onInput: (e)=>props.update({
                        ...props.prompt,
                        content: e.currentTarget.value
                    })
            }),
            !focusingInput && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_delete_svg__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {}),
                className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_25___default()["context-delete-button"]),
                onClick: ()=>props.remove(),
                bordered: true
            })
        ]
    });
}
function ContextPrompts(props) {
    const context = props.context;
    const addContextPrompt = (prompt, i)=>{
        props.updateContext((context)=>context.splice(i, 0, prompt));
    };
    const removeContextPrompt = (i)=>{
        props.updateContext((context)=>context.splice(i, 1));
    };
    const updateContextPrompt = (i, prompt)=>{
        props.updateContext((context)=>{
            const images = (0,_utils__WEBPACK_IMPORTED_MODULE_21__/* .getMessageImages */ .Bs)(context[i]);
            context[i] = prompt;
            if (images.length > 0) {
                const text = (0,_utils__WEBPACK_IMPORTED_MODULE_21__/* .getMessageTextContent */ .YK)(context[i]);
                const newContext = [
                    {
                        type: "text",
                        text
                    }
                ];
                for (const img of images){
                    newContext.push({
                        type: "image_url",
                        image_url: {
                            url: img
                        }
                    });
                }
                context[i].content = newContext;
            }
        });
    };
    const onDragEnd = (result)=>{
        if (!result.destination) {
            return;
        }
        const newContext = reorder(context, result.source.index, result.destination.index);
        props.updateContext((context)=>{
            context.splice(0, context.length, ...newContext);
        });
    };
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
            className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_25___default()["context-prompt"]),
            style: {
                marginBottom: 20
            },
            children: [
                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_hello_pangea_dnd__WEBPACK_IMPORTED_MODULE_26__/* .DragDropContext */ .Z5, {
                    onDragEnd: onDragEnd,
                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_hello_pangea_dnd__WEBPACK_IMPORTED_MODULE_26__/* .Droppable */ .bK, {
                        droppableId: "context-prompt-list",
                        children: (provided)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                ref: provided.innerRef,
                                ...provided.droppableProps,
                                children: [
                                    context.map((c, i)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_hello_pangea_dnd__WEBPACK_IMPORTED_MODULE_26__/* .Draggable */ ._l, {
                                            draggableId: c.id || i.toString(),
                                            index: i,
                                            children: (provided)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                    ref: provided.innerRef,
                                                    ...provided.draggableProps,
                                                    ...provided.dragHandleProps,
                                                    children: [
                                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(ContextPromptItem, {
                                                            index: i,
                                                            prompt: c,
                                                            update: (prompt)=>updateContextPrompt(i, prompt),
                                                            remove: ()=>removeContextPrompt(i)
                                                        }),
                                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                            className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_25___default()["context-prompt-insert"]),
                                                            onClick: ()=>{
                                                                addContextPrompt((0,_store__WEBPACK_IMPORTED_MODULE_15__/* .createMessage */ .tn)({
                                                                    role: "user",
                                                                    content: "",
                                                                    date: new Date().toLocaleString()
                                                                }), i + 1);
                                                            },
                                                            children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_add_svg__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {})
                                                        })
                                                    ]
                                                })
                                        }, c.id)),
                                    provided.placeholder
                                ]
                            })
                    })
                }),
                props.context.length === 0 && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                    className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_25___default()["context-prompt-row"]),
                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                        icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_add_svg__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {}),
                        text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Context.Add,
                        bordered: true,
                        className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_25___default()["context-prompt-button"]),
                        onClick: ()=>addContextPrompt((0,_store__WEBPACK_IMPORTED_MODULE_15__/* .createMessage */ .tn)({
                                role: "user",
                                content: "",
                                date: ""
                            }), props.context.length)
                    })
                })
            ]
        })
    });
}
function MaskPage() {
    const navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_27__.useNavigate)();
    const maskStore = (0,_store_mask__WEBPACK_IMPORTED_MODULE_14__/* .useMaskStore */ .Zy)();
    const chatStore = (0,_store__WEBPACK_IMPORTED_MODULE_15__/* .useChatStore */ .aK)();
    const [filterLang, setFilterLang] = (0,react__WEBPACK_IMPORTED_MODULE_20__.useState)();
    const allMasks = maskStore.getAll().filter((m)=>!filterLang || m.lang === filterLang);
    const [searchMasks, setSearchMasks] = (0,react__WEBPACK_IMPORTED_MODULE_20__.useState)([]);
    const [searchText, setSearchText] = (0,react__WEBPACK_IMPORTED_MODULE_20__.useState)("");
    const masks = searchText.length > 0 ? searchMasks : allMasks;
    // refactored already, now it accurate
    const onSearch = (text)=>{
        setSearchText(text);
        if (text.length > 0) {
            const result = allMasks.filter((m)=>m.name.toLowerCase().includes(text.toLowerCase()));
            setSearchMasks(result);
        } else {
            setSearchMasks(allMasks);
        }
    };
    const [editingMaskId, setEditingMaskId] = (0,react__WEBPACK_IMPORTED_MODULE_20__.useState)();
    const editingMask = maskStore.get(editingMaskId) ?? _masks__WEBPACK_IMPORTED_MODULE_24__/* .BUILTIN_MASK_STORE */ .$n.get(editingMaskId);
    const closeMaskModal = ()=>setEditingMaskId(undefined);
    const downloadAll = ()=>{
        (0,_utils__WEBPACK_IMPORTED_MODULE_21__/* .downloadAs */ .CP)(JSON.stringify(masks.filter((v)=>!v.builtin)), _constant__WEBPACK_IMPORTED_MODULE_23__/* .FileName */ .dJ.Masks);
    };
    const importFromFile = ()=>{
        (0,_utils__WEBPACK_IMPORTED_MODULE_21__/* .readFromFile */ .j2)().then((content)=>{
            try {
                const importMasks = JSON.parse(content);
                if (Array.isArray(importMasks)) {
                    for (const mask of importMasks){
                        if (mask.name) {
                            maskStore.create(mask);
                        }
                    }
                    return;
                }
                //if the content is a single mask.
                if (importMasks.name) {
                    maskStore.create(importMasks);
                }
            } catch  {}
        });
    };
    function curl(urlString, method, headers) {
        return new Promise((resolve, reject)=>{
            const parsedUrl = url__WEBPACK_IMPORTED_MODULE_13___default().parse(urlString);
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port ? parseInt(parsedUrl.port) : 443,
                path: parsedUrl.path,
                method: method,
                headers: headers
            };
            const req = https__WEBPACK_IMPORTED_MODULE_12___default().request(options, (res)=>{
                let data = "";
                res.on("data", (chunk)=>{
                    data += chunk;
                });
                res.on("end", ()=>{
                    resolve(data);
                });
            });
            req.on("error", (err)=>{
                reject(err);
            });
            req.end();
        });
    }
    const importFromLink = ()=>{
        const url = "https://i8mf90he81.execute-api.us-east-1.amazonaws.com";
        const method = "GET";
        const headers = {};
        curl(url, method, headers).then((data)=>{
            console.log(data);
            try {
                const importMasks = JSON.parse(data);
                if (Array.isArray(importMasks)) {
                    for (const mask of importMasks){
                        if (mask.name) {
                            maskStore.create(mask);
                        }
                    }
                    return;
                }
                //if the content is a single mask.
                if (importMasks.name) {
                    maskStore.create(importMasks);
                }
                console.log("import successful");
            } catch (err) {
                console.error(err);
            }
        }).catch((err)=>{
            console.error(err);
        });
    };
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_error__WEBPACK_IMPORTED_MODULE_2__/* .ErrorBoundary */ .S, {
        children: [
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                className: (_mask_module_scss__WEBPACK_IMPORTED_MODULE_28___default()["mask-page"]),
                children: [
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: "window-header",
                        children: [
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: "window-header-title",
                                children: [
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                        className: "window-header-main-title",
                                        children: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Page.Title
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                        className: "window-header-submai-title",
                                        children: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Page.SubTitle(allMasks.length)
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: "window-actions",
                                children: [
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                        className: "window-action-button",
                                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                                            icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_download_svg__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {}),
                                            bordered: true,
                                            onClick: downloadAll,
                                            text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.UI.Export
                                        })
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                        className: "window-action-button",
                                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                                            icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_upload_svg__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {}),
                                            text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.UI.Import,
                                            bordered: true,
                                            onClick: ()=>importFromFile()
                                        })
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                        className: "window-action-button",
                                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                                            icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_upload_svg__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {}),
                                            text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.UI.ImportFromHub,
                                            bordered: true,
                                            onClick: ()=>importFromLink()
                                        })
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                        className: "window-action-button",
                                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                                            icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_close_svg__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .Z, {}),
                                            bordered: true,
                                            onClick: ()=>navigate(-1)
                                        })
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: (_mask_module_scss__WEBPACK_IMPORTED_MODULE_28___default()["mask-page-body"]),
                        children: [
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: (_mask_module_scss__WEBPACK_IMPORTED_MODULE_28___default()["mask-filter"]),
                                children: [
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                                        type: "text",
                                        className: (_mask_module_scss__WEBPACK_IMPORTED_MODULE_28___default()["search-bar"]),
                                        placeholder: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Page.Search,
                                        autoFocus: true,
                                        onInput: (e)=>onSearch(e.currentTarget.value)
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .Select */ .Ph, {
                                        className: (_mask_module_scss__WEBPACK_IMPORTED_MODULE_28___default()["mask-filter-lang"]),
                                        value: filterLang ?? _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Settings.Lang.All,
                                        onChange: (e)=>{
                                            const value = e.currentTarget.value;
                                            if (value === _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Settings.Lang.All) {
                                                setFilterLang(undefined);
                                            } else {
                                                setFilterLang(value);
                                            }
                                        },
                                        children: [
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                                value: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Settings.Lang.All,
                                                children: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Settings.Lang.All
                                            }, "all"),
                                            _locales__WEBPACK_IMPORTED_MODULE_19__/* .AllLangs */ .DC.map((lang)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                                    value: lang,
                                                    children: _locales__WEBPACK_IMPORTED_MODULE_19__/* .ALL_LANG_OPTIONS */ .nW[lang]
                                                }, lang))
                                        ]
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                                        className: (_mask_module_scss__WEBPACK_IMPORTED_MODULE_28___default()["mask-create"]),
                                        icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_add_svg__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {}),
                                        text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Page.Create,
                                        bordered: true,
                                        onClick: ()=>{
                                            const createdMask = maskStore.create();
                                            setEditingMaskId(createdMask.id);
                                        }
                                    })
                                ]
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                children: masks.map((m)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: (_mask_module_scss__WEBPACK_IMPORTED_MODULE_28___default()["mask-item"]),
                                        children: [
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                className: (_mask_module_scss__WEBPACK_IMPORTED_MODULE_28___default()["mask-header"]),
                                                children: [
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                        className: (_mask_module_scss__WEBPACK_IMPORTED_MODULE_28___default()["mask-icon"]),
                                                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(MaskAvatar, {
                                                            avatar: m.avatar,
                                                            model: m.modelConfig.model
                                                        })
                                                    }),
                                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                        className: (_mask_module_scss__WEBPACK_IMPORTED_MODULE_28___default()["mask-title"]),
                                                        children: [
                                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                                className: (_mask_module_scss__WEBPACK_IMPORTED_MODULE_28___default()["mask-name"]),
                                                                children: m.name
                                                            }),
                                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                                className: (_mask_module_scss__WEBPACK_IMPORTED_MODULE_28___default()["mask-info"]) + " one-line",
                                                                children: `${_locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Item.Info(m.context.length)} / ${_locales__WEBPACK_IMPORTED_MODULE_19__/* .ALL_LANG_OPTIONS */ .nW[m.lang]} / ${m.modelConfig.model}`
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                className: (_mask_module_scss__WEBPACK_IMPORTED_MODULE_28___default()["mask-actions"]),
                                                children: [
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                                                        icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_add_svg__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {}),
                                                        text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Item.Chat,
                                                        onClick: ()=>{
                                                            chatStore.newSession(m);
                                                            navigate(_constant__WEBPACK_IMPORTED_MODULE_23__/* .Path */ .y$.Chat);
                                                        }
                                                    }),
                                                    m.builtin ? /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                                                        icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_eye_svg__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z, {}),
                                                        text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Item.View,
                                                        onClick: ()=>setEditingMaskId(m.id)
                                                    }) : /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                                                        icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_edit_svg__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z, {}),
                                                        text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Item.Edit,
                                                        onClick: ()=>setEditingMaskId(m.id)
                                                    }),
                                                    !m.builtin && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                                                        icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_delete_svg__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {}),
                                                        text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Item.Delete,
                                                        onClick: async ()=>{
                                                            if (await (0,_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .showConfirm */ .i0)(_locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.Item.DeleteConfirm)) {
                                                                maskStore.delete(m.id);
                                                            }
                                                        }
                                                    })
                                                ]
                                            })
                                        ]
                                    }, m.id))
                            })
                        ]
                    })
                ]
            }),
            editingMask && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: "modal-mask",
                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .Modal */ .u_, {
                    title: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.EditModal.Title(editingMask?.builtin),
                    onClose: closeMaskModal,
                    actions: [
                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                            icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_download_svg__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {}),
                            text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.EditModal.Download,
                            bordered: true,
                            onClick: ()=>(0,_utils__WEBPACK_IMPORTED_MODULE_21__/* .downloadAs */ .CP)(JSON.stringify(editingMask), `${editingMask.name}.json`)
                        }, "export"),
                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                            icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_copy_svg__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z, {}),
                            bordered: true,
                            text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Mask.EditModal.Clone,
                            onClick: ()=>{
                                navigate(_constant__WEBPACK_IMPORTED_MODULE_23__/* .Path */ .y$.Masks);
                                maskStore.create(editingMask);
                                setEditingMaskId(undefined);
                            }
                        }, "copy")
                    ],
                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(MaskConfig, {
                        mask: editingMask,
                        updateMask: (updater)=>maskStore.updateMask(editingMaskId, updater),
                        readonly: editingMask.builtin
                    })
                })
            })
        ]
    });
}


/***/ }),

/***/ 95073:
/***/ ((module) => {

// Exports
module.exports = {
	"mask-page": "mask_mask-page__ou14k",
	"mask-page-body": "mask_mask-page-body__kBXsJ",
	"mask-filter": "mask_mask-filter__OdpU3",
	"slide-in": "mask_slide-in__unpXH",
	"search-bar": "mask_search-bar__7_Msn",
	"mask-filter-lang": "mask_mask-filter-lang__mRxyv",
	"mask-create": "mask_mask-create__BjAzk",
	"mask-item": "mask_mask-item__dinia",
	"mask-header": "mask_mask-header__RXJXI",
	"mask-icon": "mask_mask-icon__wO1ER",
	"mask-title": "mask_mask-title__IDEbR",
	"mask-name": "mask_mask-name__77Rjh",
	"mask-info": "mask_mask-info__2gtiu",
	"mask-actions": "mask_mask-actions__rsWn_",
	"slide-in-from-top": "mask_slide-in-from-top__DOEYB"
};


/***/ })

};
;