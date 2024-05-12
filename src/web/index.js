import { applicationServerKey } from './key'

/** @param {string} msg */
const log = (msg) => {
  console.log(msg)
  document.getElementById('log').innerHTML += `${msg}\n`
}

addEventListener('load', () => {
  document.getElementById('schedule-button').addEventListener('click', () => {
    scheduleNotification()
  })
})

addEventListener('message', (e) => {
  if (e.data.source !== 'push-sw') return
  log(`Message received from service worker: ${JSON.stringify(e.data)}`)
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
  log(
    `Subscription details generated! (${
      new URL(pushSubscription.endpoint).origin
    })`
  )

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
