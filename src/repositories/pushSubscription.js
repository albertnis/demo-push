/**
 * @typedef PushSubscription
 * @prop {number} push_subscription_id
 * @prop {string} endpoint
 * @prop {string | null} expiration_time
 * @prop {string} keys_auth
 * @prop {string} keys_p256dh
 */

/**
 * @param {import("@cloudflare/workers-types").D1Database} db
 */
export const pushSubscription = (db) => ({
  create: async ({ endpoint, expiration_time, keys_auth, keys_p256dh }) => {
    const result = await db
      .prepare(
        `INSERT INTO [PushSubscription] (
          endpoint,
          expiration_time,
          keys_auth,
          keys_p256dh
        ) VALUES (
          ?1, ?2, ?3, ?4
        ) ON CONFLICT(endpoint) DO UPDATE
        SET
          expiration_time=excluded.expiration_time,
          keys_auth=excluded.keys_auth,
          keys_p256dh=excluded.keys_p256dh
      `
      )
      .bind(endpoint, expiration_time, keys_auth, keys_p256dh)
      .all()

    return result.meta.last_row_id
  },

  /** @param {string} endpoint */
  deleteByEndpoint: async (endpoint) => {
    const result = await db
      .prepare(
        `DELETE FROM [PushSubscription]
        WHERE endpoint = ?1
      `
      )
      .bind(endpoint)
      .all()

    return result.meta.rows_written
  },

  /**
   * Delete all push subscriptions created over an hour ago
   * @returns number of subscriptions deleted
   */
  deleteAllStale: async () => {
    const result = await db
      .prepare(
        `DELETE FROM [PushSubscription]
       WHERE unixepoch('now') - unixepoch(created_at) > 3600`
      )
      .all()

    return result.meta.rows_written
  },
})
