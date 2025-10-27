/**
 * API Integration Test Script
 * Tests multi-provider chat API with different providers and models
 */

import type { AIMessage } from '@lionpack/leo-client';

interface ChatRequest {
  messages: AIMessage[];
  provider?: 'gemini' | 'claude' | 'gpt';
  model?: string;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}

interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

const API_URL = 'http://localhost:3001/api/chat';

/**
 * Test non-streaming chat
 */
async function testNonStreamingChat(
  provider: 'gemini' | 'claude' | 'gpt',
  model?: string
) {
  console.log(`\n🧪 Testing ${provider} (non-streaming)${model ? ` with model ${model}` : ''}...`);

  const request: ChatRequest = {
    messages: [
      {
        role: 'user',
        content: 'Say "Hello from LionPack Studio!" in exactly those words.'
      }
    ],
    provider,
    stream: false,
    temperature: 0.1,
    maxTokens: 50
  };

  if (model) {
    request.model = model;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`❌ Error: ${error.error}`);
      if (error.availableModels) {
        console.log('Available models:', error.availableModels);
      }
      return false;
    }

    const data: ChatResponse = await response.json();
    console.log(`✅ Success!`);
    console.log(`   Model: ${data.model}`);
    console.log(`   Response: ${data.content.substring(0, 100)}...`);
    if (data.usage) {
      console.log(`   Tokens: ${data.usage.totalTokens} (prompt: ${data.usage.promptTokens}, completion: ${data.usage.completionTokens})`);
    }
    return true;
  } catch (error) {
    console.error(`❌ Request failed:`, error);
    return false;
  }
}

/**
 * Test streaming chat
 */
async function testStreamingChat(
  provider: 'gemini' | 'claude' | 'gpt',
  model?: string
) {
  console.log(`\n🧪 Testing ${provider} (streaming)${model ? ` with model ${model}` : ''}...`);

  const request: ChatRequest = {
    messages: [
      {
        role: 'user',
        content: 'Count from 1 to 3 slowly.'
      }
    ],
    provider,
    stream: true,
    temperature: 0.1,
    maxTokens: 50
  };

  if (model) {
    request.model = model;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`❌ Error: ${error.error}`);
      return false;
    }

    console.log(`✅ Streaming started...`);

    const reader = response.body?.getReader();
    if (!reader) {
      console.error('❌ No response stream');
      return false;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullResponse = '';
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            console.log(`✅ Stream complete!`);
            console.log(`   Total chunks: ${chunkCount}`);
            console.log(`   Response: ${fullResponse}`);
            return true;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullResponse += parsed.content;
              chunkCount++;
              process.stdout.write('.');
            }
            if (parsed.error) {
              console.error(`\n❌ Stream error: ${parsed.error}`);
              return false;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }

    console.log(`\n✅ Stream ended (no [DONE] marker)`);
    return true;
  } catch (error) {
    console.error(`❌ Request failed:`, error);
    return false;
  }
}

/**
 * Test code generation
 */
async function testCodeGeneration(provider: 'gemini' | 'claude' | 'gpt') {
  console.log(`\n🧪 Testing ${provider} code generation...`);

  const request: ChatRequest = {
    messages: [
      {
        role: 'user',
        content: `Create a simple React button component in TypeScript.
Return ONLY valid JSON in this exact format:
{
  "files": [
    {
      "path": "Button.tsx",
      "content": "// component code here",
      "language": "typescript"
    }
  ]
}

No explanation, just the JSON.`
      }
    ],
    provider,
    stream: false,
    temperature: 0.3,
    maxTokens: 1000
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`❌ Error: ${error.error}`);
      return false;
    }

    const data: ChatResponse = await response.json();
    console.log(`✅ Success!`);
    console.log(`   Response length: ${data.content.length} characters`);

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(data.content);
      if (parsed.files && Array.isArray(parsed.files)) {
        console.log(`   ✅ Valid code generation format!`);
        console.log(`   Files: ${parsed.files.map((f: any) => f.path).join(', ')}`);
        return true;
      } else {
        console.log(`   ⚠️ Response is JSON but not in expected format`);
        return false;
      }
    } catch (e) {
      console.log(`   ⚠️ Response is not valid JSON (this is expected for some providers)`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Request failed:`, error);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting API Integration Tests');
  console.log('=====================================\n');

  const results: { [key: string]: boolean } = {};

  // Test Gemini (should work - we have API key)
  results['gemini-non-streaming'] = await testNonStreamingChat('gemini');
  results['gemini-streaming'] = await testStreamingChat('gemini');
  results['gemini-flash'] = await testNonStreamingChat('gemini', 'gemini-2.5-flash');
  results['gemini-code-gen'] = await testCodeGeneration('gemini');

  // Test Claude (should fail - not implemented yet)
  console.log('\n---\n');
  results['claude-expected-fail'] = !(await testNonStreamingChat('claude'));

  // Test GPT (should fail - not implemented yet)
  console.log('\n---\n');
  results['gpt-expected-fail'] = !(await testNonStreamingChat('gpt'));

  // Print summary
  console.log('\n\n📊 Test Summary');
  console.log('=====================================');

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });

  console.log(`\n${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️ Some tests failed');
  }
}

// Run tests
runTests().catch(console.error);
