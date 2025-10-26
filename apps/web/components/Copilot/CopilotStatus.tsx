/**
 * CopilotStatus Component
 * 
 * Shows Copilot authentication and activity status
 * Displays in status bar with indicator
 */

import React, { useEffect, useState } from 'react';

interface CopilotStatusData {
  authenticated: boolean;
  githubUser?: string;
  copilotEnabled: boolean;
  plan: 'individual' | 'business' | 'none';
  aiProvider: string;
}

interface CopilotStatusProps {
  onAuthRequired?: () => void;
}

export const CopilotStatus: React.FC<CopilotStatusProps> = ({ onAuthRequired }) => {
  const [status, setStatus] = useState<CopilotStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/copilot/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch Copilot status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!status?.authenticated && onAuthRequired) {
      onAuthRequired();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>⚠️</span>
        <span>Status unavailable</span>
      </div>
    );
  }

  if (!status.authenticated) {
    return (
      <button
        onClick={handleClick}
        className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
      >
        <span>🤖</span>
        <span>Sign in to Copilot</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Activity indicator */}
      <div className="relative">
        <span className="text-lg">🤖</span>
        {isActive && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Status text */}
      <div className="flex items-center gap-2">
        <span className="text-slate-300">
          {status.copilotEnabled ? 'Copilot' : 'AI Assistant'}
        </span>
        <span className="text-slate-500">•</span>
        <span className="text-green-400">Ready</span>
      </div>

      {/* Provider badge */}
      <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-400 text-xs">
        {status.aiProvider.toUpperCase()}
      </span>

      {/* User info (on hover) */}
      {status.githubUser && (
        <div className="hidden group-hover:block absolute bottom-full mb-2 right-0 bg-slate-900 text-white px-3 py-2 rounded shadow-lg text-xs whitespace-nowrap">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400">Signed in as</span>
            <span className="font-semibold">{status.githubUser}</span>
            <span className="text-slate-400">Plan: {status.plan}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CopilotStatus;
