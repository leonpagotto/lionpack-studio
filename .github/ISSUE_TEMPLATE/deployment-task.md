---
name: Deployment Task
about: Deployment, infrastructure, or DevOps tasks
title: "[DEPLOY] "
labels: deployment, P1
assignees: ''
---

## 🚀 Deployment Overview

**Deployment Type:**
- [ ] Production Deployment
- [ ] Staging Deployment
- [ ] Development Environment
- [ ] Infrastructure Setup
- [ ] Configuration Update
- [ ] Database Migration
- [ ] Service Update
- [ ] Rollback

**Service/Application:**
[Name of service or application being deployed]

**Version/Commit:**
[Version number or commit hash]

---

## 🎯 Deployment Goal

**Objective:**
[What is being deployed and why?]

**Changes Included:**
- Change 1: [Description]
- Change 2: [Description]
- Change 3: [Description]

**Related Issues:**
- Fixes: #[issue number]
- Implements: #[issue number]
- Depends on: #[issue number]

---

## 📋 Pre-Deployment Checklist

### Code & Testing
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed and approved
- [ ] Security scan passed
- [ ] Performance testing completed
- [ ] No critical or high-severity vulnerabilities

### Dependencies
- [ ] All dependencies updated and compatible
- [ ] Third-party services notified (if needed)
- [ ] Database migrations tested
- [ ] Environment variables documented

### Documentation
- [ ] CHANGELOG updated
- [ ] Deployment guide updated
- [ ] API documentation updated (if applicable)
- [ ] User-facing documentation updated

### Communication
- [ ] Team notified of deployment
- [ ] Stakeholders informed
- [ ] Maintenance window scheduled (if needed)
- [ ] Users notified (if user-facing changes)

---

## 🗄️ Database Changes

**Database Migration Required:**
- [ ] Yes - Details below
- [ ] No database changes

**Migration Details:**
```sql
-- Add SQL migration scripts or description
```

**Rollback Script:**
```sql
-- Add rollback SQL scripts
```

**Data Backup:**
- [ ] Database backup created
- [ ] Backup verified and tested
- [ ] Backup location: [path or URL]

---

## ⚙️ Configuration Changes

**Environment Variables:**
```bash
# New or updated environment variables
NEW_VAR=value
UPDATED_VAR=new_value
```

**Configuration Files:**
- [ ] `config/production.yml` - [Changes]
- [ ] `.env.production` - [Changes]
- [ ] Other: [File name and changes]

**Secrets Management:**
- [ ] New secrets added to vault
- [ ] Old secrets rotated/removed
- [ ] Secrets documented in secure location

---

## 🔧 Infrastructure Changes

**Services Affected:**
- [ ] Web server
- [ ] API server
- [ ] Background workers
- [ ] Database
- [ ] Cache (Redis, etc.)
- [ ] CDN
- [ ] Other: [Specify]

**Resource Changes:**
- [ ] Scaling changes (horizontal/vertical)
- [ ] Memory/CPU adjustments
- [ ] Storage changes
- [ ] Network configuration

**New Services:**
- [ ] Service 1: [Description, purpose]
- [ ] Service 2: [Description, purpose]

---

## 📊 Deployment Steps

### 1. Pre-Deployment

```bash
# Step 1: Verify current state
[command]

# Step 2: Create backup
[command]

# Step 3: Run pre-deployment checks
[command]
```

### 2. Deployment

```bash
# Step 1: Pull latest code
[command]

# Step 2: Install dependencies
[command]

# Step 3: Run migrations
[command]

# Step 4: Build application
[command]

# Step 5: Deploy
[command]
```

### 3. Post-Deployment

```bash
# Step 1: Verify deployment
[command]

# Step 2: Run smoke tests
[command]

# Step 3: Check logs
[command]

# Step 4: Monitor metrics
[command]
```

---

## 🔍 Verification Steps

**Health Checks:**
- [ ] Service responding to health check endpoint
- [ ] All critical endpoints responding
- [ ] Database connections established
- [ ] External service integrations working

**Functional Tests:**
- [ ] User login/authentication working
- [ ] Core features functioning
- [ ] Data flowing correctly
- [ ] No console errors

