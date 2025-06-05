"use client";

import React, { useState, useEffect } from 'react';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

// Conditionally import StdioClientTransport only if we're in a Node.js environment
let StdioClientTransport: any = null;
if (typeof window === 'undefined') {
  // Server-side or Node.js environment
  try {
    StdioClientTransport = require("@modelcontextprotocol/sdk/client/stdio.js").StdioClientTransport;
  } catch (e) {
    console.warn("StdioClientTransport not available in this environment");
  }
}

interface MCPTestResult {
  operation: string;
  status: 'success' | 'error' | 'pending';
  data?: any;
  error?: string;
  timestamp: string;
}

export function MCPClientTest() {
  const [client, setClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<MCPTestResult[]>([]);
  const [serverCommand, setServerCommand] = useState('node');
  const [serverArgs, setServerArgs] = useState('server.js');
  const [promptName, setPromptName] = useState('example-prompt');
  const [promptArg, setPromptArg] = useState('{"arg1": "value"}');
  const [resourceUri, setResourceUri] = useState('file:///example.txt');
  const [toolName, setToolName] = useState('example-tool');
  const [toolArgs, setToolArgs] = useState('{"arg1": "value"}');
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');
  }, []);

  const addTestResult = (operation: string, status: 'success' | 'error' | 'pending', data?: any, error?: string) => {
    const result: MCPTestResult = {
      operation,
      status,
      data,
      error,
      timestamp: new Date().toISOString()
    };
    setTestResults(prev => [result, ...prev]);
    return result;
  };

  const connectToServer = async () => {
    setLoading(true);
    const result = addTestResult('Connect to MCP Server', 'pending');
    
    try {
      if (isBrowser) {
        throw new Error('StdioClientTransport is not supported in browser environments. This transport requires Node.js process spawning capabilities.');
      }

      if (!StdioClientTransport) {
        throw new Error('StdioClientTransport is not available in this environment.');
      }

      const transport = new StdioClientTransport({
        command: serverCommand,
        args: serverArgs.split(' ')
      });

      const newClient = new Client({
        name: "mcp-test-client",
        version: "1.0.0"
      });

      await newClient.connect(transport);
      
      setClient(newClient);
      setConnected(true);
      
      setTestResults(prev => prev.map(r => 
        r === result ? { ...r, status: 'success', data: 'Connected successfully' } : r
      ));
    } catch (error) {
      setConnected(false);
      setTestResults(prev => prev.map(r => 
        r === result ? { 
          ...r, 
          status: 'error', 
          error: error instanceof Error ? error.message : String(error) 
        } : r
      ));
    } finally {
      setLoading(false);
    }
  };

  const disconnectFromServer = async () => {
    if (client) {
      try {
        await client.close();
        setClient(null);
        setConnected(false);
        addTestResult('Disconnect from MCP Server', 'success', 'Disconnected successfully');
      } catch (error) {
        addTestResult('Disconnect from MCP Server', 'error', null, 
          error instanceof Error ? error.message : String(error));
      }
    }
  };

  const listPrompts = async () => {
    if (!client || !connected) {
      addTestResult('List Prompts', 'error', null, 'Client not connected');
      return;
    }

    setLoading(true);
    const result = addTestResult('List Prompts', 'pending');
    
    try {
      const prompts = await client.listPrompts();
      setTestResults(prev => prev.map(r => 
        r === result ? { ...r, status: 'success', data: prompts } : r
      ));
    } catch (error) {
      setTestResults(prev => prev.map(r => 
        r === result ? { 
          ...r, 
          status: 'error', 
          error: error instanceof Error ? error.message : String(error) 
        } : r
      ));
    } finally {
      setLoading(false);
    }
  };

  const getPrompt = async () => {
    if (!client || !connected) {
      addTestResult('Get Prompt', 'error', null, 'Client not connected');
      return;
    }

    setLoading(true);
    const result = addTestResult('Get Prompt', 'pending');
    
    try {
      let args;
      try {
        args = JSON.parse(promptArg);
      } catch {
        args = { arg1: promptArg };
      }

      const prompt = await client.getPrompt({
        name: promptName,
        arguments: args
      });
      
      setTestResults(prev => prev.map(r => 
        r === result ? { ...r, status: 'success', data: prompt } : r
      ));
    } catch (error) {
      setTestResults(prev => prev.map(r => 
        r === result ? { 
          ...r, 
          status: 'error', 
          error: error instanceof Error ? error.message : String(error) 
        } : r
      ));
    } finally {
      setLoading(false);
    }
  };

  const listResources = async () => {
    if (!client || !connected) {
      addTestResult('List Resources', 'error', null, 'Client not connected');
      return;
    }

    setLoading(true);
    const result = addTestResult('List Resources', 'pending');
    
    try {
      const resources = await client.listResources();
      setTestResults(prev => prev.map(r => 
        r === result ? { ...r, status: 'success', data: resources } : r
      ));
    } catch (error) {
      setTestResults(prev => prev.map(r => 
        r === result ? { 
          ...r, 
          status: 'error', 
          error: error instanceof Error ? error.message : String(error) 
        } : r
      ));
    } finally {
      setLoading(false);
    }
  };

  const readResource = async () => {
    if (!client || !connected) {
      addTestResult('Read Resource', 'error', null, 'Client not connected');
      return;
    }

    setLoading(true);
    const result = addTestResult('Read Resource', 'pending');
    
    try {
      const resource = await client.readResource({
        uri: resourceUri
      });
      
      setTestResults(prev => prev.map(r => 
        r === result ? { ...r, status: 'success', data: resource } : r
      ));
    } catch (error) {
      setTestResults(prev => prev.map(r => 
        r === result ? { 
          ...r, 
          status: 'error', 
          error: error instanceof Error ? error.message : String(error) 
        } : r
      ));
    } finally {
      setLoading(false);
    }
  };

  const callTool = async () => {
    if (!client || !connected) {
      addTestResult('Call Tool', 'error', null, 'Client not connected');
      return;
    }

    setLoading(true);
    const result = addTestResult('Call Tool', 'pending');
    
    try {
      let args;
      try {
        args = JSON.parse(toolArgs);
      } catch {
        args = { arg1: toolArgs };
      }

      const toolResult = await client.callTool({
        name: toolName,
        arguments: args
      });
      
      setTestResults(prev => prev.map(r => 
        r === result ? { ...r, status: 'success', data: toolResult } : r
      ));
    } catch (error) {
      setTestResults(prev => prev.map(r => 
        r === result ? { 
          ...r, 
          status: 'error', 
          error: error instanceof Error ? error.message : String(error) 
        } : r
      ));
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  useEffect(() => {
    return () => {
      if (client && connected) {
        client.close().catch(console.error);
      }
    };
  }, [client, connected]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">MCP Client Test</h2>
      
      <div className="space-y-6">
        {/* Environment Warning */}
        {isBrowser && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
            <p className="font-semibold text-yellow-800 mb-2">⚠️ Browser Environment Detected</p>
            <p className="text-yellow-700 text-sm">
              You are running in a browser environment. The StdioClientTransport requires Node.js process spawning capabilities and will not work here. 
              This interface demonstrates the MCP client API structure, but actual connections require a server-side implementation or alternative transport methods like WebSocket.
            </p>
          </div>
        )}

        {/* Connection Section */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Server Connection</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Server Command:
              </label>
              <input
                type="text"
                value={serverCommand}
                onChange={(e) => setServerCommand(e.target.value)}
                disabled={connected}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="node"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Server Arguments:
              </label>
              <input
                type="text"
                value={serverArgs}
                onChange={(e) => setServerArgs(e.target.value)}
                disabled={connected}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="server.js"
              />
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={connectToServer}
              disabled={loading || connected}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect'}
            </button>
            
            <button
              onClick={disconnectFromServer}
              disabled={!connected}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              Disconnect
            </button>
            
            <div className={`px-3 py-2 rounded font-semibold ${
              connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {connected ? '✅ Connected' : '❌ Not Connected'}
            </div>
          </div>
        </div>

        {/* Test Operations Section */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Test Operations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prompts */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-600">Prompts</h4>
              <button
                onClick={listPrompts}
                disabled={!connected || loading}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                List Prompts
              </button>
              
              <div className="space-y-2">
                <input
                  type="text"
                  value={promptName}
                  onChange={(e) => setPromptName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Prompt name"
                />
                <input
                  type="text"
                  value={promptArg}
                  onChange={(e) => setPromptArg(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Arguments (JSON)"
                />
                <button
                  onClick={getPrompt}
                  disabled={!connected || loading}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Get Prompt
                </button>
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-600">Resources</h4>
              <button
                onClick={listResources}
                disabled={!connected || loading}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
              >
                List Resources
              </button>
              
              <div className="space-y-2">
                <input
                  type="text"
                  value={resourceUri}
                  onChange={(e) => setResourceUri(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Resource URI"
                />
                <button
                  onClick={readResource}
                  disabled={!connected || loading}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                >
                  Read Resource
                </button>
              </div>
            </div>

            {/* Tools */}
            <div className="space-y-3 md:col-span-2">
              <h4 className="font-medium text-gray-600">Tools</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Tool name"
                />
                <input
                  type="text"
                  value={toolArgs}
                  onChange={(e) => setToolArgs(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Arguments (JSON)"
                />
                <button
                  onClick={callTool}
                  disabled={!connected || loading}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                >
                  Call Tool
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Test Results</h3>
            <button
              onClick={clearResults}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              Clear Results
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No test results yet. Try connecting and running some operations!</p>
            ) : (
              testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-md border ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : result.status === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">{result.operation}</h4>
                    <span className={`text-sm font-medium ${
                      result.status === 'success'
                        ? 'text-green-700'
                        : result.status === 'error'
                        ? 'text-red-700'
                        : 'text-yellow-700'
                    }`}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {result.error && (
                    <div className="mb-2">
                      <strong className="text-red-800">Error:</strong>
                      <p className="text-red-700 text-sm">{result.error}</p>
                    </div>
                  )}
                  
                  {result.data && (
                    <div className="mb-2">
                      <strong className="text-gray-800">Data:</strong>
                      <pre className="text-sm bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                        {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="text-sm text-gray-500 border-t pt-4">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
            <p className="font-semibold mb-1">📝 Note about MCP Client Testing</p>
            <p className="text-xs">
              This is a demonstration of MCP client functionality. In a web environment, the StdioClientTransport cannot work as it requires Node.js process spawning capabilities. For production use in web browsers, you would need a different transport mechanism such as:
            </p>
            <ul className="text-xs mt-2 ml-4 list-disc">
              <li>WebSocket transport to communicate with a WebSocket-enabled MCP server</li>
              <li>HTTP transport for REST-based MCP communication</li>
              <li>Server-side proxy that handles the stdio communication</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 