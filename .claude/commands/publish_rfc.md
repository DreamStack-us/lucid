<!-- ccw-template-version: 1.0.0 -->
<!-- ccw-template-name: publish_rfc -->
<!-- ccw-last-updated: 2025-01-28 -->
# Publish RFC to GitHub Discussions

You are tasked with publishing a thoughts document as an RFC (Request for Comments) to GitHub Discussions to gather team consensus before implementation.

## Purpose

When you've researched a feature or created a plan and want team input before proceeding, publish it as an RFC to GitHub Discussions. This enables:
- Team discussion and feedback
- Consensus building before implementation
- Public record of decision-making process
- Discovery by future team members

## When to Use

Publish an RFC when:
- Proposing significant architecture changes
- Introducing new tools, frameworks, or dependencies
- Major feature designs affecting multiple areas
- Technical decisions requiring team alignment
- Cross-team coordination needed
- Uncertain about the best approach and want input

**Don't use for:**
- Minor bug fixes or obvious improvements
- Fully approved plans ready for implementation
- Internal brainstorming (use thoughts/local/ instead)

## Initial Response

When invoked WITHOUT a document path:
```
I'll help you publish an RFC to GitHub Discussions.

Please provide:
1. The path to the thoughts document you want to publish
   - From thoughts/shared/research/ for research findings
   - From thoughts/shared/plans/ for implementation plans
   - From thoughts/local/ if you want to publish a draft

What document would you like to turn into an RFC?
```

When invoked WITH a document path:
```
I'll prepare your RFC for GitHub Discussions. Let me read the document first...
```

## Process Steps

### Step 1: Read and Analyze the Document

1. **Read the thoughts document completely:**
   - Parse the frontmatter (title, date, status, related docs)
   - Understand the full content
   - Identify key sections and arguments
   - Note any open questions or areas needing input

2. **Determine RFC type:**
   - **Research RFC**: Presenting findings, proposing solutions
   - **Design RFC**: Architecture or technical design decisions
   - **Process RFC**: Changes to team workflow or tooling

3. **Check readiness:**
   - Is the content complete enough for feedback?
   - Are there specific questions to ask the team?
   - Is the problem statement clear?
   - Are alternatives considered?

### Step 2: Format as RFC

Transform the thoughts document into a structured RFC:

```markdown
# RFC: [Title from Document]

**Status:** Draft | Under Review | Approved | Rejected
**Author:** [From document metadata or user]
**Date:** [Today's date]
**Related Ticket:** DRE-XXX (if applicable)
**Source Document:** [Link to thoughts document on GitHub]

## Summary
[1-3 sentence overview of what this RFC proposes]

## Problem Statement
[Clear description of the problem or need this addresses]
[Why is this important to solve now?]

## Proposed Solution
[Your recommended approach with key details]
[How does this solve the problem?]

## Alternatives Considered
1. **[Alternative 1]:**
   - Pros: [Benefits]
   - Cons: [Drawbacks]
   - Why not chosen: [Reasoning]

2. **[Alternative 2]:**
   - Pros: [Benefits]
   - Cons: [Drawbacks]
   - Why not chosen: [Reasoning]

## Technical Details
[Implementation specifics]
[Architecture diagrams if applicable]
[Code examples or patterns]

## Impact Assessment
- **Affected Systems:** [List of components/services impacted]
- **Migration Required:** Yes/No - [Details if yes]
- **Breaking Changes:** Yes/No - [Details if yes]
- **Performance Impact:** [Expected impact on performance]
- **Security Implications:** [Any security considerations]

## Open Questions
[List specific questions for team discussion]
[Areas where you need input]

## Timeline
- **RFC Discussion Period:** [Suggested duration, e.g., "3-5 business days"]
- **Decision Deadline:** [When decision should be made]
- **Implementation Start:** [Proposed start date if approved]

## Risks and Mitigation
- **Risk 1:** [Description] → **Mitigation:** [How to address]
- **Risk 2:** [Description] → **Mitigation:** [How to address]

## References
- Source Document: [`thoughts/shared/[path]`](GitHub URL)
- Related Tickets: DRE-XXX
- Related RFCs: [If any]
- External Resources: [Docs, articles, examples]

---

## Discussion Guidelines

**For Reviewers:**
- Please read the full RFC before commenting
- Focus feedback on: feasibility, alternatives, edge cases, impacts
- Ask clarifying questions
- Suggest improvements
- Vote using reactions: 👍 (approve), 👎 (concerns), 🤔 (questions)

**Decision Process:**
- Consensus preferred; at minimum no blocking objections
- Author will summarize feedback and update RFC
- Final decision by [decision maker or process]
- RFC will be marked Approved/Rejected after discussion period
```

### Step 3: Prepare GitHub Discussion Post

1. **Choose discussion category:**
   Ask the user to select (or suggest based on RFC type):
   - **Ideas** - For early-stage proposals
   - **RFCs** - For formal technical proposals (if category exists)
   - **General** - For process or team discussions
   - **Engineering** - For technical discussions

