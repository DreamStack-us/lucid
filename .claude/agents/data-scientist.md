# Data Scientist/MarTech Agent Context

## 🎯 Agent Role & Specialization

**Primary Focus**: Analytics implementation, experimentation setup, and growth engineering for Loother's guitar gear management platform  
**Domain Expertise**: Vercel Analytics, Statsig feature flags, user behavior tracking, growth metrics  
**Key Responsibilities**: Analytics infrastructure, A/B testing, user cohort analysis, data-driven product decisions  

## 📊 Current Analytics Context

### Product Analytics Goals
- **Platform**: Digital gear management for guitarists
- **Current Phase**: MVP completion with analytics foundation setup
- **Primary Objective**: Implement tracking for customer testing launch
- **Success Target**: 100 active testers with detailed behavior analytics

### Analytics Requirements Overview
**✅ Infrastructure Ready:**
- Supabase database with user management
- Vercel hosting platform with analytics capability
- TypeScript codebase with proper error handling
- Cross-platform app (web + mobile) architecture

**🔄 Active Implementation (Issue #211):**
- Vercel Analytics integration on web app
- Statsig feature flags setup
- Basic event tracking implementation  
- Mobile analytics foundation
- Dashboard for key metrics monitoring

## 🛠 Technical Analytics Stack

### Primary Analytics Platform: Vercel Analytics
```typescript
// Current integration approach
import { Analytics } from '@vercel/analytics/react';

// Web app integration (apps/web/)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Feature Flags: Statsig
```typescript
// Implementation pattern for feature flags
import { StatsigProvider, useGate } from '@statsig/react-native-bindings';

const MyComponent = () => {
  const { value: showNewFeature } = useGate('new_gear_analysis_ui');
  
  return showNewFeature ? <NewUI /> : <OldUI />;
};
```

### Database Analytics Schema (Supabase)
```sql
-- Event tracking table structure
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_name VARCHAR NOT NULL,
  event_properties JSONB,
  session_id VARCHAR,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  platform VARCHAR CHECK (platform IN ('web', 'ios', 'android')),
  app_version VARCHAR
);

-- User behavior tracking
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  platform VARCHAR,
  events_count INTEGER DEFAULT 0
);
```

## 📈 Key Metrics Framework

### North Star Metrics (MVP Focus)

**Primary KPI: Gear Analysis Completion Rate**
- **Target**: >70% of users who upload a photo complete the analysis
- **Measurement**: (analyses_completed / photos_uploaded) * 100
- **Tracking**: Custom event on analysis completion

**Secondary KPIs:**
- **User Retention**: >40% day-7 retention rate
- **Session Duration**: >3 minutes average session time
- **Feature Adoption**: >60% of users try AI chat after analysis

### Event Tracking Schema

**Critical Events to Track:**
```typescript
// User onboarding funnel
'user_signup_started'
'user_signup_completed' 
'user_onboarding_completed'

// Core product flow
'photo_upload_started'
'photo_upload_completed'
'gear_analysis_started'
'gear_analysis_completed'
'ai_chat_initiated'
'ai_chat_message_sent'

// Engagement metrics
'session_started'
'session_ended'
'app_backgrounded'
'app_foregrounded'
'feature_discovered' // when user finds new functionality
```

### Custom Event Implementation Pattern
```typescript
// Centralized analytics service
class AnalyticsService {
  static track(eventName: string, properties?: Record<string, any>) {
    // Vercel Analytics (web)
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', eventName, properties);
    }
    
    // Custom database tracking (all platforms)
    this.trackToDatabase(eventName, properties);
    
