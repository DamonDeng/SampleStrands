exports.id = 803;
exports.ids = [803];
exports.modules = {

/***/ 60803:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AgentAvatar: () => (/* binding */ AgentAvatar),
/* harmony export */   AgentConfig: () => (/* binding */ AgentConfig),
/* harmony export */   AgentPage: () => (/* binding */ AgentPage),
/* harmony export */   ContextPrompts: () => (/* binding */ ContextPrompts)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(56786);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _button__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(39378);
/* harmony import */ var _error__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(31057);
/* harmony import */ var _agent_module_scss__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(64853);
/* harmony import */ var _agent_module_scss__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(_agent_module_scss__WEBPACK_IMPORTED_MODULE_27__);
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
/* harmony import */ var _store_agent__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(67631);
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(36278);
/* harmony import */ var _client_api__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(40163);
/* harmony import */ var _ui_lib__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(24552);
/* harmony import */ var _emoji__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(85563);
/* harmony import */ var _locales__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(57254);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(99742);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(react_router_dom__WEBPACK_IMPORTED_MODULE_26__);
/* harmony import */ var _chat_module_scss__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(48563);
/* harmony import */ var _chat_module_scss__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(_chat_module_scss__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(18038);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(92842);
/* harmony import */ var _model_config__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(80663);
/* harmony import */ var _constant__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(43684);
/* harmony import */ var _hello_pangea_dnd__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(41423);





























// drag and drop helper function
function reorder(list, startIndex, endIndex) {
    const result = [
        ...list
    ];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
}
function AgentAvatar(props) {
    return props.avatar !== _store_agent__WEBPACK_IMPORTED_MODULE_14__/* .DEFAULT_AGENT_AVATAR */ .Mj ? /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_emoji__WEBPACK_IMPORTED_MODULE_18__/* .Avatar */ .qE, {
        avatar: props.avatar
    }) : /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_emoji__WEBPACK_IMPORTED_MODULE_18__/* .Avatar */ .qE, {
        model: props.model
    });
}
function AgentConfig(props) {
    const [showPicker, setShowPicker] = (0,react__WEBPACK_IMPORTED_MODULE_20__.useState)(false);
    const updateConfig = (updater)=>{
        if (props.readonly) return;
        const config = {
            ...props.agent.modelConfig
        };
        updater(config);
        props.updateAgent((agent)=>{
            agent.modelConfig = config;
            // if user changed current session agent, it will disable auto sync
            agent.syncGlobalConfig = false;
        });
    };
    const copyAgentLink = ()=>{
        const agentLink = `${location.protocol}//${location.host}/#${_constant__WEBPACK_IMPORTED_MODULE_23__/* .Path */ .y$.NewChat}?agent=${props.agent.id}`;
        (0,_utils__WEBPACK_IMPORTED_MODULE_21__/* .copyToClipboard */ .vQ)(agentLink);
    };
    const globalConfig = (0,_store__WEBPACK_IMPORTED_MODULE_15__/* .useAppConfig */ .MG)();
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(ContextPrompts, {
                context: props.agent.context,
                updateContext: (updater)=>{
                    const context = props.agent.context.slice();
                    updater(context);
                    props.updateAgent((agent)=>agent.context = context);
                }
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .List */ .aV, {
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .ListItem */ .HC, {
                        title: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Config.Avatar,
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .Popover */ .J2, {
                            content: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_emoji__WEBPACK_IMPORTED_MODULE_18__/* .AvatarPicker */ .aR, {
                                onEmojiClick: (emoji)=>{
                                    props.updateAgent((agent)=>agent.avatar = emoji);
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
                                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(AgentAvatar, {
                                    avatar: props.agent.avatar,
                                    model: props.agent.modelConfig.model
                                })
                            })
                        })
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .ListItem */ .HC, {
                        title: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Config.Name,
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                            type: "text",
                            value: props.agent.name,
                            onInput: (e)=>props.updateAgent((agent)=>{
                                    agent.name = e.currentTarget.value;
                                })
                        })
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .ListItem */ .HC, {
                        title: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Config.Description,
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                            type: "text",
                            value: props.agent.description || "",
                            onInput: (e)=>props.updateAgent((agent)=>{
                                    agent.description = e.currentTarget.value;
                                })
                        })
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .ListItem */ .HC, {
                        title: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Config.HideContext.Title,
                        subTitle: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Config.HideContext.SubTitle,
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                            type: "checkbox",
                            checked: props.agent.hideContext,
                            onChange: (e)=>{
                                props.updateAgent((agent)=>{
                                    agent.hideContext = e.currentTarget.checked;
                                });
                            }
                        })
                    }),
                    !props.shouldSyncFromGlobal ? /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .ListItem */ .HC, {
                        title: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Config.Share.Title,
                        subTitle: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Config.Share.SubTitle,
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                            icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_copy_svg__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z, {}),
                            text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Config.Share.Action,
                            onClick: copyAgentLink
                        })
                    }) : null,
                    props.shouldSyncFromGlobal ? /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .ListItem */ .HC, {
                        title: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Config.Sync.Title,
                        subTitle: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Config.Sync.SubTitle,
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                            type: "checkbox",
                            checked: props.agent.syncGlobalConfig,
                            onChange: async (e)=>{
                                const checked = e.currentTarget.checked;
                                if (checked && await (0,_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .showConfirm */ .i0)(_locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Config.Sync.Confirm)) {
                                    props.updateAgent((agent)=>{
                                        agent.syncGlobalConfig = checked;
                                        agent.modelConfig = {
                                            ...globalConfig.modelConfig
                                        };
                                    });
                                } else if (!checked) {
                                    props.updateAgent((agent)=>{
                                        agent.syncGlobalConfig = checked;
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
                            ...props.agent.modelConfig
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
        className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_24___default()["context-prompt-row"]),
        children: [
            !focusingInput && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_24___default()["context-drag"]),
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_drag_svg__WEBPACK_IMPORTED_MODULE_11__/* ["default"] */ .Z, {})
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .Select */ .Ph, {
                        value: props.prompt.role,
                        className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_24___default()["context-role"]),
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
                className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_24___default()["context-content"]),
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
                className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_24___default()["context-delete-button"]),
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
            className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_24___default()["context-prompt"]),
            style: {
                marginBottom: 20
            },
            children: [
                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_hello_pangea_dnd__WEBPACK_IMPORTED_MODULE_25__/* .DragDropContext */ .Z5, {
                    onDragEnd: onDragEnd,
                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_hello_pangea_dnd__WEBPACK_IMPORTED_MODULE_25__/* .Droppable */ .bK, {
                        droppableId: "context-prompt-list",
                        children: (provided)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                ref: provided.innerRef,
                                ...provided.droppableProps,
                                children: [
                                    context.map((c, i)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_hello_pangea_dnd__WEBPACK_IMPORTED_MODULE_25__/* .Draggable */ ._l, {
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
                                                            className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_24___default()["context-prompt-insert"]),
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
                    className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_24___default()["context-prompt-row"]),
                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                        icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_add_svg__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {}),
                        text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Context.Add,
                        bordered: true,
                        className: (_chat_module_scss__WEBPACK_IMPORTED_MODULE_24___default()["context-prompt-button"]),
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
function AgentPage() {
    const navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_26__.useNavigate)();
    const agentStore = (0,_store_agent__WEBPACK_IMPORTED_MODULE_14__/* .useAgentStore */ .EW)();
    const chatStore = (0,_store__WEBPACK_IMPORTED_MODULE_15__/* .useChatStore */ .aK)();
    const [filterLang, setFilterLang] = (0,react__WEBPACK_IMPORTED_MODULE_20__.useState)();
    const allAgents = agentStore.getAll().filter((m)=>!filterLang || m.lang === filterLang);
    const [searchAgents, setSearchAgents] = (0,react__WEBPACK_IMPORTED_MODULE_20__.useState)([]);
    const [searchText, setSearchText] = (0,react__WEBPACK_IMPORTED_MODULE_20__.useState)("");
    const agents = searchText.length > 0 ? searchAgents : allAgents;
    // refactored already, now it accurate
    const onSearch = (text)=>{
        setSearchText(text);
        if (text.length > 0) {
            const result = allAgents.filter((m)=>m.name.toLowerCase().includes(text.toLowerCase()));
            setSearchAgents(result);
        } else {
            setSearchAgents(allAgents);
        }
    };
    const [editingAgentId, setEditingAgentId] = (0,react__WEBPACK_IMPORTED_MODULE_20__.useState)();
    const editingAgent = editingAgentId ? agentStore.get(editingAgentId) ?? allAgents.find((a)=>a.id === editingAgentId) : undefined;
    const closeAgentModal = ()=>setEditingAgentId(undefined);
    const downloadAll = ()=>{
        (0,_utils__WEBPACK_IMPORTED_MODULE_21__/* .downloadAs */ .CP)(JSON.stringify(agents.filter((v)=>!v.builtin)), _constant__WEBPACK_IMPORTED_MODULE_23__/* .FileName */ .dJ.Agents);
    };
    const importFromFile = ()=>{
        (0,_utils__WEBPACK_IMPORTED_MODULE_21__/* .readFromFile */ .j2)().then((content)=>{
            try {
                const importAgents = JSON.parse(content);
                if (Array.isArray(importAgents)) {
                    for (const agent of importAgents){
                        if (agent.name) {
                            agentStore.create(agent);
                        }
                    }
                    return;
                }
                //if the content is a single agent.
                if (importAgents.name) {
                    agentStore.create(importAgents);
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
                const importAgents = JSON.parse(data);
                if (Array.isArray(importAgents)) {
                    for (const agent of importAgents){
                        if (agent.name) {
                            agentStore.create(agent);
                        }
                    }
                    return;
                }
                //if the content is a single agent.
                if (importAgents.name) {
                    agentStore.create(importAgents);
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
                className: (_agent_module_scss__WEBPACK_IMPORTED_MODULE_27___default()["agent-page"]),
                children: [
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: "window-header",
                        children: [
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: "window-header-title",
                                children: [
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                        className: "window-header-main-title",
                                        children: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Page.Title
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                        className: "window-header-submai-title",
                                        children: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Page.SubTitle(allAgents.length)
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
                        className: (_agent_module_scss__WEBPACK_IMPORTED_MODULE_27___default()["agent-page-body"]),
                        children: [
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: (_agent_module_scss__WEBPACK_IMPORTED_MODULE_27___default()["agent-filter"]),
                                children: [
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                                        type: "text",
                                        className: (_agent_module_scss__WEBPACK_IMPORTED_MODULE_27___default()["search-bar"]),
                                        placeholder: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Page.Search,
                                        autoFocus: true,
                                        onInput: (e)=>onSearch(e.currentTarget.value)
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .Select */ .Ph, {
                                        className: (_agent_module_scss__WEBPACK_IMPORTED_MODULE_27___default()["agent-filter-lang"]),
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
                                        className: (_agent_module_scss__WEBPACK_IMPORTED_MODULE_27___default()["agent-create"]),
                                        icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_add_svg__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {}),
                                        text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Page.Create,
                                        bordered: true,
                                        onClick: ()=>{
                                            const createdAgent = agentStore.create();
                                            setEditingAgentId(createdAgent.id);
                                        }
                                    })
                                ]
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                children: agents.map((m)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: (_agent_module_scss__WEBPACK_IMPORTED_MODULE_27___default()["agent-item"]),
                                        children: [
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                className: (_agent_module_scss__WEBPACK_IMPORTED_MODULE_27___default()["agent-header"]),
                                                children: [
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                        className: (_agent_module_scss__WEBPACK_IMPORTED_MODULE_27___default()["agent-icon"]),
                                                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(AgentAvatar, {
                                                            avatar: m.avatar,
                                                            model: m.modelConfig.model
                                                        })
                                                    }),
                                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                        className: (_agent_module_scss__WEBPACK_IMPORTED_MODULE_27___default()["agent-title"]),
                                                        children: [
                                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                                className: (_agent_module_scss__WEBPACK_IMPORTED_MODULE_27___default()["agent-name"]),
                                                                children: m.name
                                                            }),
                                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                                className: (_agent_module_scss__WEBPACK_IMPORTED_MODULE_27___default()["agent-info"]) + " one-line",
                                                                children: `${_locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Item.Info(m.context.length)} / ${_locales__WEBPACK_IMPORTED_MODULE_19__/* .ALL_LANG_OPTIONS */ .nW[m.lang]} / ${m.modelConfig.model}`
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                className: (_agent_module_scss__WEBPACK_IMPORTED_MODULE_27___default()["agent-actions"]),
                                                children: [
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                                                        icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_add_svg__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {}),
                                                        text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Item.Chat,
                                                        onClick: ()=>{
                                                            chatStore.newSession(m);
                                                            navigate(_constant__WEBPACK_IMPORTED_MODULE_23__/* .Path */ .y$.Chat);
                                                        }
                                                    }),
                                                    m.builtin ? /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                                                        icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_eye_svg__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z, {}),
                                                        text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Item.View,
                                                        onClick: ()=>setEditingAgentId(m.id)
                                                    }) : /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                                                        icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_edit_svg__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z, {}),
                                                        text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Item.Edit,
                                                        onClick: ()=>setEditingAgentId(m.id)
                                                    }),
                                                    !m.builtin && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                                                        icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_delete_svg__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {}),
                                                        text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Item.Delete,
                                                        onClick: async ()=>{
                                                            if (await (0,_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .showConfirm */ .i0)(_locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.Item.DeleteConfirm)) {
                                                                agentStore.delete(m.id);
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
            editingAgent && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: "modal-mask",
                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_ui_lib__WEBPACK_IMPORTED_MODULE_17__/* .Modal */ .u_, {
                    title: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.EditModal.Title(editingAgent?.builtin),
                    onClose: closeAgentModal,
                    actions: [
                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                            icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_download_svg__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {}),
                            text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.EditModal.Download,
                            bordered: true,
                            onClick: ()=>(0,_utils__WEBPACK_IMPORTED_MODULE_21__/* .downloadAs */ .CP)(JSON.stringify(editingAgent), `${editingAgent.name}.json`)
                        }, "export"),
                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_button__WEBPACK_IMPORTED_MODULE_1__/* .IconButton */ .h, {
                            icon: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_icons_copy_svg__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z, {}),
                            bordered: true,
                            text: _locales__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .ZP.Agent.EditModal.Clone,
                            onClick: ()=>{
                                navigate(_constant__WEBPACK_IMPORTED_MODULE_23__/* .Path */ .y$.Agents);
                                agentStore.create(editingAgent);
                                setEditingAgentId(undefined);
                            }
                        }, "copy")
                    ],
                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(AgentConfig, {
                        agent: editingAgent,
                        updateAgent: (updater)=>agentStore.updateAgent(editingAgentId, updater),
                        readonly: editingAgent.builtin
                    })
                })
            })
        ]
    });
}


/***/ }),

/***/ 64853:
/***/ ((module) => {

// Exports
module.exports = {
	"agent-page": "agent_agent-page__xPrLy",
	"agent-page-body": "agent_agent-page-body__OnHe7",
	"agent-filter": "agent_agent-filter__y_mou",
	"slide-in": "agent_slide-in__5Z5Sl",
	"search-bar": "agent_search-bar__ilqmi",
	"agent-filter-lang": "agent_agent-filter-lang__NRAxJ",
	"agent-create": "agent_agent-create__B0wtw",
	"agent-item": "agent_agent-item__oynhR",
	"agent-header": "agent_agent-header__jmVwn",
	"agent-icon": "agent_agent-icon__xUYDF",
	"agent-title": "agent_agent-title__TVDbi",
	"agent-name": "agent_agent-name__buTKz",
	"agent-info": "agent_agent-info__HL5Zs",
	"agent-actions": "agent_agent-actions__kc64P",
	"slide-in-from-top": "agent_slide-in-from-top__wWFUV"
};


/***/ })

};
;