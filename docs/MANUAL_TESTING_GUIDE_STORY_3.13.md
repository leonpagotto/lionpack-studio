# Manual Testing Guide: Story 3.13 - GitHub Integration

**Purpose:** Test GitHub integration features in the AI chat with live GitHub API  
**Date:** 2025-10-26  
**Tester:** Developer/QA  

---

## 🔧 Setup Instructions

### 1. Configure Environment Variables

**File:** `apps/web/.env.local`

**Required Variables:**
```bash
# GitHub repository configuration
NEXT_PUBLIC_GITHUB_OWNER=leonpagotto          # Your GitHub username or org
NEXT_PUBLIC_GITHUB_REPO=lionpack-studio       # Your repository name
NEXT_PUBLIC_GITHUB_TOKEN=ghp_YOUR_TOKEN       # Your GitHub Personal Access Token
```

### 2. Generate GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. **Token name:** "LionPack Studio - Local Development"
4. **Expiration:** 30 days (or your preference)
5. **Select scopes:**
   - ✅ **repo** (Full control of private repositories)
   - ✅ **workflow** (Update GitHub Action workflows)
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again!)
8. Paste into `.env.local` as `NEXT_PUBLIC_GITHUB_TOKEN=ghp_YOUR_TOKEN`

### 3. Start Development Server

```bash
cd /Users/leo.de.souza1/lionpack-studio
npm run dev
```

**Expected output:**
```
✓ Ready in 2.5s
- Local: http://localhost:3001 (or 3000)
```

### 4. Navigate to AI Chat

Open browser: **http://localhost:3001/demo/ai-chat**

---

## 🧪 Test Cases

### Test 1: Create Pull Request ✅

**Objective:** Verify AI can create a PR with approval workflow

**Prerequisites:**
- Have a test branch in your repository (e.g., `test/pr-creation`)
- Or create one: `git checkout -b test/pr-creation && git push origin test/pr-creation`

**Steps:**

1. **Prompt AI:**
   ```
   Create a pull request to merge test/pr-creation into main 
   with title "test: GitHub integration PR creation test"
   ```

2. **Expected AI Response:**
   ```markdown
   I'll create a pull request for you.

   <github_pr title="test: GitHub integration PR creation test" base="main" head="test/pr-creation">
   This is a test PR to validate the GitHub integration feature in Story 3.13.
   </github_pr>

   Please review and approve the PR creation.
   ```

3. **Verify Approval UI Appears:**
   - [ ] Blue accent panel visible
   - [ ] Shows operation type: "CREATE PR"
   - [ ] Shows PR title: "test: GitHub integration PR creation test"
   - [ ] Shows branches: "test/pr-creation → main"
   - [ ] "Approve" button (green) visible
   - [ ] "Reject" button (red) visible

4. **Click "Approve" Button**

5. **Expected Result:**
   - [ ] Button shows "Executing..." status
   - [ ] Buttons become disabled
   - [ ] Success message appears in chat:
     ```
     ✅ Created PR #X: test: GitHub integration PR creation test
     https://github.com/leonpagotto/lionpack-studio/pull/X
     ```

6. **Verify on GitHub:**
   - Go to https://github.com/leonpagotto/lionpack-studio/pulls
   - [ ] PR exists with correct title
   - [ ] PR description matches AI response
   - [ ] Base branch is "main"
   - [ ] Head branch is "test/pr-creation"

**Pass Criteria:** PR created successfully, link works, all details correct ✅

---

### Test 2: Create Issue ✅

**Objective:** Verify AI can create GitHub issues

**Steps:**

1. **Prompt AI:**
   ```
   Create an issue titled "Test: GitHub integration issue creation" 
   with label "test" to validate Story 3.13
   ```

2. **Expected AI Response:**
   ```markdown
   I'll create an issue for you.

   <github_issue title="Test: GitHub integration issue creation" labels="test">
   This issue validates the GitHub integration feature implemented in Story 3.13.

   Testing:
   - Issue creation from AI chat
   - Label assignment
   - Approval workflow
   </github_issue>

   Please review and approve.
   ```

3. **Verify Approval UI:**
   - [ ] Blue accent panel visible
   - [ ] Shows operation type: "CREATE ISSUE"
   - [ ] Shows issue title
   - [ ] Shows labels: "test"
   - [ ] Approve/Reject buttons visible

