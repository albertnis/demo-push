const SERVER_PUBLIC_KEY =
  'BCUdAv5I5pJwseflX848zH2IQHwaSsvMRcE-7Exhq-ES1HssHg_UnHeinOlN9rg3dLrdSPd0IFfMvK08Ixj8e0w'

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
