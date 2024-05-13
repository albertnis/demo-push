/**
 * @typedef Notification
 * @prop {number} notification_id
 * @prop {number} push_subscription_id
 * @prop {string} notification_time
 * @prop {number} notification_time_unixepoch
 * @prop {string} created_at
 * @prop {number} created_at_unixepoch
 *
 * @typedef {Notification & import('./pushSubscription').PushSubscription} NotificationWithPushSubscription
 */

/**
 * @param {import("@cloudflare/workers-types").D1Database} db
 */
export const notification = (db) => ({
  /**
   * @param {Pick<import('./pushSubscription').PushSubscription, 'endpoint'>} input
   * @returns {Promise<number>}
   */
  create: async ({ endpoint }) => {
    const result = await db
      .prepare(
        `INSERT INTO [Notification] (
          notification_time,
          push_subscription_id
        ) 
        SELECT datetime('now', '+10 seconds'), push_subscription_id
        FROM [PushSubscription]
        WHERE endpoint = ?1
        `
      )
      .bind(endpoint)
      .all()

    return result.meta.last_row_id
  },

  /** @returns {Promise<NotificationWithPushSubscription[]>} */
  getAllDue: async () => {
    const result = await db
      .prepare(
        `SELECT
           *,
           unixepoch(n.notification_time, 'subsec') * 1000 as notification_time_unixepoch,
           unixepoch(n.created_at, 'subsec') * 1000 as created_at_unixepoch
         FROM
           [PushSubscription] ps
           INNER JOIN [Notification] n ON ps.push_subscription_id = n.push_subscription_id
         WHERE
           unixepoch('now', 'subsec') - unixepoch(n.notification_time, 'subsec') > 0`
      )
      .all()

    return /** @type {NotificationWithPushSubscription[]} */ (result.results)
  },

  /**
   * @param {string} endpoint
   * @returns {Promise<number | null>}
   **/
  getByEndpoint: async (endpoint) => {
    const result = await db
      .prepare(
        `SELECT notification_id
         FROM
           [PushSubscription] ps
           INNER JOIN [Notification] n ON ps.push_subscription_id = n.push_subscription_id
         WHERE
           endpoint = ?1`
      )
      .bind(endpoint)
      .first()

    return /** @type {number} */ (result.notification_id)
  },

  /** @param {number[]} ids */
  deleteMany: async (ids) => {
    if (ids.length === 0) return

    const statement = db.prepare(
      'DELETE FROM [Notification] WHERE notification_id = ?1'
    )

    await db.batch(ids.map((id) => statement.bind(id)))
  },
})
