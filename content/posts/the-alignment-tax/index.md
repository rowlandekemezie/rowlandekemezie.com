---
template: post
title: The Alignment Tax
slug: /posts/the-alignment-tax/
draft: false
date: '2026-09-02T00:00:00.000Z'
description: Alignment helps teams move together, but it becomes expensive when shared context turns into shared control and every stakeholder becomes an approver.
category: Leadership
tags:
  - engineering leadership
  - product management
  - decision making
  - organizational design
  - software engineering
---

Somewhere inside a growing product company, a team has a change that should take about a week to build. Engineering understands the work, Product understands the customer problem, and nobody thinks the change is especially controversial. That is usually when the alignment starts.

The engineering manager wants confidence in the delivery plan. A senior engineer raises an architectural concern. Support wants to understand what customers will see. Go-to-market wants to know how the change will be explained. A partner team might be affected, so someone from Partnerships should probably take a look. Each request makes sense on its own, and nobody is deliberately trying to slow the work down.

A week later, someone who missed the first discussion asks a question the group already answered. The proposal shifts. Someone else wants leadership to see it first. By the time everyone is comfortable, the small experiment has grown into a larger release, because after all that process, shipping something small feels like a waste.

I have seen this pattern often enough to give it a name: **the alignment tax**.

I am not calling collaboration a tax. Large companies have real dependencies: existing customers, security requirements, contracts, shared platforms, regulatory obligations, and teams that affect each other in ways no single squad can see. Alignment prevents expensive mistakes. The tax starts when shared context turns into shared control. People who should give input become informal approvers, and the organization spends so long getting comfortable internally that it gets slower at learning from customers.

## It starts reasonably

The difficult thing about the alignment tax is that almost every individual step can be defended. A support lead should explain how a change might affect customers. A security engineer should identify a security risk. A partner manager should surface a commitment made to a customer. A senior engineer should challenge an architectural choice that creates a long-term problem.

Growing companies need those perspectives. The mistake is assuming that because some alignment creates value, more alignment must create more value.

Alignment has diminishing returns. Early on, it exposes dependencies, clarifies the customer problem, and stops teams from moving in opposite directions. Past a certain point, each new participant brings less new information and one more opportunity for delay, disagreement, context switching, and rework.

![Conceptual alignment value curve](./images/alignment-value-curve.svg)

Where that point sits depends on the decision. A payment migration, an A/B test, a pricing change, and a new internal tool deserve different amounts of attention. Give them all the same treatment and the low-risk work ends up paying for scrutiny it never needed.

There is some evidence for this at the organizational level. McKinsey's 2018 global survey on decision-making covered 1,259 participants in 91 countries. Respondents at organizations with fewer reporting layers were more likely to say decisions were both high quality and quick. Seventy percent of respondents in organizations with one to three layers said decisions were high quality, compared with 53% at four to six layers and 45% at seven or more. For quick decisions, the numbers were 61%, 47%, and 38%.[1]

![Decision quality and speed by reporting layers](./images/decision-speed-quality.svg)

*McKinsey's result is correlational, not proof that layers alone caused slower or weaker decisions. It still shows why adding decision distance should not be treated as free.*

The same survey found that respondents spent an average of 37% of their time making decisions, and 61% said most of their decision-making time was used ineffectively.[1] Companies still need to decide things together. But deciding consumes real capacity, and organizations rarely count that cost when they add another review, another stakeholder, or another layer of approval.

## When input becomes permission

Many alignment problems start with loose language. We use alignment, consultation, coordination, approval, and consensus as though they mean the same thing. They do not. A person can be consulted without owning the decision. Two teams can understand each other's direction without agreeing on every implementation detail. Someone can disagree strongly with a choice and still have no authority to block it.

An approver should exist because they own a specific risk or responsibility, not because they were invited into the discussion early and gradually acquired veto power.

The difference matters more as the stakeholder list grows. Two people have one possible communication path between them. Five people have ten. Ten have 45. Fifteen have 105. Twenty have 190.

![Possible communication paths as stakeholder count grows](./images/coordination-paths.svg)

Those numbers do not mean every possible relationship becomes a meeting. They show why "let's just include these three people" changes the coordination problem faster than it appears to. A well-designed organization stops those paths from turning into required approvals. It gives one person ownership, names the people whose input matters, and makes it clear when a decision is closed.

Without that structure, the safest behaviour is predictable. People copy more stakeholders. Teams socialize decisions before the real decision meeting. Product managers learn who must be comfortable before anything can move, and engineers learn which changes attract organizational attention and start avoiding them. Nobody built the bureaucracy in one step, but everyone has a reason to keep feeding it.

## The hidden cost is waiting

Engineering teams find it easier to measure effort than elapsed time. A security review may take thirty minutes of work and sit in a queue for four days. A platform team might need one hour to confirm an integration constraint but cannot get to it until next week. Product updates the proposal, then waits for another calendar slot to get everyone back in the room. A release can hold five days of engineering effort and still take a month to reach a customer.

DORA's research on change approval challenges the assumption that more approval makes software safer. DORA reports that heavyweight external approvals, such as change advisory boards or senior-management gates, hurt software delivery performance. It also found no evidence that these formal reviews were associated with lower change failure rates.[2]

