import { useState } from 'react';

export default function Tabs() {
  const [activeTab, setActiveTab] = useState('timeline');

  const tabs = [
    { id: 'timeline', label: '📝 Timeline', icon: '📝' },
    { id: 'gallery', label: '📸 Galería', icon: '📸' },
    { id: 'calendar', label: '📅 Calendario', icon: '📅' },
    { id: 'letters', label: '💌 Cartas', icon: '💌' }
  ];

  return (
    <div className="flex gap-3 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
        >
          {tab.label}
        </button>
      ))}


    </div>
  );
}