import { useState, useEffect } from 'react';
import { Agent, SupportedModel, SupportedTool } from '../types/agent';
import {
  IoPersonOutline,
  IoPencilOutline,
  IoSaveOutline,
  IoCloseOutline,
  IoSettingsOutline,
  IoPlayOutline,
  IoPauseOutline,
  IoInformationCircleOutline
} from 'react-icons/io5';
import styles from '../styles/AgentDetail.module.css';

interface AgentDetailProps {
  agent: Agent;
  supportedModels: SupportedModel[];
  supportedTools: SupportedTool[];
  onUpdateAgent: (agentId: string, updates: any) => void;
  onToggleAgent: (agentId: string, isActive: boolean) => void;
}

export default function AgentDetail({
  agent,
  supportedModels,
  supportedTools,
  onUpdateAgent,
  onToggleAgent
}: AgentDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: agent.config.name,
    description: agent.config.description || '',
    system_prompt: agent.config.system_prompt || '',
    model_id: agent.config.model_config.model_id,
    temperature: agent.config.model_config.temperature,
    max_tokens: agent.config.model_config.max_tokens,
    top_p: agent.config.model_config.top_p,
    enabled_tools: agent.config.tools.filter(tool => tool.enabled).map(tool => tool.tool_id)
  });

  useEffect(() => {
    setEditForm({
      name: agent.config.name,
      description: agent.config.description || '',
      system_prompt: agent.config.system_prompt || '',
      model_id: agent.config.model_config.model_id,
      temperature: agent.config.model_config.temperature,
      max_tokens: agent.config.model_config.max_tokens,
      top_p: agent.config.model_config.top_p,
      enabled_tools: agent.config.tools.filter(tool => tool.enabled).map(tool => tool.tool_id)
    });
  }, [agent]);

  const handleSave = () => {
    const selectedModel = supportedModels.find(m => m.model_id === editForm.model_id);
    if (!selectedModel) return;

    const updatedConfig = {
      name: editForm.name,
      description: editForm.description,
      system_prompt: editForm.system_prompt,
      model_config: {
        model_id: editForm.model_id,
        model_name: selectedModel.model_name,
        provider: selectedModel.provider,
        temperature: editForm.temperature,
        max_tokens: editForm.max_tokens,
        top_p: editForm.top_p,
        stop_sequences: agent.config.model_config.stop_sequences
      },
      tools: supportedTools.map(tool => ({
        tool_id: tool.tool_id,
        tool_name: tool.tool_name,
        description: tool.description,
        enabled: editForm.enabled_tools.includes(tool.tool_id),
        parameters: {}
      })),
      metadata: agent.config.metadata || {}
    };

    onUpdateAgent(agent.id, { config: updatedConfig });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: agent.config.name,
      description: agent.config.description || '',
      system_prompt: agent.config.system_prompt || '',
      model_id: agent.config.model_config.model_id,
      temperature: agent.config.model_config.temperature,
      max_tokens: agent.config.model_config.max_tokens,
      top_p: agent.config.model_config.top_p,
      enabled_tools: agent.config.tools.filter(tool => tool.enabled).map(tool => tool.tool_id)
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getEnabledTools = () => {
    return agent.config.tools.filter(tool => tool.enabled);
  };

  const getModelDisplayName = () => {
    return agent.config.model_config.model_name || 'Unknown Model';
  };

  return (
    <div className={styles.agentDetail}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.agentIcon}>
            <IoPersonOutline />
          </div>
          <div className={styles.titleInfo}>
            <h1 className={styles.agentName}>{agent.config.name}</h1>
            <div className={styles.agentStatus}>
              <span className={`${styles.statusIndicator} ${agent.is_active ? styles.active : styles.inactive}`}>
                {agent.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <button
            className={`${styles.actionButton} ${agent.is_active ? styles.pauseButton : styles.playButton}`}
            onClick={() => onToggleAgent(agent.id, !agent.is_active)}
            title={agent.is_active ? "Deactivate agent" : "Activate agent"}
          >
            {agent.is_active ? <IoPauseOutline /> : <IoPlayOutline />}
            {agent.is_active ? 'Deactivate' : 'Activate'}
          </button>
          
          {!isEditing ? (
            <button
              className={styles.actionButton}
              onClick={() => setIsEditing(true)}
              title="Edit agent"
            >
              <IoPencilOutline />
              Edit
            </button>
          ) : (
            <>
              <button
                className={`${styles.actionButton} ${styles.saveButton}`}
                onClick={handleSave}
                title="Save changes"
              >
                <IoSaveOutline />
                Save
              </button>
              <button
                className={`${styles.actionButton} ${styles.cancelButton}`}
                onClick={handleCancel}
                title="Cancel editing"
              >
                <IoCloseOutline />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {isEditing ? (
          <div className={styles.editForm}>
            <div className={styles.formSection}>
              <label className={styles.formLabel}>Agent Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className={styles.formInput}
                placeholder="Enter agent name"
              />
            </div>

            <div className={styles.formSection}>
              <label className={styles.formLabel}>Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className={styles.formTextarea}
                placeholder="Enter agent description"
                rows={3}
              />
            </div>

            <div className={styles.formSection}>
              <label className={styles.formLabel}>System Prompt</label>
              <textarea
                value={editForm.system_prompt}
                onChange={(e) => setEditForm({ ...editForm, system_prompt: e.target.value })}
                className={styles.formTextarea}
                placeholder="Enter system prompt for the agent"
                rows={4}
              />
            </div>

            <div className={styles.formSection}>
              <label className={styles.formLabel}>Model</label>
              <select
                value={editForm.model_id}
                onChange={(e) => setEditForm({ ...editForm, model_id: e.target.value })}
                className={styles.formSelect}
              >
                {supportedModels.map((model) => (
                  <option key={model.model_id} value={model.model_id}>
                    {model.model_name} ({model.provider})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formSection}>
                <label className={styles.formLabel}>Temperature</label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={editForm.temperature}
                  onChange={(e) => setEditForm({ ...editForm, temperature: parseFloat(e.target.value) })}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formSection}>
                <label className={styles.formLabel}>Max Tokens</label>
                <input
                  type="number"
                  min="1"
                  max="8000"
                  value={editForm.max_tokens}
                  onChange={(e) => setEditForm({ ...editForm, max_tokens: parseInt(e.target.value) })}
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <label className={styles.formLabel}>Tools</label>
              <div className={styles.toolsGrid}>
                {supportedTools.map((tool) => (
                  <label key={tool.tool_id} className={styles.toolCheckbox}>
                    <input
                      type="checkbox"
                      checked={editForm.enabled_tools.includes(tool.tool_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditForm({
                            ...editForm,
                            enabled_tools: [...editForm.enabled_tools, tool.tool_id]
                          });
                        } else {
                          setEditForm({
                            ...editForm,
                            enabled_tools: editForm.enabled_tools.filter(id => id !== tool.tool_id)
                          });
                        }
                      }}
                    />
                    <span className={styles.toolName}>{tool.tool_name}</span>
                    <span className={styles.toolDescription}>{tool.description}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.viewMode}>
            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>
                <IoInformationCircleOutline />
                Basic Information
              </h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Description:</span>
                  <span className={styles.infoValue}>
                    {agent.config.description || 'No description provided'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Created:</span>
                  <span className={styles.infoValue}>{formatDate(agent.created_at)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Last Updated:</span>
                  <span className={styles.infoValue}>{formatDate(agent.updated_at)}</span>
                </div>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>
                <IoSettingsOutline />
                Model Configuration
              </h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Model:</span>
                  <span className={styles.infoValue}>{getModelDisplayName()}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Temperature:</span>
                  <span className={styles.infoValue}>{agent.config.model_config.temperature}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Max Tokens:</span>
                  <span className={styles.infoValue}>{agent.config.model_config.max_tokens}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Top P:</span>
                  <span className={styles.infoValue}>{agent.config.model_config.top_p}</span>
                </div>
              </div>
            </div>

            {agent.config.system_prompt && (
              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>System Prompt</h3>
                <div className={styles.systemPrompt}>
                  {agent.config.system_prompt}
                </div>
              </div>
            )}

            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>
                Enabled Tools ({getEnabledTools().length})
              </h3>
              <div className={styles.toolsList}>
                {getEnabledTools().length > 0 ? (
                  getEnabledTools().map((tool) => (
                    <div key={tool.tool_id} className={styles.toolItem}>
                      <span className={styles.toolItemName}>{tool.tool_name}</span>
                      <span className={styles.toolItemDescription}>{tool.description}</span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noTools}>No tools enabled</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
