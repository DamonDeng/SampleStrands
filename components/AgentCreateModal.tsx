import { useState, useEffect } from 'react';
import { SupportedModel, SupportedTool, AgentCreateRequest } from '../types/agent';
import {
  IoCloseOutline,
  IoSaveOutline,
  IoPersonOutline
} from 'react-icons/io5';
import { useAppTranslation } from '../contexts/I18nContext';
import styles from '../styles/AgentCreateModal.module.css';

interface AgentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAgent: (request: AgentCreateRequest) => Promise<void>;
  supportedModels: SupportedModel[];
  supportedTools: SupportedTool[];
}

export default function AgentCreateModal({
  isOpen,
  onClose,
  onCreateAgent,
  supportedModels,
  supportedTools
}: AgentCreateModalProps) {
  console.log('🎭 AgentCreateModal rendered with props:', {
    isOpen,
    supportedModelsCount: supportedModels?.length || 0,
    supportedToolsCount: supportedTools?.length || 0,
    supportedModels,
    supportedTools
  });

  const { t } = useAppTranslation('agents');
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: '',
    model_id: '',
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 0.9,
    enabled_tools: ['calculator'] // Default to calculator tool
  });

  // Reset form when modal opens
  useEffect(() => {
    console.log('🔍 AgentCreateModal useEffect triggered:', {
      isOpen,
      supportedModelsLength: supportedModels.length,
      supportedModels: supportedModels,
      firstModel: supportedModels.length > 0 ? supportedModels[0] : null
    });

    if (isOpen) {
      const defaultModelId = supportedModels.length > 0 ? supportedModels[0].model_id : '';
      console.log('📝 Setting form data with default model:', defaultModelId);

      setFormData({
        name: '',
        description: '',
        system_prompt: '',
        model_id: defaultModelId,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9,
        enabled_tools: ['calculator']
      });
    }
  }, [isOpen, supportedModels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter an agent name');
      return;
    }

    if (!formData.model_id) {
      alert('Please select a model');
      return;
    }

    setIsCreating(true);

    try {
      const selectedModel = supportedModels.find(m => m.model_id === formData.model_id);
      if (!selectedModel) {
        throw new Error('Selected model not found');
      }

      const request: AgentCreateRequest = {
        config: {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          system_prompt: formData.system_prompt.trim() || undefined,
          model_config: {
            model_id: formData.model_id,
            model_name: selectedModel.model_name,
            provider: selectedModel.provider,
            temperature: formData.temperature,
            max_tokens: formData.max_tokens,
            top_p: formData.top_p,
            stop_sequences: []
          },
          tools: supportedTools.map(tool => ({
            tool_id: tool.tool_id,
            tool_name: tool.tool_name,
            description: tool.description,
            enabled: formData.enabled_tools.includes(tool.tool_id),
            parameters: {}
          })),
          metadata: {}
        }
      };

      await onCreateAgent(request);
      onClose();
    } catch (error) {
      console.error('Failed to create agent:', error);
      alert(`Failed to create agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    if (!isCreating) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.titleSection}>
            <IoPersonOutline className={styles.titleIcon} />
            <h2 className={styles.modalTitle}>Create New Agent</h2>
          </div>
          <button
            className={styles.closeButton}
            onClick={handleCancel}
            disabled={isCreating}
            title="Close"
          >
            <IoCloseOutline />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formSection}>
            <label className={styles.formLabel}>{t('create.agentName')} *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={styles.formInput}
              placeholder={t('create.agentNamePlaceholder')}
              required
              disabled={isCreating}
            />
          </div>

          <div className={styles.formSection}>
            <label className={styles.formLabel}>{t('create.agentDescription')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={styles.formTextarea}
              placeholder={t('create.agentDescriptionPlaceholder')}
              rows={3}
              disabled={isCreating}
            />
          </div>

          <div className={styles.formSection}>
            <label className={styles.formLabel}>System Prompt</label>
            <textarea
              value={formData.system_prompt}
              onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
              className={styles.formTextarea}
              placeholder="Enter system prompt for the agent"
              rows={4}
              disabled={isCreating}
            />
          </div>

          <div className={styles.formSection}>
            <label className={styles.formLabel}>Model *</label>
            <select
              value={formData.model_id}
              onChange={(e) => {
                console.log('🔄 Model selection changed:', e.target.value);
                setFormData({ ...formData, model_id: e.target.value });
              }}
              className={styles.formSelect}
              required
              disabled={isCreating}
            >
              {(() => {
                console.log('🎯 Rendering model options:', {
                  supportedModelsCount: supportedModels.length,
                  supportedModels: supportedModels,
                  currentFormModelId: formData.model_id
                });

                if (supportedModels.length === 0) {
                  console.log('⚠️ No supported models available for dropdown');
                  return <option value="">No models available</option>;
                }

                return supportedModels.map((model, index) => {
                  console.log(`📋 Rendering model option ${index}:`, model);
                  return (
                    <option key={model.model_id} value={model.model_id}>
                      {model.model_name} ({model.provider})
                    </option>
                  );
                });
              })()}
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formSection}>
              <label className={styles.formLabel}>{t('create.temperature')}</label>
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                className={styles.formInput}
                disabled={isCreating}
              />
            </div>
            <div className={styles.formSection}>
              <label className={styles.formLabel}>{t('create.maxTokens')}</label>
              <input
                type="number"
                min="1"
                max="8000"
                value={formData.max_tokens}
                onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                className={styles.formInput}
                disabled={isCreating}
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
                    checked={formData.enabled_tools.includes(tool.tool_id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          enabled_tools: [...formData.enabled_tools, tool.tool_id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          enabled_tools: formData.enabled_tools.filter(id => id !== tool.tool_id)
                        });
                      }
                    }}
                    disabled={isCreating}
                  />
                  <span className={styles.toolName}>{tool.tool_name}</span>
                  <span className={styles.toolDescription}>{tool.description}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.createButton}
              disabled={isCreating || !formData.name.trim()}
            >
              <IoSaveOutline />
              {isCreating ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
