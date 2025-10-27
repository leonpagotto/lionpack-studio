/**
 * AI Provider Selector Component
 *
 * Allows users to choose between AI providers (Claude, GPT, Gemini)
 * and select specific models within each provider.
 *
 * Constitution Alignment:
 * - Facilitation over Complexity: 2-click provider switching
 * - Speed with Purpose: Visual feedback, no page reload
 * - Empowerment: Cost and capability info visible
 */

import React, { useState, useEffect } from 'react';
import { providerRegistry, AIModel } from '@lionpack/leo-client';

export interface AIProviderSelectorProps {
  /** Currently selected provider ID */
  currentProvider?: string;

  /** Currently selected model ID */
  currentModel?: string;

  /** Callback when provider/model changes */
  onProviderChange: (provider: string, model: string) => void;

  /** Disabled state */
  disabled?: boolean;

  /** Show compact mode */
  compact?: boolean;
}

export const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({
  currentProvider = 'gemini',
  currentModel,
  onProviderChange,
  disabled = false,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(currentProvider);
  const [selectedModel, setSelectedModel] = useState(currentModel);

  // Get all registered providers
  const allProviders = providerRegistry.getAll();

  // Build providers list with availability
  const providers = [
    { id: 'gemini', name: 'Gemini', icon: '✨', available: allProviders.some(p => p.name === 'gemini') },
    { id: 'claude', name: 'Claude', icon: '🤖', available: allProviders.some(p => p.name === 'claude') },
    { id: 'gpt', name: 'GPT', icon: '🧠', available: allProviders.some(p => p.name === 'gpt') },
  ];

  // Get current provider instance
  const currentProviderInstance = providerRegistry.get(selectedProvider);
  const availableModels: AIModel[] = currentProviderInstance?.getModels() || [];

  // Get current model details
  const currentModelData = currentProviderInstance?.getModel(selectedModel || '');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.ai-provider-selector')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const handleProviderSelect = (providerId: string) => {
    const providerInstance = providerRegistry.get(providerId);
    if (providerInstance) {
      const models = providerInstance.getModels();
      if (models.length > 0) {
        const firstModel = models[0].id;
        setSelectedProvider(providerId);
        setSelectedModel(firstModel);
        onProviderChange(providerId, firstModel);
        setIsOpen(false);
      }
    }
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    onProviderChange(selectedProvider, modelId);
    setIsOpen(false);
  };

  return (
    <div className="ai-provider-selector relative">
      {/* Current Selection Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border
          bg-white dark:bg-slate-800
          border-slate-300 dark:border-slate-600
          hover:bg-slate-50 dark:hover:bg-slate-700
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        aria-label="Select AI Provider and Model"
        aria-expanded={isOpen}
      >
        {/* Provider Icon */}
        <div className="w-5 h-5 flex items-center justify-center">
          {selectedProvider === 'gemini' && <span>✨</span>}
          {selectedProvider === 'claude' && <span>🤖</span>}
          {selectedProvider === 'gpt' && <span>🧠</span>}
        </div>

        {/* Provider and Model Name */}
        <div className="flex flex-col items-start">
          <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
            {selectedProvider}
          </span>
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {currentModelData?.name || selectedModel}
          </span>
        </div>

        {/* Cost Badge */}
        {currentModelData && (
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            ${(currentModelData.costPer1kTokens.input * 1000).toFixed(2)}/M
          </span>
        )}

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-50">
          {/* Provider Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            {providers.map(provider => (
              <button
                key={provider.id}
                onClick={() => handleProviderSelect(provider.id)}
                disabled={!provider.available}
                className={`
                  flex-1 px-4 py-2 text-sm font-medium
                  transition-colors duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${selectedProvider === provider.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }
                `}
                title={!provider.available ? 'Coming Soon' : ''}
              >
                <span className="mr-1">{provider.icon}</span>
                {provider.name}
              </button>
            ))}
          </div>

          {/* Model List */}
          <div className="max-h-80 overflow-y-auto p-2">
            {availableModels.map(model => (
              <button
                key={model.id}
                onClick={() => handleModelSelect(model.id)}
                className={`
                  w-full text-left px-3 py-2 rounded-md
                  transition-colors duration-200
                  ${selectedModel === model.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {model.description}
                    </div>

                    {/* Capabilities */}
                    <div className="flex gap-1 mt-1">
                      {model.capabilities.streaming && (
                        <span className="px-1.5 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          Streaming
                        </span>
                      )}
                      {model.capabilities.functionCalling && (
                        <span className="px-1.5 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          Functions
                        </span>
                      )}
                      {model.capabilities.vision && (
                        <span className="px-1.5 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          Vision
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="ml-3 text-right">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Input
                    </div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">
                      ${(model.costPer1kTokens.input * 1000).toFixed(2)}/M
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Output
                    </div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">
                      ${(model.costPer1kTokens.output * 1000).toFixed(2)}/M
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer with Max Tokens */}
          {currentModelData && (
            <div className="border-t border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
              Max tokens: {currentModelData.maxTokens.toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIProviderSelector;
