/**
 * @typedef Assets
 * @prop {(input: import("@cloudflare/workers-types").Request<any, import("@cloudflare/workers-types").CfProperties<any>>, init?: RequestInit) => Response} fetch
 * @prop {typeof fetch} fetch
 *
 * @typedef Env
 * @prop {import("@cloudflare/workers-types").D1Database} DB
 * @prop {Assets} ASSETS
 */

import { pushSubscription } from '../repositories/pushSubscription'

export default {
  /**
   * @param {import('@cloudflare/workers-types').Request} request
   * @param {Env} env
   * @returns
   */
  async fetch(request, env) {
    const url = new URL(request.url)

    const repo = pushSubscription(env.DB)

    if (url.pathname === '/api/pushSubscription' && request.method === 'POST') {
      const body = await request.json()
      console.log('Request body:', body)
      const id = await repo.create({
        endpoint: body.endpoint,
        expiration_time: body.expirationTime,
        keys_auth: body.keys.auth,
        keys_p256dh: body.keys.p256dh,
      })
      return Response.json({ id })
    }
    if (url.pathname === '/notifications' && request.method === 'GET') {
      const result = await repo.getAllDue()
      return Response.json(result)
    }
    // Otherwise, serve the static assets.
    // Without this, the Worker will error and no assets will be served.
    return env.ASSETS.fetch(request)
  },
}
