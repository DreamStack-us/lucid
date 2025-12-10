# PRD to Implementation Workflow

## 🎯 Purpose

This document defines the complete workflow from product vision (Notion PRD) through execution planning (Linear tickets) to technical implementation (OpenSpec proposals) and deployment.

**Last Updated**: October 2025
**Owner**: Product & Engineering Teams

---

## 📋 Quick Reference

```
Notion PRD → Linear Tickets → OpenSpec Proposals → Code → Deployment
   (Why)         (What)            (How)          (Build)    (Ship)
```

| Phase | System | Owner | Output | Duration |
|-------|--------|-------|--------|----------|
| 1. Product Vision | Notion | PM | PRD with epics | 1-2 weeks |
| 2. Planning | Linear | PM | Tickets with criteria | 1-2 days |
| 3. Technical Design | OpenSpec | Dev + AI | Specs & tasks | 1-2 hours |
| 4. Implementation | Code | Dev | Working feature | 1-5 days |
| 5. Review & Deploy | GitHub/Vercel | Dev | Live in production | 1-2 hours |

---

## Phase 1: Product Vision (Notion PRD)

### When to Create a PRD

Create a PRD for:
- ✅ New major features or epics
- ✅ Significant product changes
- ✅ Features requiring stakeholder buy-in
- ✅ Features with unclear requirements

Skip PRD for:
- ❌ Small bug fixes
- ❌ Minor UI tweaks
- ❌ Technical debt cleanup
- ❌ Obviously defined enhancements

### PRD Template

**Recommended Structure:**

```markdown
# [Feature Name] PRD

## 1. Executive Summary
- One-paragraph overview
- Business impact
- Timeline estimate

## 2. Problem Statement
- What user pain point are we solving?
- Current state vs. desired state
- Who is affected?

## 3. Market Analysis (Optional)
- Competitive landscape
- Market opportunity
- User research findings

## 4. User Personas
- Primary persona (70% of users)
- Secondary persona (20% of users)
- Tertiary persona (10% of users)

## 5. Product Requirements (Epics)
### 5.1 Epic 1: [Name]
- Description
- User value
- Success metrics

### 5.2 Epic 2: [Name]
- Description
- User value
- Success metrics

## 6. Success Metrics & KPIs
- Metric 1: [Target]
- Metric 2: [Target]
- How we'll measure

## 7. Constraints & Assumptions
- Technical limitations
- Resource constraints
- Assumptions to validate

## 8. Roadmap & Milestones
- Phase 1: MVP (dates)
- Phase 2: Enhancements (dates)
- Phase 3: Advanced features (dates)

## 9. Open Questions
- Questions requiring research
- Decisions pending
```

### Example: Guitar Maintenance PRD

```markdown
# Guitar Maintenance Tracking PRD

## 1. Executive Summary
Enable users to track maintenance history for their gear collection,
increasing long-term engagement and platform stickiness.

Target: 30% of users log maintenance within 30 days of signup.

## 2. Problem Statement
Current State: Users have no way to track when they changed strings,
performed setups, or had repairs done.

Desired State: Users can log maintenance activities and view history
for each piece of gear.

Impact: Without maintenance tracking, users forget service history
and may under-maintain expensive instruments.

## 5. Product Requirements
### 5.1 Maintenance Logging
Users can record maintenance type, date, cost, and notes for each guitar.

Success Metric: 30% log ≥1 record in first 30 days

### 5.2 Maintenance History
Users can view chronological maintenance history per guitar.

Success Metric: 50% return to view history within 7 days

### 5.3 Maintenance Reminders (Future)
AI suggests maintenance schedules based on gear type and usage.

Success Metric: 40% enable reminders when prompted
```

### PRD Best Practices

**Do:**
- ✅ Focus on **why** (business justification)
- ✅ Include measurable success metrics
- ✅ Define user personas clearly
- ✅ Keep it concise (3-5 pages max for MVP features)
- ✅ Link to user research/competitive analysis

