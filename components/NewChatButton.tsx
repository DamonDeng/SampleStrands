import { useState, useRef, useEffect } from 'react';
import { Agent } from '../types/agent';
import { IoAdd, IoChevronUp, IoPersonOutline, IoCheckbox, IoSquareOutline } from 'react-icons/io5';
import { useAppTranslation } from '../contexts/I18nContext';
import styles from '../styles/NewChatButton.module.css';

interface NewChatButtonProps {
  defaultAgent: Agent | null;
  agents: Agent[];
  onCreateSession: (agentId?: string) => void;
  onSetDefaultAgent: (agentId: string) => void;
  disabled?: boolean;
}

export default function NewChatButton({
  defaultAgent,
  agents,
  onCreateSession,
  onSetDefaultAgent,
  disabled = false
}: NewChatButtonProps) {
  const { t } = useAppTranslation('agents');
  const [showDropup, setShowDropup] = useState(false);
  const dropupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropupRef.current && 
        !dropupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropup(false);
      }
    };

    if (showDropup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropup]);

  // Handle main button click (create session with default agent)
  const handleMainButtonClick = () => {
    if (disabled) return;
    
    if (defaultAgent) {
      onCreateSession(defaultAgent.id);
    } else {
      onCreateSession(); // Create session without agent
    }
  };

  // Handle arrow button click (toggle dropup)
  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setShowDropup(!showDropup);
  };

  // Handle agent selection from dropup
  const handleAgentSelect = (agent: Agent) => {
    onCreateSession(agent.id);
    setShowDropup(false);
  };

  // Handle default agent checkbox
  const handleSetDefault = (e: React.MouseEvent, agent: Agent) => {
    e.stopPropagation(); // Prevent agent selection
    onSetDefaultAgent(agent.id);
    // Don't close dropup - let user continue browsing
  };

  // Filter to only active agents
  const activeAgents = agents.filter(agent => agent.is_active);

  // Debug logging
  console.log('🔧 NewChatButton props:', {
    defaultAgent: defaultAgent?.config.name || 'None',
    totalAgents: agents.length,
    activeAgents: activeAgents.length,
    disabled
  });

  return (
    <div className={styles.newChatButtonContainer}>
      {/* Dropup Menu */}
      {showDropup && (
        <div ref={dropupRef} className={styles.dropup}>
          <div className={styles.dropupHeader}>
            <IoPersonOutline />
            <span>{t('dropdown.selectAgent')}</span>
          </div>
          <div className={styles.agentList}>
            {activeAgents.length === 0 ? (
              <div className={styles.emptyState}>
                <p>{t('dropdown.noActiveAgents')}</p>
                <p className={styles.emptySubtext}>{t('dropdown.createAgentFirst')}</p>
              </div>
            ) : (
              activeAgents.map((agent) => (
                <div
                  key={agent.id}
                  className={styles.agentItem}
                  onClick={() => handleAgentSelect(agent)}
                >
                  <div className={styles.agentInfo}>
                    <div className={styles.agentName}>{agent.config.name}</div>
                    <div className={styles.agentModel}>
                      {agent.config.model_config.model_name}
                    </div>
                  </div>
                  <button
                    className={styles.defaultCheckbox}
                    onClick={(e) => handleSetDefault(e, agent)}
                    title={defaultAgent?.id === agent.id ? "Current default agent" : "Set as default agent"}
                  >
                    {defaultAgent?.id === agent.id ? (
                      <IoCheckbox className={styles.checkedIcon} />
                    ) : (
                      <IoSquareOutline className={styles.uncheckedIcon} />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Button */}
      <button
        ref={buttonRef}
        className={`${styles.newChatButton} ${disabled ? styles.disabled : ''}`}
        disabled={disabled}
      >
        {/* Main clickable area */}
        <div className={styles.mainArea} onClick={handleMainButtonClick}>
          <IoAdd className={styles.addIcon} />
          <span className={styles.buttonText}>
            {defaultAgent ? defaultAgent.config.name : t('buttons.newChat', { ns: 'common' })}
          </span>
        </div>

        {/* Arrow area */}
        <div 
          className={`${styles.arrowArea} ${showDropup ? styles.active : ''}`}
          onClick={handleArrowClick}
        >
          <IoChevronUp className={styles.arrowIcon} />
        </div>
      </button>
    </div>
  );
}
