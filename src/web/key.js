const SERVER_PUBLIC_KEY =
  'BCUdAv5I5pJwseflX848zH2IQHwaSsvMRcE-7Exhq-ES1HssHg_UnHeinOlN9rg3dLrdSPd0IFfMvK08Ixj8e0w'

/** @param {string} base64String */
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

export const applicationServerKey = urlB64ToUint8Array(SERVER_PUBLIC_KEY)
