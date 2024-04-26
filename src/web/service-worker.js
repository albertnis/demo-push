self.addEventListener('install', async () => {
  console.log('Service Worker Installed')

  // setInterval(() => console.log('Still installed'), 5000)

  /** @type {Window[]} */
  const clients = await self.clients.matchAll({ type: 'window' })

  console.log(`Got ${clients.length} clients`)

  clients.forEach((c) => c.postMessage('Message from SW'))
})

self.addEventListener('push', async (e) => {
  console.log(JSON.stringify(e))

  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  })

  console.log(`Got ${clients.length} clients`)

  clients.forEach((c) =>
    c.postMessage('Received notification event', JSON.stringify(e))
  )
})
