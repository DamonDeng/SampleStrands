"use strict";
exports.id = 6392;
exports.ids = [6392];
exports.modules = {

/***/ 26392:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Command: () => (/* binding */ Command)
});

// UNUSED EXPORTS: Child, EventEmitter, open

;// CONCATENATED MODULE: ./node_modules/@tauri-apps/api/external/tslib/tslib.es6.js
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function tslib_es6_classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function tslib_es6_classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};



;// CONCATENATED MODULE: ./node_modules/@tauri-apps/api/core.js


// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
var _Channel_onmessage, _Channel_nextMessageIndex, _Channel_pendingMessages, _Channel_messageEndIndex, _Resource_rid;
/**
 * Invoke your custom commands.
 *
 * This package is also accessible with `window.__TAURI__.core` when [`app.withGlobalTauri`](https://v2.tauri.app/reference/config/#withglobaltauri) in `tauri.conf.json` is set to `true`.
 * @module
 */
/**
 * A key to be used to implement a special function
 * on your types that define how your type should be serialized
 * when passing across the IPC.
 * @example
 * Given a type in Rust that looks like this
 * ```rs
 * #[derive(serde::Serialize, serde::Deserialize)
 * enum UserId {
 *   String(String),
 *   Number(u32),
 * }
 * ```
 * `UserId::String("id")` would be serialized into `{ String: "id" }`
 * and so we need to pass the same structure back to Rust
 * ```ts
 * import { SERIALIZE_TO_IPC_FN } from "@tauri-apps/api/core"
 *
 * class UserIdString {
 *   id
 *   constructor(id) {
 *     this.id = id
 *   }
 *
 *   [SERIALIZE_TO_IPC_FN]() {
 *     return { String: this.id }
 *   }
 * }
 *
 * class UserIdNumber {
 *   id
 *   constructor(id) {
 *     this.id = id
 *   }
 *
 *   [SERIALIZE_TO_IPC_FN]() {
 *     return { Number: this.id }
 *   }
 * }
 *
 * type UserId = UserIdString | UserIdNumber
 * ```
 *
 */
// if this value changes, make sure to update it in:
// 1. ipc.js
// 2. process-ipc-message-fn.js
const SERIALIZE_TO_IPC_FN = '__TAURI_TO_IPC_KEY__';
/**
 * Transforms a callback function to a string identifier that can be passed to the backend.
 * The backend uses the identifier to `eval()` the callback.
 *
 * @return A unique identifier associated with the callback function.
 *
 * @since 1.0.0
 */
