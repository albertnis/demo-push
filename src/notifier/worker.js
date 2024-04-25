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
 */

import { main } from "./main"

export default {
  /**
   * @param {import('@cloudflare/workers-types').ScheduledEvent} event 
   * @param {Env} env 
   * @param {ScheduledEventContext} ctx 
   * @returns 
   */
  async scheduled(event, env, ctx) {
    ctx.waitUntil(main(env.DB))
  }
}