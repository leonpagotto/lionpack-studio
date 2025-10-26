# Manual Testing Guide - Story 3.14: Advanced Git Operations

**Purpose:** Verify all advanced Git operations work correctly in production-like scenarios

**Prerequisites:**

- LionPack Studio running locally
- GitHub account with test repository access
- Test repository with multiple branches

---

## 🧪 Test Setup

### Create Test Repository

1. Create new GitHub repository: `lionpack-test-story-3.14`
2. Initialize with README.md
3. Create test branches:
   ```bash
   git checkout -b feature/test-multi-commit
   git checkout -b feature/test-conflicts
   git checkout -b feature/test-cherry-pick
   ```

### Configure LionPack Studio

1. Start local development server:
   ```bash
   npm run dev
   ```
2. Navigate to AI Chat interface
3. Authenticate with GitHub (if not already)
4. Set test repository as active

---

## Test Case 1: Multi-Commit Operations

**Objective:** Verify `createCommitGroup()` creates multiple atomic commits

### Steps

1. Open AI Chat
2. Enter command:

   ```xml
   <git_commit_group branch="feature/test-multi-commit">
     <commit type="feat" message="Add user authentication module">
       <file path="auth/auth.ts">
         export function login(email: string, password: string) {
           return { token: 'test-token' };
         }
       </file>
     </commit>

     <commit type="test" message="Add authentication tests">
       <file path="auth/__tests__/auth.test.ts">
         import { login } from '../auth';

         describe('login', () => {
           it('should return token', () => {
             const result = login('test@example.com', 'password');
             expect(result.token).toBe('test-token');
           });
         });
       </file>
     </commit>

     <commit type="docs" message="Document authentication API">
       <file path="docs/AUTH.md">
         # Authentication API

         ## login(email, password)
         Authenticates user and returns JWT token.
       </file>
     </commit>
   </git_commit_group>
   ```

3. **Expected:** CommitGroupPreview component appears showing:
   - 3 commits listed
   - Each commit has correct type color (feat=green, test=purple, docs=yellow)
   - File counts shown for each commit
   - Conventional commit validation passes

4. Click "Approve"

5. **Expected:**
   - Success message in chat
   - All 3 commits created on `feature/test-multi-commit`
   - GitHub shows 3 sequential commits with correct messages

### Verification

```bash
git log feature/test-multi-commit --oneline -3
```

**Expected Output:**

```
abc123 docs: Document authentication API
def456 test: Add authentication tests
ghi789 feat: Add user authentication module
```

**Pass Criteria:**

- ✅ 3 commits created
- ✅ Commits in correct order
- ✅ Each commit has correct message format
- ✅ Each commit contains correct files

---

## Test Case 2: Empty Commit Group

**Objective:** Verify empty commit groups return gracefully without errors

### Steps

1. Open AI Chat
2. Enter command:

   ```xml
   <git_commit_group branch="feature/test-multi-commit">
   </git_commit_group>
   ```

3. **Expected:**
   - No error thrown
   - Success message: "No commits to create"
   - Branch remains at current SHA

**Pass Criteria:**

- ✅ No errors in console
- ✅ Graceful handling of empty case
- ✅ Branch unchanged

---

## Test Case 3: Conflict Detection

**Objective:** Verify `detectConflicts()` correctly identifies merge conflicts

### Setup

Create conflicting changes:

```bash
# On main branch
git checkout main
echo "const API_VERSION = 'v1';" > config.ts
git add config.ts
git commit -m "Set API version to v1"

# On feature branch
git checkout feature/test-conflicts
echo "const API_VERSION = 'v2';" > config.ts
git add config.ts
git commit -m "Set API version to v2"
```

### Steps

1. Open AI Chat
2. Enter command:

   ```xml
   <git_diff base="main" head="feature/test-conflicts"/>
   ```

3. **Expected:** DiffViewer component appears showing:
   - Conflict detected in `config.ts`
   - Shows both versions:
     - Main: `const API_VERSION = 'v1';`
     - Feature: `const API_VERSION = 'v2';`
   - Visual conflict markers highlighted

**Pass Criteria:**

- ✅ Conflict detected correctly
- ✅ Both versions shown clearly
- ✅ Conflict markers highlighted

---

