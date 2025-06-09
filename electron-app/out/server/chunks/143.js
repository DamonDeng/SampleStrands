"use strict";
exports.id = 143;
exports.ids = [143];
exports.modules = {

/***/ 70143:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MCPClientTest: () => (/* binding */ MCPClientTest)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(56786);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(18038);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _modelcontextprotocol_sdk_client_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(10732);
/* __next_internal_client_entry_do_not_use__ MCPClientTest auto */ 


// Conditionally import StdioClientTransport only if we're in a Node.js environment
let StdioClientTransport = null;
if (true) {
    // Server-side or Node.js environment
    try {
        StdioClientTransport = (__webpack_require__(62202).StdioClientTransport);
    } catch (e) {
        console.warn("StdioClientTransport not available in this environment");
    }
}
function MCPClientTest() {
    const [client, setClient] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    const [connected, setConnected] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [testResults, setTestResults] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    const [serverCommand, setServerCommand] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("node");
    const [serverArgs, setServerArgs] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("server.js");
    const [promptName, setPromptName] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("example-prompt");
    const [promptArg, setPromptArg] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('{"arg1": "value"}');
    const [resourceUri, setResourceUri] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("file:///example.txt");
    const [toolName, setToolName] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("example-tool");
    const [toolArgs, setToolArgs] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('{"arg1": "value"}');
    const [isBrowser, setIsBrowser] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        setIsBrowser("undefined" !== "undefined");
    }, []);
    const addTestResult = (operation, status, data, error)=>{
        const result = {
            operation,
            status,
            data,
            error,
            timestamp: new Date().toISOString()
        };
        setTestResults((prev)=>[
                result,
                ...prev
            ]);
        return result;
    };
    const connectToServer = async ()=>{
        setLoading(true);
        const result = addTestResult("Connect to MCP Server", "pending");
        try {
            if (isBrowser) {
                throw new Error("StdioClientTransport is not supported in browser environments. This transport requires Node.js process spawning capabilities.");
            }
            if (!StdioClientTransport) {
                throw new Error("StdioClientTransport is not available in this environment.");
            }
            const transport = new StdioClientTransport({
                command: serverCommand,
                args: serverArgs.split(" ")
            });
            const newClient = new _modelcontextprotocol_sdk_client_index_js__WEBPACK_IMPORTED_MODULE_2__/* .Client */ .K({
                name: "mcp-test-client",
                version: "1.0.0"
            });
            await newClient.connect(transport);
            setClient(newClient);
            setConnected(true);
            setTestResults((prev)=>prev.map((r)=>r === result ? {
                        ...r,
                        status: "success",
                        data: "Connected successfully"
                    } : r));
        } catch (error) {
            setConnected(false);
            setTestResults((prev)=>prev.map((r)=>r === result ? {
                        ...r,
                        status: "error",
                        error: error instanceof Error ? error.message : String(error)
                    } : r));
        } finally{
            setLoading(false);
        }
    };
    const disconnectFromServer = async ()=>{
        if (client) {
            try {
                await client.close();
                setClient(null);
                setConnected(false);
                addTestResult("Disconnect from MCP Server", "success", "Disconnected successfully");
            } catch (error) {
                addTestResult("Disconnect from MCP Server", "error", null, error instanceof Error ? error.message : String(error));
            }
        }
    };
    const listPrompts = async ()=>{
        if (!client || !connected) {
            addTestResult("List Prompts", "error", null, "Client not connected");
            return;
        }
        setLoading(true);
        const result = addTestResult("List Prompts", "pending");
        try {
            const prompts = await client.listPrompts();
            setTestResults((prev)=>prev.map((r)=>r === result ? {
                        ...r,
                        status: "success",
                        data: prompts
                    } : r));
        } catch (error) {
            setTestResults((prev)=>prev.map((r)=>r === result ? {
                        ...r,
                        status: "error",
                        error: error instanceof Error ? error.message : String(error)
                    } : r));
        } finally{
            setLoading(false);
        }
    };
    const getPrompt = async ()=>{
        if (!client || !connected) {
            addTestResult("Get Prompt", "error", null, "Client not connected");
            return;
        }
        setLoading(true);
        const result = addTestResult("Get Prompt", "pending");
        try {
            let args;
            try {
                args = JSON.parse(promptArg);
            } catch  {
                args = {
                    arg1: promptArg
                };
            }
            const prompt = await client.getPrompt({
                name: promptName,
                arguments: args
            });
            setTestResults((prev)=>prev.map((r)=>r === result ? {
                        ...r,
                        status: "success",
                        data: prompt
                    } : r));
        } catch (error) {
            setTestResults((prev)=>prev.map((r)=>r === result ? {
                        ...r,
                        status: "error",
                        error: error instanceof Error ? error.message : String(error)
                    } : r));
        } finally{
            setLoading(false);
        }
    };
    const listResources = async ()=>{
        if (!client || !connected) {
            addTestResult("List Resources", "error", null, "Client not connected");
            return;
        }
        setLoading(true);
        const result = addTestResult("List Resources", "pending");
        try {
            const resources = await client.listResources();
            setTestResults((prev)=>prev.map((r)=>r === result ? {
                        ...r,
                        status: "success",
                        data: resources
                    } : r));
        } catch (error) {
            setTestResults((prev)=>prev.map((r)=>r === result ? {
                        ...r,
                        status: "error",
                        error: error instanceof Error ? error.message : String(error)
                    } : r));
        } finally{
            setLoading(false);
        }
    };
    const readResource = async ()=>{
        if (!client || !connected) {
            addTestResult("Read Resource", "error", null, "Client not connected");
            return;
        }
        setLoading(true);
        const result = addTestResult("Read Resource", "pending");
        try {
            const resource = await client.readResource({
                uri: resourceUri
            });
            setTestResults((prev)=>prev.map((r)=>r === result ? {
                        ...r,
                        status: "success",
                        data: resource
                    } : r));
        } catch (error) {
            setTestResults((prev)=>prev.map((r)=>r === result ? {
                        ...r,
                        status: "error",
                        error: error instanceof Error ? error.message : String(error)
                    } : r));
        } finally{
            setLoading(false);
        }
    };
    const callTool = async ()=>{
        if (!client || !connected) {
            addTestResult("Call Tool", "error", null, "Client not connected");
            return;
        }
        setLoading(true);
        const result = addTestResult("Call Tool", "pending");
        try {
            let args;
            try {
                args = JSON.parse(toolArgs);
            } catch  {
                args = {
                    arg1: toolArgs
                };
            }
            const toolResult = await client.callTool({
                name: toolName,
                arguments: args
            });
            setTestResults((prev)=>prev.map((r)=>r === result ? {
                        ...r,
                        status: "success",
                        data: toolResult
                    } : r));
        } catch (error) {
            setTestResults((prev)=>prev.map((r)=>r === result ? {
                        ...r,
                        status: "error",
                        error: error instanceof Error ? error.message : String(error)
                    } : r));
        } finally{
            setLoading(false);
        }
    };
    const clearResults = ()=>{
        setTestResults([]);
    };
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        return ()=>{
            if (client && connected) {
                client.close().catch(console.error);
            }
        };
    }, [
        client,
        connected
    ]);
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        className: "max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg",
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h2", {
                className: "text-2xl font-bold mb-6 text-gray-800",
                children: "MCP Client Test"
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                className: "space-y-6",
                children: [
                    isBrowser && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: "bg-yellow-50 border border-yellow-200 p-4 rounded-md",
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                className: "font-semibold text-yellow-800 mb-2",
                                children: "⚠️ Browser Environment Detected"
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                className: "text-yellow-700 text-sm",
                                children: "You are running in a browser environment. The StdioClientTransport requires Node.js process spawning capabilities and will not work here. This interface demonstrates the MCP client API structure, but actual connections require a server-side implementation or alternative transport methods like WebSocket."
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: "border-b pb-6",
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h3", {
                                className: "text-lg font-semibold mb-4 text-gray-700",
                                children: "Server Connection"
                            }),
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4",
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("label", {
                                                className: "block text-sm font-medium text-gray-700 mb-2",
                                                children: "Server Command:"
                                            }),
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                                                type: "text",
                                                value: serverCommand,
                                                onChange: (e)=>setServerCommand(e.target.value),
                                                disabled: connected,
                                                className: "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100",
                                                placeholder: "node"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("label", {
                                                className: "block text-sm font-medium text-gray-700 mb-2",
                                                children: "Server Arguments:"
                                            }),
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                                                type: "text",
                                                value: serverArgs,
                                                onChange: (e)=>setServerArgs(e.target.value),
                                                disabled: connected,
                                                className: "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100",
                                                placeholder: "server.js"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: "flex space-x-3",
                                children: [
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                        onClick: connectToServer,
                                        disabled: loading || connected,
                                        className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50",
                                        children: loading ? "Connecting..." : "Connect"
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                        onClick: disconnectFromServer,
                                        disabled: !connected,
                                        className: "px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50",
                                        children: "Disconnect"
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                        className: `px-3 py-2 rounded font-semibold ${connected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`,
                                        children: connected ? "✅ Connected" : "❌ Not Connected"
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: "border-b pb-6",
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h3", {
                                className: "text-lg font-semibold mb-4 text-gray-700",
                                children: "Test Operations"
                            }),
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "space-y-3",
                                        children: [
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h4", {
                                                className: "font-medium text-gray-600",
                                                children: "Prompts"
                                            }),
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                                onClick: listPrompts,
                                                disabled: !connected || loading,
                                                className: "w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50",
                                                children: "List Prompts"
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                                                        type: "text",
                                                        value: promptName,
                                                        onChange: (e)=>setPromptName(e.target.value),
                                                        className: "w-full p-2 border border-gray-300 rounded-md text-sm",
                                                        placeholder: "Prompt name"
                                                    }),
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                                                        type: "text",
                                                        value: promptArg,
                                                        onChange: (e)=>setPromptArg(e.target.value),
                                                        className: "w-full p-2 border border-gray-300 rounded-md text-sm",
                                                        placeholder: "Arguments (JSON)"
                                                    }),
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                                        onClick: getPrompt,
                                                        disabled: !connected || loading,
                                                        className: "w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50",
                                                        children: "Get Prompt"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "space-y-3",
                                        children: [
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h4", {
                                                className: "font-medium text-gray-600",
                                                children: "Resources"
                                            }),
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                                onClick: listResources,
                                                disabled: !connected || loading,
                                                className: "w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50",
                                                children: "List Resources"
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                                                        type: "text",
                                                        value: resourceUri,
                                                        onChange: (e)=>setResourceUri(e.target.value),
                                                        className: "w-full p-2 border border-gray-300 rounded-md text-sm",
                                                        placeholder: "Resource URI"
                                                    }),
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                                        onClick: readResource,
                                                        disabled: !connected || loading,
                                                        className: "w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50",
                                                        children: "Read Resource"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "space-y-3 md:col-span-2",
                                        children: [
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h4", {
                                                className: "font-medium text-gray-600",
                                                children: "Tools"
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                className: "grid grid-cols-1 md:grid-cols-3 gap-3",
                                                children: [
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                                                        type: "text",
                                                        value: toolName,
                                                        onChange: (e)=>setToolName(e.target.value),
                                                        className: "p-2 border border-gray-300 rounded-md text-sm",
                                                        placeholder: "Tool name"
                                                    }),
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                                                        type: "text",
                                                        value: toolArgs,
                                                        onChange: (e)=>setToolArgs(e.target.value),
                                                        className: "p-2 border border-gray-300 rounded-md text-sm",
                                                        placeholder: "Arguments (JSON)"
                                                    }),
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                                        onClick: callTool,
                                                        disabled: !connected || loading,
                                                        className: "px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50",
                                                        children: "Call Tool"
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        children: [
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: "flex justify-between items-center mb-4",
                                children: [
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h3", {
                                        className: "text-lg font-semibold text-gray-700",
                                        children: "Test Results"
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                        onClick: clearResults,
                                        className: "px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm",
                                        children: "Clear Results"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                className: "space-y-3 max-h-96 overflow-y-auto",
                                children: testResults.length === 0 ? /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                    className: "text-gray-500 text-center py-8",
                                    children: "No test results yet. Try connecting and running some operations!"
                                }) : testResults.map((result, index)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: `p-4 rounded-md border ${result.status === "success" ? "bg-green-50 border-green-200" : result.status === "error" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`,
                                        children: [
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                className: "flex justify-between items-start mb-2",
                                                children: [
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h4", {
                                                        className: "font-semibold text-gray-800",
                                                        children: result.operation
                                                    }),
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                                                        className: `text-sm font-medium ${result.status === "success" ? "text-green-700" : result.status === "error" ? "text-red-700" : "text-yellow-700"}`,
                                                        children: result.status.toUpperCase()
                                                    })
                                                ]
                                            }),
                                            result.error && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                className: "mb-2",
                                                children: [
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("strong", {
                                                        className: "text-red-800",
                                                        children: "Error:"
                                                    }),
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                        className: "text-red-700 text-sm",
                                                        children: result.error
                                                    })
                                                ]
                                            }),
                                            result.data && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                className: "mb-2",
                                                children: [
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("strong", {
                                                        className: "text-gray-800",
                                                        children: "Data:"
                                                    }),
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("pre", {
                                                        className: "text-sm bg-gray-100 p-2 rounded mt-1 overflow-x-auto",
                                                        children: typeof result.data === "string" ? result.data : JSON.stringify(result.data, null, 2)
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                className: "text-xs text-gray-500",
                                                children: new Date(result.timestamp).toLocaleString()
                                            })
                                        ]
                                    }, index))
                            })
                        ]
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "text-sm text-gray-500 border-t pt-4",
                        children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                            className: "bg-blue-50 border border-blue-200 p-3 rounded-md",
                            children: [
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                    className: "font-semibold mb-1",
                                    children: "\uD83D\uDCDD Note about MCP Client Testing"
                                }),
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                    className: "text-xs",
                                    children: "This is a demonstration of MCP client functionality. In a web environment, the StdioClientTransport cannot work as it requires Node.js process spawning capabilities. For production use in web browsers, you would need a different transport mechanism such as:"
                                }),
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("ul", {
                                    className: "text-xs mt-2 ml-4 list-disc",
                                    children: [
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("li", {
                                            children: "WebSocket transport to communicate with a WebSocket-enabled MCP server"
                                        }),
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("li", {
                                            children: "HTTP transport for REST-based MCP communication"
                                        }),
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("li", {
                                            children: "Server-side proxy that handles the stdio communication"
                                        })
                                    ]
                                })
                            ]
                        })
                    })
                ]
            })
        ]
    });
}


/***/ })

};
;