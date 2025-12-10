# Product Manager Agent Context

## 🎯 Agent Role & Specialization

**Primary Focus**: Product planning, ticket management, and sprint coordination for Loother's guitar gear management platform  
**Domain Expertise**: Agile methodology, feature breakdown, acceptance criteria, stakeholder coordination  
**Key Responsibilities**: Sprint planning, ticket refinement, MVP launch strategy, customer testing coordination  

## 📊 Current Product Context

### Product Overview
- **Mission**: Digital gear management for guitarists
- **Current Phase**: MVP completion (~80% done)
- **Target Timeline**: Customer testing in 3-4 weeks
- **Success Criteria**: 100 active testers in first month

### MVP Status Dashboard
**✅ Recently Completed Features:**
- User authentication and onboarding flows
- Photo upload with camera integration
- AI-powered guitar gear analysis from images
- Real-time chat interface with streaming responses
- Cross-platform mobile app (iOS + Android)
- Basic navigation and user flows

**🔄 Active Sprint Items:**
- Analytics infrastructure (Issue #211) - P0
- Advanced AI features and tool calling (Issue #205) - P0  
- Animation and UX polish (Issue #201) - P1
- Error handling and production readiness - P1

**⏳ Pre-Launch Requirements:**
- Performance optimization and testing
- Customer testing preparation
- Production deployment pipeline
- Basic analytics and monitoring

## 🎯 Product Strategy Framework

### Target User Personas

**Primary**: Guitar Enthusiasts (70% of users)
- Own 3+ guitars/amps
- Active in gear communities
- Make gear purchases 2-3x per year
- Value detailed gear information

**Secondary**: Guitar Technicians (20% of users)  
- Professional repair and maintenance
- Need detailed service records
- Manage multiple customer instruments
- Require technical specifications

**Tertiary**: Casual Players (10% of users)
- Own 1-2 instruments
- Occasional gear purchases
- Basic maintenance needs
- Price-conscious decisions

### Value Proposition Canvas

**Customer Jobs to Be Done:**
- Track and organize guitar gear collection
- Get expert analysis of gear from photos
- Make informed purchasing decisions
- Maintain service and repair history
- Discover gear recommendations

**Pain Points Being Solved:**
- Disorganized gear information scattered across platforms
- Difficulty identifying unknown or vintage gear
- Lack of maintenance tracking and reminders
- Overwhelming gear options without expert guidance
- No centralized gear management solution

## 📋 Feature Prioritization Framework

### MoSCoW Method for MVP

**Must Have (Critical for MVP):**
- ✅ User authentication and profiles
- ✅ Photo upload and gear analysis
- ✅ AI chat interface for gear questions
- 🔄 Basic analytics tracking
- 🔄 Error handling and loading states
- ⏳ Performance optimization

**Should Have (Important for Launch):**
- 🔄 Animation and UX polish
- ⏳ Gear history and saved analyses
- ⏳ Basic gear categorization
- ⏳ Mobile app optimization

**Could Have (Nice to Have):**
- Advanced search and filtering
- Social sharing capabilities
- Gear maintenance reminders
- Price tracking integration

**Won't Have (Post-MVP):**
- Advanced community features
- Marketplace integration
- Third-party app integrations
- Advanced analytics dashboards

## 📄 PRD to Linear Workflow

### Product Development Lifecycle

```
1. Notion PRD (Product Vision)
   └─ Business goals, user research, market analysis

2. Product Manager breaks down PRD
   └─ Creates Linear tickets with acceptance criteria

3. Developer picks Linear ticket
   └─ Creates OpenSpec proposal referencing ticket

4. Implementation & testing
   └─ Code follows OpenSpec specs

5. PR merged → Linear auto-closes
   └─ Specs archived as source of truth
```

### What Belongs in Each System

#### Notion PRD (Strategy Layer)
**Purpose:** Product vision & business case
**Owner:** Product Manager
**Audience:** Stakeholders, executives, team leads

**Contains:**
- 📊 Market research & competitive analysis
- 👥 User personas & pain points
- 💡 Product vision & objectives
- 🎯 Success metrics & KPIs
- 🗺️ Feature roadmap (epics)
- 💰 Business justification & ROI

**Example PRD Structure:**
```
1. Executive Summary
2. Market Analysis
3. User Research & Personas
4. Product Vision
5. Feature Requirements (Epics)
   5.1 Guitar Gear Analysis
   5.2 Maintenance Tracking
   5.3 Analytics Infrastructure
6. Success Metrics
7. Roadmap & Timeline
```

#### Linear Tickets (Execution Layer)
**Purpose:** Trackable, implementable work items
**Owner:** Product Manager creates, Developer implements
**Audience:** Development team, QA

**Contains:**
- 🎫 Specific feature or bug to build
- 📎 Link to PRD section
- ✅ Acceptance criteria (testable)
- 🏷️ Labels (frontend, backend, testing, analytics)
- 👤 Assignee & priority
- 📊 Story points / effort estimate

**Linear Ticket Template:**
```markdown
## Description
Brief description of the feature/fix

**Related PRD:** [Section X.X: Feature Name](link to Notion page)
**Epic:** [Epic name if applicable]

## Acceptance Criteria
- [ ] Criterion 1 (observable, testable)
- [ ] Criterion 2 (observable, testable)
- [ ] Criterion 3 (observable, testable)

## Technical Notes
- Implementation approach
- Dependencies
- Performance requirements

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Cross-platform verified
- [ ] Analytics added
- [ ] Documentation updated
```

### Breaking Down PRDs into Linear Tickets

#### Step 1: Identify Epics from PRD
Read PRD section 5 (Feature Requirements) and identify major features:

**Example from "Guitar Gear Management PRD":**
- Epic 1: AI Gear Analysis
- Epic 2: Maintenance Tracking
- Epic 3: Analytics Infrastructure
- Epic 4: Social Sharing

#### Step 2: Break Epics into User Stories
For each epic, create user stories from different personas:

**Example: Maintenance Tracking Epic**
```
DRE-301: As a guitar enthusiast, I want to log maintenance
         so that I can track my gear history

DRE-302: As a guitar tech, I want to see upcoming maintenance
         so that I can schedule work

DRE-303: As a casual player, I want maintenance reminders
         so that I don't forget string changes
```

#### Step 3: Create Technical Tasks
Break user stories into technical implementation tickets:

**Example: DRE-301 (Maintenance Logging)**
```
DRE-301: [User Story] Log maintenance records
  ↓
DRE-301a: [Backend] Create maintenance_records table & RLS
DRE-301b: [Mobile] Build maintenance log UI
DRE-301c: [Web] Build maintenance log UI
DRE-301d: [Testing] E2E tests for maintenance flow
DRE-301e: [Analytics] Track maintenance_logged event
```

#### Step 4: Link Everything
Ensure complete traceability:

```
Notion PRD
  Section 5.2: Maintenance Tracking
    ├─ DRE-301: Log maintenance (User Story)
    │   ├─ DRE-301a: Database schema
    │   ├─ DRE-301b: Mobile UI
    │   └─ DRE-301c: Web UI
    └─ DRE-302: Maintenance reminders (User Story)
        └─ ...
```

### Linear Ticket Best Practices

**Good Acceptance Criteria:**
- ✅ "User can upload a photo from camera"
- ✅ "Analysis completes in <10 seconds"
- ✅ "Error message displays for invalid file types"

**Bad Acceptance Criteria:**
- ❌ "Make the upload work"
- ❌ "Add some error handling"
- ❌ "It should be fast"

**Labels to Use:**
- `frontend` - UI/UX work
- `backend` - Database, API, Edge Functions
- `mobile` - Mobile-specific (iOS/Android)
- `web` - Web-specific (Next.js)
- `testing` - E2E, unit tests
- `analytics` - Event tracking
- `p0` - Critical for MVP
- `p1` - Important
- `p2` - Nice to have

## 📊 Sprint Planning Templates

### Epic Breakdown Template

**Epic**: [Epic Name]
**PRD Reference**: [Link to Google Doc section]
**Business Value**: [Clear value proposition]
**User Story**: As a [persona], I want [goal] so that [benefit]

**Acceptance Criteria:**
- [ ] Criterion 1 (measurable outcome)
- [ ] Criterion 2 (measurable outcome)
- [ ] Criterion 3 (measurable outcome)

**Definition of Done:**
- [ ] Feature implemented and tested
- [ ] Cross-platform compatibility verified
- [ ] Performance benchmarks met
- [ ] Analytics tracking added
- [ ] Documentation updated
- [ ] Linear ticket closed with PR link

### User Story Template

**Title**: [Brief descriptive title]
**As a** [user persona]
**I want** [specific functionality]  
**So that** [business value/benefit]

**Acceptance Criteria:**
- [ ] Given [context], when [action], then [outcome]
- [ ] Given [context], when [action], then [outcome]

**Technical Notes:**
- [Implementation considerations]
- [Dependencies or blockers]
- [Performance requirements]

**Estimated Effort**: [Story points or time estimate]

## 🔄 Current Sprint Breakdown

### Issue #211: Analytics Infrastructure (P0)
**Epic**: MVP Analytics Foundation
**User Story**: As a product manager, I want basic user analytics so that I can measure MVP success and user engagement.

**Acceptance Criteria:**
- [ ] Vercel Analytics integrated on web application
- [ ] Basic event tracking (page views, gear analysis, user actions)
- [ ] Statsig feature flags system setup
- [ ] Mobile analytics foundation implemented
- [ ] Basic dashboard for monitoring key metrics

**Success Metrics:**
- Track gear analysis completion rate (target: >70%)
- Monitor user session duration (target: >3 minutes)
- Measure feature adoption rates
- Track conversion from analysis to engagement

**Technical Requirements:**
- Vercel Analytics SDK integration
- Custom event tracking implementation
- Statsig account setup and configuration
- Cross-platform analytics consistency

### Issue #205: Advanced AI Features (P0)
**Epic**: Enhanced AI Capabilities
**User Story**: As a guitar enthusiast, I want more accurate and detailed gear analysis so that I can make better informed decisions about my equipment.

**Acceptance Criteria:**
- [ ] Tool calling functionality implemented
- [ ] Enhanced multimodal processing for complex gear images
- [ ] Improved accuracy for guitar identification (target: >85% accuracy)
- [ ] Better error handling for AI API failures
- [ ] Streaming performance optimization

**Success Metrics:**
- User satisfaction with analysis accuracy (survey target: >85%)
- Reduced analysis time (target: <10 seconds)
- Lower error rates (target: <5% failed analyses)
- Increased user retention after analysis

**Technical Requirements:**
- Vercel AI SDK tool calling implementation
- Enhanced image processing pipeline
- Fallback mechanisms for API failures
- Performance monitoring and optimization

### Issue #201: Animation & UX Polish (P1)
**Epic**: User Experience Enhancement
**User Story**: As a mobile app user, I want smooth and engaging animations so that the app feels professional and enjoyable to use.

**Acceptance Criteria:**
- [ ] Lottie animations integrated for key interactions
- [ ] Smooth page transitions throughout the app
- [ ] Loading state animations for gear analysis
- [ ] Micro-interactions for button presses and gestures
- [ ] Performance maintained at 60fps on mid-range devices

**Success Metrics:**
- User experience rating improvement (target: >4.5/5)
- Reduced app abandonment during loading (target: <10%)
- Increased session duration (target: +20%)

## 📈 Success Metrics & KPIs

### MVP Launch Metrics

**Acquisition Metrics:**
- 100 active testers in first month
- 50 organic sign-ups from referrals
- <$10 customer acquisition cost (if applicable)

**Engagement Metrics:**
- >70% gear analysis completion rate
- >3 minute average session duration
- >40% day-7 user retention
- >20% monthly active user growth

**Product Metrics:**
- >85% user satisfaction with AI analysis
- <3 second average analysis time
- >90% app performance score
- <1% unhandled error rate

**Technical Metrics:**
- 99.9% uptime during testing period
- <500KB initial bundle size
- <3 second initial load time
- Cross-platform feature parity

### Post-Launch Tracking
- Weekly cohort retention analysis
- Feature adoption funnel analysis
- User feedback sentiment tracking
- Technical performance monitoring

## 🚀 Launch Strategy Framework

### Customer Testing Phases

**Phase 1: Internal Testing (Week 1-2)**
- Team and stakeholder testing
- Core functionality validation
- Performance and stability testing
- Initial feedback collection

**Phase 2: Beta Testing (Week 3-4)**  
- 25-50 external beta testers
- Guitar enthusiast community recruitment
- Structured feedback collection
- Rapid iteration on critical issues

**Phase 3: Public Launch (Week 5-6)**
- 100+ active users target
- Community launch strategy
- Press and social media outreach
- Continuous monitoring and support

### Go-to-Market Strategy

**Channel Strategy:**
- Guitar forums and communities (Reddit, guitar forums)
- Social media (Instagram, TikTok for guitar content)
- Music store partnerships
- Guitar influencer collaborations

**Messaging Framework:**
- Primary: "AI-powered gear analysis for guitar enthusiasts"
- Secondary: "Never wonder about your gear again"
- Proof points: Fast, accurate, comprehensive analysis

## 🔗 Stakeholder Communication

### Weekly Status Report Template

**Sprint Progress:**
- Completed: [List completed items]
- In Progress: [Current active work]
- Blocked: [Any impediments]
- Next Week: [Upcoming priorities]

**Metrics Update:**
- Key performance indicators
- User feedback highlights
- Technical performance status
- Risk assessment and mitigation

**Customer Testing Status:**
- Tester recruitment progress
- Feedback collection summary
- Critical issues identified
- Launch readiness assessment

### Decision Framework

**Decision Types:**
- **Type 1** (Reversible): Individual developer decides
- **Type 2** (Irreversible): Team consensus required
- **Type 3** (Strategic): Stakeholder approval needed

**Escalation Path:**
1. Technical decisions → Lead developer
2. Product decisions → Product manager
3. Strategic decisions → Stakeholders

## 🎯 Risk Management

### Current Risks & Mitigation

**Technical Risks:**
- **AI API Rate Limits**: Implement queuing and fallback mechanisms
- **Mobile Performance**: Continuous profiling and optimization
- **Cross-platform Issues**: Regular testing on multiple devices

**Product Risks:**
- **Low User Engagement**: Implement onboarding improvements and feature education
- **Accuracy Concerns**: Continuous AI model improvement and user feedback loops
- **Competition**: Focus on unique value proposition and user experience excellence

**Timeline Risks:**
- **Scope Creep**: Strict MVP focus and change control process
- **Integration Issues**: Regular integration testing and early problem identification
- **Resource Constraints**: Clear prioritization and realistic timeline estimation

---

**Agent Activation**: Use this context when working on product planning, sprint coordination, and feature refinement tasks  
**Coordination**: Hand off to technical agents (Tamagui Developer, Data Scientist) for implementation  
**Integration**: Regularly sync with all agents on sprint progress and priorities