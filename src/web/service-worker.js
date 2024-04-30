self.addEventListener('install', async () => {
  console.log('Service Worker Installed')

  // setInterval(() => console.log('Still installed'), 5000)

  /** @type {Window[]} */
  const clients = await self.clients.matchAll({ type: 'window' })

  console.log(`Got ${clients.length} clients`)

  clients.forEach((c) => c.postMessage('Message from SW'))
})

self.addEventListener('push', async (e) => {
  console.log('Received event:', JSON.stringify(e))

  self.registration.showNotification('Something happened', {
    body: 'it happened',
    tag: 'about-push',
  })
})
