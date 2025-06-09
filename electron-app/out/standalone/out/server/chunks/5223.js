"use strict";
exports.id = 5223;
exports.ids = [5223];
exports.modules = {

/***/ 5223:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  PythonTest: () => (/* binding */ PythonTest)
});

// EXTERNAL MODULE: external "next/dist/compiled/react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(56786);
// EXTERNAL MODULE: external "next/dist/compiled/react"
var react_ = __webpack_require__(18038);
;// CONCATENATED MODULE: ./app/utils/python-bridge.ts
/**
 * Python Bridge Utility for Tauri
 * Provides methods to communicate with Python scripts from TypeScript
 */ // Check if we're running in Tauri environment
const isTauri = ()=>{
    return  false && 0;
};
class PythonBridge {
    static{
        this.pythonPath = "python3" // You might need to adjust this path
        ;
    }
    static{
        this.scriptPath = "./python/main_entry.py" // Relative to the app root
        ;
    }
    /**
   * Execute Python script with command line arguments
   * This is the simplest approach but requires shell permissions
   */ static async executeWithArgs(inputText) {
        if (!isTauri()) {
            // Web environment fallback - simulate Python processing
            return this.simulatePythonProcessing(inputText);
        }
        try {
            // For Tauri v1, we need to use the proper shell API
            const { invoke } = window.__TAURI__ || {};
            if (!invoke) {
                throw new Error("Tauri shell API not available");
            }
            // Use Tauri's shell plugin via invoke
            const result = await invoke("plugin:shell|execute", {
                program: this.pythonPath,
                args: [
                    this.scriptPath,
                    "--input",
                    inputText
                ],
                options: {
                    cwd: null,
                    env: null
                }
            });
            if (result.code === 0) {
                try {
                    return JSON.parse(result.stdout);
                } catch (parseError) {
                    throw new Error(`Failed to parse Python output: ${parseError}`);
                }
            } else {
                throw new Error(`Python script failed with code ${result.code}: ${result.stderr}`);
            }
        } catch (error) {
            console.error("Python execution error:", error);
            // Fallback: try the v2 API approach if v1 fails
            try {
                const { Command } = await __webpack_require__.e(/* import() */ 6392).then(__webpack_require__.bind(__webpack_require__, 26392));
                const command = Command.create(this.pythonPath, [
                    this.scriptPath,
                    "--input",
                    inputText
                ]);
                const output = await command.execute();
                if (output.code === 0) {
                    try {
                        return JSON.parse(output.stdout);
                    } catch (parseError) {
                        throw new Error(`Failed to parse Python output: ${parseError}`);
                    }
                } else {
                    throw new Error(`Python script failed with code ${output.code}: ${output.stderr}`);
                }
            } catch (fallbackError) {
                console.error("Both Tauri v1 and v2 approaches failed:", fallbackError);
                return {
                    status: "error",
                    error: error instanceof Error ? error.message : String(error),
                    timestamp: new Date().toISOString()
                };
            }
        }
    }
    /**
   * Simulate Python processing for web environment
   */ static async simulatePythonProcessing(inputText) {
        // Simulate async processing delay
        await new Promise((resolve)=>setTimeout(resolve, 500));
        return {
            status: "success",
            original_input: inputText,
            processed_output: `Processed: ${inputText}`,
            length: inputText.length,
            uppercase: inputText.toUpperCase(),
            reversed: inputText.split("").reverse().join(""),
            timestamp: new Date().toISOString()
        };
    }
    /**
   * Test if Python is available and the script works
   */ static async testConnection() {
        if (!isTauri()) {
            // In web environment, always return true for simulation
            return true;
        }
        try {
            const result = await this.executeWithArgs("test connection");
            return result.status === "success";
        } catch  {
            return false;
        }
    }
    /**
   * Get Python version and script info
   */ static async getInfo() {
        if (!isTauri()) {
            // Return simulated info for web environment
            return {
                pythonVersion: "Python 3.x (Simulated in Web)",
                scriptPath: this.scriptPath,
                isWorking: true
            };
        }
        try {
            // Try Tauri v1 API first
            const { invoke } = window.__TAURI__ || {};
            if (invoke) {
                try {
                    const versionResult = await invoke("plugin:shell|execute", {
                        program: this.pythonPath,
                        args: [
                            "--version"
                        ],
                        options: {
                            cwd: null,
                            env: null
                        }
                    });
                    const isWorking = await this.testConnection();
                    return {
                        pythonVersion: versionResult.code === 0 ? versionResult.stdout.trim() : undefined,
                        scriptPath: this.scriptPath,
                        isWorking
                    };
                } catch (v1Error) {
                    console.log("Tauri v1 API failed, trying v2...", v1Error);
                }
            }
            // Fallback to Tauri v2 API
            const { Command } = await __webpack_require__.e(/* import() */ 6392).then(__webpack_require__.bind(__webpack_require__, 26392));
            // Test Python version
            const versionCommand = Command.create(this.pythonPath, [
                "--version"
            ]);
            const versionOutput = await versionCommand.execute();
            const isWorking = await this.testConnection();
            return {
                pythonVersion: versionOutput.code === 0 ? versionOutput.stdout.trim() : undefined,
                scriptPath: this.scriptPath,
                isWorking
            };
        } catch (error) {
            console.error("Failed to get Python info:", error);
            return {
                scriptPath: this.scriptPath,
                isWorking: false
            };
        }
    }
}
/**
 * Convenience function for simple text processing
 */ async function processPythonText(text) {
    return PythonBridge.executeWithArgs(text);
}

