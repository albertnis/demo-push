const SERVER_PUBLIC_KEY =
  'BCUdAv5I5pJwseflX848zH2IQHwaSsvMRcE-7Exhq-ES1HssHg_UnHeinOlN9rg3dLrdSPd0IFfMvK08Ixj8e0w'

/**
 *
 * @param {string} base64String
 * @returns
 */
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

const applicationServerKey = urlB64ToUint8Array(SERVER_PUBLIC_KEY)

const tryParseJson = (input) => {
  try {
    return JSON.parse(input)
  } catch {
    return undefined
  }
}

/**
 *
 * @param {number} n
 */
const markActiveStep = (n) => {
  const steps = document.querySelectorAll('#steps > li')

  steps.forEach((el, i) => {
    if (i < n) {
      el.classList.add('step-completed')
      el.classList.remove('step-future')
      el.querySelector('button').setAttribute('disabled', 'disabled')
    } else if (i === n) {
      el.classList.remove('step-future', 'step-completed')
      el.querySelector('button').removeAttribute('disabled')
    } else {
      el.classList.remove('step-completed')
      el.classList.add('step-future')
      el.querySelector('button').setAttribute('disabled', 'disabled')
    }
  })
}

addEventListener('load', async () => {
  await navigator.serviceWorker.register('/service-worker.js')
  await checkAllSteps()
})

const checkAllSteps = async () => {
  markActiveStep(0)
  const notificationsGranted = checkNotificationPermissions()
  if (!notificationsGranted) {
    return
  }

  markActiveStep(1)
  const subscribed = await checkSubscription()
  if (!subscribed) {
    return
  }

  markActiveStep(2)
  const sent = await checkSendSubscription()
  if (!sent) {
    return
  }

  markActiveStep(3)
}

const checkNotificationPermissions = () => {
  const permission = Notification.permission

  let message
  let granted
  if (permission === 'granted') {
    message = 'Notification permission is <b>granted</b>'
    granted = true
  } else if (permission === 'denied') {
    message = 'Notification permission is denied'
    granted = false
  } else {
    message = 'Notification permission is not granted'
    granted = false
  }

  document.getElementById('status-notification').innerHTML = message

  return granted
}

const requestNotificationPermissions = async () => {
  await Notification.requestPermission()
  checkAllSteps()
}

const checkSubscription = async () => {
  const registration = await navigator.serviceWorker.ready

  const pushSubscription = await registration.pushManager.getSubscription()

  const subscribed = pushSubscription !== null

  let message
  if (subscribed) {
    const domain = new URL(pushSubscription.endpoint).origin
    message = `The service worker is subscribed to an endpoint on <b>${domain}</b>`
  } else {
    message = 'The service worker is not subscribed'
  }

  document.getElementById('status-subscription').innerHTML = message
  return subscribed
}

const requestSubscription = async () => {
  const registration = await navigator.serviceWorker.ready

  await registration.pushManager.subscribe({
    applicationServerKey,
    userVisibleOnly: true,
  })

  checkAllSteps()
}

let cachedPushSubscriptionId = null

const checkSendSubscription = async () => {
  if (cachedPushSubscriptionId === null) {
    const registration = await navigator.serviceWorker.ready
    const pushSubscription = await registration.pushManager.getSubscription()

    const response = await fetch(
      `/api/pushSubscription?endpoint=${encodeURIComponent(
        pushSubscription.endpoint
      )}`
    )
    if (response.ok) {
      cachedPushSubscriptionId = (await response.json()).id
    }
  }

  let message
  if (cachedPushSubscriptionId !== null) {
    message = `The server has subscription information for this browser, stored with ID <b>${cachedPushSubscriptionId}</b>`
  } else {
    message =
      'The server does not have subscription information for this browser'
  }

  document.getElementById('status-send').innerHTML = message
  return cachedPushSubscriptionId !== null
}

const requestSendSubscription = async () => {
  const registration = await navigator.serviceWorker.ready
  const pushSubscription = await registration.pushManager.getSubscription()

  const response = await fetch('/api/pushSubscription', {
    method: 'POST',
    body: JSON.stringify(pushSubscription.toJSON()),
  })

  if (response.ok) {
    cachedPushSubscriptionId = (await response.json()).id
  }

  checkAllSteps()
}

const requestNotify = async () => {
  const registration = await navigator.serviceWorker.ready
  const pushSubscription = await registration.pushManager.getSubscription()

  const { endpoint } = pushSubscription.toJSON()

  const response = await fetch('/api/notification', {
    method: 'POST',
    body: JSON.stringify({ endpoint }),
  })

  if (response.ok) {
    document.getElementById('status-schedule').innerHTML = 'Sent successfully!'
    markActiveStep(4)
  }
}