function transformCallback(callback, once = false) {
    return window.__TAURI_INTERNALS__.transformCallback(callback, once);
}
class Channel {
    constructor(onmessage) {
        _Channel_onmessage.set(this, void 0);
        // the index is used as a mechanism to preserve message order
        _Channel_nextMessageIndex.set(this, 0);
        _Channel_pendingMessages.set(this, []);
        _Channel_messageEndIndex.set(this, void 0);
        tslib_es6_classPrivateFieldSet(this, _Channel_onmessage, onmessage || (() => { }), "f");
        this.id = transformCallback((rawMessage) => {
            const index = rawMessage.index;
            if ('end' in rawMessage) {
                if (index == tslib_es6_classPrivateFieldGet(this, _Channel_nextMessageIndex, "f")) {
                    this.cleanupCallback();
                }
                else {
                    tslib_es6_classPrivateFieldSet(this, _Channel_messageEndIndex, index, "f");
                }
                return;
            }
            const message = rawMessage.message;
            // Process the message if we're at the right order
            if (index == tslib_es6_classPrivateFieldGet(this, _Channel_nextMessageIndex, "f")) {
                tslib_es6_classPrivateFieldGet(this, _Channel_onmessage, "f").call(this, message);
                tslib_es6_classPrivateFieldSet(this, _Channel_nextMessageIndex, tslib_es6_classPrivateFieldGet(this, _Channel_nextMessageIndex, "f") + 1, "f");
                // process pending messages
                while (tslib_es6_classPrivateFieldGet(this, _Channel_nextMessageIndex, "f") in tslib_es6_classPrivateFieldGet(this, _Channel_pendingMessages, "f")) {
                    const message = tslib_es6_classPrivateFieldGet(this, _Channel_pendingMessages, "f")[tslib_es6_classPrivateFieldGet(this, _Channel_nextMessageIndex, "f")];
                    tslib_es6_classPrivateFieldGet(this, _Channel_onmessage, "f").call(this, message);
                    // eslint-disable-next-line @typescript-eslint/no-array-delete
                    delete tslib_es6_classPrivateFieldGet(this, _Channel_pendingMessages, "f")[tslib_es6_classPrivateFieldGet(this, _Channel_nextMessageIndex, "f")];
                    tslib_es6_classPrivateFieldSet(this, _Channel_nextMessageIndex, tslib_es6_classPrivateFieldGet(this, _Channel_nextMessageIndex, "f") + 1, "f");
                }
                if (tslib_es6_classPrivateFieldGet(this, _Channel_nextMessageIndex, "f") === tslib_es6_classPrivateFieldGet(this, _Channel_messageEndIndex, "f")) {
                    this.cleanupCallback();
                }
            }
            // Queue the message if we're not
            else {
                // eslint-disable-next-line security/detect-object-injection
                tslib_es6_classPrivateFieldGet(this, _Channel_pendingMessages, "f")[index] = message;
            }
        });
    }
    cleanupCallback() {
        Reflect.deleteProperty(window, `_${this.id}`);
    }
    set onmessage(handler) {
        tslib_es6_classPrivateFieldSet(this, _Channel_onmessage, handler, "f");
    }
    get onmessage() {
        return tslib_es6_classPrivateFieldGet(this, _Channel_onmessage, "f");
    }
    [(_Channel_onmessage = new WeakMap(), _Channel_nextMessageIndex = new WeakMap(), _Channel_pendingMessages = new WeakMap(), _Channel_messageEndIndex = new WeakMap(), SERIALIZE_TO_IPC_FN)]() {
        return `__CHANNEL__:${this.id}`;
    }
    toJSON() {
        // eslint-disable-next-line security/detect-object-injection
        return this[SERIALIZE_TO_IPC_FN]();
    }
}
class PluginListener {
    constructor(plugin, event, channelId) {
        this.plugin = plugin;
        this.event = event;
        this.channelId = channelId;
    }
    async unregister() {
        return core_invoke(`plugin:${this.plugin}|remove_listener`, {
            event: this.event,
            channelId: this.channelId
        });
    }
}
/**
 * Adds a listener to a plugin event.
 *
 * @returns The listener object to stop listening to the events.
 *
 * @since 2.0.0
 */
async function addPluginListener(plugin, event, cb) {
    const handler = new Channel(cb);
    return core_invoke(`plugin:${plugin}|registerListener`, { event, handler }).then(() => new PluginListener(plugin, event, handler.id));
}
/**
 * Get permission state for a plugin.
 *
 * This should be used by plugin authors to wrap their actual implementation.
 */
async function checkPermissions(plugin) {
    return core_invoke(`plugin:${plugin}|check_permissions`);
}
/**
 * Request permissions.
 *
 * This should be used by plugin authors to wrap their actual implementation.
 */
async function requestPermissions(plugin) {
    return core_invoke(`plugin:${plugin}|request_permissions`);
}
/**
 * Sends a message to the backend.
 * @example
 * ```typescript
 * import { invoke } from '@tauri-apps/api/core';
 * await invoke('login', { user: 'tauri', password: 'poiwe3h4r5ip3yrhtew9ty' });
 * ```
 *
 * @param cmd The command name.
 * @param args The optional arguments to pass to the command.
 * @param options The request options.
 * @return A promise resolving or rejecting to the backend response.
 *
 * @since 1.0.0
 */
