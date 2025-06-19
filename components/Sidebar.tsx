import { useState } from 'react';
import styles from '../styles/Sidebar.module.css';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNewChat: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse, onNewChat }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('chat');

  const sidebarItems = [
    {
      id: 'chat',
      label: 'Chat',
      icon: '💬',
      onClick: () => setActiveItem('chat'),
    },
    {
      id: 'new-chat',
      label: 'New Chat',
      icon: '➕',
      onClick: onNewChat,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      onClick: () => setActiveItem('settings'),
    },
    {
      id: 'help',
      label: 'Help',
      icon: '❓',
      onClick: () => setActiveItem('help'),
    },
  ];

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <button 
          className={styles.toggleButton}
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className={styles.nav}>
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeItem === item.id ? styles.active : ''}`}
            onClick={item.onClick}
            title={item.label}
          >
            <span className={styles.icon}>{item.icon}</span>
            {!collapsed && <span className={styles.label}>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>👤</div>
          {!collapsed && (
            <div className={styles.userDetails}>
              <div className={styles.userName}>DamonDeng</div>
              <div className={styles.userStatus}>Online</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
