"use client";

import React, { useState, useEffect } from 'react';
import { processPythonText, PythonBridge, PythonResponse } from '../utils/python-bridge';

export function PythonTest() {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState<PythonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pythonInfo, setPythonInfo] = useState<any>(null);
  const [isTauriEnv, setIsTauriEnv] = useState(false);

  useEffect(() => {
    // Check if running in Tauri environment
    const checkTauriEnv = () => {
      return typeof window !== 'undefined' && window.__TAURI__ !== undefined;
    };
    setIsTauriEnv(checkTauriEnv());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Python Integration Test</h2>
      
      <div className="space-y-6">
        {/* Connection Test */}
        <div className="border-b pb-4">
          <button 
            onClick={testConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Python Connection'}
          </button>
          
          {pythonInfo && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <p><strong>Python Version:</strong> {pythonInfo.pythonVersion || 'Unknown'}</p>
              <p><strong>Script Path:</strong> {pythonInfo.scriptPath}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 font-semibold ${pythonInfo.isWorking ? 'text-green-600' : 'text-red-600'}`}>
                  {pythonInfo.isWorking ? '✅ Working' : '❌ Not Working'}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pythonInput" className="block text-sm font-medium text-gray-700 mb-2">
              Send text to Python:
            </label>
            <textarea
              id="pythonInput"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message here..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !inputText.trim()}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Send to Python'}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-semibold">Error:</p>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Output Display */}
        {output && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">Python Response:</h3>
            
            <div className={`p-4 rounded-md border ${
              output.status === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <strong>Status:</strong> 
                  <span className={`ml-2 ${
                    output.status === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {output.status}
                  </span>
                </div>
                
                {output.original_input && (
                  <div>
                    <strong>Original Input:</strong>
                    <div className="text-gray-600 mt-1">{output.original_input}</div>
                  </div>
                )}
                
                {output.processed_output && (
                  <div className="md:col-span-2">
                    <strong>Processed Output:</strong>
                    <div className="text-gray-700 mt-1 font-mono">{output.processed_output}</div>
                  </div>
                )}
                
                {output.length !== undefined && (
                  <div>
                    <strong>Length:</strong> {output.length}
                  </div>
                )}
                
                {output.uppercase && (
                  <div>
                    <strong>Uppercase:</strong>
                    <div className="text-gray-600 mt-1">{output.uppercase}</div>
                  </div>
                )}
                
                {output.reversed && (
                  <div>
                    <strong>Reversed:</strong>
                    <div className="text-gray-600 mt-1 font-mono">{output.reversed}</div>
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <strong>Timestamp:</strong> {new Date(output.timestamp).toLocaleString()}
                </div>
                
                {output.error && (
                  <div className="md:col-span-2">
                    <strong>Error:</strong>
                    <div className="text-red-600 mt-1">{output.error}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-500 border-t pt-4">
          <div className={`mb-3 p-3 rounded-md ${isTauriEnv ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
            <p className="font-semibold mb-1">
              {isTauriEnv ? '🚀 Running in Tauri Desktop Mode' : '🌐 Running in Web Mode'}
            </p>
            <p className="text-xs">
              {isTauriEnv 
                ? 'Connected to actual Python backend via Tauri shell commands.'
                : 'Using simulated Python processing for web environment. Install and run as Tauri app for real Python integration.'
              }
            </p>
          </div>
          
          <p><strong>How it works:</strong> 
            {isTauriEnv 
              ? ' This demo sends your text to a Python script via Tauri\'s shell commands, processes it, and returns structured JSON data back to TypeScript.'
              : ' In web mode, this demo simulates Python processing locally. When running as a Tauri desktop app, it will connect to actual Python scripts.'
            }
          </p>
        </div>
      </div>
    </div>
  );
} 