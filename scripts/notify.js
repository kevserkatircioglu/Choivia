import process from 'node:process'

const endpoint = process.env.CHOIVIA_NOTIFY_URL
  || 'http://127.0.0.1:5173/__choivia/notify-water'

try {
  const response = await fetch(endpoint, { method: 'POST' })
  const result = await response.json()

  if (!response.ok) {
    console.error(`Water reminder failed: ${result.error || response.statusText}`)
    process.exit(1)
  }

  console.log('Water reminder sent successfully.')
  console.log('Title: Time for a glass of water')
  console.log('Message: A few sips now keep your energy up.')
} catch {
  console.error(
    'Could not reach Choivia. Start the development server with npm run dev first.',
  )
  process.exit(1)
}
