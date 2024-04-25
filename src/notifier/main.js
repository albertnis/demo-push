import { pushSubscription } from "../repositories/pushSubscription"

/** @param {import("@cloudflare/workers-types").D1Database} db  */
export const main = async (db) => {
  console.log('Scheduled run commenced')

  const repo = pushSubscription(db)

  const subscriptions = await repo.getAllDue()

  for (const subscription of subscriptions) {
    console.log(`Processing subscription: ${subscription.id}`)
  }

  const ids = subscriptions.map(s => s.id)
  console.log(`Deleting subscriptions: [${ids.join(', ')}]`)
  await repo.deleteMany(ids)
}
