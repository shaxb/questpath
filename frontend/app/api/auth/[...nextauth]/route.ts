import { handlers } from '@/auth'

async function logAndHandle(req: Request) {
  try {
    // Call NextAuth handlers by method (handlers is an object of methods)
    const method = (req.method || 'GET').toUpperCase()
    const h: any = handlers as any
    const fn = h[method]
    if (typeof fn === 'function') {
      return await fn(req as any)
    }
    return new Response('Method Not Allowed', { status: 405 })
  } catch (err) {
    console.error('[auth] Handler error:', err)
    throw err
  }
}

export const GET = (req: Request) => logAndHandle(req)
export const POST = (req: Request) => logAndHandle(req)
export const PUT = (req: Request) => logAndHandle(req)
export const DELETE = (req: Request) => logAndHandle(req)
// Note: we forward requests to NextAuth `handlers` via `logAndHandle` above.
