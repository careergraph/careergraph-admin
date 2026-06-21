# Elasticsearch Rollback & Recovery Guide - Phase 7 Production Ready

**Status:** Production Ready  
**Last Updated:** 2026-06-21  
**Scope:** Company verification, operational status, and job searchability

## 1. Non-Destructive ES Strategy

### Why Non-Destructive?

The system uses **field-based filtering** instead of document deletion when companies are blocked. This approach:

- **Prevents data loss**: No Elasticsearch documents are deleted; fields are updated
- **Enables instant rollback**: Unblock a company by setting `operationalStatus = ACTIVE` and resyncing
- **Survives ES downtime**: Database queries alone enforce blocking if ES is unavailable
- **Avoids reindex failures**: Embedding provider rate limits or network issues don't corrupt job visibility

### ES Fields for Control

Jobs are indexed with four control fields:

| Field | Type | Purpose |
|-------|------|---------|
| `jobSearchable` | boolean | Computed: `job.status == ACTIVE && company.verificationStatus == APPROVED && company.operationalStatus == ACTIVE` |
| `companyBlocked` | boolean | `company.operationalStatus == BLOCKED` or `company.operationalStatus == SUSPENDED` |
| `companyVerificationStatus` | keyword | Current company verification status (NOT_SUBMITTED, PENDING_REVIEW, APPROVED, REJECTED, NEEDS_ADDITIONAL_INFO) |
| `companyOperationalStatus` | keyword | Current company operational status (ACTIVE, SUSPENDED, BLOCKED) |

### Field Mapping Configuration

Location: `careergraph-api/src/main/resources/elasticsearch/jobs-es-mappings.json`

```json
{
  "properties": {
    "jobSearchable": {
      "type": "boolean"
    },
    "companyBlocked": {
      "type": "boolean"
    },
    "companyVerificationStatus": {
      "type": "keyword"
    },
    "companyOperationalStatus": {
      "type": "keyword"
    }
  }
}
```

---

## 2. Operational Procedures

### 2.1 When Company Status Changes

**Scenario: Admin blocks a company**

1. Admin calls `POST /admin/companies/{companyId}/block` with reason
2. Backend:
   - Updates `company.operationalStatus = BLOCKED` in database
   - Calls `notificationService.onCompanyBlocked()`
   - Calls `jobEsService.syncCompanyJobsSearchDocuments(companyId)`
3. ES Resync:
   - Fetches all ACTIVE jobs for the company from database
   - For each job, calls `jobEsService.syncJobSearchDocument(job)`
   - Sets `jobSearchable = false` (because `company.operationalStatus != ACTIVE`)
   - Sets `companyBlocked = true`
   - Updates `companyOperationalStatus = BLOCKED`
4. **Result**: Jobs remain in ES but hidden from candidate searches via `jobSearchable=false` filter

**Scenario: Admin unblocks a company**

1. Admin calls `POST /admin/companies/{companyId}/unblock` with optional note
2. Backend:
   - Updates `company.operationalStatus = ACTIVE` in database
   - Calls `notificationService.onCompanyUnblocked()`
   - Calls `jobEsService.syncCompanyJobsSearchDocuments(companyId)`
3. ES Resync:
   - Fetches all ACTIVE jobs for the company from database
   - For each job, calls `jobEsService.syncJobSearchDocument(job)`
   - Sets `jobSearchable = true` (if `job.status == ACTIVE` AND `company.verificationStatus == APPROVED` AND `company.operationalStatus == ACTIVE`)
   - Sets `companyBlocked = false`
   - Updates `companyOperationalStatus = ACTIVE`
4. **Result**: Jobs reappear in candidate searches

---

### 2.2 Manual ES Resync Procedure

**When to use:** Emergency situations or after manual database changes

**Procedure:**

1. **Option A: Resync specific company jobs**
   ```bash
   # Via the application's internal job service
   POST /internal/jobs/resync-company/{companyId}
   # (if this endpoint is exposed; currently called automatically on status change)
   ```