## Test Case 4: Conflict Resolution - Accept Ours

**Objective:** Verify conflict resolution with "Accept Ours" strategy

### Steps

1. From previous test, click "Resolve Conflicts"
2. **Expected:** ConflictResolutionPanel appears
3. Select "Accept Ours" strategy for `config.ts`
4. **Expected:** Preview shows `const API_VERSION = 'v1';` (from main)
5. Click "Resolve"

6. **Expected:**
   - Conflict resolved
   - Branch updated with main's version
   - No conflict markers remain

### Verification

```bash
git show feature/test-conflicts:config.ts
```

**Expected Output:**

```javascript
const API_VERSION = "v1";
```

**Pass Criteria:**

- ✅ Conflict resolved correctly
- ✅ Main's version retained
- ✅ No conflict markers in file

---

## Test Case 5: Conflict Resolution - Accept Theirs

**Objective:** Verify conflict resolution with "Accept Theirs" strategy

### Setup

Recreate conflict (if resolved in previous test)

### Steps

1. Open ConflictResolutionPanel
2. Select "Accept Theirs" strategy for `config.ts`
3. **Expected:** Preview shows `const API_VERSION = 'v2';` (from feature)
4. Click "Resolve"

### Verification

```bash
git show feature/test-conflicts:config.ts
```

**Expected Output:**

```javascript
const API_VERSION = "v2";
```

**Pass Criteria:**

- ✅ Conflict resolved correctly
- ✅ Feature's version retained
- ✅ No conflict markers in file

---

## Test Case 6: Conflict Resolution - Manual Edit

**Objective:** Verify manual conflict resolution

### Steps

1. Open ConflictResolutionPanel
2. Select "Manual Edit" for `config.ts`
3. Enter custom resolution:
   ```javascript
   const API_VERSION = "v1";
   const API_BETA_VERSION = "v2";
   ```
4. Click "Resolve"

### Verification

```bash
git show feature/test-conflicts:config.ts
```

**Expected Output:**

```javascript
const API_VERSION = "v1";
const API_BETA_VERSION = "v2";
```

**Pass Criteria:**

- ✅ Manual edit accepted
- ✅ Custom content saved correctly
- ✅ No conflict markers remain

---

## Test Case 7: Cherry-Pick Single Commit

**Objective:** Verify `cherryPick()` correctly applies commits to target branch

### Setup

```bash
# Create commit to cherry-pick
git checkout feature/test-cherry-pick
echo "Bug fix content" > bugfix.ts
git add bugfix.ts
git commit -m "fix: Critical bug in authentication"
```

### Steps

1. Get commit SHA:

   ```bash
   git log -1 --format=%H
   # Output: abc123def456...
   ```

2. Open AI Chat
3. Enter command:

   ```xml
   <git_cherry_pick commits="abc123def456" target="main" create_pr="false"/>
   ```

4. **Expected:**
   - Success message
   - Commit applied to `main` branch
   - No conflicts

### Verification

```bash
git log main --oneline -1
```

**Expected Output:**

```
abc123d fix: Critical bug in authentication
```

**Pass Criteria:**

- ✅ Commit cherry-picked successfully
- ✅ Applied to correct branch (main)
- ✅ No conflicts detected

---

## Test Case 8: Cherry-Pick with PR Creation

**Objective:** Verify cherry-pick with automatic PR creation

### Steps

1. Enter command:

   ```xml
   <git_cherry_pick commits="abc123def456" target="main" create_pr="true"/>
   ```

2. **Expected:**
   - Success message with PR link
   - New PR created on GitHub
   - PR title: "Cherry-pick: fix: Critical bug in authentication"
   - PR has single commit

### Verification

Check GitHub for new PR:

```bash
gh pr list
```

**Pass Criteria:**

- ✅ PR created successfully
- ✅ PR contains cherry-picked commit
- ✅ PR ready for review

---

## Test Case 9: Add PR Review Comment

**Objective:** Verify `addReviewComment()` adds inline comment to PR

### Setup

Create test PR:

```bash
gh pr create --title "Test PR for Story 3.14" --body "Testing PR reviews" --base main --head feature/test-multi-commit
# Output: PR #42 created
```

### Steps