DORA also describes the mechanism. Slower approvals push teams to release less often and in larger batches. Larger batches raise the impact of each release, which can increase the very risk the approval process was meant to reduce.[2]

![The approval paradox](./images/approval-loop.svg)

That loop is a better test than the usual argument about whether a company has too much process. Ask whether a control reduces risk, or whether it creates waiting that makes teams batch more work, widen the blast radius, and then ask for even more control.

## The alignment tax becomes a product tax

Too much alignment is usually discussed as an employee problem: engineers complain about meetings, Product managers complain about stakeholder management, and leaders complain that decisions take too long. The more expensive part is that the customer eventually pays the tax.

Imagine a team that can build an experiment in four days, but internal discussion and approval take three weeks. The experiment then needs two weeks in production before the team learns anything. On paper, the company runs two-week experiments. In practice, each learning cycle takes closer to six weeks.

A competitor that makes the same reversible decision in two days finishes a loop in about three weeks. Over a year, that is roughly eighteen loops against nine. The gap is not only in features shipped. The two companies now know different amounts about what customers want, what they ignore, what they will pay for, and which assumptions were wrong. That knowledge compounds.

DORA's research on user focus backs this up. Teams with a strong user focus were associated with 40% higher organizational performance, and the research emphasizes short feedback loops, visible user metrics, and reprioritizing work based on what teams learn.[3]

Release speed matters because every release can be a question asked of the market. Does this workflow reduce drop-off? Will customers use the new capability? Does the pricing make sense? Did the change improve conversion? Can we remove a step completely? Every unnecessary week before a safe experiment reaches customers is another week before the company can know the answer.

## The customer can disappear from the room

An organization teaches people what to optimize for, even when nobody writes those incentives down. If getting a small change in front of customers is expensive, but internal agreement is mandatory, people become good at internal agreement. They learn who should see the proposal before a meeting, which objections are likely to stop it, and how to write documents that solve the customer problem while also reducing the political risk of moving forward.

None of this requires bad people or bad intentions. It is a rational response to the system. The danger is that internal confidence starts to replace external evidence. Instead of asking, "How cheaply can we test whether customers want this?" teams spend their energy asking, "How do we get everyone comfortable with this direction?" The questions sound related, but they produce different behaviours.

The customer never sees the alignment work. They only experience what eventually ships, what arrives too late, what gets diluted on the way through the organization, and what never survives long enough to be tested.

## Startups are not magically better at this

The obvious comparison is a startup where five people can make a product decision around one table and ship the change the same afternoon. Startups often are faster, but part of that speed comes from structural advantages: fewer existing customers to disrupt, fewer integrations, fewer contracts, fewer reporting layers, fewer shared systems, and much less organizational history. The same founder may also hold product context, customer context, and final decision authority at the same time.

Some startup speed is deferred cost. Teams can move quickly while accumulating security problems, weak controls, undocumented decisions, duplicated infrastructure, architectural fragmentation, and founder bottlenecks that become painful later.

Large companies cannot fix this by pretending to be ten-person startups. The better question is how to keep decision speed while adding the controls that scale requires. That is an organizational design problem, not a meeting problem.

## Alignment should buy autonomy

The purpose of alignment should be to reduce the amount of coordination a team needs during execution. If a team understands the customer problem, the business objective, the technical boundaries, the acceptable risks, and the success metrics, it should be able to make many implementation decisions without bringing the whole organization back into the room.

Netflix describes a similar idea as "context, not control." Its culture memo says managers should give teams enough context and clarity to make good decisions, while significant decisions have an "informed captain" rather than being made by committee.[4] GitLab makes the ownership principle even more explicit by pushing decisions to the lowest possible level and assigning a directly responsible individual, or DRI.[5]

The details will not transfer perfectly to every company, but the pattern holds. Broad input does not require broad decision authority. Before a discussion gets large, a scalable decision system should answer a few questions:

- What decision are we actually making?
- Who owns it?
- Who has information that the owner needs?
- Who owns a risk that can genuinely block the decision?
- When does the decision close?
- What new evidence would justify reopening it?

The questions are simple, but they remove a surprising amount of ambiguity before that ambiguity turns into coordination work.

## Treat different decisions differently

Amazon's one-way-door and two-way-door model still works because it starts with reversibility rather than hierarchy. One-way-door decisions have significant and difficult-to-reverse consequences, while two-way-door decisions can be reversed or corrected with relatively limited cost.[6]

A payment architecture migration, a major contract, or a change with regulatory consequences deserves more scrutiny than an experiment behind a feature flag. Treating both as though they carry the same risk wastes organizational attention and slows learning where the downside is already contained.

A practical version looks something like this:

| Decision | Useful default |
| --- | --- |
| Local and reversible | One owner decides after getting the context they need |
| Cross-team but reversible | One owner, time-boxed input, parallel dependency checks |
| Difficult to reverse | Formal review with clearly named approvers and one final decider |
| Regulated, security-sensitive, or financially material | Mandatory specialist controls, automated where possible |

