import { createMocks } from 'node-mocks-http';
import handler from '../detect-mode';

describe('/api/detect-mode', () => {
  it('POST: accepts input in body and returns detection result', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { input: 'Refactor this function to improve performance' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const result = JSON.parse(res._getData());
    expect(result).toHaveProperty('intent');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('timestamp');
  });

  it('GET: accepts query param and returns detection result', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { q: 'Write unit tests for this module' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const result = JSON.parse(res._getData());
    expect(result.intent).toBe('test');
  });

  it('returns 400 when input is missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toContain('Missing input text');
  });

  it('returns 400 when input is empty string', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { input: '   ' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('correctly classifies generate intent', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { input: 'Write a function to sort an array' },
    });
    await handler(req, res);
    const result = JSON.parse(res._getData());
    expect(result.intent).toBe('generate');
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('correctly classifies debug intent', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { input: 'Fix the bug causing the login error' },
    });
    await handler(req, res);
    const result = JSON.parse(res._getData());
    expect(result.intent).toBe('debug');
  });
});
