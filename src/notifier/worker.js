/**
 * @typedef Assets
 * @prop {typeof fetch} fetch
 *
 * @typedef ScheduledEventContext
 * @prop {(promise: Promise<any>) => void} waitUntil
 *
 * @typedef Env
 * @prop {import("@cloudflare/workers-types").D1Database} DB
 * @prop {Assets} ASSETS
 * @prop {string} PUSH_SERVER_PRIVATE_KEY
 * @prop {string} PUSH_SERVER_PUBLIC_KEY
 */

import { main } from './main'

export default {
  /**
   * @param {import('@cloudflare/workers-types').ScheduledEvent} event
   * @param {Env} env
   * @param {ScheduledEventContext} ctx
   * @returns
   */
  async scheduled(event, env, ctx) {
    console.log('Scheduled run commenced')
    ctx.waitUntil(
      main(env.DB, env.PUSH_SERVER_PRIVATE_KEY, env.PUSH_SERVER_PUBLIC_KEY)
    )
  },
}
