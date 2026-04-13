import "./TabBar.css";

export default function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="TabBar" aria-label="Secciones principales">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`TabBar-tab ${
            activeTab === tab.id ? "TabBar-tab--active" : ""
          }`}
          onClick={() => onTabChange(tab.id)}
          aria-current={activeTab === tab.id ? "page" : undefined}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
