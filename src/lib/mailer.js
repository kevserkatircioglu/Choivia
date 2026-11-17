// Sends the 6-digit verification code to the address used at sign-up.
// A browser cannot send email by itself, so this uses EmailJS (free tier, no server needed).
// Fill the three VITE_EMAILJS_* values in a .env file (see .env.example). Without them the app
// runs in DEMO mode and shows the code on screen instead of sending a real email.
const env = import.meta.env
export const mailConfigured = Boolean(env.VITE_EMAILJS_SERVICE_ID && env.VITE_EMAILJS_TEMPLATE_ID && env.VITE_EMAILJS_PUBLIC_KEY)

export async function sendVerificationCode({ to, name, code }) {
  if (!mailConfigured) return { delivered: false }
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: env.VITE_EMAILJS_SERVICE_ID,
      template_id: env.VITE_EMAILJS_TEMPLATE_ID,
      user_id: env.VITE_EMAILJS_PUBLIC_KEY,
      template_params: { to_email: to, to_name: name, code, app_name: 'Choivia' },
    }),
  })
  if (!res.ok) throw new Error('We could not send the email. Check the address and try again.')
  return { delivered: true }
}
