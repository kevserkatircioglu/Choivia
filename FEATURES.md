# Choivia – feature summary

A personal agenda app for mobile (installable as a PWA, English UI).

**Account** – Sign up with first name, last name, Gmail and a password (min. 4 characters). A 6-digit code is emailed to that Gmail; after verifying, the user picks a username and an avatar. Both can be changed later in Preferences.
**Home** – Greeting scene, today's steps, hobby check-ins, today's plan and a "Coming up" strip of calendar reminders and national days.
**Daily plan** – Weekly day strip, hourly timeline (07:00–22:00), progress ring and a plant that grows as tasks are completed.
**Calendar** – Year and month views, reminders with optional time, Turkish national holidays (flag), 10 November Atatürk Memorial Day (infinity symbol), religious holidays and special weeks.
**Notifications** – Bell icon opens a small panel with time stamps: daily-plan tasks, calendar reminders, hobby reminders, special days and water reminders (10:00, 12:30, 15:00, 17:30, 20:00). Also sent as phone notifications once permission is granted.
**Diary** – Handwritten-style notebook, one page per day with an automatic date, protected by its own 4-digit PIN (iPhone-style keypad). Past pages are read-only.
**Steps** – Counts steps with the phone's motion sensor while the app is open; manual entry and a daily goal are also available.
**Statistics** – Weekly steps chart and weekly plan completion.
**Hobbies / Reading book / Preferences** – From the team's previous work.

## Honest limits (good to mention in the presentation)
- Accounts and data live in the browser's localStorage (demo-level security, no server).
- Real emails need an email service. Fill `.env` (see `.env.example`, EmailJS free plan). Without it the app shows the code on screen (demo mode).
- Phone notifications and step counting work while the app is open or installed to the home screen. Counting in the background and timed push notifications when the app is closed need a native app / push server (e.g. Capacitor + Health Connect, Firebase).
- On iPhone, the motion sensor needs a tap on "Start counting" to grant permission. HTTPS is required on phones.