;// CONCATENATED MODULE: ./app/components/PythonTest.tsx
/* __next_internal_client_entry_do_not_use__ PythonTest auto */ 


function PythonTest() {
    const [inputText, setInputText] = (0,react_.useState)("");
    const [output, setOutput] = (0,react_.useState)(null);
    const [loading, setLoading] = (0,react_.useState)(false);
    const [error, setError] = (0,react_.useState)(null);
    const [pythonInfo, setPythonInfo] = (0,react_.useState)(null);
    const [isTauriEnv, setIsTauriEnv] = (0,react_.useState)(false);
    (0,react_.useEffect)(()=>{
        // Check if running in Tauri environment
        const checkTauriEnv = ()=>{
            return  false && 0;
        };
        setIsTauriEnv(checkTauriEnv());
    }, []);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!inputText.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const result = await processPythonText(inputText);
            setOutput(result);
            if (result.status === "error") {
                setError(result.error || "Unknown Python error");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally{
            setLoading(false);
        }
    };
    const testConnection = async ()=>{
        setLoading(true);
        setError(null);
        try {
            const info = await PythonBridge.getInfo();
            setPythonInfo(info);
            if (!info.isWorking) {
                setError("Python script is not working correctly");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: "max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg",
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx("h2", {
                className: "text-2xl font-bold mb-6 text-gray-800",
                children: "Python Integration Test"
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: "space-y-6",
                children: [
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: "border-b pb-4",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                onClick: testConnection,
                                disabled: loading,
                                className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50",
                                children: loading ? "Testing..." : "Test Python Connection"
                            }),
                            pythonInfo && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                className: "mt-3 p-3 bg-gray-50 rounded",
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("p", {
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                                children: "Python Version:"
                                            }),
                                            " ",
                                            pythonInfo.pythonVersion || "Unknown"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("p", {
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                                children: "Script Path:"
                                            }),
                                            " ",
                                            pythonInfo.scriptPath
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("p", {
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                                children: "Status:"
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                                className: `ml-2 font-semibold ${pythonInfo.isWorking ? "text-green-600" : "text-red-600"}`,
                                                children: pythonInfo.isWorking ? "✅ Working" : "❌ Not Working"
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("form", {
                        onSubmit: handleSubmit,
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ jsx_runtime_.jsx("label", {
                                        htmlFor: "pythonInput",
                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                        children: "Send text to Python:"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("textarea", {
                                        id: "pythonInput",
                                        value: inputText,
                                        onChange: (e)=>setInputText(e.target.value),
                                        placeholder: "Type your message here...",
                                        className: "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                        rows: 3
                                    })
                                ]
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                type: "submit",
                                disabled: loading || !inputText.trim(),
                                className: "w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50",
                                children: loading ? "Processing..." : "Send to Python"
                            })
                        ]
                    }),
                    error && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: "p-4 bg-red-50 border border-red-200 rounded-md",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("p", {
                                className: "text-red-800 font-semibold",
                                children: "Error:"
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("p", {
                                className: "text-red-700",
                                children: error
                            })
                        ]
                    }),
                    output && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("h3", {
                                className: "text-lg font-semibold text-gray-800",
                                children: "Python Response:"
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: `p-4 rounded-md border ${output.status === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`,
                                children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 gap-3 text-sm",
                                    children: [
                                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                                    children: "Status:"
                                                }),
                                                /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                                    className: `ml-2 ${output.status === "success" ? "text-green-700" : "text-red-700"}`,
                                                    children: output.status
                                                })
                                            ]
                                        }),
                                        output.original_input && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                                    children: "Original Input:"
                                                }),
                                                /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                    className: "text-gray-600 mt-1",
                                                    children: output.original_input
                                                })
                                            ]
                                        }),
                                        output.processed_output && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                            className: "md:col-span-2",
                                            children: [
                                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                                    children: "Processed Output:"
                                                }),
                                                /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                    className: "text-gray-700 mt-1 font-mono",
                                                    children: output.processed_output
                                                })
                                            ]
                                        }),
                                        output.length !== undefined && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                                    children: "Length:"
                                                }),
                                                " ",
                                                output.length
                                            ]
                                        }),
                                        output.uppercase && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                                    children: "Uppercase:"
                                                }),
                                                /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                    className: "text-gray-600 mt-1",
                                                    children: output.uppercase
                                                })
                                            ]
                                        }),
                                        output.reversed && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                                    children: "Reversed:"
                                                }),
                                                /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                    className: "text-gray-600 mt-1 font-mono",
                                                    children: output.reversed
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                            className: "md:col-span-2",
                                            children: [
                                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                                    children: "Timestamp:"
                                                }),
                                                " ",
                                                new Date(output.timestamp).toLocaleString()
                                            ]
                                        }),
                                        output.error && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                            className: "md:col-span-2",
                                            children: [
                                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                                    children: "Error:"
                                                }),
                                                /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                    className: "text-red-600 mt-1",
                                                    children: output.error
                                                })
                                            ]
                                        })
                                    ]
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: "text-sm text-gray-500 border-t pt-4",
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                className: `mb-3 p-3 rounded-md ${isTauriEnv ? "bg-green-50 border border-green-200" : "bg-blue-50 border border-blue-200"}`,
                                children: [
                                    /*#__PURE__*/ jsx_runtime_.jsx("p", {
                                        className: "font-semibold mb-1",
                                        children: isTauriEnv ? "\uD83D\uDE80 Running in Tauri Desktop Mode" : "\uD83C\uDF10 Running in Web Mode"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("p", {
                                        className: "text-xs",
                                        children: isTauriEnv ? "Connected to actual Python backend via Tauri shell commands." : "Using simulated Python processing for web environment. Install and run as Tauri app for real Python integration."
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("p", {
                                children: [
                                    /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                        children: "How it works:"
                                    }),
                                    isTauriEnv ? " This demo sends your text to a Python script via Tauri's shell commands, processes it, and returns structured JSON data back to TypeScript." : " In web mode, this demo simulates Python processing locally. When running as a Tauri desktop app, it will connect to actual Python scripts."
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });
}


/***/ })

};
;