async function core_invoke(cmd, args = {}, options) {
    return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}
/**
 * Convert a device file path to an URL that can be loaded by the webview.
 * Note that `asset:` and `http://asset.localhost` must be added to [`app.security.csp`](https://v2.tauri.app/reference/config/#csp-1) in `tauri.conf.json`.
 * Example CSP value: `"csp": "default-src 'self' ipc: http://ipc.localhost; img-src 'self' asset: http://asset.localhost"` to use the asset protocol on image sources.
 *
 * Additionally, `"enable" : "true"` must be added to [`app.security.assetProtocol`](https://v2.tauri.app/reference/config/#assetprotocolconfig)
 * in `tauri.conf.json` and its access scope must be defined on the `scope` array on the same `assetProtocol` object.
 *
 * @param  filePath The file path.
 * @param  protocol The protocol to use. Defaults to `asset`. You only need to set this when using a custom protocol.
 * @example
 * ```typescript
 * import { appDataDir, join } from '@tauri-apps/api/path';
 * import { convertFileSrc } from '@tauri-apps/api/core';
 * const appDataDirPath = await appDataDir();
 * const filePath = await join(appDataDirPath, 'assets/video.mp4');
 * const assetUrl = convertFileSrc(filePath);
 *
 * const video = document.getElementById('my-video');
 * const source = document.createElement('source');
 * source.type = 'video/mp4';
 * source.src = assetUrl;
 * video.appendChild(source);
 * video.load();
 * ```
 *
 * @return the URL that can be used as source on the webview.
 *
 * @since 1.0.0
 */
function convertFileSrc(filePath, protocol = 'asset') {
    return window.__TAURI_INTERNALS__.convertFileSrc(filePath, protocol);
}
/**
 * A rust-backed resource stored through `tauri::Manager::resources_table` API.
 *
 * The resource lives in the main process and does not exist
 * in the Javascript world, and thus will not be cleaned up automatiacally
 * except on application exit. If you want to clean it up early, call {@linkcode Resource.close}
 *
 * @example
 * ```typescript
 * import { Resource, invoke } from '@tauri-apps/api/core';
 * export class DatabaseHandle extends Resource {
 *   static async open(path: string): Promise<DatabaseHandle> {
 *     const rid: number = await invoke('open_db', { path });
 *     return new DatabaseHandle(rid);
 *   }
 *
 *   async execute(sql: string): Promise<void> {
 *     await invoke('execute_sql', { rid: this.rid, sql });
 *   }
 * }
 * ```
 */
class Resource {
    get rid() {
        return __classPrivateFieldGet(this, _Resource_rid, "f");
    }
    constructor(rid) {
        _Resource_rid.set(this, void 0);
        __classPrivateFieldSet(this, _Resource_rid, rid, "f");
    }
    /**
     * Destroys and cleans up this resource from memory.
     * **You should not call any method on this object anymore and should drop any reference to it.**
     */
    async close() {
        return core_invoke('plugin:resources|close', {
            rid: this.rid
        });
    }
}
_Resource_rid = new WeakMap();
function isTauri() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access
    return !!(globalThis || window).isTauri;
}



;// CONCATENATED MODULE: ./node_modules/@tauri-apps/plugin-shell/dist-js/index.js


// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * Access the system shell.
 * Allows you to spawn child processes and manage files and URLs using their default application.
 *
 * ## Security
 *
 * This API has a scope configuration that forces you to restrict the programs and arguments that can be used.
 *
 * ### Restricting access to the {@link open | `open`} API
 *
 * On the configuration object, `open: true` means that the {@link open} API can be used with any URL,
 * as the argument is validated with the `^((mailto:\w+)|(tel:\w+)|(https?://\w+)).+` regex.
 * You can change that regex by changing the boolean value to a string, e.g. `open: ^https://github.com/`.
 *
 * ### Restricting access to the {@link Command | `Command`} APIs
 *
 * The plugin permissions object has a `scope` field that defines an array of CLIs that can be used.
 * Each CLI is a configuration object `{ name: string, cmd: string, sidecar?: bool, args?: boolean | Arg[] }`.
 *
 * - `name`: the unique identifier of the command, passed to the {@link Command.create | Command.create function}.
 * If it's a sidecar, this must be the value defined on `tauri.conf.json > bundle > externalBin`.
 * - `cmd`: the program that is executed on this configuration. If it's a sidecar, this value is ignored.
 * - `sidecar`: whether the object configures a sidecar or a system program.
 * - `args`: the arguments that can be passed to the program. By default no arguments are allowed.
 *   - `true` means that any argument list is allowed.
 *   - `false` means that no arguments are allowed.
 *   - otherwise an array can be configured. Each item is either a string representing the fixed argument value
 *     or a `{ validator: string }` that defines a regex validating the argument value.
 *
 * #### Example scope configuration
 *
 * CLI: `git commit -m "the commit message"`
 *
 * Capability:
 * ```json
 * {
 *   "permissions": [
 *     {
 *       "identifier": "shell:allow-execute",
 *       "allow": [
 *         {
 *           "name": "run-git-commit",
 *           "cmd": "git",
 *           "args": ["commit", "-m", { "validator": "\\S+" }]
 *         }
 *       ]
 *     }
 *   ]
 * }
 * ```
 * Usage:
 * ```typescript
 * import { Command } from '@tauri-apps/plugin-shell'
 * Command.create('run-git-commit', ['commit', '-m', 'the commit message'])
 * ```
 *
 * Trying to execute any API with a program not configured on the scope results in a promise rejection due to denied access.
 *
 * @module
 */
/**
 * @since 2.0.0
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class EventEmitter {
    constructor() {
        /** @ignore */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        this.eventListeners = Object.create(null);
    }
    /**
     * Alias for `emitter.on(eventName, listener)`.
     *
     * @since 2.0.0
     */
    addListener(eventName, listener) {
        return this.on(eventName, listener);
    }
    /**
     * Alias for `emitter.off(eventName, listener)`.
     *
     * @since 2.0.0
     */
    removeListener(eventName, listener) {
        return this.off(eventName, listener);
    }
    /**
     * Adds the `listener` function to the end of the listeners array for the
     * event named `eventName`. No checks are made to see if the `listener` has
     * already been added. Multiple calls passing the same combination of `eventName`and `listener` will result in the `listener` being added, and called, multiple
     * times.
     *
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     *
     * @since 2.0.0
     */
    on(eventName, listener) {
        if (eventName in this.eventListeners) {
            // eslint-disable-next-line security/detect-object-injection
            this.eventListeners[eventName].push(listener);
        }
        else {
            // eslint-disable-next-line security/detect-object-injection
            this.eventListeners[eventName] = [listener];
        }
        return this;
    }
    /**
     * Adds a **one-time**`listener` function for the event named `eventName`. The
     * next time `eventName` is triggered, this listener is removed and then invoked.
     *
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     *
     * @since 2.0.0
     */
    once(eventName, listener) {
        const wrapper = (arg) => {
            this.removeListener(eventName, wrapper);
            listener(arg);
        };
        return this.addListener(eventName, wrapper);
    }
    /**
     * Removes the all specified listener from the listener array for the event eventName
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     *
     * @since 2.0.0
     */
    off(eventName, listener) {
        if (eventName in this.eventListeners) {
            // eslint-disable-next-line security/detect-object-injection
            this.eventListeners[eventName] = this.eventListeners[eventName].filter((l) => l !== listener);
        }
        return this;
    }
    /**
     * Removes all listeners, or those of the specified eventName.
     *
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     *
     * @since 2.0.0
     */
    removeAllListeners(event) {
        if (event) {
            // eslint-disable-next-line security/detect-object-injection
            delete this.eventListeners[event];
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this.eventListeners = Object.create(null);
        }
        return this;
    }
    /**
     * @ignore
     * Synchronously calls each of the listeners registered for the event named`eventName`, in the order they were registered, passing the supplied arguments
     * to each.
     *
     * @returns `true` if the event had listeners, `false` otherwise.
     *
     * @since 2.0.0
     */
    emit(eventName, arg) {
        if (eventName in this.eventListeners) {
            // eslint-disable-next-line security/detect-object-injection
            const listeners = this.eventListeners[eventName];
            for (const listener of listeners)
                listener(arg);
            return true;
        }
        return false;
    }
    /**
     * Returns the number of listeners listening to the event named `eventName`.
     *
     * @since 2.0.0
     */
    listenerCount(eventName) {
        if (eventName in this.eventListeners)
            // eslint-disable-next-line security/detect-object-injection
            return this.eventListeners[eventName].length;
        return 0;
    }
    /**
     * Adds the `listener` function to the _beginning_ of the listeners array for the
     * event named `eventName`. No checks are made to see if the `listener` has
     * already been added. Multiple calls passing the same combination of `eventName`and `listener` will result in the `listener` being added, and called, multiple
     * times.
     *
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     *
     * @since 2.0.0
     */
    prependListener(eventName, listener) {
        if (eventName in this.eventListeners) {
            // eslint-disable-next-line security/detect-object-injection
            this.eventListeners[eventName].unshift(listener);
        }
        else {
            // eslint-disable-next-line security/detect-object-injection
            this.eventListeners[eventName] = [listener];
        }
        return this;
    }
    /**
     * Adds a **one-time**`listener` function for the event named `eventName` to the_beginning_ of the listeners array. The next time `eventName` is triggered, this
     * listener is removed, and then invoked.
     *
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     *
     * @since 2.0.0
     */
    prependOnceListener(eventName, listener) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const wrapper = (arg) => {
            this.removeListener(eventName, wrapper);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            listener(arg);
        };
        return this.prependListener(eventName, wrapper);
    }
}
/**
 * @since 2.0.0
 */
