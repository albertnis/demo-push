/**
 * @typedef Assets
 * @prop {(input: import("@cloudflare/workers-types").Request<any, import("@cloudflare/workers-types").CfProperties<any>>, init?: RequestInit) => Response} fetch
 * @prop {typeof fetch} fetch
 *
 * @typedef Env
 * @prop {import("@cloudflare/workers-types").D1Database} DB
 * @prop {Assets} ASSETS
 */

import { notification } from '../repositories/notification'
import { pushSubscription } from '../repositories/pushSubscription'

export default {
  /**
   * @param {import('@cloudflare/workers-types').Request} request
   * @param {Env} env
   * @returns
   */
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api')) {
      // POST /api/pushSubscription
      if (
        url.pathname === '/api/pushSubscription' &&
        request.method === 'POST'
      ) {
        const pushSubscriptionRepo = pushSubscription(env.DB)

        const body = await request.json()
        const id = await pushSubscriptionRepo.create({
          endpoint: body.endpoint,
          expiration_time: body.expirationTime,
          keys_auth: body.keys.auth,
          keys_p256dh: body.keys.p256dh,
        })

        return Response.json({ id }, { status: 201 })
      }

      // POST /api/notification
      if (url.pathname === '/api/notification' && request.method === 'POST') {
        const notificationRepo = notification(env.DB)

        const body = await request.json()
        const id = await notificationRepo.create({
          endpoint: body.endpoint,
        })

        return Response.json({ id }, { status: 201 })
      }

      return Response.json('API path not found', { status: 404 })
    }

    // Otherwise, serve the static assets.
    // Without this, the Worker will error and no assets will be served.
    return env.ASSETS.fetch(request)
  },
}
