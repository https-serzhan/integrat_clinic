# Project Defense Notes

## Project Summary

Integrat is a dental platform that combines clinic presentation, doctor discovery, appointment capture, academy access, and admin approval in one system.

## Business Flows Implemented

### Clinic flow
- public user opens the website
- user submits a contact request
- manager receives a Telegram notification
- authenticated user books a doctor appointment
- appointment is stored and visible to admin

### Academy flow
- user signs up or logs in
- user sees course catalog
- user chooses a course
- user gets Kaspi payment details
- user sends a payment request
- manager receives Telegram notification
- admin approves or rejects the request
- approved users can open the course videos page

### Admin flow
- admin account is controlled by Supabase role
- admin can review appointments
- admin can review payment requests
- admin can manage access grants and purchases

## Technical Architecture

- frontend: multi-page HTML, CSS, and vanilla JavaScript
- backend: Express server in `src/backend/academy/server.js`
- primary production database: Supabase Postgres
- fallback storage: local JSON files in `src/backend/academy/data`
- notifications: Telegram Bot API

## Why The Architecture Is Defensible

- one backend serves both pages and APIs, so deployment is simple
- frontend API calls are centralized in shared clients
- Supabase schema is explicit and documented
- admin approval is separated from user purchase intent
- contact, appointment, and payment events are observable through Telegram and terminal logs
- local fallback storage keeps the demo usable if remote services are unavailable

## Current Data Model

- `profiles` for academy users and roles
- `contacts` for public contact requests
- `appointments` for doctor bookings
- `courses` for academy catalog
- `payment_settings` for Kaspi payment details
- `payment_requests` for course payment approvals
- `course_access` for approved learning access

## Security And Access Model

- clinic appointment flow uses bearer token auth
- academy flow uses cookie session auth
- admin routes require academy admin role
- Supabase service role is used only on the backend
- users cannot self-approve course access

## User Experience Features

- English and Russian language toggle
- phone formatting and validation
- gated appointment flow
- gated academy flow
- admin review pages
- terminal request logs
- Telegram manager notifications

## What Makes The Demo Complete

- all primary business actions work end to end
- data can persist in Supabase
- backend startup and requests are observable
- the project can run locally or on a VPS with one Node service

## Remaining Work That Depends On Client Assets

- replace placeholder doctor media
- replace placeholder company videos
- replace placeholder course media
- replace placeholder treatment and review visuals

## Deployment Position

This project is ready to deploy as a single Node.js application behind a reverse proxy.
The deployment steps are documented in `docs/deploy-and-use.md`.