**Don't:**
- ❌ Include implementation details (that's for OpenSpec)
- ❌ Specify UI designs (use Figma for that)
- ❌ Write technical requirements (that's for Linear/OpenSpec)
- ❌ Make it longer than necessary

---

## Phase 2: Execution Planning (Linear)

### Breaking Down PRD into Linear Tickets

**Workflow:**

1. **Identify Epics** from PRD Section 5
2. **Create User Stories** for each epic
3. **Break into Technical Tasks** (subtasks)
4. **Link Everything** (PRD → Epic → Story → Subtask)

### Step-by-Step Breakdown

#### Step 1: Create Epic in Linear

From PRD Section 5.1 "Maintenance Logging":

**Linear Epic:**
- Title: "Maintenance Tracking"
- Description: "Enable users to track guitar maintenance history (PRD Section 5)"
- PRD Link: `https://notion.so/your-workspace/...#section-5`
- Projects: "MVP Launch"
- Priority: P1

#### Step 2: Create User Stories

Break epic into user stories (one per persona or user journey):

**Story 1: DRE-301**
```
Title: Log maintenance records
Description: As a guitar enthusiast, I want to log maintenance
             so that I can track my gear's service history.

Related PRD: Section 5.1 - Maintenance Logging
Parent: Epic "Maintenance Tracking"

Acceptance Criteria:
- [ ] User can add maintenance record from gear detail page
- [ ] Record includes: type, date, cost (optional), notes (optional)
- [ ] Record persists and appears in history
- [ ] Works on iOS, Android, and web

Labels: frontend, backend, mobile, web, p1
Story Points: 5
```

**Story 2: DRE-302**
```
Title: View maintenance history
Description: As a guitar enthusiast, I want to view maintenance history
             so that I can see when I last serviced my gear.

Related PRD: Section 5.2 - Maintenance History
Parent: Epic "Maintenance Tracking"

Acceptance Criteria:
- [ ] Maintenance history displays on gear detail page
- [ ] Records sorted newest-first
- [ ] Shows type, date, cost, notes for each record
- [ ] Empty state when no history exists

Labels: frontend, mobile, web, p1
Story Points: 3
```

#### Step 3: Create Technical Subtasks

Break DRE-301 into implementation tasks:

**Subtask: DRE-301a**
```
Title: [Backend] Create maintenance_records table & RLS
Parent: DRE-301
Labels: backend, database
Assignee: [Backend dev]

Technical Notes:
- Create Supabase migration
- Add maintenance_type ENUM
- Implement RLS policies (user owns records)
- Add indexes for performance
```

**Subtask: DRE-301b**
```
Title: [Mobile] Build maintenance logging UI
Parent: DRE-301
Labels: frontend, mobile
Assignee: [Mobile dev]

Technical Notes:
- Create AddMaintenanceSheet component (Tamagui)
- Form with type picker, date picker, text inputs
- Validation and error handling
- Loading states
```

**Subtask: DRE-301c**
```
Title: [Web] Build maintenance logging UI
Parent: DRE-301
Labels: frontend, web
Assignee: [Web dev]

Technical Notes:
- Create AddMaintenanceModal component
- Server Actions for mutations
- Optimistic UI updates
- Responsive design
```

**Subtask: DRE-301d**
```
Title: [Testing] E2E tests for maintenance flow
Parent: DRE-301
Labels: testing
Assignee: [QA/Dev]

Technical Notes:
- Maestro test for mobile flow
- Playwright test for web flow
- Test validation edge cases
```

**Subtask: DRE-301e**
```
Title: [Analytics] Track maintenance events
Parent: DRE-301
Labels: analytics
Assignee: [Dev]

Technical Notes:
- Add maintenance_logged event
- Track maintenance_type distribution
- Track time_to_first_maintenance metric
```

### Linear Ticket Template

```markdown
## Description
[Brief description of what needs to be built]

**Related PRD:** [Section X.X: Feature Name](notion.so link)
**Parent:** [Epic name if applicable]

## Acceptance Criteria
- [ ] Criterion 1 (observable, testable)
- [ ] Criterion 2 (observable, testable)
- [ ] Criterion 3 (observable, testable)

## Technical Notes
- Implementation approach
- Dependencies
- Performance requirements
- Security considerations

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing (unit, integration, E2E)
- [ ] Cross-platform verified (if applicable)
- [ ] Analytics tracking added
- [ ] Documentation updated
- [ ] Code reviewed and merged
- [ ] Deployed to production
```

### Linear Labels to Use

**By Domain:**
- `frontend` - UI/UX work
- `backend` - Database, API, Edge Functions
- `mobile` - Mobile-specific (iOS/Android)
- `web` - Web-specific (Next.js)
- `testing` - E2E, unit, integration tests
- `analytics` - Event tracking, dashboards
- `infrastructure` - DevOps, CI/CD

**By Priority:**
- `p0` - Critical for MVP/launch (must have)
- `p1` - Important for quality (should have)
- `p2` - Nice to have (could have)

**By Type:**
- `feature` - New functionality
- `bug` - Fix existing functionality
- `enhancement` - Improve existing feature
- `refactor` - Code quality improvement
- `documentation` - Docs only

---

## Phase 3: Technical Design (OpenSpec)

### Creating an OpenSpec Proposal

When you pick up a Linear ticket, create an OpenSpec proposal:

#### Command

```bash
/openspec:proposal <feature-name> --linear DRE-XXX
```

**Example:**
```bash
/openspec:proposal maintenance-logging --linear DRE-301
```

#### What the AI Does

When you run this command, the AI:

1. **Reads the Linear ticket** (DRE-301)
2. **Follows PRD link** and reads relevant section
3. **Consults specialized agents** based on task domain:
   - Product Manager agent → Requirements & acceptance criteria
   - Supabase Engineer agent → Database schema
   - Tamagui Developer agent → Mobile UI components
   - Web Developer agent → Next.js patterns
   - Maestro Tester agent → Test strategy
   - Data Scientist agent → Analytics events

4. **Generates proposal files**:
   ```
   openspec/changes/maintenance-logging/
   ├── proposal.md      # Why, what, success criteria
   ├── tasks.md         # Implementation checklist
   ├── design.md        # Architecture decisions (optional)
   └── specs/
       └── maintenance/
           └── spec.md  # Technical requirements
   ```

#### Proposal Structure

**`proposal.md`:**
```markdown
# Maintenance Logging Feature

## References
- **Linear:** [DRE-301](https://linear.app/...)
- **PRD:** [Section 5.1](https://notion.so/...)
- **Related Specs:** None (new feature)

## Why We're Building This
[Business justification from PRD]

## What We're Building
[High-level technical summary]

## Success Criteria
[Measurable outcomes]
```

**`tasks.md`:**
```markdown
## Implementation Tasks

### 1. Database Layer
- [ ] 1.1 Create maintenance_records table
- [ ] 1.2 Add RLS policies
...

### 2. Mobile UI
- [ ] 2.1 Create AddMaintenanceSheet
- [ ] 2.2 Add to GearDetailScreen
...

### 3. Web UI
- [ ] 3.1 Create AddMaintenanceModal
- [ ] 3.2 Implement Server Actions
...

### 4. Testing
- [ ] 4.1 Maestro E2E test
- [ ] 4.2 Playwright web test
...

### 5. Analytics
- [ ] 5.1 Add maintenance_logged event
...
```

**`specs/maintenance/spec.md`:**
```markdown
# Maintenance Logging Specification

## Requirements

### Requirement: Maintenance Record Creation
The system SHALL allow users to create maintenance records.

#### Scenario: Add from gear detail page
- GIVEN a user is viewing a guitar's detail page
- WHEN they tap "Add Maintenance"
- THEN a form appears
- AND they can enter type, date, cost, notes
- AND the record is saved

...
```

---

## Phase 4: Implementation

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/maintenance-logging-DRE-301
   ```

2. **Work through tasks.md systematically**
   - Check off each task as you complete it
   - Reference specs for requirements
   - Consult specialized agents as needed

3. **Test continuously**
   - Run unit tests: `yarn test`
   - Run typecheck: `yarn typecheck`
   - Run linting: `yarn lint`
   - Manual testing on mobile and web

4. **Commit regularly**
   ```bash
   git commit -m "feat: create maintenance_records table (DRE-301)"
   git commit -m "feat: add maintenance logging UI mobile (DRE-301)"
   git commit -m "feat: add maintenance logging UI web (DRE-301)"
   ```

### Referencing Linear in Commits/PRs

**Always mention the Linear ticket ID (DRE-XXX) in:**
- Commit messages
- PR titles
- PR descriptions

This enables **automatic linking** between GitHub and Linear.

**Examples:**

```bash
# Commit message
git commit -m "feat: add maintenance record creation (DRE-301)"

# PR title
"feat: maintenance logging feature (DRE-301)"

# PR description
## Summary
Implements maintenance logging per PRD Section 5.1

**Linear:** DRE-301
**OpenSpec:** openspec/changes/maintenance-logging/
...
```

---

## Phase 5: Review & Deployment

### Creating Pull Request

```bash
gh pr create --base develop \
  --title "feat: maintenance logging feature (DRE-301)" \
  --body "$(cat <<'EOF'
## Summary
Implements maintenance logging per PRD Section 5.1

**Linear:** DRE-301
**PRD:** [Section 5.1](https://notion.so/...)
**OpenSpec:** `openspec/changes/maintenance-logging/`

## What Changed
- ✅ Created maintenance_records table with RLS
- ✅ Built mobile UI (AddMaintenanceSheet)
- ✅ Built web UI (AddMaintenanceModal)
- ✅ Added E2E tests (Maestro + Playwright)
- ✅ Added analytics events

## Testing
- [x] iOS tested
- [x] Android tested
- [x] Web tested
- [x] All tests passing
- [x] Typecheck clean
- [x] Linting clean

## Screenshots
[Add screenshots if UI changes]
EOF
)"
```

### After PR Merge

1. **Linear auto-closes**
   - GitHub mentions "DRE-301" → Linear detects and closes ticket
   - Linear updates status to "Done"

2. **Archive OpenSpec proposal**
   ```bash
   /openspec:archive maintenance-logging
   ```
   - Specs move to `openspec/specs/maintenance/`
   - Change folder moves to `openspec/archive/`

3. **Vercel auto-deploys**
   - PR merged to `develop` → Vercel preview
   - Merged to `main` → Vercel production

---

## Complete Example: Maintenance Logging Feature

### Timeline

| Phase | Duration | Artifacts |
|-------|----------|-----------|
| PRD Writing | 1 week | "Maintenance Tracking.gdoc" |
| Linear Planning | 1 day | DRE-301, DRE-302, subtasks |
| OpenSpec Proposal | 1 hour | openspec/changes/maintenance-logging/ |
| Implementation | 3 days | Code, tests |
| Review & Deploy | 1 day | PR merged, deployed |
| **Total** | **~2 weeks** | **Live feature** |

### Step-by-Step

**Week 1 (PM):**
- Monday: Draft PRD in Notion
- Tuesday-Thursday: Stakeholder review
- Friday: Finalize PRD, share with team

**Week 2 (PM + Dev):**
- Monday AM: PM creates Linear tickets (DRE-301, etc.)
- Monday PM: Dev picks DRE-301, creates OpenSpec proposal
- Tuesday-Thursday: Dev implements following tasks.md
- Friday: PR review, merge, deploy

**Artifacts Created:**
```
Notion
└── "Maintenance Tracking PRD" (Notion page)

Linear
├── Epic: Maintenance Tracking
├── DRE-301: Log maintenance records
│   ├── DRE-301a: Backend (database)
│   ├── DRE-301b: Mobile UI
│   ├── DRE-301c: Web UI
│   ├── DRE-301d: Testing
│   └── DRE-301e: Analytics
└── DRE-302: View maintenance history

OpenSpec
└── openspec/changes/maintenance-logging/ (later archived)
    ├── proposal.md
    ├── tasks.md
    └── specs/maintenance/spec.md

GitHub
└── PR #XXX: "feat: maintenance logging (DRE-301)"
```

---

## Best Practices Summary

### For Product Managers

**Writing PRDs:**
- Focus on **why** (business case) not **how** (implementation)
- Include measurable success metrics
- Keep it concise (3-5 pages for MVP features)
- Update when requirements change significantly

**Creating Linear Tickets:**
- Link to specific PRD sections
- Write clear, testable acceptance criteria
- Break large stories into subtasks
- Use consistent labels
- Estimate story points realistically

### For Developers

**Using OpenSpec:**
- Always create proposal before coding
- Reference Linear ticket and PRD
- Follow tasks.md checklist systematically
- Update specs if requirements change during implementation

**Commits & PRs:**
- Always mention Linear ticket ID (DRE-XXX)
- Write clear commit messages
- Include testing evidence in PR
- Link to OpenSpec proposal

### For Everyone

**Traceability:**
- Every code change should trace back to Linear ticket
- Every Linear ticket should link to PRD section
- Every OpenSpec proposal should reference both

**Communication:**
- PRD changes → Notify team, update Linear tickets
- Linear changes → Update OpenSpec proposal if needed
- OpenSpec changes → Document in PR description

---

## Troubleshooting

### "Should I create a PRD for this small feature?"

**No** if:
- Feature is obvious and well-understood
- No stakeholder buy-in required
- Implementation is straightforward

**Yes** if:
- Feature affects multiple personas
- Business justification is unclear
- Feature requires cross-team coordination

### "My Linear ticket is too big. How do I break it down?"

Use the **INVEST** criteria:
- **I**ndependent: Can be worked on separately
- **N**egotiable: Scope can be adjusted
- **V**aluable: Delivers user value
- **E**stimable: Can estimate effort
- **S**mall: Fits in one sprint
- **T**estable: Has clear acceptance criteria

If ticket violates these, split it into smaller stories or subtasks.

### "OpenSpec proposal doesn't match Linear ticket. What do I do?"

1. Check if Linear ticket is accurate
2. If Linear is wrong, update it first
3. Regenerate OpenSpec proposal with corrected info
4. If proposal reveals gaps in Linear ticket, update both

### "Should I update the PRD after implementation?"

**No** - PRDs are strategic documents that remain static.

**Instead:**
- Update Linear tickets with "as-built" notes
- Archive OpenSpec specs as source of truth
- Create new PRD page in Notion if product direction changes

---

## Tools & Links

**Documentation:**
- **Notion**: https://notion.so/ (PRD workspace)
- **Linear**: https://linear.app/dreamstack
- **GitHub**: https://github.com/DreamStack-us/loother

**Internal Guides:**
- **AGENTS.md**: Project root
- **OPENSPEC_IMPLEMENTATION_GUIDE.md**: Project root
- **Agent Contexts**: `.claude/agents/`

**Templates:**
- PRD Template: (Available in Notion workspace)
- Linear Ticket Template: (See above)
- OpenSpec is auto-generated

---

**Last Updated**: October 2025
**Questions?** Ask in #product-eng Slack channel or consult `.claude/agents/product-manager.md`