1. Open AI Chat
2. Enter command:

   ```xml
   <pr_review pr="42" event="COMMENT">
     <comment path="auth/auth.ts" line="2">
       Consider adding password strength validation here.
       Weak passwords are a security risk.
     </comment>
   </pr_review>
   ```

3. **Expected:**
   - Success message
   - Comment added to PR #42

### Verification

Open PR #42 on GitHub:

```bash
gh pr view 42 --web
```

**Expected:**

- Inline comment visible on line 2 of `auth/auth.ts`
- Comment text matches

**Pass Criteria:**

- ✅ Comment added successfully
- ✅ Comment on correct line
- ✅ Comment text correct

---

## Test Case 10: Submit PR Review - Approve

**Objective:** Verify `submitReview()` with APPROVE event

### Steps

1. Enter command:

   ```xml
   <pr_review pr="42" event="APPROVE">
     <summary>
       Great work! Authentication implementation looks solid.
       All security concerns addressed.
     </summary>
   </pr_review>
   ```

2. **Expected:**
   - Success message
   - PR approved
   - Review visible on GitHub

### Verification

```bash
gh pr view 42
```

**Expected Output:**

```
✓ Approved by [your username]
```

**Pass Criteria:**

- ✅ PR approved successfully
- ✅ Review comment visible
- ✅ Approval status updated

---

## Test Case 11: Submit PR Review - Request Changes

**Objective:** Verify `submitReview()` with REQUEST_CHANGES event

### Setup

Create new test PR

### Steps

1. Enter command:

   ```xml
   <pr_review pr="43" event="REQUEST_CHANGES">
     <comment path="auth/auth.ts" line="2">
       Add input validation for email format
     </comment>

     <comment path="auth/auth.ts" line="5">
       Hash password before storing
     </comment>

     <summary>
       Please address the following security issues before merge:
       1. Email validation
       2. Password hashing
     </summary>
   </pr_review>
   ```

2. **Expected:**
   - ReviewCommentThread component appears
   - Shows 2 inline comments
   - Shows summary comment
   - Event marked as "REQUEST_CHANGES" (red)

3. Click "Submit Review"

### Verification

```bash
gh pr view 43
```

**Expected Output:**

```
✗ Changes requested by [your username]
```

**Pass Criteria:**

- ✅ Review submitted successfully
- ✅ All comments visible
- ✅ Status changed to "Changes Requested"

---

## Test Case 12: View Branch Diff

**Objective:** Verify `getDiff()` shows correct diff between branches

### Steps

1. Enter command:

   ```xml
   <git_diff base="main" head="feature/test-multi-commit"/>
   ```

2. **Expected:** DiffViewer component appears showing:
   - All files changed between branches
   - Line-by-line diff with syntax highlighting
   - Green lines for additions (+)
   - Red lines for deletions (-)
   - Context lines (no color)
   - Total additions/deletions count
   - Link to GitHub compare view

3. Expand a file section

4. **Expected:**
   - Full diff visible
   - Line numbers shown
   - Diff hunks properly parsed

**Pass Criteria:**

- ✅ All changed files listed
- ✅ Diffs parsed correctly
- ✅ Color coding accurate
- ✅ Line numbers correct

---

## Test Case 13: View Filtered Diff

**Objective:** Verify diff file filtering works correctly

### Steps

1. Enter command:

   ```xml
   <git_diff base="main" head="feature/test-multi-commit" files="auth/auth.ts,docs/AUTH.md"/>
   ```

2. **Expected:** DiffViewer shows ONLY:
   - `auth/auth.ts` diff
   - `docs/AUTH.md` diff
   - Other files excluded

**Pass Criteria:**

- ✅ Only specified files shown
- ✅ Other files correctly filtered out

---

## Test Case 14: View Commit Diff

**Objective:** Verify `getCommitDiff()` shows diff for specific commit

### Steps

1. Get commit SHA:

   ```bash
   git log feature/test-multi-commit --oneline -1
   # Output: abc123 feat: Add user authentication module
   ```

2. Enter command:

   ```xml
   <git_commit_diff commit="abc123"/>
   ```

3. **Expected:** DiffViewer shows:
   - Only changes from that specific commit
   - Parent commit comparison
   - Correct file changes

**Pass Criteria:**

- ✅ Commit diff shown correctly
- ✅ Only commit's changes visible
- ✅ Matches `git show abc123`