Spend alignment where a wrong decision is expensive to undo, and use experiments where the organization can learn safely.

## Move recurring alignment into the system

Engineering already has a mental model for this. If every service had to understand the implementation details of every other service before changing, software would be almost impossible to evolve. So we create interfaces, contracts, ownership boundaries, automated tests, observability, and deployment controls, and parts of the system can change without coordinating with everything around them.

Organizations can apply the same idea. If every team must remember the same security requirements, logging standards, deployment steps, rollback expectations, access controls, and service metadata before shipping, those requirements do not all need to stay conversations. Some belong in templates, CI checks, platform tooling, policies, feature flags, automated rollbacks, and paved roads.

Spotify's experience with Golden Paths is a good example. As autonomous teams grew, Spotify found that fragmented developer tooling and what it called "rumour-driven development" no longer scaled. Golden Paths provided opinionated, supported routes for common engineering work without removing the ability to leave the path when a team had a good reason.[7]

DORA makes a similar recommendation for change management: move validation into peer review, continuous testing, monitoring, and the development platform rather than relying on people far from the change to manually inspect every release.[2]

Regulated environments make the distinction more important, not less. A payments, banking, healthcare, or insurance team cannot treat compliance, privacy, segregation of duties, or auditability as an implementation preference. Some changes will genuinely require specialist review or explicit sign-off. But many requirements define controls, evidence, and accountability without requiring every change to pass through the same manual sequence. Teams can pre-approve common architectures, encode policy checks into CI and infrastructure, generate audit evidence automatically, and reserve additional human review for changes that leave the approved path or materially change the risk profile.

The organization keeps the control but changes its form. Instead of asking a person for permission every time, it encodes repeatable knowledge into the system and saves human attention for cases that require judgment. In engineering organizations, some of the most scalable alignment will look less like another meeting and more like better infrastructure.

## Measure the wait, not only the build

Companies often have detailed engineering metrics while decision friction remains mostly invisible. If a feature takes five engineering days but forty calendar days to reach production, something consumed the other thirty-five. Without measuring that gap, the organization can keep pushing engineering teams to move faster while leaving the real bottleneck untouched.

Standard delivery measures such as lead time for changes and cycle time are still useful, but they can miss part of this problem when the largest delay happens before implementation starts or while work is waiting outside the engineering workflow. I would pair them with a small set of measures that show where the elapsed time goes:

| Metric | What it reveals |
| --- | --- |
| Decision latency | First serious proposal to a decision that lets the team proceed |
| Approval wait time | Time spent waiting for required reviewers, separate from the time they spend reviewing |
| Code-complete-to-production | How long ready work waits before customers can use it |
| Experiment lead time | Product hypothesis to the first usable customer evidence |
| Decision reopen rate | How often closed decisions are reopened without material new evidence |
| Wait share | Calendar days with no active work, as a share of total elapsed days |

These do not need to become another dashboard that teams optimize for. They are diagnostic measures. Count a day as active if anyone worked on the change that day. Parallel work does not add extra days. In the earlier example, five active days out of forty gives a wait share of nearly 90%. That tells a very different story from a change where most of the forty days went into building and testing the product.

Those measures tell you whether the organization is becoming easier or harder to move through, and they change the conversation. Instead of "Engineering needs to deliver faster," leaders can ask why a five-day implementation took forty days to reach customers. Sometimes the answer will be a legitimate constraint. Other times it will expose approval queues, unclear ownership, serial reviews, or a control that exists because nobody has revisited why it was created.

## A better definition of alignment

As companies grow, alignment matters more, because independent decisions carry bigger consequences. I do not think the answer is fewer conversations for their own sake, and I do not think every company should copy startup informality. The better goal is to make alignment produce autonomy.

Teams should share the mission, the customer problem, the constraints, the interfaces, and the measures of success. People with relevant expertise should challenge assumptions and surface risks. Decisions with large or irreversible consequences should get the scrutiny they deserve. Once that context is in place, let people act.

Alignment has done its job when the next decision can be made without everyone in the room. If every decision needs another round of alignment, the company has not reduced uncertainty. It has spread decision authority so widely that nobody can move without permission.

## References

- [McKinsey - Decision making in the age of urgency][1]
- [DORA - Streamlining change approval][2]
- [DORA - User-centric focus][3]
- [Netflix - Culture Memo][4]
- [GitLab - Decision Velocity][5]
- [AWS - Elements of Amazon's Day 1 Culture][6]
- [Spotify Engineering - How We Use Golden Paths to Solve Fragmentation in Our Software Ecosystem][7]

[1]: https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/decision-making-in-the-age-of-urgency
[2]: https://dora.dev/capabilities/streamlining-change-approval/
[3]: https://dora.dev/capabilities/user-centric-focus/
[4]: https://jobs.netflix.com/culture
[5]: https://handbook.gitlab.com/teamops/decision-velocity/
[6]: https://aws.amazon.com/executive-insights/content/how-amazon-defines-and-operationalizes-a-day-1-culture/
[7]: https://engineering.atspotify.com/2020/8/how-we-use-golden-paths-to-solve-fragmentation-in-our-software-ecosystem
