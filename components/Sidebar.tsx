import { useState } from 'react';
import { IoChatbubbleEllipsesOutline, IoAddOutline, IoSettingsOutline, IoHelpCircleOutline, IoPersonOutline } from 'react-icons/io5';
import styles from '../styles/Sidebar.module.css';

interface SidebarProps {
  onNewChat: () => void;
}

export default function Sidebar({ onNewChat }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('chat');

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
      onClick: () => setActiveItem('chat'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <IoSettingsOutline />,
      onClick: () => setActiveItem('settings'),
    },
    {
      id: 'help',
      label: 'Help',
      icon: <IoHelpCircleOutline />,
      onClick: () => setActiveItem('help'),
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