2. **Option B: Full resync via command line**
   ```bash
   # Run the ElasticsearchDataInitializer via Spring context
   # Currently runs at application startup; can be triggered via:
   POST /internal/elasticsearch/reindex
   # (if exposed for admin use)
   ```

3. **Option C: Manual deletion and resync** (if ES documents are corrupted)
   ```bash
   # Delete all job documents for a company
   DELETE /jobs_es/_delete_by_query
   {
     "query": {
       "term": {
         "companyId": "COMPANY_ID"
       }
     }
   }

   # Then resync via application:
   POST /internal/jobs/resync-company/COMPANY_ID
   ```

---

## 3. Rollback Scenarios

### 3.1 Rollback: Undo a Company Block

**If accidentally blocked**: Use the unblock action

```bash
POST /admin/companies/{companyId}/unblock
{
  "note": "Accidentally blocked. Restoring to active status."
}
```

**What happens:**
- Company status changes to ACTIVE
- All ACTIVE jobs are resynced in ES with `jobSearchable=true`
- HR receives notification and can create jobs again
- Candidates can see jobs again in search

**Time to recovery:** < 5 seconds (resync is synchronous)

### 3.2 Rollback: Undo a Company Approval

**If incorrectly approved**: Use the reject action

```bash
POST /admin/company-verification-requests/{requestId}/reject
{
  "reason": "Incorrect approval. Please resubmit corrected documents."
}
```

**What happens:**
- Verification status changes to REJECTED
- If company had jobs, they are resynced with `jobSearchable=false`
- HR receives notification and cannot create new jobs until reapproved
- Existing jobs disappear from candidate searches

**Time to recovery:** < 5 seconds (resync is synchronous)

### 3.3 Rollback: ES Data Corruption or Sync Failure

**If ES contains stale/incorrect data:**

1. **Identify the problem:**
   ```bash
   # Query ES for inconsistent documents
   GET /jobs_es/_search
   {
     "query": {
       "bool": {
         "must": [
           { "term": { "companyId": "PROBLEM_COMPANY_ID" } }
         ]
       }
     }
   }
   ```

2. **Clear corrupted documents:**
   ```bash
   DELETE /jobs_es/_delete_by_query
   {
     "query": {
       "term": {
         "companyId": "PROBLEM_COMPANY_ID"
       }
     }
   }
   ```

3. **Trigger resync from application:**
   - Call `/internal/jobs/resync-company/{companyId}` (if exposed)
   - Or restart application to trigger `ElasticsearchDataInitializer`

4. **Verify:**
   ```bash
   # Check that jobSearchable field is correctly set
   GET /jobs_es/_search
   {
     "query": {
       "term": {
         "companyId": "PROBLEM_COMPANY_ID"
       }
     },
     "_source": ["id", "jobSearchable", "companyOperationalStatus", "companyVerificationStatus"]
   }
   ```

---

## 4. Safety Guarantees

### 4.1 Database is the Source of Truth

Even if ES is completely down:
- ✅ Candidates cannot apply to jobs from blocked companies (DB query enforcement)
- ✅ HR cannot create jobs for unverified companies (DB query enforcement)
- ✅ Candidate searches return only jobs from approved, active companies (DB query in `JobRepository`)

### 4.2 No Data Loss

Jobs are never deleted:
- ✅ When company is blocked, ES documents remain (only `jobSearchable=false`)
- ✅ When company is unblocked, `jobSearchable=true` is set (no reindex needed)
- ✅ Job data is preserved for audit, analytics, and rollback

### 4.3 Consistent State

After any admin action:
- Database and ES reach consistent state within seconds
- All new candidate searches use the latest company status
- Notifications are sent after DB commit, preventing orphaned notifications

### 4.4 Transaction Safety

- Notification dispatch uses `TransactionSynchronizationManager`
- Notifications only sent AFTER company status is committed to database
- Even if notification delivery fails, company status is already updated

---

## 5. Monitoring & Debugging

### 5.1 Check Sync Status

**Query: Are there jobs in ES from blocked companies?**