---

## Test Case 15: Enhanced Commit History - Pagination

**Objective:** Verify commit history pagination works

### Steps

1. Call from code (this operation typically called internally):

   ```typescript
   const commits = await githubService.getCommitHistory("main", 1, 10);
   ```

2. **Expected:**
   - 10 commits returned
   - Pagination metadata included
   - Commits in reverse chronological order

**Pass Criteria:**

- ✅ Correct number of commits
- ✅ Pagination works
- ✅ Order correct (newest first)

---

## Test Case 16: Enhanced Commit History - Author Filter

**Objective:** Verify author filtering in commit history

### Steps

1. Call from code:

   ```typescript
   const myCommits = await githubService.getCommitHistory(
     "main",
     1,
     50,
     "leo.de.souza1"
   );
   ```

2. **Expected:**
   - Only commits by `leo.de.souza1`
   - Other authors' commits excluded

**Pass Criteria:**

- ✅ All commits match author filter
- ✅ No commits from other authors

---

## Test Case 17: Enhanced Commit History - Date Range Filter

**Objective:** Verify date range filtering in commit history

### Steps

1. Call from code:

   ```typescript
   const octCommits = await githubService.getCommitHistory(
     "main",
     1,
     100,
     undefined,
     "2025-10-01T00:00:00Z",
     "2025-10-31T23:59:59Z"
   );
   ```

2. **Expected:**
   - Only commits from October 2025
   - Commits outside range excluded

**Pass Criteria:**

- ✅ All commits within date range
- ✅ No commits outside range

---

## Test Case 18: Conventional Commit Validation

**Objective:** Verify CommitGroupPreview validates conventional commits

### Steps

1. Enter command with INVALID commit:

   ```xml
   <git_commit_group branch="feature/test-validation">
     <commit type="feat" message="This message is way too long and exceeds the 72 character limit which is required by conventional commits spec and will cause validation to fail">
       <file path="test.ts">content</file>
     </commit>
   </git_commit_group>
   ```

2. **Expected:** CommitGroupPreview shows:
   - ❌ Validation error: "Message exceeds 72 characters"
   - Approve button DISABLED
   - Error highlighted in red

3. Edit message to be valid (< 72 chars)

4. **Expected:**
   - ✅ Validation passes
   - Approve button ENABLED
   - Green checkmark shown

**Pass Criteria:**

- ✅ Long messages rejected
- ✅ Short messages accepted
- ✅ Approve button state correct

---

## Test Case 19: Dark Mode Support

**Objective:** Verify all UI components support dark mode

### Steps

1. Toggle dark mode in LionPack Studio settings
2. Open DiffViewer
3. **Expected:**
   - Background dark
   - Text light colored
   - Syntax highlighting adjusted for dark mode
   - Additions/deletions still clearly visible

4. Open ConflictResolutionPanel
5. **Expected:**
   - Dark mode applied
   - Conflict markers still highlighted
   - Buttons styled appropriately

6. Open CommitGroupPreview
7. **Expected:**
   - Dark mode applied
   - Commit type colors still distinct

8. Open ReviewCommentThread
9. **Expected:**
   - Dark mode applied
   - Comment threads readable

**Pass Criteria:**

- ✅ All components support dark mode
- ✅ Colors adjusted appropriately
- ✅ Text remains readable

---

## Test Case 20: Error Handling - Invalid Branch

**Objective:** Verify graceful error handling for invalid branch names

### Steps

1. Enter command:

   ```xml
   <git_commit_group branch="nonexistent-branch">
     <commit type="feat" message="Test commit">
       <file path="test.ts">content</file>
     </commit>
   </git_commit_group>
   ```

2. **Expected:**
   - Error message in chat
   - Clear explanation: "Branch 'nonexistent-branch' not found"
   - No crash or uncaught exceptions

**Pass Criteria:**

- ✅ Error handled gracefully
- ✅ Clear error message
- ✅ No console errors
- ✅ Chat remains functional

---

## Test Case 21: Error Handling - Network Failure

**Objective:** Verify error handling when GitHub API fails

### Steps

1. Simulate network failure (disconnect internet or block GitHub API)
2. Attempt any operation (e.g., create commit group)
3. **Expected:**
   - Error message: "Network error: Unable to reach GitHub"
   - Retry option shown
   - Operation can be cancelled

