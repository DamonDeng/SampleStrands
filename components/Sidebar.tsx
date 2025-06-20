import { useState } from 'react';
import { IoChatbubbleEllipsesOutline, IoAddOutline, IoSettingsOutline, IoHelpCircleOutline, IoPersonOutline, IoPeopleOutline } from 'react-icons/io5';
import styles from '../styles/Sidebar.module.css';

interface SidebarProps {
  onNewChat: () => void;
  onNavigate?: (view: 'chat' | 'agents' | 'settings' | 'help') => void;
  activeView?: string;
}

export default function Sidebar({ onNewChat, onNavigate, activeView = 'chat' }: SidebarProps) {
  const [activeItem, setActiveItem] = useState(activeView);

  const handleNavigation = (view: 'chat' | 'agents' | 'settings' | 'help') => {
    setActiveItem(view);
    onNavigate?.(view);
  };

  const sidebarItems = [
    {
      id: 'new-chat',
      label: 'New Chat',
      icon: <IoAddOutline />,
      onClick: onNewChat,
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <IoChatbubbleEllipsesOutline />,
      onClick: () => handleNavigation('chat'),
    },
    {
      id: 'agents',
      label: 'Agents',
      icon: <IoPeopleOutline />,
      onClick: () => handleNavigation('agents'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <IoSettingsOutline />,
      onClick: () => handleNavigation('settings'),
    },
    {
      id: 'help',
      label: 'Help',
      icon: <IoHelpCircleOutline />,
      onClick: () => handleNavigation('help'),
    },
  ];

  return (
    <div className={styles.sidebar}>

      <nav className={styles.nav}>
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeItem === item.id ? styles.active : ''}`}
            onClick={item.onClick}
            title={item.label}
          >
            <span className={styles.icon}>{item.icon}</span>
          </button>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}><IoPersonOutline /></div>
        </div>
      </div>
    </div>
  );
}
