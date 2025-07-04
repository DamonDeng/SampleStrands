import { useState, useEffect, useCallback, useRef } from 'react';
import { Agent, SupportedModel, SupportedTool } from '../types/agent';
import {
  IoPersonOutline,
  IoPencilOutline,
  IoSaveOutline,
  IoCloseOutline,
  IoSettingsOutline,
  IoPlayOutline,
  IoPauseOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';
import { useAppTranslation } from '../contexts/I18nContext';
import styles from '../styles/AgentDetail.module.css';

interface AgentDetailProps {
  agent: Agent;
  supportedModels: SupportedModel[];
  supportedTools: SupportedTool[];
  onUpdateAgent: (agentId: string, updates: any) => void;
  onToggleAgent: (agentId: string, isActive: boolean) => void;
  onAgentChange?: () => void; // Called when navigating away from this agent
}

export default function AgentDetail({
  agent,
  supportedModels,
  supportedTools,
  onUpdateAgent,
  onToggleAgent,
  onAgentChange
}: AgentDetailProps) {
  const { t: tcd } = useAppTranslation('agents');
  const { t: tcdCommon } = useAppTranslation('common');
  // Always start in editing mode for seamless UX
  const [isEditing, setIsEditing] = useState(true);
  const [editForm, setEditForm] = useState({
    name: agent.config.name,
    description: agent.config.description || '',
    system_prompt: agent.config.system_prompt || '',
    preferred_region: agent.config.preferred_region || '',
    enable_advanced_settings: agent.config.enable_advanced_settings || false,
    model_id: agent.config.model_config.model_id,
    temperature: agent.config.model_config.temperature,
    max_tokens: agent.config.model_config.max_tokens,
    top_p: agent.config.model_config.top_p,
    enabled_tools: agent.config.tools.filter(tool => tool.enabled).map(tool => tool.tool_id)
  });

  // Track if there are unsaved changes
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Refs for cleanup
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialFormRef = useRef(editForm);

  // Update form when agent changes and reset editing state
  useEffect(() => {
    const newForm = {
      name: agent.config.name,
      description: agent.config.description || '',
      system_prompt: agent.config.system_prompt || '',
      preferred_region: agent.config.preferred_region || '',
      enable_advanced_settings: agent.config.enable_advanced_settings || false,
      model_id: agent.config.model_config.model_id,
      temperature: agent.config.model_config.temperature,
      max_tokens: agent.config.model_config.max_tokens,
      top_p: agent.config.model_config.top_p,
      enabled_tools: agent.config.tools.filter(tool => tool.enabled).map(tool => tool.tool_id)
    };

    setEditForm(newForm);
    initialFormRef.current = newForm;
    setIsEditing(true); // Always enter editing mode
    setHasChanges(false);
    setLastSaved(null);
  }, [agent]);

  // Check if form has changes compared to initial state
  const checkForChanges = useCallback(() => {
    const current = editForm;
    const initial = initialFormRef.current;

    const hasFormChanges = (
      current.name !== initial.name ||
      current.description !== initial.description ||
      current.system_prompt !== initial.system_prompt ||
      current.preferred_region !== initial.preferred_region ||
      current.enable_advanced_settings !== initial.enable_advanced_settings ||
      current.model_id !== initial.model_id ||
      current.temperature !== initial.temperature ||
      current.max_tokens !== initial.max_tokens ||
      current.top_p !== initial.top_p ||
      JSON.stringify(current.enabled_tools.sort()) !== JSON.stringify(initial.enabled_tools.sort())
    );

    setHasChanges(hasFormChanges);
    return hasFormChanges;
  }, [editForm]);

  // Check for changes whenever form updates
  useEffect(() => {
    checkForChanges();
  }, [editForm, checkForChanges]);

  // Auto-save function
  const performAutoSave = useCallback(async () => {
    if (!hasChanges || isSaving) return;

    setIsSaving(true);
    try {
      await handleSave();
      setLastSaved(new Date());

      // Update initial form reference after successful save
      initialFormRef.current = { ...editForm };
      setHasChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, isSaving, editForm]); // handleSave is stable, no need to include

  // Debounced auto-save (save 2 seconds after user stops typing)
  useEffect(() => {
    if (hasChanges && !isSaving) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for auto-save
      saveTimeoutRef.current = setTimeout(() => {
        performAutoSave();
      }, 2000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasChanges, isSaving, performAutoSave]);

  // Auto-save when component unmounts (navigation away)
  useEffect(() => {
    return () => {
      if (hasChanges && !isSaving) {
        // Perform immediate save on unmount
        performAutoSave();
      }
      onAgentChange?.();
    };
  }, [hasChanges, isSaving, performAutoSave, onAgentChange]);

  const handleSave = async () => {
    const selectedModel = supportedModels.find(m => m.model_id === editForm.model_id);
    if (!selectedModel) return;

    const updatedConfig = {
      name: editForm.name,
      description: editForm.description,
      system_prompt: editForm.system_prompt,
      preferred_region: editForm.preferred_region,
      enable_advanced_settings: editForm.enable_advanced_settings,
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

    await onUpdateAgent(agent.id, { config: updatedConfig });
  };

  const handleCancel = () => {
    const originalForm = {
      name: agent.config.name,
      description: agent.config.description || '',
      system_prompt: agent.config.system_prompt || '',
      preferred_region: agent.config.preferred_region || '',
      enable_advanced_settings: agent.config.enable_advanced_settings || false,
      model_id: agent.config.model_config.model_id,
      temperature: agent.config.model_config.temperature,
      max_tokens: agent.config.model_config.max_tokens,
      top_p: agent.config.model_config.top_p,
      enabled_tools: agent.config.tools.filter(tool => tool.enabled).map(tool => tool.tool_id)
    };

    setEditForm(originalForm);
    initialFormRef.current = originalForm;
    setHasChanges(false);
    setIsEditing(false);
  };

  // Form change handlers that update state
  const handleFormChange = (field: string, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToolToggle = (toolId: string) => {
    setEditForm(prev => ({
      ...prev,
      enabled_tools: prev.enabled_tools.includes(toolId)
        ? prev.enabled_tools.filter(id => id !== toolId)
        : [...prev.enabled_tools, toolId]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
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
              <span className={`${styles.statusIndicator} ${agent.active ? styles.active : styles.inactive}`}>
                {agent.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        
        <div className={styles.headerActions}>

          {/* Auto-save status indicator */}
          <div className={styles.saveStatus}>
            {isSaving ? (
              <span className={styles.savingIndicator}>
                <IoSaveOutline className={styles.spinIcon} />
                Saving...
              </span>
            ) : hasChanges ? (
              <span className={styles.unsavedIndicator}>
                <IoPencilOutline />
                Unsaved changes
              </span>
            ) : lastSaved ? (
              <span className={styles.savedIndicator}>
                <IoCheckmarkCircleOutline />
                Saved {formatTimeAgo(lastSaved)}
              </span>
            ) : (
              <span className={styles.editingIndicator}>
                <IoPencilOutline />
                Editing
              </span>
            )}
          </div>

          <button
            className={`${styles.actionButton} ${agent.active ? styles.pauseButton : styles.playButton}`}
            onClick={() => onToggleAgent(agent.id, !agent.active)}
            title={agent.active ? "Deactivate agent" : "Activate agent"}
          >
            {agent.active ? <IoPauseOutline /> : <IoPlayOutline />}
            {agent.active ? 'Deactivate' : 'Activate'}
          </button>

          

          {/* Manual save button (optional, for immediate save)
          {hasChanges && !isSaving && (
            <button
              className={`${styles.actionButton} ${styles.saveButton}`}
              onClick={performAutoSave}
              title="Save changes now"
            >
              <IoSaveOutline />
              Save Now
            </button>
          )} */}
        </div>
      </div>

      <div className={styles.content}>
        {isEditing ? (
          <div className={styles.editForm}>
            {/* 1. Agent Name */}
            <div className={styles.formSection}>
              <label className={styles.formLabel}>{tcd('AGENTS.FIELDS.AGENT_NAME')}</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                className={styles.formInput}
                placeholder="Enter agent name"
              />
            </div>

            {/* 2. Model (moved up) */}
            <div className={styles.formSection}>
              <label className={styles.formLabel}>{tcd('AGENTS.FIELDS.MODEL')}</label>
              <select
                value={editForm.model_id}
                onChange={(e) => handleFormChange('model_id', e.target.value)}
                className={styles.formSelect}
              >
                {/* Show current model even if it's legacy/inactive */}
                {!supportedModels.find(m => m.model_id === editForm.model_id) && (
                  <option key={editForm.model_id} value={editForm.model_id}>
                    {agent.config.model_config.model_name} ({agent.config.model_config.provider}) - Legacy
                  </option>
                )}

                {/* Show all active models */}
                {supportedModels.map((model) => (
                  <option key={model.model_id} value={model.model_id}>
                    {model.model_name} ({model.provider})
                  </option>
                ))}
              </select>

              {/* Show warning for legacy models */}
              {!supportedModels.find(m => m.model_id === editForm.model_id) && (
                <div className={styles.warningText}>
                  ⚠️ This agent uses a legacy model that is no longer active. You can continue using it or switch to an active model.
                </div>
              )}
            </div>

            {/* 3. Preferred Region (new) */}
            <div className={styles.formSection}>
              <label className={styles.formLabel}>{tcd('AGENTS.FIELDS.PREFERRED_REGION')}</label>
              <input
                type="text"
                value={editForm.preferred_region}
                onChange={(e) => handleFormChange('preferred_region', e.target.value)}
                className={styles.formInput}
                placeholder="e.g., us-east-1 (leave blank for default)"
              />
            </div>

            {/* 4. Enable Advanced Settings (new) */}
            <div className={styles.formSection}>
              <label className={styles.formCheckboxLabel}>
                <input
                  type="checkbox"
                  checked={editForm.enable_advanced_settings}
                  onChange={(e) => handleFormChange('enable_advanced_settings', e.target.checked)}
                  className={styles.formCheckbox}
                />
                Enable Advanced Settings
              </label>
            </div>

            {/* 4.1 Advanced Model Settings (conditional) */}
            {editForm.enable_advanced_settings && (
              <div className={styles.advancedSettings}>
                <h4 className={styles.advancedTitle}>{tcd('AGENTS.FIELDS.ADVANCED_MODEL_SETTINGS')}</h4>
                <div className={styles.formRow}>
                  <div className={styles.formSection}>
                    <label className={styles.formLabel}>{tcd('AGENTS.FIELDS.TEMPERATURE')}</label>
                    <input
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={editForm.temperature}
                      onChange={(e) => handleFormChange('temperature', parseFloat(e.target.value))}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formSection}>
                    <label className={styles.formLabel}>{tcd('AGENTS.FIELDS.MAX_TOKENS')}</label>
                    <input
                      type="number"
                      min="1"
                      max="8000"
                      value={editForm.max_tokens}
                      onChange={(e) => handleFormChange('max_tokens', parseInt(e.target.value))}
                      className={styles.formInput}
                    />
                  </div>
                </div>
                <div className={styles.formSection}>
                  <label className={styles.formLabel}>{tcd('AGENTS.FIELDS.TOP_P')}</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={editForm.top_p}
                    onChange={(e) => handleFormChange('top_p', parseFloat(e.target.value))}
                    className={styles.formInput}
                  />
                </div>
              </div>
            )}

            {/* 5. Description */}
            <div className={styles.formSection}>
              <label className={styles.formLabel}>{tcdCommon('COMMON.FIELDS.DESCRIPTION')}</label>
              <textarea
                value={editForm.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                className={styles.formTextarea}
                placeholder="Enter agent description"
                rows={3}
              />
            </div>

            {/* 6. System Prompt */}
            <div className={styles.formSection}>
              <label className={styles.formLabel}>{tcd('AGENTS.FIELDS.SYSTEM_PROMPT')}</label>
              <textarea
                value={editForm.system_prompt}
                onChange={(e) => handleFormChange('system_prompt', e.target.value)}
                className={styles.formTextarea}
                placeholder="Enter system prompt for the agent"
                rows={4}
              />
            </div>

            

            {/* 8. Tools */}
            <div className={styles.formSection}>
              <label className={styles.formLabel}>{tcd('AGENTS.FIELDS.TOOLS')}</label>
              <div className={styles.toolsGrid}>
                {supportedTools.map((tool) => (
                  <label key={tool.tool_id} className={styles.toolCheckbox}>
                    <input
                      type="checkbox"
                      checked={editForm.enabled_tools.includes(tool.tool_id)}
                      onChange={() => handleToolToggle(tool.tool_id)}
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
                  <span className={styles.infoLabel}>{tcd('AGENTS.FIELDS.DESCRIPTION_COLON')}</span>
                  <span className={styles.infoValue}>
                    {agent.config.description || 'No description provided'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>{tcd('AGENTS.FIELDS.CREATED')}</span>
                  <span className={styles.infoValue}>{formatDate(agent.created_at)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>{tcd('AGENTS.FIELDS.LAST_UPDATED')}</span>
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
                  <span className={styles.infoLabel}>{tcd('AGENTS.FIELDS.MODEL_COLON')}</span>
                  <span className={styles.infoValue}>{getModelDisplayName()}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>{tcd('AGENTS.FIELDS.TEMPERATURE_COLON')}</span>
                  <span className={styles.infoValue}>{agent.config.model_config.temperature}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>{tcd('AGENTS.FIELDS.MAX_TOKENS_COLON')}</span>
                  <span className={styles.infoValue}>{agent.config.model_config.max_tokens}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>{tcd('AGENTS.FIELDS.TOP_P_COLON')}</span>
                  <span className={styles.infoValue}>{agent.config.model_config.top_p}</span>
                </div>
              </div>
            </div>

            {agent.config.system_prompt && (
              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>{tcd('AGENTS.FIELDS.SYSTEM_PROMPT')}</h3>
                <div className={styles.systemPrompt}>
                  {agent.config.system_prompt}
                </div>
              </div>
            )}

            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>
{tcd('AGENTS.TOOLS.ENABLED_TOOLS')}{getEnabledTools().length})
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
                  <p className={styles.noTools}>{tcd('AGENTS.TOOLS.NO_TOOLS_ENABLED')}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
