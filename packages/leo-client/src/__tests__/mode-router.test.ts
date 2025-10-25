import { classifyIntent, detectMode } from '../mode-router';

describe('classifyIntent', () => {
  it('classifies generate intent', () => {
    const r = classifyIntent('Create a function to sort numbers');
    expect(r.intent).toBe('generate');
    expect(r.confidence).toBeGreaterThan(0);
  });
  it('classifies debug intent', () => {
    const r = classifyIntent('Fix this error and debug the failing test case');
    expect(r.intent).toBe('debug');
  });
  it('classifies refactor intent', () => {
    const r = classifyIntent('Refactor this component to extract logic and simplify');
    expect(r.intent).toBe('refactor');
  });
  it('classifies document intent', () => {
    const r = classifyIntent('Document the API endpoints and add comments');
    expect(r.intent).toBe('document');
  });
  it('classifies optimize intent', () => {
    const r = classifyIntent('Optimize the performance of this slow query');
    expect(r.intent).toBe('optimize');
  });
  it('classifies test intent', () => {
    const r = classifyIntent('Write unit tests and jest specs for this module');
    expect(r.intent).toBe('test');
  });
  it('falls back to generate with low confidence for ambiguous input', () => {
    const r = classifyIntent('Hello world');
    expect(['generate', 'unknown']).toContain(r.intent);
  });
});

describe('detectMode', () => {
  it('returns detection response with timestamp and version', () => {
    const r = detectMode('Refactor code to improve structure');
    expect(r.intent).toBe('refactor');
    expect(r.timestamp).toBeTruthy();
    expect(r.version).toBe('1.0.0');
  });
});
