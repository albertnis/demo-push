const channel = new BroadcastChannel('about-push')

self.addEventListener('install', async () => {
  self.skipWaiting()
  channel.postMessage({ message: 'New service worker installed' })
})

self.addEventListener('push', async (e) => {
  console.log('Received event:', JSON.stringify(e))

  const data = e.data?.json() //

  const { created_at_unixepoch, notification_time_unixepoch } = data

  const dateFormat = Intl.DateTimeFormat(navigator.language, {
    timeStyle: 'short',
    dateStyle: undefined,
  }).format(new Date(created_at_unixepoch))

  channel.postMessage({
    message: `Notification received: ${JSON.stringify(data)}`,
  })

  self.registration.showNotification('Push demo notification', {
    body: `Here's the notification you created at ${dateFormat}`,
    tag: 'about-push',
    timestamp: notification_time_unixepoch,
  })
})