4. **Click "Approve"**

5. **Expected Result:**
   - [ ] Success message with issue number:
     ```
     ✅ Created Issue #X: Test: GitHub integration issue creation
     https://github.com/leonpagotto/lionpack-studio/issues/X
     ```

6. **Verify on GitHub:**
   - Go to https://github.com/leonpagotto/lionpack-studio/issues
   - [ ] Issue exists with correct title
   - [ ] Label "test" is applied
   - [ ] Description matches AI response

**Pass Criteria:** Issue created successfully with correct details ✅

---

### Test 3: Create Branch ✅

**Objective:** Verify AI can create new branches

**Steps:**

1. **Prompt AI:**
   ```
   Create a new branch called "test/github-integration-validation" from main
   ```

2. **Expected AI Response:**
   ```markdown
   I'll create a branch for you.

   <github_branch name="test/github-integration-validation" from="main"/>

   Please approve to create the branch.
   ```

3. **Verify Approval UI:**
   - [ ] Blue accent panel visible
   - [ ] Shows operation type: "CREATE BRANCH"
   - [ ] Shows branch name: "test/github-integration-validation"
   - [ ] Shows source branch: "main"
   - [ ] Approve/Reject buttons visible

4. **Click "Approve"**

5. **Expected Result:**
   - [ ] Success message:
     ```
     ✅ Created branch: test/github-integration-validation from main
     ```

6. **Verify on GitHub:**
   - Go to https://github.com/leonpagotto/lionpack-studio/branches
   - [ ] Branch "test/github-integration-validation" exists
   - [ ] Branch is based on main

**Pass Criteria:** Branch created successfully ✅

---

### Test 4: Reject Operation 🚫

**Objective:** Verify rejection workflow prevents execution

**Steps:**

1. **Prompt AI:**
   ```
   Create a PR to merge feature/test into main with title "Test rejection"
   ```

2. **Wait for approval UI to appear**

3. **Click "Reject" Button**

4. **Expected Result:**
   - [ ] Operation removed from pending list
   - [ ] NO PR created on GitHub
   - [ ] No success message
   - [ ] No error message
   - [ ] UI returns to normal state

5. **Verify on GitHub:**
   - Go to https://github.com/leonpagotto/lionpack-studio/pulls
   - [ ] NO PR with title "Test rejection" exists

**Pass Criteria:** Operation rejected without execution ✅

---

### Test 5: Error Handling (Invalid Token) ❌

**Objective:** Verify graceful error handling for auth failures

**Steps:**

1. **Temporarily modify `.env.local`:**
   ```bash
   NEXT_PUBLIC_GITHUB_TOKEN=ghp_invalid_token_123
   ```

2. **Restart dev server:**
   ```bash
   # Kill current server (Ctrl+C)
   npm run dev
   ```

3. **Prompt AI:**
   ```
   Create an issue titled "Test error handling"
   ```

4. **Click "Approve" when UI appears**

5. **Expected Result:**
   - [ ] Error message in chat:
     ```
     ❌ Failed to create issue: Bad credentials
     ```
   - [ ] Operation marked as failed
   - [ ] No issue created on GitHub

6. **Restore valid token in `.env.local`**

7. **Restart server**

**Pass Criteria:** Error handled gracefully with clear message ✅

---

### Test 6: Multiple Operations 🔄

**Objective:** Verify handling of multiple GitHub operations in one response

**Steps:**

1. **Prompt AI:**
   ```
   Set up a new feature: create a branch called feature/multi-test, 
   create an issue to track it, and prepare a PR template
   ```

2. **Expected AI Response:**
   ```markdown
   I'll help you set up the new feature.

   <github_branch name="feature/multi-test" from="main"/>

   <github_issue title="Feature: Multi-test setup" labels="enhancement">
   Track the setup of the multi-test feature.
   </github_issue>

   <github_pr title="feat: Multi-test implementation" base="main" head="feature/multi-test">
   This PR implements the multi-test feature.
   </github_pr>
   ```

3. **Verify Approval UI:**
   - [ ] Multiple operations appear in pending list
   - [ ] Each operation has separate Approve/Reject buttons
   - [ ] Branch operation listed first
   - [ ] Issue operation listed second
   - [ ] PR operation listed third

