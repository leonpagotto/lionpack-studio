/**
 * Enhanced CodeEditor Tests
 *
 * Tests for the CodeEditor with integrated code intelligence
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CodeEditor from '../CodeEditor';
import { AnalysisEngine } from '@lionpack/leo-client';

// Mock the Analysis Engine
jest.mock('@lionpack/leo-client', () => ({
  AnalysisEngine: jest.fn().mockImplementation(() => ({
    analyzeCode: jest.fn().mockResolvedValue({
      issues: [
        {
          type: 'warning',
          severity: 'medium',
          category: 'best-practice',
          message: 'Async operation without error handling',
          line: 2,
          column: 0,
          endLine: 2,
          endColumn: 40,
          ruleId: 'require-error-handling',
        },
      ],
      metrics: {
        complexity: 3,
        linesOfCode: 3,
        maintainabilityIndex: 85,
        securityScore: 100,
        issues: {
          critical: 0,
          high: 0,
          medium: 1,
          low: 0,
        },
      },
      suggestions: [],
    }),
  })),
}));

describe('CodeEditor with Intelligence', () => {
  const mockFile = {
    path: 'test.ts',
    content: `const data = await fetch('/api/data');
const result = data.json();
console.log(result);`,
    language: 'typescript',
  };

  it('should render code editor', () => {
    render(<CodeEditor file={mockFile} />);

    expect(screen.getByText('test.ts')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('should display code metrics when intelligence is enabled', async () => {
    render(<CodeEditor file={mockFile} enableIntelligence={true} />);

    await waitFor(() => {
      expect(screen.getByText(/Complexity:/)).toBeInTheDocument();
      expect(screen.getByText(/Maintainability:/)).toBeInTheDocument();
      expect(screen.getByText(/Security:/)).toBeInTheDocument();
    });
  });

  it('should not display metrics when intelligence is disabled', () => {
    render(<CodeEditor file={mockFile} enableIntelligence={false} />);

    expect(screen.queryByText(/Complexity:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Maintainability:/)).not.toBeInTheDocument();
  });

  it('should show analyzing indicator', () => {
    render(<CodeEditor file={mockFile} enableIntelligence={true} />);

    // Initially should show analyzing
    expect(screen.getByText(/Analyzing.../)).toBeInTheDocument();
  });

  it('should display issue badges on lines with issues', async () => {
    render(<CodeEditor file={mockFile} enableIntelligence={true} />);

    await waitFor(() => {
      // Should show issue badge (🟡 for warning)
      expect(screen.getByText('🟡')).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    render(<CodeEditor file={mockFile} isLoading={true} />);

    expect(screen.getByText('Loading code...')).toBeInTheDocument();
  });

  it('should show empty state when no file selected', () => {
    render(<CodeEditor file={null} />);

    expect(screen.getByText('No file selected')).toBeInTheDocument();
    expect(screen.getByText('Select a file to view code')).toBeInTheDocument();
  });

  it('should display line count', () => {
    render(<CodeEditor file={mockFile} />);

    expect(screen.getByText(/3 lines/)).toBeInTheDocument();
  });
});
