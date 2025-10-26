/**
 * Tests for DocumentationGenerator component
 * 
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DocumentationGenerator } from '../DocumentationGenerator';
import { aiSuggestionProvider } from '@lionpack/leo-client/src/lib/intelligence/ai-suggestions';

// Mock the AI suggestion provider
jest.mock('@lionpack/leo-client/src/lib/intelligence/ai-suggestions', () => ({
  aiSuggestionProvider: {
    generateDocumentation: jest.fn(),
  },
}));

// Mock Morphic components
jest.mock('../../MorphicChat', () => ({
  ChatInput: ({ onSendMessage, isLoading, placeholder }: any) => (
    <div data-testid="chat-input">
      <input
        data-testid="custom-prompt-input"
        placeholder={placeholder}
        disabled={isLoading}
        onChange={(e) => {}}
      />
      <button
        data-testid="send-button"
        onClick={() => onSendMessage('Test prompt')}
        disabled={isLoading}
      >
        Send
      </button>
    </div>
  ),
  MessageDisplay: ({ messages, isLoading }: any) => (
    <div data-testid="message-display">
      {messages.map((msg: any) => (
        <div key={msg.id} data-testid={`message-${msg.role}`}>
          {msg.content}
        </div>
      ))}
      {isLoading && <div data-testid="loading-indicator">Loading...</div>}
    </div>
  ),
}));

describe('DocumentationGenerator', () => {
  const mockCode = `
function add(a, b) {
  return a + b;
}
  `.trim();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default JSDoc type selected', () => {
      render(<DocumentationGenerator code={mockCode} />);
      
      expect(screen.getByText('📝 Documentation Generator')).toBeInTheDocument();
      expect(screen.getByText('AI-Powered')).toBeInTheDocument();
      
      // Check doc type buttons
      expect(screen.getByText('JSDOC')).toBeInTheDocument();
      expect(screen.getByText('TSDOC')).toBeInTheDocument();
      expect(screen.getByText('README')).toBeInTheDocument();
    });

    it('should display code preview', () => {
      render(<DocumentationGenerator code={mockCode} />);
      
      expect(screen.getByText(/Code to document:/)).toBeInTheDocument();
      expect(screen.getByText(/function add/)).toBeInTheDocument();
    });

    it('should show empty state when no messages', () => {
      render(<DocumentationGenerator code={mockCode} />);
      
      expect(screen.getByText('Generate Documentation')).toBeInTheDocument();
      expect(screen.getByText(/AI will analyze your code/)).toBeInTheDocument();
    });

    it('should render close button when onClose provided', () => {
      const onClose = jest.fn();
      render(<DocumentationGenerator code={mockCode} onClose={onClose} />);
      
      const closeButton = screen.getByText('✕');
      expect(closeButton).toBeInTheDocument();
      
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Doc Type Selection', () => {
    it('should allow switching doc types', () => {
      render(<DocumentationGenerator code={mockCode} />);
      
      const tsdocButton = screen.getByText('TSDOC');
      fireEvent.click(tsdocButton);
      
      expect(screen.getByText(/Generate TSDoc comments/)).toBeInTheDocument();
    });

    it('should show correct description for each doc type', () => {
      render(<DocumentationGenerator code={mockCode} />);
      
      // JSDoc (default)
      expect(screen.getByText(/Generate JSDoc comments/)).toBeInTheDocument();
      
      // Switch to TSDoc
      fireEvent.click(screen.getByText('TSDOC'));
      expect(screen.getByText(/Generate TSDoc comments/)).toBeInTheDocument();
      
      // Switch to README
      fireEvent.click(screen.getByText('README'));
      expect(screen.getByText(/Generate README documentation/)).toBeInTheDocument();
    });
  });

  describe('Documentation Generation', () => {
    it('should generate JSDoc documentation', async () => {
      const mockDocs = '/** Add two numbers */';
      (aiSuggestionProvider.generateDocumentation as jest.Mock).mockResolvedValue(mockDocs);

      render(<DocumentationGenerator code={mockCode} />);
      
      const generateButton = screen.getByText(/Generate JSDOC/);
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(aiSuggestionProvider.generateDocumentation).toHaveBeenCalledWith(
          mockCode,
          'jsdoc',
          expect.objectContaining({
            context: expect.stringContaining('Language: typescript'),
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText(mockDocs)).toBeInTheDocument();
      });
    });

    it('should show loading state during generation', async () => {
      (aiSuggestionProvider.generateDocumentation as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('/** docs */'), 100))
      );

      render(<DocumentationGenerator code={mockCode} />);
      
      const generateButton = screen.getByText(/Generate JSDOC/);
      fireEvent.click(generateButton);

      // Should show loading
      await waitFor(() => {
        expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
      });

      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('should handle generation errors', async () => {
      (aiSuggestionProvider.generateDocumentation as jest.Mock).mockRejectedValue(
        new Error('API error')
      );

      render(<DocumentationGenerator code={mockCode} />);
      
      fireEvent.click(screen.getByText(/Generate JSDOC/));

      await waitFor(() => {
        expect(screen.getByText(/Error generating documentation/)).toBeInTheDocument();
        expect(screen.getByText(/API error/)).toBeInTheDocument();
      });
    });

    it('should support "Include Examples" quick action', async () => {
      const mockDocs = '/** Add with examples */';
      (aiSuggestionProvider.generateDocumentation as jest.Mock).mockResolvedValue(mockDocs);

      render(<DocumentationGenerator code={mockCode} />);
      
      fireEvent.click(screen.getByText(/Include Examples/));

      await waitFor(() => {
        expect(screen.getByText(/Add examples and usage instructions/)).toBeInTheDocument();
      });
    });

    it('should support "Comprehensive" quick action', async () => {
      const mockDocs = '/** Comprehensive docs */';
      (aiSuggestionProvider.generateDocumentation as jest.Mock).mockResolvedValue(mockDocs);

      render(<DocumentationGenerator code={mockCode} />);
      
      fireEvent.click(screen.getByText(/Comprehensive/));

      await waitFor(() => {
        expect(screen.getByText(/Generate comprehensive documentation/)).toBeInTheDocument();
      });
    });

    it('should support custom prompts', async () => {
      const mockDocs = '/** Custom docs */';
      (aiSuggestionProvider.generateDocumentation as jest.Mock).mockResolvedValue(mockDocs);

      render(<DocumentationGenerator code={mockCode} />);
      
      fireEvent.click(screen.getByTestId('send-button'));

      await waitFor(() => {
        expect(screen.getByText(/Test prompt/)).toBeInTheDocument();
      });
    });
  });

  describe('Documentation Actions', () => {
    it('should copy documentation to clipboard', async () => {
      const mockDocs = '/** Test docs */';
      (aiSuggestionProvider.generateDocumentation as jest.Mock).mockResolvedValue(mockDocs);

      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

      render(<DocumentationGenerator code={mockCode} />);
      
      fireEvent.click(screen.getByText(/Generate JSDOC/));

      await waitFor(() => {
        expect(screen.getByText('📋 Copy')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('📋 Copy'));
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockDocs);
    });

    it('should apply documentation when Apply button clicked', async () => {
      const mockDocs = '/** Applied docs */';
      const onApply = jest.fn();
      const onClose = jest.fn();
      
      (aiSuggestionProvider.generateDocumentation as jest.Mock).mockResolvedValue(mockDocs);

      render(
        <DocumentationGenerator
          code={mockCode}
          onApply={onApply}
          onClose={onClose}
        />
      );
      
      fireEvent.click(screen.getByText(/Generate JSDOC/));

      await waitFor(() => {
        expect(screen.getByText('✓ Apply Documentation')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('✓ Apply Documentation'));
      
      expect(onApply).toHaveBeenCalledWith(mockDocs);
      expect(onClose).toHaveBeenCalled();
    });

    it('should not show Apply button when onApply not provided', async () => {
      const mockDocs = '/** Test docs */';
      (aiSuggestionProvider.generateDocumentation as jest.Mock).mockResolvedValue(mockDocs);

      render(<DocumentationGenerator code={mockCode} />);
      
      fireEvent.click(screen.getByText(/Generate JSDOC/));

      await waitFor(() => {
        expect(screen.getByText('📋 Copy')).toBeInTheDocument();
      });

      expect(screen.queryByText('✓ Apply Documentation')).not.toBeInTheDocument();
    });
  });

  describe('Language Context', () => {
    it('should use provided language in context', async () => {
      (aiSuggestionProvider.generateDocumentation as jest.Mock).mockResolvedValue('/** docs */');

      render(<DocumentationGenerator code={mockCode} language="javascript" />);
      
      fireEvent.click(screen.getByText(/Generate JSDOC/));

      await waitFor(() => {
        expect(aiSuggestionProvider.generateDocumentation).toHaveBeenCalledWith(
          mockCode,
          'jsdoc',
          expect.objectContaining({
            context: expect.stringContaining('Language: javascript'),
          })
        );
      });
    });

    it('should default to typescript if language not provided', async () => {
      (aiSuggestionProvider.generateDocumentation as jest.Mock).mockResolvedValue('/** docs */');

      render(<DocumentationGenerator code={mockCode} />);
      
      fireEvent.click(screen.getByText(/Generate JSDOC/));

      await waitFor(() => {
        expect(aiSuggestionProvider.generateDocumentation).toHaveBeenCalledWith(
          mockCode,
          'jsdoc',
          expect.objectContaining({
            context: expect.stringContaining('Language: typescript'),
          })
        );
      });
    });
  });

  describe('Code Truncation', () => {
    it('should truncate long code in preview', () => {
      const longCode = Array(20).fill('const x = 1;').join('\n');
      
      render(<DocumentationGenerator code={longCode} />);
      
      // Should show first 10 lines + ellipsis
      expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
    });

    it('should not truncate short code', () => {
      const shortCode = 'const x = 1;\nconst y = 2;';
      
      render(<DocumentationGenerator code={shortCode} />);
      
      expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
    });
  });
});