2. **Format for GitHub:**
   - Use GitHub-flavored markdown
   - Ensure links are absolute GitHub URLs
   - Add appropriate labels/tags if supported

3. **Present draft to user:**
   ```
   ## Draft RFC for GitHub Discussions

   **Title:** RFC: [Feature Name]
   **Category:** [Suggested category]

   [Show formatted RFC content]

   ---

   This RFC will:
   - Post to GitHub Discussions in the [category] category
   - Link back to source: `thoughts/shared/[path]`
   - Request [N] days for team discussion
   - Enable team consensus before implementation

   Would you like me to:
   1. Post this RFC now
   2. Make edits first
   3. Save the formatted RFC to thoughts/shared/ and post later
   ```

### Step 4: Publish to GitHub Discussions

Using GitHub MCP tools or gh CLI:

1. **Create the discussion:**
   ```bash
   # Using gh CLI
   gh discussion create \
     --category "RFCs" \
     --title "RFC: [Title]" \
     --body-file /tmp/rfc_formatted.md
   ```

   Or using MCP tools:
   ```
   mcp__github__create_discussion with:
   - owner: DreamStack-us
   - repo: loother
   - category: RFCs
   - title: RFC: [Title]
   - body: [Formatted RFC content]
   ```

2. **Get discussion URL:**
   - Capture the created discussion URL
   - Store for reference

### Step 5: Update Source Document

1. **Add RFC metadata to original thoughts document:**
   ```yaml
   ---
   title: [Original title]
   date: [Original date]
   status: under-review
   rfc_published: YYYY-MM-DD
   rfc_url: [GitHub Discussions URL]
   rfc_decision_by: YYYY-MM-DD
   ---
   ```

2. **Optionally add RFC badge:**
   ```markdown
   > 📢 **RFC Published:** This document is under team review.
   > [Join the discussion →](GitHub Discussions URL)
   ```

3. **If user requested, sync thoughts:**
   ```bash
   npx humanlayer thoughts sync  # If using humanlayer
   ```

### Step 6: Post-Publication Actions

1. **Notify the user:**
   ```
   ✅ RFC Published Successfully!

   - GitHub Discussion: [URL]
   - Source Document: `thoughts/shared/[path]` (updated with RFC link)
   - Category: [Category]
   - Discussion Period: [Duration]

   Next steps:
   - Share the RFC URL with your team (Slack, email, etc.)
   - Monitor discussion for questions and feedback
   - After discussion period, summarize feedback and make a decision
   - Update RFC status in GitHub Discussions
   - Update source document with decision

   Would you like me to:
   - Create a Linear ticket to track RFC decision?
   - Draft a Slack message to share the RFC?
   ```

2. **Offer to create tracking ticket:**
   ```
   I can create a Linear ticket (DRE-XXX) to track:
   - RFC review completion
   - Implementation if approved
   - Documentation updates

   Should I create this ticket?
   ```

## Important Notes

- **RFC != Decision**: Publishing an RFC doesn't mean the proposal is approved
- **Be open to feedback**: The goal is to gather input and build consensus
- **Timebox discussion**: Set a clear discussion period (3-7 days typical)
- **Summarize and decide**: After discussion, author summarizes and decision is made
- **Update status**: Mark RFC as Approved/Rejected and update thoughts document

## Example Workflow

### Scenario: New Feature Architecture

1. Developer researches new feature in `thoughts/local/research/vector-search.md`
2. Refines research and moves to `thoughts/shared/research/2025-01-28-vector-search.md`
3. Runs `/publish_rfc thoughts/shared/research/2025-01-28-vector-search.md`
4. RFC posted to GitHub Discussions
5. Team discusses for 3 days
6. Author summarizes feedback, makes revisions
7. RFC approved by consensus
8. Author creates implementation plan
9. Implementation plan references approved RFC

### Scenario: Architecture Decision

1. Developer creates design in `thoughts/shared/plans/2025-01-28-DRE-245-api-redesign.md`
2. Before implementing, runs `/publish_rfc thoughts/shared/plans/2025-01-28-DRE-245-api-redesign.md`
3. RFC identifies concerns about breaking changes
4. Team suggests phased rollout approach
5. Author updates plan with phased approach
6. RFC approved with modifications
7. Implementation proceeds with agreed approach

## Integration with Other Commands

- `/research_codebase` → `/publish_rfc` → Team consensus → `/create_plan`
- `/create_plan` → `/publish_rfc` (for major plans) → `/implement_plan`
- `/publish_rfc` → `/linear` (create tracking ticket)

## Customization

Adjust these for your team:
- **Discussion period**: Default 3-5 days, adjust based on urgency
- **Decision process**: Consensus, majority vote, or designated decision maker
- **GitHub category**: Use what makes sense for your repo
- **Notification method**: Slack, email, or other team communication

## Support

- Check if GitHub Discussions is enabled for your repo
- Requires GitHub MCP tools or `gh` CLI access
- See `.claude/commands/linear.md` for ticket creation
- See `thoughts/README.md` for thoughts system overview

---

**Remember**: The goal of an RFC is to gather input and build consensus, not to railroad your preferred solution. Be open to feedback and willing to iterate!
