import { applicationServerKey } from './key'

/** @param {string} msg */
const log = (msg) => {
  console.log(msg)
  document.getElementById('log').innerHTML += `${msg}\n`
}

const channel = new BroadcastChannel('about-push')
channel.addEventListener('message', (e) => {
  log(`Message from service worker: ${e.data.message}`)
})

addEventListener('load', () => {
  document.getElementById('schedule-button').addEventListener('click', () => {
    scheduleNotification()
  })

  document.getElementById('delete-button').addEventListener('click', () => {
    deleteSubscription()
  })
})

export const scheduleNotification = async () => {
  log('Checking browser compatibility')
  if (!('Notification' in window)) {
    log('Browser does not support Notification')
    return
  }

  if (!('serviceWorker' in navigator)) {
    log('Browser does not support service workers')
    return
  }
  log('Browser is compatible')

  log('Registering service worker')
  const registration = await navigator.serviceWorker.register(
    '/service-worker.js'
  )
  log('Service worker registered')

  log('Requesting notification permissions')
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    log('Notification permission was declined')
    return
  }
  log('Notification permission was granted')

  log('Generating subscription details')
  await registration.pushManager.subscribe({
    applicationServerKey,
    userVisibleOnly: true,
  })

  const pushSubscription = (
    await registration.pushManager.getSubscription()
  ).toJSON()
  log(`Subscription details generated! (${pushSubscription.endpoint})`)

  log('Sending subscription details to server')
  await fetch('/api/pushSubscription', {
    method: 'POST',
    body: JSON.stringify(pushSubscription),
  })
  log('Subscription details sent to server')

  log('Requesting a notification')
  await fetch('/api/notification', {
    method: 'POST',
    body: JSON.stringify({ endpoint: pushSubscription.endpoint }),
  })
  log(
    'Notification requested! It will be sent on the next poll, in 10 seconds-5 minutes.'
  )
}

export const deleteSubscription = async () => {
  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    log(
      "Nothing to delete: No service worker is registered - the server couldn't send a notification even if it wanted to"
    )
    return
  }

  const pushSubscription = await registration.pushManager.getSubscription()
  if (!pushSubscription) {
    log(
      "Nothing to delete: The service worker has not subscribed to an endpoint - the server couldn't send a notification even if it wanted to"
    )
    return
  }

  const endpoint = pushSubscription.toJSON().endpoint
  if (!endpoint) {
    log(
      "Nothing to delete: The service worker's subscription has no endpoint - the server couldn't send a notification even if it wanted to"
    )
    return
  }

  log(`Deleting endpoint on server: ${endpoint}`)
  const res = await fetch('/api/pushSubscription', {
    method: 'DELETE',
    body: JSON.stringify({ endpoint: pushSubscription.endpoint }),
  })
  log(
    `Subscription and notifications deleted on server! (rows deleted: ${
      (await res.json()).count
    })`
  )
}
