exports.id = 7564;
exports.ids = [7564];
exports.modules = {

/***/ 75748:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

Promise.resolve(/* import() eager */).then(__webpack_require__.bind(__webpack_require__, 82494));
Promise.resolve(/* import() eager */).then(__webpack_require__.bind(__webpack_require__, 49967));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 60209, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 78124, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 82927, 23))

/***/ }),

/***/ 25057:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  g: () => (/* binding */ getServerSideConfig)
});

// EXTERNAL MODULE: ./node_modules/spark-md5/spark-md5.js
var spark_md5 = __webpack_require__(46033);
var spark_md5_default = /*#__PURE__*/__webpack_require__.n(spark_md5);
;// CONCATENATED MODULE: ./app/constant.ts
const OWNER = "aws-samples";
const REPO = "sample-client-for-amazon-bedrock";
const REPO_URL = (/* unused pure expression or super */ null && (`https://github.com/${OWNER}/${REPO}`));
const ISSUE_URL = (/* unused pure expression or super */ null && (`https://github.com/${OWNER}/${REPO}/issues`));
const UPDATE_URL = (/* unused pure expression or super */ null && (`${REPO_URL}#keep-updated`));
const RELEASE_URL = (/* unused pure expression or super */ null && (`${REPO_URL}/releases`));
const FETCH_COMMIT_URL = (/* unused pure expression or super */ null && (`https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=1`));
const FETCH_TAG_URL = (/* unused pure expression or super */ null && (`https://api.github.com/repos/${OWNER}/${REPO}/tags?per_page=1`));
const RUNTIME_CONFIG_DOM = "danger-runtime-config";
const DEFAULT_API_HOST = "https://api.nextchat.dev";
const OPENAI_BASE_URL = "https://api.openai.com";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/";
var Path;
(function(Path) {
    Path["Home"] = "/";
    Path["Chat"] = "/chat";
    Path["Settings"] = "/settings";
    Path["NewChat"] = "/new-chat";
    Path["Masks"] = "/masks";
    Path["Agents"] = "/agents";
    Path["Auth"] = "/auth";
    Path["PythonTest"] = "/python-test";
    Path["MCPTest"] = "/mcp-test";
})(Path || (Path = {}));
var ApiPath;
(function(ApiPath) {
    ApiPath["Cors"] = "/api/cors";
    ApiPath["OpenAI"] = "/api/openai";
})(ApiPath || (ApiPath = {}));
var SlotID;
(function(SlotID) {
    SlotID["AppBody"] = "app-body";
    SlotID["CustomModel"] = "custom-model";
})(SlotID || (SlotID = {}));
var FileName;
(function(FileName) {
    FileName["Masks"] = "masks.json";
    FileName["Agents"] = "agents.json";
    FileName["Prompts"] = "prompts.json";
})(FileName || (FileName = {}));
var StoreKey;
(function(StoreKey) {
    StoreKey["Chat"] = "chat-store";
    StoreKey["Access"] = "access-control";
    StoreKey["Config"] = "app-config";
    StoreKey["Mask"] = "mask-store";
    StoreKey["Agent"] = "agent-store";
    StoreKey["Prompt"] = "prompt-store";
    StoreKey["Update"] = "chat-update";
    StoreKey["Sync"] = "sync";
    StoreKey["BedrockModels"] = "bedrock-models";
})(StoreKey || (StoreKey = {}));
const DEFAULT_SIDEBAR_WIDTH = 300;
const MAX_SIDEBAR_WIDTH = 500;
const MIN_SIDEBAR_WIDTH = 230;
const NARROW_SIDEBAR_WIDTH = 100;
const ACCESS_CODE_PREFIX = "nk-";
const LAST_INPUT_KEY = "last-input";
const UNFINISHED_INPUT = (id)=>"unfinished-input-" + id;
const STORAGE_KEY = "chatgpt-next-web";
const REQUEST_TIMEOUT_MS = 60000;
const EXPORT_MESSAGE_CLASS_NAME = "export-markdown";
var UseBRProxy;
(function(UseBRProxy) {
    UseBRProxy["True"] = "True";
    UseBRProxy["False"] = "False";
})(UseBRProxy || (UseBRProxy = {}));
var ServiceProvider;
(function(ServiceProvider) {
    ServiceProvider["OpenAI"] = "OpenAI";
    ServiceProvider["Azure"] = "Azure";
    ServiceProvider["Google"] = "Google";
    ServiceProvider["AWS"] = "AWS";
})(ServiceProvider || (ServiceProvider = {}));
var ModelProvider;
(function(ModelProvider) {
    ModelProvider["GPT"] = "GPT";
    ModelProvider["GeminiPro"] = "GeminiPro";
    ModelProvider[// Anthropic = "Anthropic",
    "Claude"] = "Claude";
    ModelProvider["AWS"] = "AWS";
})(ModelProvider || (ModelProvider = {}));
const OpenaiPath = {
    ChatPath: "v1/chat/completions",
    UsagePath: "dashboard/billing/usage",
    SubsPath: "dashboard/billing/subscription",
    ListModelPath: "v1/models"
};
const Azure = {
    ExampleEndpoint: "https://{resource-url}/openai/deployments/{deploy-id}"
};
const Google = {
    ExampleEndpoint: "https://generativelanguage.googleapis.com/",
    ChatPath: "v1beta/models/gemini-pro:generateContent",
    VisionChatPath: "v1beta/models/gemini-pro-vision:generateContent"
};
const BRProxy = {
    ExampleEndpoint: "https://Your-BRConnector-Url",
    ChatPath: "v1/chat/completions"
};
const DEFAULT_INPUT_TEMPLATE = (/* unused pure expression or super */ null && (`{{input}}`)); // input / time / model / lang
const DEFAULT_SYSTEM_TEMPLATE = (/* unused pure expression or super */ null && (`
You are ChatGPT, a large language model trained by {{ServiceProvider}}.
Knowledge cutoff: {{cutoff}}
Current model: {{model}}
Current time: {{time}}
Latex inline: $x^2$ 
Latex block: $$e=mc^2$$
`));
const SUMMARIZE_MODEL = "gpt-3.5-turbo";
const GEMINI_SUMMARIZE_MODEL = "gemini-pro";
const KnowledgeCutOffDate = {
    default: "2021-09",
    "gpt-4-turbo-preview": "2023-12",
    "gpt-4-1106-preview": "2023-04",
    "gpt-4-0125-preview": "2023-12",
    "gpt-4-vision-preview": "2023-04",
    // After improvements,
    // it's now easier to add "KnowledgeCutOffDate" instead of stupid hardcoding it, as was done previously.
    "gemini-pro": "2023-12"
};
const DEFAULT_MODELS = [
    {
        name: "claude-3-sonnet",
        available: true,
        modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
        anthropic_version: "bedrock-2023-05-31",
        displayName: "Claude3 sonnet",
        provider: {
            id: "aws",
            providerName: "AWS",
            providerType: "aws"
        }
    },
    {
        name: "claude-3-haiku",
        available: true,
        modelId: "anthropic.claude-3-haiku-20240307-v1:0",
        anthropic_version: "bedrock-2023-05-31",
        displayName: "Claude3 haiku",
        provider: {
            id: "aws",
            providerName: "AWS",
            providerType: "aws"
        }
    },
    {
        name: "claude-3.7-sonnet",
        available: true,
        modelId: "anthropic.claude-3-7-sonnet-20250219-v1:0",
        anthropic_version: "bedrock-2023-05-31",
        displayName: "Claude3.7 sonnet",
        provider: {
            id: "aws",
            providerName: "AWS",
            providerType: "aws"
        }
    }
];
const REASONING_MODEL = (/* unused pure expression or super */ null && ([
    "claude-3.7-sonnet"
]));
const CHAT_PAGE_SIZE = 15;
const MAX_RENDER_MSG_COUNT = 45;

