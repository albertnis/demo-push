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
      )`
      )
      .bind(endpoint, expiration_time, keys_auth, keys_p256dh)
      .all()

    return result.meta.last_row_id
  },

  /** @returns {Promise<PushSubscription[]>} */
  getAll: async () => {
    const result = await db.prepare('SELECT * FROM [PushSubscription]').all()

    return /** @type {PushSubscription[]} */ (result.results)
  },

  /**
   * @param {string} endpoint
   * @returns {Promise<PushSubscription | null>}
   **/
  getByEndpoint: async (endpoint) => {
    const result = await db
      .prepare('SELECT * FROM [PushSubscription] WHERE endpoint = ?1')
      .bind(endpoint)
      .first()

    return /** @type {PushSubscription} */ (result)
  },
})