```bash
GET /jobs_es/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "jobSearchable": false } }
      ]
    }
  },
  "aggs": {
    "by_company": {
      "terms": {
        "field": "companyId",
        "size": 100
      }
    }
  }
}
```

**Expected:** All blocked/unverified companies show with `jobSearchable=false`

### 5.2 Check Search Filtering

**Query: Verify candidate search respects filters**

```bash
# Should NOT return jobs with jobSearchable=false
GET /jobs_es/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "status": "ACTIVE" } },
        { "term": { "jobSearchable": true } }
      ]
    }
  }
}
```

### 5.3 Verify Notification Delivery

Check notification table for company verification/block events:

```sql
-- Check last 10 company-related notifications
SELECT n.id, n.type, n.title, n.created_date, n.read
FROM notifications n
WHERE n.type IN ('COMPANY_VERIFICATION_APPROVED', 'COMPANY_VERIFICATION_REJECTED', 
                   'COMPANY_VERIFICATION_NEEDS_INFO', 'COMPANY_BLOCKED', 'COMPANY_UNBLOCKED')
ORDER BY n.created_date DESC
LIMIT 10;
```

---

## 6. Emergency Procedures

### 6.1 Complete ES Reindex Required (e.g., mapping change)

If you modified the job mapping and need a full reindex:

```bash
# 1. Create new index with new mapping
PUT /jobs_es_v2
{
  "mappings": {
    // ... updated mapping from jobs-es-mappings.json
  }
}

# 2. Reindex from old to new
POST /_reindex
{
  "source": {
    "index": "jobs_es"
  },
  "dest": {
    "index": "jobs_es_v2"
  }
}

# 3. Delete old index
DELETE /jobs_es

# 4. Create alias
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "jobs_es_v2",
        "alias": "jobs_es"
      }
    }
  ]
}

# 5. Trigger application resync
# - Restart application (triggers ElasticsearchDataInitializer)
# - Or call /internal/elasticsearch/reindex if exposed
```

### 6.2 ES Is Completely Down

1. **Assess duration**: How long will ES be unavailable?
2. **If < 1 hour**: No action needed
   - Database queries will enforce company status
   - Search results will be DB-only (slower but correct)
3. **If > 1 hour**: 
   - Job search may be significantly slower
   - Consider disabling advanced search features temporarily
4. **After recovery**:
   - Restart application or call resync endpoint
   - Verify sync completed successfully
   - Monitor search latency return to normal

---

## 7. Verification Checklist

After any company status change or rollback:

- [ ] Company status is correct in database: `SELECT verification_status, operational_status FROM companies WHERE id = '...'`
- [ ] ES documents are updated: `GET /jobs_es/_search?q=companyId:...` returns `jobSearchable=false` for blocked/unverified
- [ ] Candidate cannot see jobs: Search API returns 0 results for blocked company jobs
- [ ] HR receives notification: Check notification dropdown in HR UI
- [ ] HR cannot create jobs (if verification pending): `/jobs/new` shows gate message
- [ ] Search performance is acceptable: No ES timeout errors in logs

---

## 8. Key Contacts & Support

For Elasticsearch issues:
- Check ElasticsearchDataInitializer logs: `src/main/java/com/hcmute/careergraph/config/app/ElasticsearchDataInitializer.java`
- Monitor: `jobEsService.syncCompanyJobsSearchDocuments()` execution time
- Support email: [Configured via `support.email` property]

---

## Summary

The Elasticsearch strategy for company verification/blocking is **designed for safety and recovery**:
- ✅ Non-destructive approach enables instant rollback
- ✅ Database enforcement means no reliance on ES for correctness
- ✅ Field-based filtering survives ES downtime
- ✅ Synchronous resync means changes are live within seconds
- ✅ Transaction safety ensures consistent state

**For production:**
1. No manual ES operations normally required
2. Admin block/unblock actions handle all sync automatically
3. In emergencies, manual resync via `/internal/jobs/resync-company/{companyId}` is safe
4. Never delete ES documents — always use `jobSearchable=false` filtering instead