**Pass Criteria:**

- ✅ Network error detected
- ✅ User-friendly error message
- ✅ Retry mechanism available

---

## Test Case 22: Concurrent Operations

**Objective:** Verify system handles multiple operations gracefully

### Steps

1. Start multi-commit operation (don't approve yet)
2. In separate chat message, start diff operation
3. **Expected:**
   - Both operations queue correctly
   - No conflicts between operations
   - Each operation completes successfully

**Pass Criteria:**

- ✅ Operations queue correctly
- ✅ No race conditions
- ✅ Both complete successfully

---

## 📊 Test Summary Template

Use this template to record test results:

```markdown
## Story 3.14 Manual Test Results

**Tester:** [Your Name]
**Date:** [Test Date]
**Environment:** [Local/Staging/Production]
**LionPack Version:** [Version Number]

### Test Results

| Test Case                     | Status  | Notes                            |
| ----------------------------- | ------- | -------------------------------- |
| TC1: Multi-Commit Operations  | ✅ Pass | All 3 commits created correctly  |
| TC2: Empty Commit Group       | ✅ Pass | Handled gracefully               |
| TC3: Conflict Detection       | ✅ Pass | Conflicts detected correctly     |
| TC4: Resolve - Accept Ours    | ✅ Pass | Main version retained            |
| TC5: Resolve - Accept Theirs  | ✅ Pass | Feature version retained         |
| TC6: Resolve - Manual Edit    | ✅ Pass | Custom content saved             |
| TC7: Cherry-Pick Single       | ✅ Pass | Commit applied successfully      |
| TC8: Cherry-Pick with PR      | ✅ Pass | PR created automatically         |
| TC9: Add PR Comment           | ✅ Pass | Inline comment added             |
| TC10: Approve PR              | ✅ Pass | PR approved successfully         |
| TC11: Request Changes         | ✅ Pass | Changes requested correctly      |
| TC12: View Branch Diff        | ✅ Pass | Diff shown correctly             |
| TC13: Filtered Diff           | ✅ Pass | File filtering works             |
| TC14: Commit Diff             | ✅ Pass | Specific commit diff shown       |
| TC15: History Pagination      | ✅ Pass | Pagination works correctly       |
| TC16: History Author Filter   | ✅ Pass | Author filter accurate           |
| TC17: History Date Filter     | ✅ Pass | Date filter accurate             |
| TC18: Commit Validation       | ✅ Pass | Validation working correctly     |
| TC19: Dark Mode               | ✅ Pass | All components support dark mode |
| TC20: Error - Invalid Branch  | ✅ Pass | Error handled gracefully         |
| TC21: Error - Network Failure | ✅ Pass | Network errors handled           |
| TC22: Concurrent Operations   | ✅ Pass | Operations queue correctly       |

### Summary

- **Total Tests:** 22
- **Passed:** [Number]
- **Failed:** [Number]
- **Blocked:** [Number]
- **Pass Rate:** [Percentage]%

### Issues Found

[List any bugs or issues discovered during testing]

### Recommendations

[Any recommendations for improvements or follow-up work]
```

---

## 🎯 Pass Criteria for Story 3.14

**Story is READY FOR PRODUCTION if:**

- ✅ All 22 manual test cases pass
- ✅ No critical bugs found
- ✅ All automated unit tests pass (19/19)
- ✅ Dark mode supported in all components
- ✅ Error handling robust across all operations
- ✅ Performance acceptable (no lag or freezes)
- ✅ GitHub API integration working correctly

**Story NEEDS FIXES if:**

- ❌ Any critical test case fails
- ❌ Automated tests failing
- ❌ Major UI issues in dark mode
- ❌ Errors not handled gracefully
- ❌ Performance issues detected

---

## 📝 Notes for Testers

1. **Test Repository:** Use a dedicated test repository, not production repo
2. **Branch Cleanup:** Delete test branches after testing to avoid clutter
3. **GitHub Limits:** Be mindful of GitHub API rate limits (5000 requests/hour)
4. **Screenshots:** Take screenshots of UI components for documentation
5. **Error Logs:** Save any error messages for debugging

---

**End of Manual Testing Guide**
