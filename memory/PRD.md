# MEN'S HOUSE BARBER - PRD

## Original Problem Statement
Aplicație pentru salon de frizerie cu programări și prețuri.

## User Preferences
- Nume: MEN'S HOUSE BARBER
- Culori: Alb și Negru (design elegant, masculin)

## Architecture
- **Backend**: FastAPI + MongoDB
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Auth**: JWT-based admin authentication

## What's Been Implemented (Jan 2026)

### Public Features
- ✅ Landing page cu hero section și preview servicii
- ✅ Pagina servicii cu prețuri și durată
- ✅ Sistem de rezervări în 5 pași:
  1. Selectare serviciu
  2. Selectare dată (calendar)
  3. Selectare oră (sloturi disponibile)
  4. Completare date contact
  5. Confirmare programare

### Admin Panel
- ✅ Autentificare admin (setup inițial + login)
- ✅ Dashboard cu statistici (programări azi, luna aceasta, venituri)
- ✅ Management servicii (CRUD)
- ✅ Management programări (vizualizare, marcare finalizat/anulat)
- ✅ Setări (program de lucru, informații contact)

### Default Services (create la setup)
1. Tuns Clasic - 50 Lei - 30 min
2. Tuns + Barbă - 80 Lei - 45 min
3. Aranjat Barbă - 40 Lei - 20 min
4. Bărbierit Clasic - 60 Lei - 30 min
5. Tuns Copii - 35 Lei - 25 min

## Backlog (P1 - Next Features)
- [ ] Notificări email/SMS pentru confirmări
- [ ] Sistem de review-uri clienți
- [ ] Multiple frizeri cu programări separate
- [ ] Rapoarte și analytics extinse

## Backlog (P2 - Enhancements)
- [ ] Integrare Google Calendar
- [ ] App mobil nativ
- [ ] Program de fidelitate
- [ ] Plăți online (Stripe)
