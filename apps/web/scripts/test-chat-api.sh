#!/bin/bash

# API Integration Test Script
# Tests the multi-provider chat API

API_URL="http://localhost:3001/api/chat"

echo "🚀 Testing Chat API Integration"
echo "================================"
echo ""

# Test 1: Gemini Non-Streaming
echo "🧪 Test 1: Gemini Non-Streaming Chat"
echo "-----------------------------------"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Say hello in 3 words"}],
    "provider": "gemini",
    "stream": false,
    "temperature": 0.1,
    "maxTokens": 20
  }' | jq '.'
echo ""
echo ""

# Test 2: Gemini with specific model
echo "🧪 Test 2: Gemini with gemini-2.5-flash model"
echo "--------------------------------------------"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Count to 3"}],
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "stream": false,
    "temperature": 0.1,
    "maxTokens": 30
  }' | jq '.'
echo ""
echo ""

# Test 3: Invalid model
echo "🧪 Test 3: Invalid Model (should return error)"
echo "---------------------------------------------"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "provider": "gemini",
    "model": "invalid-model-xyz",
    "stream": false
  }' | jq '.'
echo ""
echo ""

# Test 4: Claude (should fail - not implemented)
echo "🧪 Test 4: Claude Provider (expected to fail)"
echo "--------------------------------------------"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "provider": "claude",
    "stream": false
  }' | jq '.'
echo ""
echo ""

# Test 5: GPT (should fail - not implemented)
echo "🧪 Test 5: GPT Provider (expected to fail)"
echo "-----------------------------------------"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "provider": "gpt",
    "stream": false
  }' | jq '.'
echo ""
echo ""

# Test 6: Streaming (visual test)
echo "🧪 Test 6: Gemini Streaming Chat"
echo "--------------------------------"
echo "Watch for SSE events..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Count from 1 to 5"}],
    "provider": "gemini",
    "stream": true,
    "temperature": 0.1,
    "maxTokens": 50
  }'
echo ""
echo ""

echo "✅ Tests Complete!"
echo ""
echo "Expected Results:"
echo "  ✅ Tests 1-2: Should succeed with Gemini responses"
echo "  ✅ Test 3: Should return error with available models"
echo "  ✅ Test 4-5: Should fail (Claude/GPT not implemented)"
echo "  ✅ Test 6: Should stream SSE events"
