export default function choiviaNotifyPlugin() {
  return {
    name: 'choivia-dev-water-notify',
    apply: 'serve',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== '/__choivia/notify-water') {
          return next()
        }

        res.setHeader('Content-Type', 'application/json')

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'POST method required.' }))
          return
        }

        server.ws.send('choivia:notify-water', {})

        res.statusCode = 202
        res.end(JSON.stringify({
          success: true,
          message: 'Water reminder sent to connected Choivia tabs.',
        }))
      })
    },
  }
}
