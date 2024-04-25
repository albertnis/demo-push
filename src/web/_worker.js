/**
 * @typedef Assets
 * @prop {(input: import("@cloudflare/workers-types").Request<any, import("@cloudflare/workers-types").CfProperties<any>>, init?: RequestInit) => Response} fetch
 * @prop {typeof fetch} fetch
 * 
 * @typedef Env
 * @prop {import("@cloudflare/workers-types").D1Database} DB
 * @prop {Assets} ASSETS
 */

import { main as notifierMain } from "../notifier/main";
import { pushSubscription } from "../repositories/pushSubscription";

export default {
  /**
   * @param {import('@cloudflare/workers-types').Request} request 
   * @param {Env} env 
   * @returns 
   */
  async fetch(request, env) {
    const url = new URL(request.url);

    const repo = pushSubscription(env.DB)

    if (url.pathname === '/notifications' && request.method === 'POST') {
      const result = await repo.create()
      return Response.json(result)
    }
    if (url.pathname === '/notifications' && request.method === 'GET') {
      const result = await repo.getAllDue()
      return Response.json(result)
    }
    // Otherwise, serve the static assets.
    // Without this, the Worker will error and no assets will be served.
    return env.ASSETS.fetch(request);
  },
}
