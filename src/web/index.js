const SERVER_PUBLIC_KEY =
  'BM_dw5-Sq5infxzHMbYRxipG7Gsd3x9JA9HmrzvBZpuPMCA03QH3kZqd2x7W4yDE78qs8h-WzDyzOG_uoG7cxwo'

const tryParseJson = (input) => {
  try {
    return JSON.parse(input)
  } catch {
    return undefined
  }
}

const subscribeButtonClicked = () => {
  console.log('clicked')

  registerPermission()
    .then((id) => console.log('Created subscription with ID', id))
    .catch((e) => {
      console.error('Failed to store subscription', e)
    })
}

const registerPermission = async () => {
  const permission = await Notification.requestPermission()

  if (permission !== 'granted') {
    throw new Error('Permission not granted')
  }

  const registration = await navigator.serviceWorker.ready

  const pushSubscription = await registration.pushManager.subscribe({
    applicationServerKey: SERVER_PUBLIC_KEY,
    userVisibleOnly: false,
  })

  const response = await fetch('/api/pushSubscription', {
    method: 'POST',
    body: JSON.stringify(pushSubscription.toJSON()),
  })

  /** @type {string | undefined | false} */
  const recordId = response.ok && tryParseJson(await response.text())?.id

  if (!recordId) {
    throw new Error('Server failed to save pushSubscription')
  }

  return recordId
}

const main = async () => {
  const registration = await navigator.serviceWorker.register(
    '/service-worker.js'
  )

  console.log('Service Worker Registered')
}

if ('serviceWorker' in navigator) {
  main().catch((e) => {
    console.error('Failed to register service worker', e)
  })
}