;// CONCATENATED MODULE: ./app/config/server.ts


const ACCESS_CODES = function getAccessCodes() {
    const code = process.env.CODE;
    try {
        const codes = (code?.split(",") ?? []).filter((v)=>!!v).map((v)=>spark_md5_default().hash(v.trim()));
        return new Set(codes);
    } catch (e) {
        return new Set();
    }
}();
const getServerSideConfig = ()=>{
    if (typeof process === "undefined") {
        throw Error("[Server Config] you are importing a nodejs-only module outside of nodejs");
    }
    const disableGPT4 = !!process.env.DISABLE_GPT4;
    let customModels = process.env.CUSTOM_MODELS ?? "";
    if (disableGPT4) {
        if (customModels) customModels += ",";
        customModels += DEFAULT_MODELS.filter((m)=>m.name.startsWith("gpt-4")).map((m)=>"-" + m.name).join(",");
    }
    const isAzure = !!process.env.AZURE_URL;
    const isGoogle = !!process.env.GOOGLE_API_KEY;
    const apiKeyEnvVar = process.env.OPENAI_API_KEY ?? "";
    const apiKeys = apiKeyEnvVar.split(",").map((v)=>v.trim());
    const randomIndex = Math.floor(Math.random() * apiKeys.length);
    const apiKey = apiKeys[randomIndex];
    console.log(`[Server Config] using ${randomIndex + 1} of ${apiKeys.length} api key`);
    return {
        baseUrl: process.env.BASE_URL,
        apiKey,
        openaiOrgId: process.env.OPENAI_ORG_ID,
        isAzure,
        azureUrl: process.env.AZURE_URL,
        azureApiKey: process.env.AZURE_API_KEY,
        azureApiVersion: process.env.AZURE_API_VERSION,
        isGoogle,
        googleApiKey: process.env.GOOGLE_API_KEY,
        googleUrl: process.env.GOOGLE_URL,
        gtmId: process.env.GTM_ID,
        needCode: ACCESS_CODES.size > 0,
        code: process.env.CODE,
        codes: ACCESS_CODES,
        proxyUrl: process.env.PROXY_URL,
        isVercel: !!process.env.VERCEL,
        hideUserApiKey: !!process.env.HIDE_USER_API_KEY,
        disableGPT4,
        hideBalanceQuery: !process.env.ENABLE_BALANCE_QUERY,
        disableFastLink: !!process.env.DISABLE_FAST_LINK,
        customModels
    };
};


