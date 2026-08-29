const DEFAULT_FILTERS = [
  'doubleclick.net',
  'googlesyndication.com',
  'adservice.google.com',
  'pagead2.googlesyndication.com',
  'amazon-adsystem.com',
]

export async function registerAdblockServiceWorker(filters: string[] = DEFAULT_FILTERS) {
  if (!('serviceWorker' in navigator)) return null

  try {
    const registration = await navigator.serviceWorker.register('/adblock-sw.js')
    // wait until active
    await navigator.serviceWorker.ready

    // send filters
    const active = registration.active || navigator.serviceWorker.controller
    active?.postMessage({ type: 'updateFilters', filters })

    return registration
  } catch (e) {
    console.error('Adblock SW registration failed', e)
    return null
  }
}

export function updateAdblockFilters(filters: string[]) {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'updateFilters', filters })
  }
}

export async function unregisterAdblockServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  try {
    const regs = await navigator.serviceWorker.getRegistrations()
    for (const r of regs) {
      if (r.scriptURL.endsWith('/adblock-sw.js')) {
        await r.unregister()
      }
    }
  } catch (e) {
    console.error('Failed to unregister adblock SW', e)
  }
}

export const adblock = {
  register: registerAdblockServiceWorker,
  updateFilters: updateAdblockFilters,
  unregister: unregisterAdblockServiceWorker,
}

export default adblock
