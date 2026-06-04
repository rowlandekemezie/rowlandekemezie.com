---
template: post
title: The Hard Part of Sync Is Deciding What to Believe
slug: /posts/the-real-integration-problem-is-trusting-data/
draft: false
date: '2026-06-03T00:00:00.000Z'
description: Bidirectional sync turns integration into an authority problem. Reliable systems need field ownership, conflict detection, event history, reconciliation, and explainable state.
category: Software
tags:
  - integrations
  - distributed systems
  - software architecture
  - backend systems
series:
  title: Building Integration Systems
  slug: building-integration-systems
  order: 3

image: ./images/building_integration_systems_pt3_hero.webp
---

![Building Integration Systems: Part 3 Hero Image](./images/building_integration_systems_pt3_hero.webp)

> Once data flows both ways, integrations stop being about transport and start becoming systems for ownership, conflict resolution, and recovery.

In Part 2, I wrote about how [external systems lie](https://rowlandekemezie.com/posts/external-systems-lie/).

Most of the time, the lie is boring. A webhook arrives late. An event arrives twice. An API returns stale data. A provider accepts a request but processes the business operation later. A retry succeeds after the original request also succeeded. A status says `pending`, even though the operation has already moved forward somewhere inside the provider’s system.

Those problems are painful enough when data moves in one direction. They become even much harder when data starts flowing both ways.

A one-way integration has a simple authority model. One system owns the truth. Another system receives a copy. You still have failure modes, but the relationship is clear. If the source says a customer’s email is `a@notrealdomain.com`, the destination should eventually reflect `a@notrealdomain.com`. If the destination disagrees, you overwrite it from the source.

However, bidirectional synchronization eliminates that architectural simplicity.

Now two systems can change the same record. In some cases, they change different fields, which can be safe. In others, they change the same field, which can be dangerous. Occasionally, both changes are valid from the perspective of the person who made them. Ultimately, both systems believe they are right because, locally, they are.

A customer updates their email in your app. A few minutes later, a support agent updates the same customer in the CRM. An hour later, your system receives a delayed webhook from the CRM with the old email. Your webhook handler processes the event successfully. Your database updates. Your UI shows the old value again.

What happened? Data moved. The system worked exactly as designed, but the customer record still became wrong.

The failure was a trust failure. Your system accepted a value without understanding whether the sender had authority, whether the event was stale, whether another system had already advanced the record, or whether the field should have been protected from that source.

At small scale, these mistakes look like edge cases. At scale, they become the integration.

## Bidirectional sync means bidirectional authority

Teams often describe bidirectional sync as data flowing both ways.

System A updates System B. System B updates System A. Both systems remain aligned.

The description is technically correct and architecturally weak. Direction belongs to transport. Authority belongs to the domain.

Once a system can send changes back, it graduates from a passive destination to a participant in the business process. It suddenly claims ownership over specific fields, workflow steps, and status transitions including the manual corrections made by users who live in that tool every day.

A CRM may own sales-stage metadata while your product owns billing state. A payroll provider may own filing status while your system owns onboarding intent. A payment processor may own settlement state while your system owns invoice intent. A project management tool may own implementation status while a product tool owns priority.

Bidirectional sync does more than add another arrow to the architecture diagram. It changes the ownership model.

A one-way sync asks:

```txt
How do we move our truth into another system?
```

A bidirectional sync asks:

```txt
When systems disagree, who has the right to change each part of the record?
```

Neither an SDK, a webhook subscription, nor a message queue can answer that question; the solution must be designed directly into your domain model.

When ownership is undefined, write order becomes the ownership model. The last event to arrive wins, even when the sender should never have been allowed to change the field.

## Field ownership should come before conflict resolution

I see many teams jump straight to conflict resolution too early. They ask whether they should use timestamps, version numbers, vector clocks, last-write-wins, or manual review. Those tools matter, but they come after a more basic decision.

You first need to decide who owns what.

If your app updates `customer.email` and the CRM updates `customer.lifecycleStage`, you may not have a conflict. Both updates can be accepted because both fields have different owners. The right outcome is a merge, not a winner.

A weak sync system treats the record as one indivisible object.

```ts
type Customer = {
  id: string
  email: string
  phoneNumber: string
  lifecycleStage: 'lead' | 'qualified' | 'customer'
  billingStatus: 'trial' | 'active' | 'past_due' | 'cancelled'
  updatedAt: Date
}
```

Then it asks:

```txt
Which customer record is newer?
```

A stronger sync system asks:

```txt
Which system owns each field?
Which systems can propose changes?
Which changes can merge automatically?
Which changes require review?
```

A more useful model looks like this:

```ts
type FieldOwnershipPolicy = {
  fieldName: string
  owner: 'local' | 'crm' | 'billing_provider' | 'shared'
  conflictStrategy:
    | 'local_wins'
    | 'external_wins'
    | 'latest_valid_change'
    | 'merge'
    | 'manual_review'
}

const customerSyncPolicy: Array<FieldOwnershipPolicy> = [
  {
    fieldName: 'email',
    owner: 'local',
    conflictStrategy: 'local_wins',
  },
  {
    fieldName: 'phoneNumber',
    owner: 'shared',
    conflictStrategy: 'latest_valid_change',
  },
  {
    fieldName: 'lifecycleStage',
    owner: 'crm',
    conflictStrategy: 'external_wins',
  },
  {
    fieldName: 'billingStatus',
    owner: 'billing_provider',
    conflictStrategy: 'external_wins',
  },
]
```

The shape can change. The discipline matters more than the implementation.

Your integration layer should know whether the CRM can update billing status. Your webhook handler should not mutate every field in a payload just because the provider sent it. Your sync job should not overwrite an entire local record because the provider returned a newer `updatedAt`.

A serious integration system needs field-level authority. Without it, good data eventually gets overwritten by valid-looking data from the wrong owner.

## Timestamps create false confidence

Early sync implementations almost always rely on timestamps. At the basic level, each record has an `updatedAt`. When versions disagree, the newer one wins. Simple to build and explain, but dangerous in production.

Clock skew is only the obvious problem. Even when every system uses UTC and NTP, timestamps still carry ambiguity. A timestamp may represent when the provider persisted the record, when it emitted the event, when the event entered a queue, when the webhook was delivered, or when your system processed it.

The timestamp may have little to do with when the business fact became true.

A delayed webhook can arrive after a newer local change. A background sync can fetch an older provider snapshot after a user already corrected the record. A support tool can mutate a field your product owns. A provider can send a partial object where missing fields mean “not included,” while your mapper reads them as “clear these values.”

If your rule says the newest timestamp wins, your system is quietly letting arrival order define authority.

I have found that a better system asks three separate questions:

```txt
When did this change happen?
Who produced it?
Was that actor allowed to change this field?
```

The timestamp answers only one of those questions, and often poorly.

## Version vectors help detect real conflicts

Distributed systems have an important distinction between two kinds of updates. One update may happen after another because it has seen the earlier version and builds on top of it. Another update may happen independently because two systems changed their own copies without seeing each other's latest state.

Generally, the two cases require different treatment.

If the CRM updates a record after seeing your latest local version, the CRM change may reasonably supersede what came before. If your system and the CRM both update the record without seeing each other’s changes, neither version automatically wins. The updates are concurrent.

Version vectors helps a lot in this scenario. Instead of relying on wall-clock time, each system tracks what it has seen from every other system.

```ts
type VersionVector = Record<string, number>

type VersionedCustomerRecord = {
  id: string
  data: Customer
  version: VersionVector
}
```

Imagine your local system and a CRM are both syncing customer records.

```txt
Local version:
{ local: 5, crm: 2 }

CRM version:
{ local: 4, crm: 3 }
```

The local system has seen five local changes and two CRM changes. The CRM has seen four local changes and three CRM changes.

Neither version fully includes the other. The local system has a local change the CRM has not seen. The CRM has a CRM change the local system has not seen.

The versions are concurrent.

```ts
function compareVersionVectors(
  left: VersionVector,
  right: VersionVector,
): 'left_after_right' | 'right_after_left' | 'same' | 'concurrent' {
  const allSystems = new Set([...Object.keys(left), ...Object.keys(right)])

  let leftIsAhead = false
  let rightIsAhead = false

  for (const system of allSystems) {
    const leftValue = left[system] ?? 0
    const rightValue = right[system] ?? 0

    if (leftValue > rightValue) {
      leftIsAhead = true
    }

    if (rightValue > leftValue) {
      rightIsAhead = true
    }
  }

  if (leftIsAhead && !rightIsAhead) {
    return 'left_after_right'
  }

  if (rightIsAhead && !leftIsAhead) {
    return 'right_after_left'
  }

  if (!leftIsAhead && !rightIsAhead) {
    return 'same'
  }

  return 'concurrent'
}
```

Version vectors do not resolve conflicts. They give the system a cleaner way to know when a conflict exists.

Many integration bugs come from systems doing one of two bad things. They either ignore conflicts entirely, or they invent conflicts where simple merging would have worked. A good integration layer knows when one version includes another, when two versions are equal, and when two systems changed state independently.

Once the system can detect the relationship, the domain can decide the outcome.

## Conflict resolution belongs to the domain

Infrastructure can detect concurrency; the domain defines correctness.

If two systems update a customer’s phone number, maybe the newest valid number wins. If two systems update a list of tags, maybe the correct result is the union of both lists. If two systems update inventory, maybe both operations should apply as deltas. If two systems update payment status, the processor probably wins because settlement state belongs to the payment rail. If two systems update payroll approval status, automatic merging may be unsafe and a person should review the difference.

Different fields need different strategies.

```ts
type ConflictResolutionResult =
  | {
      type: 'resolved'
      value: unknown
      reason: string
    }
  | {
      type: 'manual_review_required'
      reason: string
      localValue: unknown
      externalValue: unknown
    }

function resolveCustomerFieldConflict(input: {
  fieldName: keyof Customer
  localValue: unknown
  externalValue: unknown
  localVersion: VersionVector
  externalVersion: VersionVector
  policy: FieldOwnershipPolicy
}): ConflictResolutionResult {
  switch (input.policy.conflictStrategy) {
    case 'local_wins':
      return {
        type: 'resolved',
        value: input.localValue,
        reason: `${String(input.fieldName)} is owned locally`,
      }

    case 'external_wins':
      return {
        type: 'resolved',
        value: input.externalValue,
        reason: `${String(input.fieldName)} is owned externally`,
      }

    case 'manual_review':
      return {
        type: 'manual_review_required',
        reason: `${String(input.fieldName)} requires human review`,
        localValue: input.localValue,
        externalValue: input.externalValue,
      }

    case 'latest_valid_change':
      return resolveLatestValidChange(input)

    case 'merge':
      return mergeFieldValues(input)
  }
}
```

Generic conflict resolution has limits because correctness rarely works the same across domains.

A calendar sync, payroll sync, payment sync, CRM sync, and inventory sync all have different failure consequences. Losing a note in a CRM may annoy someone. Losing a tax election can create a compliance problem. Treating a payment reversal as a normal status update can corrupt financial reporting.

1. The integration platform should provide a framework:

```txt
detect concurrency
load policies
apply merge rules
record decisions
surface unresolved conflicts
```

2. The product domain should define the meaning:

```txt
who owns the field
which transitions are valid
which conflicts can merge
which conflicts require review
```

Burying those decisions inside webhook handlers spreads rules across the codebase, whereas elevating them to the integration model makes the system easier to reason about and safer to change.

## Event history gives the system memory

Most CRUD systems store current state. Current state is useful until current state becomes suspicious.

A customer says their address changed incorrectly. A provider dashboard shows something else. A webhook log shows an event from yesterday. A retry job replayed a sync. Support wants to know what happened. Engineering wants to know which system made the change.

If your database only stores the current record, how do you defend its accuracy? A thoughtful integration system requires an append-only history of meaningful changes and sync decisions to serve as an immutable paper trail.

```ts
type IntegrationEvent = {
  id: string
  entityType: 'customer' | 'invoice' | 'payment' | 'employee'
  entityId: string

  sourceSystem: 'local' | 'crm' | 'billing_provider' | 'payroll_provider'
  eventType:
    | 'field_changed'
    | 'webhook_received'
    | 'sync_started'
    | 'conflict_detected'
    | 'conflict_resolved'
    | 'manual_review_requested'
    | 'reconciliation_applied'

  payload: unknown
  version: VersionVector

  occurredAt: Date
  receivedAt: Date
  recordedAt: Date
}
```

With this history, the system can answer better questions.

```txt
Who changed this field?
What did we know at the time?
Which version had each system seen?
Was there a conflict?
Which rule resolved it?
Did reconciliation later change the result?
```

Without this history, engineers become the event store. Instead of relying on a system memory, the job devolves into manual labor: searching logs, inspecting provider dashboards, comparing timestamps by hand, asking support to reproduce issues, writing one-off scripts, and patching records manually. Then, the same class of failure returns later with different details.

It's worth noting that hope does not scale as an integration strategy.

## Snapshots make history usable

Event history helps, but replaying history forever becomes expensive.

If an entity has thousands of changes, rebuilding its current state from the beginning on every read creates unnecessary cost. Many event-sourced systems solve this with snapshots: periodically store the current state at a known version, then replay only the events after that snapshot.

The same pattern helps integration systems. A snapshot captures what a system believed at a specific version and time.

```ts
type EntitySnapshot = {
  id: string
  entityType: 'customer'
  entityId: string
  system: 'local' | 'crm'
  state: Customer
  version: VersionVector
  capturedAt: Date
}
```

Snapshots let you compare your system's belief against an external system's belief at a known point. The point-in-time part matters a lot.

If you compare your local current state against a provider’s current state while both systems are still processing events, you will detect differences that may disappear a few minutes later. One system may simply be ahead. A webhook may be delayed. A queue may still be draining. A provider may have accepted a change but not exposed it in the read API.

A good reconciliation process does not merely ask whether two systems look identical right now; instead, it asks whether both systems agree at a known point in time after allowing enough time for relevant events to settle, providing the precision necessary to reduce false repairs.

## Drift should be expected

I have seen teams treat reconciliation as a mere cleanup script. By the time a cleanup script exists, customers have probably already found the bug.

Reconciliation should be part of the integration design from the beginning because drift will happen. Events will be missed. Webhooks will fail. Providers will backfill data. Users will change records directly in external dashboards. Bugs will ship. Queues will pause. Migrations will transform some records incorrectly. Providers will fix data manually and emit no event. Sooner or later, your systems will disagree, and you can either discover that through intentional design, or through a frantic customer complaint.

Drift detection finds places where systems no longer agree allowing reconciliation to step in and repair the difference.

A reconciliation system needs a few basic pieces:

```txt
a source to compare against
a point-in-time snapshot
a comparison strategy
a repair strategy
an audit trail
```

For large datasets, you may start with counts and hashes.

```ts
type ReconciliationSummary = {
  system: 'crm'
  entityType: 'customer'
  capturedAt: Date
  localRecordCount: number
  externalRecordCount: number
  localHash: string
  externalHash: string
  matches: boolean
}
```

If the summary differs, you drill down to row-level differences.

```ts
type ReconciliationDifference = {
  entityId: string
  fieldName: string
  localValue: unknown
  externalValue: unknown
  owner: 'local' | 'crm' | 'shared'
  recommendedAction:
    | 'update_local'
    | 'update_external'
    | 'ignore'
    | 'manual_review'
}
```

Obviously, sensitive domains would require careful repair.

A payroll system should not blindly overwrite employee tax data because a provider snapshot differs. A payments system should not blindly mark invoices paid because a provider status looks successful without understanding settlement, refunds, chargebacks, and reversals. A CRM sync should not restore a deleted contact when deletion was intentional.

Essentially, repair must follow the same ownership and conflict rules as normal sync. Otherwise, reconciliation becomes another corruption path.

## The system should explain its belief

A trustworthy integration system should produce state and explain state.

When support opens a customer record, the UI should show the current data. When something looks wrong, the system should expose the story behind it.

```txt
10:01 - Customer updated email locally to new@example.com
10:02 - Local version advanced to { local: 12, crm: 5 }
10:04 - Sync sent update to CRM
10:08 - CRM webhook received with old@example.com
10:08 - Webhook version { local: 11, crm: 6 } detected as concurrent
10:08 - Conflict resolved using local_wins policy for email
10:08 - Local value preserved as new@example.com
10:09 - CRM correction scheduled
```

Timeline changes leads to better operations. Now, support can answer customer questions without escalating every case to engineering. Engineers can debug behavior without reconstructing the world from raw logs. Product and compliance can understand why the system made a decision.

Integrations fail in gray areas: delayed events, conflicting updates, partial provider states, manual corrections, replayed jobs, and stale reads. A system that cannot explain itself forces humans to reconstruct truth after the fact. And the downside is that manual reconstruction is slow, expensive, and unreliable.

## Avoid sync loops by separating incoming changes from outgoing intent

Bidirectional sync has a classic failure mode: loops.

System A sends an update to System B. System B emits a webhook. System A receives the webhook and treats it as a new external change. System A writes again. System B emits again. The two systems echo each other.

Teams often patch this with flags like:

```txt
ignoreNextWebhook = true
```

Unfortunately, this approach falls apart once retries, parallel workers, delayed delivery, and partial failures show up.

An elegant design separates incoming facts from outgoing intent.

When your system sends a change to a provider, record the outbound sync operation with an idempotency key, version vector, and correlation metadata.

```ts
type OutboundSyncOperation = {
  id: string
  entityType: 'customer'
  entityId: string
  targetSystem: 'crm'
  fields: Array<string>
  localVersion: VersionVector
  idempotencyKey: string
  status: 'pending' | 'sent' | 'confirmed' | 'failed'
  createdAt: Date
}
```

When a webhook returns, the system should classify it before applying it.

```txt
Is this webhook confirming an outbound change we already sent?
Is it a new external change?
Is it stale?
Is it concurrent?
Is it a duplicate?
```

Correlation IDs, provider resource IDs, idempotency keys, and version metadata help the system distinguish an echo of its own update from a new external change. A hall of mirrors are inevitable without that distinction.

## Reliable integrations recover from wrong beliefs

Strong integration systems do not stay consistent by magic; they recover well.

Recovery requires memory, ownership, conflict policies, reconciliation, and operational visibility. The system needs to know which events arrived, which events were missed, which states were derived, and which decisions were made automatically.

A fragile integration says:

```txt
We synced the data.
```

A reliable integration says:

```txt
We know what changed.
We know who changed it.
We know which system had authority.
We know whether the update was newer or concurrent.
We know which rule resolved the conflict.
We know how to detect drift.
We know how to repair it.
We can explain the state we believe.
```

Data movement without these properties creates the appearance of correctness. Data movement with these properties creates trust.

## The real lesson

Every large-scale integration eventually becomes a distributed systems problem. Granted, at first, the work looks like a simple API problem. Then it becomes a reliability problem. Then it becomes a consistency problem. You start with adapters and SDKs, then end up needing ownership models, version vectors, event history, reconciliation jobs, and operational tooling.

External systems do not share your database transaction. They do not share your clock. They do not share your domain model. They do not share your assumptions about ownership. They can be reasonable from their side and still dangerous for your product.

The integration layer has to make those differences explicit enough for the system to survive them. Moving data across a boundary is just the plumbing; the architecture lies with maintaining trust past that boundary.
