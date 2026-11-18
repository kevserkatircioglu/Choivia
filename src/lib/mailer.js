const env = import.meta.env

export const mailConfigured = Boolean(
  env.VITE_EMAILJS_SERVICE_ID &&
  env.VITE_EMAILJS_TEMPLATE_ID &&
  env.VITE_EMAILJS_PUBLIC_KEY,
)

export async function sendVerificationCode({ to, name, code }) {
  if (!mailConfigured) {
    return { delivered: false }
  }

  const response = await fetch(
    'https://api.emailjs.com/api/v1.0/email/send',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: env.VITE_EMAILJS_SERVICE_ID,
        template_id: env.VITE_EMAILJS_TEMPLATE_ID,
        user_id: env.VITE_EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: to,
          to_name: name,
          code,
          app_name: 'Choivia',
        },
      }),
    },
  )

  if (!response.ok) {
    throw new Error(
      'We could not send the verification email. Please try again.',
    )
  }

  return { delivered: true }
}