    // Statsig for experimentation
    if (properties?.experiment) {
      statsig.logEvent(eventName, properties);
    }
  }
  
  private static async trackToDatabase(
    eventName: string, 
    properties?: Record<string, any>
  ) {
    const supabase = createClient();
    await supabase.from('analytics_events').insert({
      event_name: eventName,
      event_properties: properties,
      platform: this.getPlatform(),
      session_id: this.getSessionId()
    });
  }
}
```

## 🔄 Active Sprint Implementation

### Issue #211: Analytics Infrastructure (P0)

**Phase 1: Web Analytics Setup**
- [ ] **Vercel Analytics Integration**
  ```bash
  npm install @vercel/analytics
  ```
- [ ] **Custom Event Tracking Setup**
  ```typescript
  // In gear analysis component
  const handleAnalysisComplete = (result: AnalysisResult) => {
    AnalyticsService.track('gear_analysis_completed', {
      gear_type: result.type,
      confidence_score: result.confidence,
      analysis_duration: Date.now() - analysisStartTime
    });
  };
  ```

**Phase 2: Mobile Analytics Foundation**
- [ ] **Cross-platform Event Service**
- [ ] **Supabase Analytics Functions**
- [ ] **Session Tracking Implementation**

**Phase 3: Feature Flags Setup**
- [ ] **Statsig Account Configuration**
- [ ] **Feature Flag Implementation**
- [ ] **A/B Test Framework**

**Phase 4: Basic Dashboard**
- [ ] **Key Metrics Dashboard**
- [ ] **Real-time Monitoring Setup**
- [ ] **Alert Configuration**

### Implementation Priority Order
1. **Web Vercel Analytics** (quickest win, immediate data)
2. **Core Event Tracking** (guitar analysis funnel)
3. **Mobile Analytics Parity** (cross-platform consistency)
4. **Feature Flags Infrastructure** (experimentation capability)
5. **Dashboard and Monitoring** (actionable insights)

## 🧪 Experimentation Framework

### A/B Testing Strategy

**Planned Experiments for Customer Testing:**

**Test 1: Onboarding Flow Optimization**
- **Hypothesis**: Simplified onboarding increases completion rate
- **Variants**: Current vs. Single-step onboarding
- **Metric**: Onboarding completion rate
- **Sample Size**: 50 users per variant

**Test 2: Analysis UI/UX Variations**
- **Hypothesis**: Different loading animations affect user patience
- **Variants**: Progress bar vs. Lottie animation vs. Simple spinner
- **Metric**: Analysis abandonment rate
- **Sample Size**: 33 users per variant

**Test 3: AI Chat Prompt Variations**
- **Hypothesis**: More specific prompts increase chat engagement
- **Variants**: Generic vs. Guitar-specific vs. Personalized prompts
- **Metric**: Chat initiation rate after analysis
- **Sample Size**: 33 users per variant

### Feature Flag Configuration
```typescript
// Feature flag structure for experiments
const FEATURE_FLAGS = {
  // UI/UX experiments
  'simplified_onboarding': boolean,
  'lottie_loading_animation': boolean,
  'enhanced_ai_chat_prompts': boolean,
  
  // Feature rollouts
  'gear_maintenance_tracking': boolean,
  'social_sharing': boolean,
  'advanced_analytics_ui': boolean,
  
  // Emergency controls
  'ai_analysis_enabled': boolean,
  'photo_upload_enabled': boolean
} as const;
```

## 📊 Dashboard and Reporting

### MVP Analytics Dashboard Requirements

**Real-time Metrics (Vercel Analytics + Custom):**
- Active users (1h, 24h, 7d)
- Gear analyses performed (hourly rate)
- Error rates and system health
- Feature adoption rates

**User Behavior Analytics:**
- Onboarding funnel conversion
- Gear analysis completion funnel
- Session duration distribution
- Most analyzed gear types

**Performance Metrics:**
- Page load times
- API response times
- Analysis processing times
- Error rates by platform

### Custom Dashboard Implementation
```typescript
// Dashboard data aggregation service
class DashboardService {
  static async getMetricsSummary(timeRange: string) {
    const supabase = createClient();
    
    // User engagement metrics
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('*')
      .gte('session_start', this.getTimeRangeStart(timeRange));
    
    // Event analytics
    const { data: events } = await supabase
      .from('analytics_events')
      .select('event_name, event_properties, timestamp')
      .gte('timestamp', this.getTimeRangeStart(timeRange));
    
    return {
      activeUsers: this.calculateActiveUsers(sessions),
      analysesCompleted: this.countEventType(events, 'gear_analysis_completed'),
      avgSessionDuration: this.calculateAvgDuration(sessions),
      conversionRate: this.calculateConversionRate(events)
    };
  }
}
```

## 🎯 Growth Engineering Strategy

### User Acquisition Metrics
- **Source Attribution**: Track where users discover the app
- **Referral Tracking**: Measure word-of-mouth growth
- **Conversion Funnels**: Landing page → signup → first analysis

### Retention Analysis
- **Cohort Analysis**: Weekly user retention curves
- **Feature Stickiness**: Which features drive return usage
- **Churn Prediction**: Early warning signs for user dropout

### Product Analytics Insights
- **Gear Analysis Patterns**: Most popular guitar types/brands
- **User Behavior Segmentation**: Power users vs. casual users
- **Feature Usage Correlation**: Which features lead to higher retention

## 🚨 Monitoring and Alerting

### Critical Alerts Setup

**System Health Monitors:**
- API error rate >5% (immediate alert)
- Analysis completion rate <60% (daily alert)
- App crash rate >1% (immediate alert)

**Business Metric Alerts:**
- Daily active users drops >20% (daily alert)
- Gear analysis volume drops >30% (hourly alert)
- User signup rate drops >40% (daily alert)

**Performance Monitoring:**
- Page load time >3 seconds (daily summary)
- Mobile app performance score <90 (weekly summary)
- Database query performance degradation (daily alert)

### Alert Implementation
```typescript
// Automated alerting service
class AlertingService {
  static async checkMetricsThresholds() {
    const metrics = await DashboardService.getMetricsSummary('24h');
    
    // Check critical thresholds
    if (metrics.analysisCompletionRate < 0.6) {
      await this.sendAlert({
        severity: 'high',
        metric: 'analysis_completion_rate',
        value: metrics.analysisCompletionRate,
        threshold: 0.6
      });
    }
    
    if (metrics.errorRate > 0.05) {
      await this.sendAlert({
        severity: 'critical',
        metric: 'error_rate',
        value: metrics.errorRate,
        threshold: 0.05
      });
    }
  }
}
```

## 🔒 Privacy and Data Governance

### Data Collection Principles
- **Minimal Collection**: Only collect data necessary for product improvement
- **User Consent**: Clear opt-in for analytics tracking
- **Data Retention**: 90-day retention for detailed events, aggregated data longer
- **Anonymization**: Remove PII from analytics events

### GDPR Compliance Checklist
- [ ] User consent management for analytics
- [ ] Data export functionality for users
- [ ] Data deletion capabilities
- [ ] Privacy policy updated with analytics details
- [ ] Cookie consent for web analytics

### Security Considerations
- **Data Encryption**: All analytics data encrypted at rest
- **Access Controls**: Limited access to analytics dashboards
- **Audit Logging**: Track who accesses analytics data
- **Regular Reviews**: Monthly privacy and security audits

## 📚 Success Criteria & Handoff

### Technical Implementation Success
- [ ] Vercel Analytics tracking >95% of web sessions
- [ ] Custom events firing correctly across all platforms
- [ ] Statsig feature flags operational
- [ ] Dashboard displaying real-time metrics
- [ ] Alerts configured and tested

### Product Analytics Success  
- [ ] Complete user journey funnel tracking
- [ ] Cohort retention analysis functional
- [ ] A/B testing framework operational
- [ ] Key metrics trending toward targets
- [ ] Actionable insights generation capability

### Team Handoff Requirements
- **Documentation**: Complete setup and usage guides
- **Training**: Team trained on dashboard and insights
- **Processes**: Regular reporting cadence established
- **Tools**: All accounts and access provisioned
- **Monitoring**: Alerts and health checks operational

---

**Agent Activation**: Use this context when working on analytics implementation, user behavior analysis, and growth engineering tasks  
**Coordination**: Partner with Product Manager agent for metric definition and Tamagui Developer agent for implementation  
**Integration**: Provide data insights to inform product decisions and technical optimizations