4. **Approve each operation sequentially**

5. **Expected Result:**
   - [ ] All three operations execute successfully
   - [ ] Success messages for each:
     ```
     ✅ Created branch: feature/multi-test from main
     ✅ Created Issue #X: Feature: Multi-test setup
     ✅ Created PR #Y: feat: Multi-test implementation
     ```

**Pass Criteria:** All operations execute correctly in sequence ✅

---

### Test 7: PR with Advanced Options 🎯

**Objective:** Test PR creation with draft, labels, assignees, reviewers

**Steps:**

1. **Prompt AI:**
   ```
   Create a draft PR to merge test/advanced into main with:
   - Title: "feat: Advanced PR test"
   - Labels: "enhancement", "test"
   - Assign to: @leonpagotto
   - Request review from: @leonpagotto
   ```

2. **Verify approval UI shows all options**

3. **Click "Approve"**

4. **Verify on GitHub:**
   - [ ] PR is marked as "Draft"
   - [ ] Labels "enhancement" and "test" applied
   - [ ] Assigned to correct user
   - [ ] Review requested from correct user

**Pass Criteria:** All PR options applied correctly ✅

---

## 📊 Test Results Template

```markdown
## Story 3.13 Manual Testing Results

**Date:** 2025-10-26
**Tester:** [Your Name]
**Environment:** Local Development
**Server URL:** http://localhost:3001/demo/ai-chat

### Test Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| Test 1: Create PR | ✅ PASS | PR #X created successfully |
| Test 2: Create Issue | ✅ PASS | Issue #Y created with label |
| Test 3: Create Branch | ✅ PASS | Branch created from main |
| Test 4: Reject Operation | ✅ PASS | No API call made |
| Test 5: Error Handling | ✅ PASS | Clear error message shown |
| Test 6: Multiple Operations | ✅ PASS | All 3 operations executed |
| Test 7: Advanced PR Options | ✅ PASS | Draft, labels, assignee OK |

### Overall Result

- ✅ All tests passed
- ⚠️ Minor issues found (list below)
- ❌ Blocking issues found (list below)

### Issues Found

1. [None / List issues here]

### Recommendations

1. [List any suggestions for improvement]

### Screenshots

[Attach screenshots of approval UI, success messages, GitHub results]
```

---

## 🐛 Common Issues & Solutions

### Issue: "Port 3000 is in use"

**Solution:** Server automatically tries port 3001. Use that URL instead.

### Issue: "GitHub token invalid"

**Solution:** 
1. Verify token in `.env.local` starts with `ghp_`
2. Check token hasn't expired
3. Verify token has `repo` and `workflow` scopes
4. Restart dev server after changing `.env.local`

### Issue: "Approval UI doesn't appear"

**Solution:**
1. Check browser console for errors
2. Verify AI response includes GitHub operation tags (`<github_pr>`, etc.)
3. Check Network tab for API call failures
4. Ensure server is running and accessible

### Issue: "Operation executes but nothing happens on GitHub"

**Solution:**
1. Verify `NEXT_PUBLIC_GITHUB_OWNER` and `NEXT_PUBLIC_GITHUB_REPO` are correct
2. Check GitHub token permissions
3. Verify repository exists and you have write access
4. Check server logs for API errors

---

## 📝 Notes

- **Token Security:** Never commit real GitHub tokens to git
- **Clean Up:** Delete test PRs, issues, and branches after testing
- **Rate Limits:** GitHub API has rate limits (5,000 requests/hour with token)
- **Repository:** Tests should be run on a test repository, not production

---

## ✅ Acceptance Criteria Checklist

After completing all tests, verify:

- [ ] PR creation works with approval workflow
- [ ] Issue creation works with labels
- [ ] Branch creation works from specified source
- [ ] Rejection workflow prevents execution
- [ ] Error handling displays clear messages
- [ ] Multiple operations can be handled in sequence
- [ ] Advanced PR options (draft, labels, assignees) work
- [ ] All GitHub operations appear on actual GitHub
- [ ] Approval UI is consistent and user-friendly
- [ ] Success messages include links to created resources

**All criteria met:** Story 3.13 is production-ready! ✅

---

**End of Manual Testing Guide**
