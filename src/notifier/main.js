import { notification } from '../repositories/notification'
import {
  generatePushHTTPRequest,
  ApplicationServerKeys,
} from 'webpush-webcrypto'

/**
 * @param {ApplicationServerKeys} applicationServerKeys
 * @returns {(sub: import("../repositories/notification").NotificationWithPushSubscription) => Promise<void>}
 */
const sendNotification = (applicationServerKeys) => async (subscription) => {
  const { created_at_unixepoch, notification_time_unixepoch } = subscription

  const { body, endpoint, headers } = await generatePushHTTPRequest({
    adminContact: 'test@example.com',
    applicationServerKeys,
    payload: JSON.stringify({
      created_at_unixepoch,
      notification_time_unixepoch,
    }),
    target: {
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.keys_auth,
        p256dh: subscription.keys_p256dh,
      },
    },
    ttl: 60,
  })

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
  const keys = await ApplicationServerKeys.fromJSON({
    privateKey,
    publicKey,
  })

  const repo = notification(db)
  const notifications = await repo.getAllDue()

  console.log(`Processing ${notifications.length} due notifications`)

  const sends = notifications.map(sendNotification(keys))

  const sendResults = await Promise.allSettled(sends)

  const successfulIds = notifications
    .map((s) => s.notification_id)
    .filter((_, i) => sendResults[i].status === 'fulfilled')

  const failedIds = notifications
    .map((subscription, i) => ({ subscription, result: sendResults[i] }))
    .filter((x) => x.result.status === 'rejected')
    .map((x) => ({
      notification_id: x.subscription.notification_id,
      reason: 'reason' in x.result && x.result.reason.message,
    }))

  console.log(
    'The following IDs failed and will be retried next time:',
    JSON.stringify(failedIds)
  )

  await repo.deleteMany(successfulIds)

  console.log(
    `The following IDs succeeded and were deleted: [${successfulIds.join(
      ', '
    )}]`
  )
}
