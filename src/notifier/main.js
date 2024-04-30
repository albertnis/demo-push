import { pushSubscription } from '../repositories/pushSubscription'
import {
  generatePushHTTPRequest,
  ApplicationServerKeys,
} from 'webpush-webcrypto'

/**
 * @param {ApplicationServerKeys} applicationServerKeys
 * @returns {(sub: import("../repositories/pushSubscription").PushSubscription) => Promise<void>}
 */
const sendNotification = (applicationServerKeys) => async (subscription) => {
  const { body, endpoint, headers } = await generatePushHTTPRequest({
    adminContact: 'test@example.com',
    applicationServerKeys,
    payload: 'TEST PAYLOAD',
    target: {
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.keys_auth,
        p256dh: subscription.keys_p256dh,
      },
    },
    ttl: 60,
  })

  console.log(
    'Sending notification:',
    JSON.stringify({ body: body.byteLength, endpoint, headers })
  )

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body,
  })

  if (!response.ok) {
    throw new Error(
      `Failed to send notification. The endpoint ${endpoint} responded with ${JSON.stringify(
        {
          statusCode: response.status,
          body: await response.text(),
        }
      )}`
    )
  }
}

/**
 * @param {import("@cloudflare/workers-types").D1Database} db
 * @param {string} privateKey
 * @param {string} publicKey
 */
export const main = async (db, privateKey, publicKey) => {
  console.log('Scheduled run commenced')

  console.log('Public key is', publicKey)
  console.log('Private key is', privateKey)

  console.log('Getting keys')
  const keys = await ApplicationServerKeys.fromJSON({
    privateKey,
    publicKey,
  })

  const repo = pushSubscription(db)

  console.log('Gettings subs')
  const subscriptions = await repo.getAll()

  const sends = subscriptions.map(sendNotification(keys))

  const sendResults = await Promise.allSettled(sends)

  const successfulIds = subscriptions
    .map((s) => s.id)
    .filter((_, i) => sendResults[i].status === 'fulfilled')

  const failedIds = subscriptions
    .map((subscription, i) => ({ subscription, result: sendResults[i] }))
    .filter((x) => x.result.status === 'rejected')
    .map((x) => ({
      id: x.subscription.id,
      reason: x.result.reason.message,
    }))

  console.log('The following IDs failed:', JSON.stringify(failedIds))

  console.log(`The following IDs succeeded: [${successfulIds.join(', ')}]`)
}
