/**
 * @typedef PushSubscription
 * @prop {string} id
 * @prop {string} notification_time
 */

/**
 * @param {import("@cloudflare/workers-types").D1Database} db 
 */
export const pushSubscription = (db) => ({
  create: async () => {
    const result = await db.prepare(
      "INSERT INTO [PushSubscription] (notification_time) VALUES (datetime('now', '+10 seconds'))"
    ).first()
  
    return result
  },

  /** @returns {Promise<PushSubscription[]>} */
  getAllDue: async () => {
    const result = await db.prepare(
      "SELECT * FROM [PushSubscription] WHERE unixepoch('now', 'subsec') - unixepoch(notification_time, 'subsec') > 0"
    ).all()
  
    return /** @type {PushSubscription[]} */ (result.results)
  },

  getAll: async () => {
    const result = await db.prepare(
      "SELECT * FROM [PushSubscription]"
    ).all()
  
    return result.results
  },
  
  /** @param {string[]} ids */
  deleteMany: async (ids) => {
    if (ids.length === 0) return

    const statement = db.prepare('DELETE FROM [PushSubscription] WHERE id = ?1')

    await db.batch(ids.map(id => statement.bind(id)))
  }
})
