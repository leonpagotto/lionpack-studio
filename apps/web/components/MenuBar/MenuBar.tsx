/**
 * MenuBar Component
 *
 * VS Code-style menu bar with dropdown menus
 */

import React, { useState } from 'react';

interface MenuItem {
  label: string;
  shortcut?: string;
  action: () => void;
  divider?: boolean;
  disabled?: boolean;
}

interface MenuBarProps {
  onNewFile?: () => void;
  onSaveFile?: () => void;
  onOpenFolder?: () => void;
  onToggleSidebar?: () => void;
  onToggleTerminal?: () => void;
  onToggleAIChat?: () => void;
  onRunFile?: () => void;
  onFindInFiles?: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onNewFile,
  onSaveFile,
  onOpenFolder,
  onToggleSidebar,
  onToggleTerminal,
  onToggleAIChat,
  onRunFile,
  onFindInFiles,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menus = {
    File: [
      {
        label: 'New File',
        shortcut: 'Cmd+N',
        action: () => onNewFile?.(),
      },
      {
        label: 'Open Folder',
        shortcut: 'Cmd+O',
        action: () => onOpenFolder?.(),
      },
      { divider: true } as MenuItem,
      {
        label: 'Save',
        shortcut: 'Cmd+S',
        action: () => onSaveFile?.(),
      },
      {
        label: 'Save As...',
        shortcut: 'Cmd+Shift+S',
        action: () => alert('Save As not yet implemented'),
      },
      { divider: true } as MenuItem,
      {
        label: 'Close Editor',
        shortcut: 'Cmd+W',
        action: () => alert('Close not yet implemented'),
      },
    ],
    Edit: [
      {
        label: 'Cut',
        shortcut: 'Cmd+X',
        action: () => document.execCommand('cut'),
      },
      {
        label: 'Copy',
        shortcut: 'Cmd+C',
        action: () => document.execCommand('copy'),
      },
      {
        label: 'Paste',
        shortcut: 'Cmd+V',
        action: () => document.execCommand('paste'),
      },
      { divider: true } as MenuItem,
      {
        label: 'Find',
        shortcut: 'Cmd+F',
        action: () => onFindInFiles?.(),
      },
      {
        label: 'Replace',
        shortcut: 'Cmd+H',
        action: () => alert('Replace not yet implemented'),
      },
    ],
    View: [
      {
        label: 'Toggle Sidebar',
        shortcut: 'Cmd+B',
        action: () => onToggleSidebar?.(),
      },
      {
        label: 'Toggle Terminal',
        shortcut: 'Cmd+J',
        action: () => onToggleTerminal?.(),
      },
      {
        label: 'Toggle AI Chat',
        shortcut: 'Cmd+Shift+A',
        action: () => onToggleAIChat?.(),
      },
      { divider: true } as MenuItem,
      {
        label: 'Zoom In',
        shortcut: 'Cmd++',
        action: () => alert('Zoom In not yet implemented'),
      },
      {
        label: 'Zoom Out',
        shortcut: 'Cmd+-',
        action: () => alert('Zoom Out not yet implemented'),
      },
    ],
    Go: [
      {
        label: 'Go to File...',
        shortcut: 'Cmd+P',
        action: () => alert('Go to File not yet implemented'),
      },
      {
        label: 'Go to Line...',
        shortcut: 'Cmd+G',
        action: () => alert('Go to Line not yet implemented'),
      },
      {
        label: 'Go to Symbol...',
        shortcut: 'Cmd+Shift+O',
        action: () => alert('Go to Symbol not yet implemented'),
      },
    ],
    Run: [
      {
        label: 'Run File',
        shortcut: 'Cmd+R',
        action: () => onRunFile?.(),
      },
      {
        label: 'Run with Debugging',
        shortcut: 'F5',
        action: () => alert('Debug not yet implemented'),
      },
      { divider: true } as MenuItem,
      {
        label: 'Run Tests',
        shortcut: 'Cmd+T',
        action: () => alert('Run Tests not yet implemented'),
      },
    ],
    Terminal: [
      {
        label: 'New Terminal',
        shortcut: 'Ctrl+`',
        action: () => onToggleTerminal?.(),
      },
      {
        label: 'Split Terminal',
        shortcut: 'Cmd+\\',
        action: () => alert('Split Terminal not yet implemented'),
      },
      { divider: true } as MenuItem,
      {
        label: 'Clear Terminal',
        action: () => alert('Clear Terminal not yet implemented'),
      },
    ],
    Help: [
      {
        label: 'Documentation',
        action: () => window.open('/docs', '_blank'),
      },
      {
        label: 'Report Issue',
        action: () =>
          window.open('https://github.com/leonpagotto/lionpack-studio/issues', '_blank'),
      },
      { divider: true } as MenuItem,
      {
        label: 'About LionPack Studio',
        action: () => alert('LionPack Studio v0.1.0 - Development Culture in a Box'),
      },
    ],
  };

  const handleMenuClick = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    setActiveMenu(null);
  };

  return (
    <nav className="flex items-center gap-1 text-sm relative">
      {Object.entries(menus).map(([menuName, menuItems]) => (
        <div key={menuName} className="relative">
          <button
            onClick={() => handleMenuClick(menuName)}
            className={`px-3 py-1 hover:bg-slate-800 rounded ${
              activeMenu === menuName ? 'bg-slate-800' : ''
            }`}
          >
            {menuName}
          </button>

          {activeMenu === menuName && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setActiveMenu(null)}
              />

              {/* Dropdown */}
              <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-700 rounded shadow-lg py-1 min-w-48 z-20">
                {menuItems.map((item, idx) => {
                  if ('divider' in item && item.divider) {
                    return (
                      <div
                        key={`divider-${idx}`}
                        className="my-1 border-t border-slate-700"
                      />
                    );
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleMenuItemClick(item.action)}
                      disabled={'disabled' in item ? item.disabled : false}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      {'shortcut' in item && item.shortcut && (
                        <span className="text-xs text-slate-400 ml-4">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ))}
    </nav>
  );
};

export default MenuBar;
