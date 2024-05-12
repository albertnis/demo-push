self.addEventListener('install', async () => {
  console.log('Service Worker Installed')
})

self.addEventListener('push', async (e) => {
  console.log('Received event:', JSON.stringify(e))

  self.registration.showNotification('Push demo notification', {
    body: `Here's the notification you scheduled: ${e.data?.text()}`,
    tag: 'about-push',
  })

  const clients = await self.clients.matchAll({ type: 'window' })

  clients.forEach((c) =>
    c.postMessage({ source: 'push-sw', message: 'Notification received!' })
  )
})
