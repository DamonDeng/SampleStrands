import { useState } from 'react';
import { Agent } from '../types/agent';
import { IoPeopleOutline, IoPencilOutline, IoTrashOutline, IoPlayOutline, IoPauseOutline, IoPersonOutline } from 'react-icons/io5';
import styles from '../styles/AgentList.module.css';

interface AgentListProps {
  agents: Agent[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  onDeleteAgent: (agentId: string) => void;
  onUpdateAgent: (agentId: string, name: string) => void;
  onToggleAgent: (agentId: string, isActive: boolean) => void;
  onCreateAgent: () => void;
}

export default function AgentList({
  agents,
  selectedAgentId,
  onSelectAgent,
  onDeleteAgent,
  onUpdateAgent,
  onToggleAgent,
  onCreateAgent
}: AgentListProps) {
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleStartEdit = (agent: Agent) => {
    setEditingAgentId(agent.id);
    setEditingName(agent.config.name);
  };

  const handleSaveEdit = () => {
    if (editingAgentId && editingName.trim()) {
      onUpdateAgent(editingAgentId, editingName.trim());
    }
    setEditingAgentId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingAgentId(null);
    setEditingName('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getModelDisplayName = (agent: Agent) => {
    return agent.config.model_config.model_name || 'Unknown Model';
  };

  const getToolsCount = (agent: Agent) => {
    return agent.config.tools.filter(tool => tool.enabled).length;
  };

  return (
    <div className={styles.agentList}>
      <div className={styles.header}>
        <h2 className={styles.title}>AI Agents</h2>
        <div className={styles.headerActions}>
          <div className={styles.agentCount}>{agents.length}</div>
          <button
            className={styles.createButton}
            onClick={onCreateAgent}
            title="Create new agent"
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.agents}>
        {agents.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><IoPersonOutline /></div>
            <p className={styles.emptyText}>No agents yet</p>
            <p className={styles.emptySubtext}>Create your first AI agent</p>
            <button
              className={styles.createAgentButton}
              onClick={onCreateAgent}
            >
              Create Agent
            </button>
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              className={`${styles.agentItem} ${
                selectedAgentId === agent.id ? styles.active : ''
              } ${!agent.is_active ? styles.inactive : ''}`}
              onClick={() => onSelectAgent(agent.id)}
            >
              <div className={styles.agentContent}>
                {editingAgentId === agent.id ? (
                  <div className={styles.editForm}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className={styles.editInput}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      onBlur={handleSaveEdit}
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <div className={styles.agentHeader}>
                      <div className={styles.agentTitleRow}>
                        <h3 className={styles.agentTitle}>{agent.config.name}</h3>
                        <div className={styles.agentStatus}>
                          {agent.is_active ? (
                            <span className={styles.statusActive} title="Active">●</span>
                          ) : (
                            <span className={styles.statusInactive} title="Inactive">●</span>
                          )}
                        </div>
                      </div>
                      <div className={styles.agentActions}>
                        <button
                          className={styles.actionButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleAgent(agent.id, !agent.is_active);
                          }}
                          title={agent.is_active ? "Deactivate agent" : "Activate agent"}
                        >
                          {agent.is_active ? <IoPauseOutline /> : <IoPlayOutline />}
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(agent);
                          }}
                          title="Edit name"
                        >
                          <IoPencilOutline />
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteAgent(agent.id);
                          }}
                          title="Delete agent"
                        >
                          <IoTrashOutline />
                        </button>
                      </div>
                    </div>
                    
                    <p className={styles.agentDescription}>
                      {agent.config.description || 'No description'}
                    </p>
                    
                    <div className={styles.agentDetails}>
                      <span className={styles.modelInfo}>
                        {getModelDisplayName(agent)}
                      </span>
                      <span className={styles.toolsInfo}>
                        {getToolsCount(agent)} tools
                      </span>
                    </div>
                    
                    <div className={styles.agentMeta}>
                      <span className={styles.timestamp}>
                        Updated {formatDate(agent.updated_at)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
