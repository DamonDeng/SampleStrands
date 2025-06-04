"use client";

import React, { useState } from 'react';
import { processPythonText, PythonBridge, PythonResponse } from '../utils/python-bridge';
import styles from './ui-lib.module.scss';

interface PythonModalProps {
  onClose: () => void;
}

export function PythonModal({ onClose }: PythonModalProps) {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState<PythonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pythonInfo, setPythonInfo] = useState<any>(null);

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
    <div className={styles["modal-mask"]} onClick={onClose}>
      <div className={styles["modal-container"]} onClick={(e) => e.stopPropagation()}>
        <div className={styles["modal-header"]}>
          <div className={styles["modal-title"]}>🐍 Python Integration</div>
          <button className={styles["modal-close-btn"]} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles["modal-content"]}>
          <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
            {/* Connection Test */}
            <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid var(--border-color)" }}>
              <button 
                onClick={testConnection}
                disabled={loading}
                className={`${styles["chat-input-send"]} ${loading ? styles["loading"] : ""}`}
                style={{ marginBottom: "12px" }}
              >
                {loading ? 'Testing...' : 'Test Python Connection'}
              </button>
              
              {pythonInfo && (
                <div style={{ 
                  padding: "12px", 
                  backgroundColor: "var(--light-gray)", 
                  borderRadius: "6px",
                  fontSize: "14px"
                }}>
                  <p><strong>Python Version:</strong> {pythonInfo.pythonVersion || 'Unknown'}</p>
                  <p><strong>Script Path:</strong> {pythonInfo.scriptPath}</p>
                  <p><strong>Status:</strong> 
                    <span style={{ 
                      marginLeft: "8px", 
                      fontWeight: "600",
                      color: pythonInfo.isWorking ? "var(--green)" : "var(--red)"
                    }}>
                      {pythonInfo.isWorking ? '✅ Working' : '❌ Not Working'}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ 
                  display: "block", 
                  fontSize: "14px", 
                  fontWeight: "500", 
                  marginBottom: "8px",
                  color: "var(--primary)"
                }}>
                  Send text to Python:
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message here..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "var(--white)",
                    color: "var(--black)",
                    resize: "vertical",
                    minHeight: "80px"
                  }}
                  rows={3}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading || !inputText.trim()}
                className={`${styles["chat-input-send"]} ${(loading || !inputText.trim()) ? styles["loading"] : ""}`}
                style={{ width: "100%" }}
              >
                {loading ? 'Processing...' : 'Send to Python'}
              </button>
            </form>

            {/* Error Display */}
            {error && (
              <div style={{ 
                padding: "16px", 
                backgroundColor: "var(--red)", 
                color: "white",
                borderRadius: "6px",
                marginBottom: "24px"
              }}>
                <p style={{ fontWeight: "600", margin: "0 0 4px 0" }}>Error:</p>
                <p style={{ margin: "0" }}>{error}</p>
              </div>
            )}

            {/* Output Display */}
            {output && (
              <div>
                <h3 style={{ 
                  fontSize: "16px", 
                  fontWeight: "600", 
                  marginBottom: "12px",
                  color: "var(--primary)"
                }}>Python Response:</h3>
                
                <div style={{ 
                  padding: "16px", 
                  borderRadius: "6px", 
                  border: "1px solid var(--border-color)",
                  backgroundColor: output.status === 'success' 
                    ? "var(--light-green)" 
                    : "var(--light-red)"
                }}>
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "12px",
                    fontSize: "14px"
                  }}>
                    <div>
                      <strong>Status:</strong> 
                      <span style={{ 
                        marginLeft: "8px",
                        color: output.status === 'success' ? "var(--green)" : "var(--red)"
                      }}>
                        {output.status}
                      </span>
                    </div>
                    
                    {output.original_input && (
                      <div>
                        <strong>Original Input:</strong>
                        <div style={{ color: "var(--black-6)", marginTop: "4px" }}>
                          {output.original_input}
                        </div>
                      </div>
                    )}
                    
                    {output.processed_output && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <strong>Processed Output:</strong>
                        <div style={{ 
                          color: "var(--black)", 
                          marginTop: "4px", 
                          fontFamily: "monospace",
                          fontSize: "13px"
                        }}>
                          {output.processed_output}
                        </div>
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
                        <div style={{ color: "var(--black-6)", marginTop: "4px" }}>
                          {output.uppercase}
                        </div>
                      </div>
                    )}
                    
                    {output.reversed && (
                      <div>
                        <strong>Reversed:</strong>
                        <div style={{ 
                          color: "var(--black-6)", 
                          marginTop: "4px", 
                          fontFamily: "monospace",
                          fontSize: "13px"
                        }}>
                          {output.reversed}
                        </div>
                      </div>
                    )}
                    
                    <div style={{ gridColumn: "1 / -1" }}>
                      <strong>Timestamp:</strong> {new Date(output.timestamp).toLocaleString()}
                    </div>
                    
                    {output.error && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <strong>Error:</strong>
                        <div style={{ color: "var(--red)", marginTop: "4px" }}>
                          {output.error}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div style={{ 
              fontSize: "12px", 
              color: "var(--black-6)", 
              borderTop: "1px solid var(--border-color)",
              paddingTop: "16px",
              marginTop: "24px"
            }}>
              <p><strong>How it works:</strong> This integration sends your text to a Python script via Tauri's shell commands, 
              processes it, and returns structured JSON data back to TypeScript.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 