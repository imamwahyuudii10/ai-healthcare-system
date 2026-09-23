# CareFlow AI — Healthcare Appointment & Patient Support

Portfolio frontend for an n8n-powered healthcare appointment automation system.

## Stack
- React + TypeScript + Vite
- Tailwind CSS
- Lucide React
- n8n webhooks
- Supabase backend (through n8n)

## Pages
- Home
- Find Doctor / Availability
- Book Appointment
- My Appointments
- Admin Dashboard

## Run
```bash
npm install
cp .env.example .env
npm run dev
```

## Connect n8n
Edit `.env` and set the production webhook URLs for:
- WF05 Availability & Doctor Search
- Booking workflow
- WF06 Appointment Lookup

The frontend intentionally calls n8n rather than Supabase directly for transactional operations, keeping business rules in the automation layer.