/***/ }),

/***/ 95818:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ RootLayout),
  metadata: () => (/* binding */ metadata)
});

// EXTERNAL MODULE: external "next/dist/compiled/react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(56786);
// EXTERNAL MODULE: ./app/styles/globals.scss
var globals = __webpack_require__(38036);
// EXTERNAL MODULE: ./app/styles/markdown.scss
var markdown = __webpack_require__(65322);
// EXTERNAL MODULE: ./app/styles/highlight.scss
var highlight = __webpack_require__(86741);
;// CONCATENATED MODULE: ./src-tauri/tauri.conf.json
const tauri_conf_namespaceObject = {"DR":{"i":"1.2.6"}};
;// CONCATENATED MODULE: ./app/config/build.ts

const getBuildConfig = ()=>{
    if (typeof process === "undefined") {
        throw Error("[Server Config] you are importing a nodejs-only module outside of nodejs");
    }
    const buildMode = process.env.BUILD_MODE ?? "standalone";
    const isApp = !!process.env.BUILD_APP;
    const version = "v" + tauri_conf_namespaceObject.DR.i;
    const commitInfo = (()=>{
        try {
            const childProcess = __webpack_require__(32081);
            const commitDate = childProcess.execSync('git log -1 --format="%at000" --date=unix').toString().trim();
            const commitHash = childProcess.execSync('git log --pretty=format:"%H" -n 1').toString().trim();
            return {
                commitDate,
                commitHash
            };
        } catch (e) {
            console.error("[Build Config] No git or not from git repo.");
            return {
                commitDate: "unknown",
                commitHash: "unknown"
            };
        }
    })();
    return {
        version,
        ...commitInfo,
        buildMode,
        isApp
    };
};

;// CONCATENATED MODULE: ./app/config/client.ts

function getClientConfig() {
    if (typeof document !== "undefined") {
        // client side
        return JSON.parse(queryMeta("config"));
    }
    if (typeof process !== "undefined") {
        // server side
        return getBuildConfig();
    }
}
function queryMeta(key, defaultValue) {
    let ret;
    if (document) {
        const meta = document.head.querySelector(`meta[name='${key}']`);
        ret = meta?.content ?? "";
    } else {
        ret = defaultValue ?? "";
    }
    return ret;
}

// EXTERNAL MODULE: ./node_modules/@vercel/speed-insights/dist/next/index.mjs
var next = __webpack_require__(72939);
// EXTERNAL MODULE: ./app/config/server.ts + 1 modules
var server = __webpack_require__(25057);
// EXTERNAL MODULE: ./node_modules/@next/third-parties/dist/google/index.js
var google = __webpack_require__(61084);
;// CONCATENATED MODULE: ./app/layout.tsx
/* eslint-disable @next/next/no-page-custom-font */ 







const serverConfig = (0,server/* getServerSideConfig */.g)();
const metadata = {
    title: "Bedrock Client",
    description: "Your personal AWS BedRock Chat Bot.",
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1
    },
    themeColor: [
        {
            media: "(prefers-color-scheme: light)",
            color: "#fafafa"
        },
        {
            media: "(prefers-color-scheme: dark)",
            color: "#151515"
        }
    ],
    appleWebApp: {
        title: "Bedrock Client",
        statusBarStyle: "default"
    }
};
function RootLayout({ children }) {
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("html", {
        lang: "en",
        children: [
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("head", {
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx("meta", {
                        name: "config",
                        content: JSON.stringify(getClientConfig())
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("link", {
                        rel: "manifest",
                        href: "/site.webmanifest"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("script", {
                        src: "/serviceWorkerRegister.js",
                        defer: true
                    })
                ]
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("body", {
                children: [
                    children,
                    serverConfig?.isVercel && /*#__PURE__*/ jsx_runtime_.jsx(jsx_runtime_.Fragment, {
                        children: /*#__PURE__*/ jsx_runtime_.jsx(next/* SpeedInsights */.c, {})
                    }),
                    serverConfig?.gtmId && /*#__PURE__*/ jsx_runtime_.jsx(jsx_runtime_.Fragment, {
                        children: /*#__PURE__*/ jsx_runtime_.jsx(google/* GoogleTagManager */.fc, {
                            gtmId: serverConfig.gtmId
                        })
                    })
                ]
            })
        ]
    });
}


/***/ }),

/***/ 38036:
/***/ (() => {



/***/ }),

/***/ 86741:
/***/ (() => {



/***/ }),

/***/ 65322:
/***/ (() => {



/***/ })

};
;