class Child {
    constructor(pid) {
        this.pid = pid;
    }
    /**
     * Writes `data` to the `stdin`.
     *
     * @param data The message to write, either a string or a byte array.
     * @example
     * ```typescript
     * import { Command } from '@tauri-apps/plugin-shell';
     * const command = Command.create('node');
     * const child = await command.spawn();
     * await child.write('message');
     * await child.write([0, 1, 2, 3, 4, 5]);
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    async write(data) {
        await core_invoke('plugin:shell|stdin_write', {
            pid: this.pid,
            buffer: data
        });
    }
    /**
     * Kills the child process.
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    async kill() {
        await core_invoke('plugin:shell|kill', {
            cmd: 'killChild',
            pid: this.pid
        });
    }
}
/**
 * The entry point for spawning child processes.
 * It emits the `close` and `error` events.
 * @example
 * ```typescript
 * import { Command } from '@tauri-apps/plugin-shell';
 * const command = Command.create('node');
 * command.on('close', data => {
 *   console.log(`command finished with code ${data.code} and signal ${data.signal}`)
 * });
 * command.on('error', error => console.error(`command error: "${error}"`));
 * command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
 * command.stderr.on('data', line => console.log(`command stderr: "${line}"`));
 *
 * const child = await command.spawn();
 * console.log('pid:', child.pid);
 * ```
 *
 * @since 2.0.0
 *
 */
class Command extends EventEmitter {
    /**
     * @ignore
     * Creates a new `Command` instance.
     *
     * @param program The program name to execute.
     * It must be configured on `tauri.conf.json > plugins > shell > scope`.
     * @param args Program arguments.
     * @param options Spawn options.
     */
    constructor(program, args = [], options) {
        super();
        /** Event emitter for the `stdout`. Emits the `data` event. */
        this.stdout = new EventEmitter();
        /** Event emitter for the `stderr`. Emits the `data` event. */
        this.stderr = new EventEmitter();
        this.program = program;
        this.args = typeof args === 'string' ? [args] : args;
        this.options = options ?? {};
    }
    /**
     * Creates a command to execute the given program.
     * @example
     * ```typescript
     * import { Command } from '@tauri-apps/plugin-shell';
     * const command = Command.create('my-app', ['run', 'tauri']);
     * const output = await command.execute();
     * ```
     *
     * @param program The program to execute.
     * It must be configured on `tauri.conf.json > plugins > shell > scope`.
     */
    static create(program, args = [], options) {
        return new Command(program, args, options);
    }
    /**
     * Creates a command to execute the given sidecar program.
     * @example
     * ```typescript
     * import { Command } from '@tauri-apps/plugin-shell';
     * const command = Command.sidecar('my-sidecar');
     * const output = await command.execute();
     * ```
     *
     * @param program The program to execute.
     * It must be configured on `tauri.conf.json > plugins > shell > scope`.
     */
    static sidecar(program, args = [], options) {
        const instance = new Command(program, args, options);
        instance.options.sidecar = true;
        return instance;
    }
    /**
     * Executes the command as a child process, returning a handle to it.
     *
     * @returns A promise resolving to the child process handle.
     *
     * @since 2.0.0
     */
    async spawn() {
        const program = this.program;
        const args = this.args;
        const options = this.options;
        if (typeof args === 'object') {
            Object.freeze(args);
        }
        const onEvent = new Channel();
        onEvent.onmessage = (event) => {
            switch (event.event) {
                case 'Error':
                    this.emit('error', event.payload);
                    break;
                case 'Terminated':
                    this.emit('close', event.payload);
                    break;
                case 'Stdout':
                    this.stdout.emit('data', event.payload);
                    break;
                case 'Stderr':
                    this.stderr.emit('data', event.payload);
                    break;
            }
        };
        return await core_invoke('plugin:shell|spawn', {
            program,
            args,
            options,
            onEvent
        }).then((pid) => new Child(pid));
    }
    /**
     * Executes the command as a child process, waiting for it to finish and collecting all of its output.
     * @example
     * ```typescript
     * import { Command } from '@tauri-apps/plugin-shell';
     * const output = await Command.create('echo', 'message').execute();
     * assert(output.code === 0);
     * assert(output.signal === null);
     * assert(output.stdout === 'message');
     * assert(output.stderr === '');
     * ```
     *
     * @returns A promise resolving to the child process output.
     *
     * @since 2.0.0
     */
    async execute() {
        const program = this.program;
        const args = this.args;
        const options = this.options;
        if (typeof args === 'object') {
            Object.freeze(args);
        }
        return await core_invoke('plugin:shell|execute', {
            program,
            args,
            options
        });
    }
}
/**
 * Opens a path or URL with the system's default app,
 * or the one specified with `openWith`.
 *
 * The `openWith` value must be one of `firefox`, `google chrome`, `chromium` `safari`,
 * `open`, `start`, `xdg-open`, `gio`, `gnome-open`, `kde-open` or `wslview`.
 *
 * @example
 * ```typescript
 * import { open } from '@tauri-apps/plugin-shell';
 * // opens the given URL on the default browser:
 * await open('https://github.com/tauri-apps/tauri');
 * // opens the given URL using `firefox`:
 * await open('https://github.com/tauri-apps/tauri', 'firefox');
 * // opens a file using the default program:
 * await open('/path/to/file');
 * ```
 *
 * @param path The path or URL to open.
 * This value is matched against the string regex defined on `tauri.conf.json > plugins > shell > open`,
 * which defaults to `^((mailto:\w+)|(tel:\w+)|(https?://\w+)).+`.
 * @param openWith The app to open the file or URL with.
 * Defaults to the system default application for the specified path type.
 *
 * @since 2.0.0
 */
async function dist_js_open(path, openWith) {
    await invoke('plugin:shell|open', {
        path,
        with: openWith
    });
}




/***/ })

};
;