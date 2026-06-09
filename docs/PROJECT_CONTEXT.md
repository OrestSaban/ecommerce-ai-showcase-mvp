# Ecommerce AI Showcase MVP

## Project Overview

Ecommerce AI Showcase MVP is a demonstration platform built for showcasing ecommerce analytics, AI-powered insights, and operational intelligence to potential clients.

This project is NOT intended to be a production-grade ecommerce analytics platform.

Primary goal:
- Impress prospective clients during demos and sales calls.

Secondary goals:
- Portfolio showcase.
- Internal SpreadLogics showcase project.
- Demonstrate AI + analytics capabilities.

Success criteria:
- Looks professional.
- Feels realistic.
- Core workflows work.
- Can answer real business questions.
- Can be demonstrated live to clients.

---

# MVP Philosophy

Important:

This is a SHOWCASE MVP.

We prioritize:

1. Speed of delivery
2. Demo quality
3. Realistic UX
4. Functional core features

We do NOT prioritize:

- Perfect architecture
- Enterprise-level scalability
- Production-grade infrastructure
- Extreme optimization

When choosing between:

- Complex production solution
- Simple demo solution

Always prefer the simple demo solution unless demo quality suffers.

---

# Tech Stack

Frontend:
- React
- Vite
- React Router

Backend:
- FastAPI
- Python

Analytics:
- Pandas

Database:
- BigQuery

AI:
- OpenAI API

Deployment:
- TBD

---

# Project Architecture

Frontend
↓
FastAPI Backend
↓
BigQuery
↓
Pandas Analytics Layer
↓
OpenAI Tools Layer (Ask)

---

# Current Data Model

Main functional datasets:

- sales_orders
- products
- ad_performance
- conversations

Mocked datasets:

- warnings
- business_health
- deep_review_scenarios

Hybrid datasets:

- settings

---

# Functional vs Mocked Components

## Functional

These components should use real data and real logic:

### Dashboard

Functional:

- KPI Cards
- Revenue calculations
- Gross profit calculations
- Ad spend calculations
- Sales charts
- Category charts
- Date filters
- Refresh actions

### Ask

Functional:

- OpenAI integration
- Real conversation history
- Real analytics queries
- Real data retrieval

This is the primary selling point of the MVP.

### Conversations

Functional:

- Create conversation
- Save conversation
- Load conversation
- Conversation history

---

## Mocked

These components do NOT require real business logic.

### Warnings

Mocked:

- Detection engine
- Alert generation
- AI reasoning

Functional:

- Filtering
- Sorting
- Navigation
- Opening details

### Business Health

Mocked:

- Status calculations

Functional:

- Display
- Tooltips

### Deep Review

Mocked:

- Multi-model orchestration
- Consensus generation
- AI comparison

Functional:

- Open modal
- Display scenario
- Navigate scenarios

### Control

Mocked:

- Real system configuration

Functional:

- UI interactions
- Toggles
- Dropdowns
- Persistence

Changes do not need to affect backend behavior.

---

# Dashboard Specification

Dashboard is the first screen users see.

Priority: HIGH

Required functionality:

- KPI Cards
- Last 7 / 30 / 90 days filters
- Refresh button
- Revenue trend chart
- Category breakdown chart

Business Health may remain mocked.

Top Priority Warning may remain mocked.

---

# Warnings Specification

Purpose:

Show operational issues.

Source:

Pre-seeded warning data.

Features:

- Filter warnings
- Sort warnings
- Open warning
- Open Deep Review
- Action Plan Preview

Warning generation is NOT part of MVP.

---

# Deep Review Specification

Purpose:

Show advanced AI analysis.

Important:

Deep Review is a showcase feature.

It is NOT a real multi-model system.

Use pre-generated scenarios.

Each scenario contains:

- Consensus status
- Confidence score
- Recovery estimate
- Recommended action
- Model reasoning

All data may be seeded.

---

# Ask Specification

Priority: VERY HIGH

Purpose:

Allow users to interact with business data using natural language.

Examples:

- What was revenue last week?
- Which campaign has the best ROAS?
- Which products have low stock?
- What is our refund rate?
- Show gross profit by category.

Architecture:

User
↓
OpenAI
↓
Tool Selection
↓
Pandas Analytics
↓
BigQuery
↓
Results
↓
OpenAI Response

Ask should be as realistic as possible.

This is the most important feature in the project.

---

# Control Specification

Purpose:

Show settings and configuration.

Features:

- Toggles
- Dropdowns
- Preferences

May be mostly frontend-only.

No need for real system behavior.

---

# Seed Data Story

The dataset tells a consistent ecommerce story.

Main issues:

1. Inventory Crisis
- Running Shoes low stock

2. Advertising Problem
- Brand Awareness campaign poor ROAS

3. Refund Spike
- Phone Case refund increase

4. Payment Issues
- Elevated decline rate

5. Listing Issues
- Travel Backpack suppression

These storylines should remain consistent across:

- Dashboard
- Warnings
- Deep Review
- Ask responses

---

# Development Priorities

Priority 1:
Dashboard

Priority 2:
Ask

Priority 3:
Warnings

Priority 4:
Deep Review

Priority 5:
Control

---

# Current Roadmap

Completed:

- Project Setup
- Data Model
- Seed Data Generation
- Seed Data Validation

In Progress:

- BigQuery Integration

Upcoming:

- Dashboard APIs
- Dashboard Frontend
- Warnings Module
- Ask Module
- Deep Review
- Control Module
- Deployment
- Demo Polish

---

# AI Agent Instructions

Before implementing any feature:

1. Read this file.
2. Treat this file as the source of truth.
3. Prefer simple implementations.
4. Avoid overengineering.
5. Avoid enterprise-level architecture.
6. Optimize for demo quality.
7. Optimize for speed.
8. Keep code understandable.
9. Do not add infrastructure that is unnecessary for the MVP.
10. When uncertain, choose the simpler solution.

Remember:

This project is a showcase MVP, not a production SaaS platform.