**Performance Checks:**
- [ ] Response times within acceptable range
- [ ] No memory leaks detected
- [ ] CPU usage normal
- [ ] Database queries optimized

**Monitoring:**
- [ ] Error tracking active (Sentry, etc.)
- [ ] Logging configured
- [ ] Metrics dashboards updated
- [ ] Alerts configured

---

## 🔙 Rollback Plan

**Rollback Trigger Criteria:**
- Critical bug affecting >50% of users
- Data loss or corruption
- Security vulnerability exposed
- Service downtime >5 minutes
- Error rate >5%

**Rollback Steps:**

```bash
# Step 1: Stop new deployment
[command]

# Step 2: Restore previous version
[command]

# Step 3: Restore database (if needed)
[command]

# Step 4: Verify rollback
[command]

# Step 5: Notify team
[notification method]
```

**Rollback Time Estimate:** [X minutes]

---

## 📈 Monitoring & Alerts

**Metrics to Monitor:**
- [ ] Error rate
- [ ] Response time (p50, p95, p99)
- [ ] Request rate
- [ ] Database query time
- [ ] Memory usage
- [ ] CPU usage

**Dashboard:**
[Link to monitoring dashboard]

**Alerts Configured:**
- [ ] Error rate >5% for 5 minutes
- [ ] Response time >500ms for 5 minutes
- [ ] Service health check failing
- [ ] Memory usage >80%

**On-Call Person:** @[username]

---

## 📅 Deployment Schedule

**Planned Deployment Time:** [YYYY-MM-DD HH:MM UTC]

**Timezone Considerations:**
[e.g., Deploying during off-peak hours (2 AM PST)]

**Estimated Downtime:** [X minutes or "Zero downtime"]

**Deployment Window:** [Start time] to [End time]

---

## 👥 Roles & Responsibilities

**Deployment Lead:** @[username]
- Overall coordination
- Execute deployment steps
- Make rollback decision

**Database Admin:** @[username]
- Run database migrations
- Monitor database performance

**DevOps Engineer:** @[username]
- Infrastructure changes
- Monitor system metrics

**QA Engineer:** @[username]
- Post-deployment testing
- Verify acceptance criteria

**Product Manager:** @[username]
- Stakeholder communication
- Business verification

---

## 📞 Communication Plan

**Before Deployment:**
- [ ] Team notification in Slack/Teams
- [ ] Stakeholder email sent
- [ ] User notification (if needed)
- [ ] Status page updated

**During Deployment:**
- [ ] Regular updates in deployment channel
- [ ] Status page shows "Maintenance"
- [ ] Incident response team on standby

**After Deployment:**
- [ ] Success notification sent
- [ ] Status page updated to "Operational"
- [ ] Post-deployment report shared
- [ ] Users notified of new features

---

## ✅ Acceptance Criteria

**Deployment Success Criteria:**
- [ ] All deployment steps completed without errors
- [ ] All verification checks passed
- [ ] No critical errors in logs
- [ ] Performance metrics within normal range
- [ ] User-facing features working as expected
- [ ] Monitoring and alerts active
- [ ] Documentation updated
- [ ] Team notified of successful deployment

**Post-Deployment Monitoring:**
- [ ] Monitor for 1 hour post-deployment
- [ ] Check metrics after 24 hours
- [ ] Review error logs after 48 hours
- [ ] Conduct retrospective (if issues)

---

## 📝 Post-Deployment Report

**Deployment Summary:**
[To be filled after deployment]
- Deployment time: [Actual time taken]
- Issues encountered: [List any issues]
- Resolution: [How issues were resolved]
- Rollback needed: [Yes/No]

**Lessons Learned:**
[To be filled after deployment]
- What went well:
- What could be improved:
- Action items for next deployment:

---

## 🔗 References

**Deployment Documentation:**
[Link to deployment runbook]

**Architecture Diagrams:**
[Link to infrastructure diagrams]

**Previous Deployments:**
[Links to related deployment issues]

**External Dependencies:**
[Links to third-party service status pages]

---

**Priority:** P1 (update based on urgency)
**Labels:** deployment, [add more: production, staging, infrastructure]
**Estimated Effort:** [story points]
**Deployment Date:** [YYYY-MM-DD]
