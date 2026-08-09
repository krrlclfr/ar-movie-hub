export type PopupReference = WindowProxy | null

export interface PopupEntry {
  id: string
  name: string | null
  url: string
  popup: WindowProxy
  openedAt: number
}

const popups = new Map<string, PopupEntry>()
let nextPopupId = 1

function generateId(name: string | null) {
  return `${name ?? 'popup'}-${nextPopupId++}`
}

export function trackPopup(popup: WindowProxy, url: string, name: string | null = null) {
  const id = generateId(name)
  popups.set(id, {
    id,
    name,
    url,
    popup,
    openedAt: Date.now(),
  })
  return id
}

export function openPopup(url: string, name: string | undefined = '_blank', features: string | undefined = ''): PopupReference {
  const popup = window.open(url, name, features ?? '')

  if (!popup) {
    return null
  }

  trackPopup(popup, url, name ?? null)
  return popup
}

export function closePopup(popupOrId: PopupReference | string): boolean {
  if (!popupOrId) {
    return false
  }

  if (typeof popupOrId === 'string') {
    const entry = popups.get(popupOrId)
    if (!entry) {
      return false
    }
    if (!entry.popup.closed) {
      entry.popup.close()
    }
    popups.delete(popupOrId)
    return true
  }

  for (const [id, entry] of popups.entries()) {
    if (entry.popup === popupOrId) {
      if (!entry.popup.closed) {
        entry.popup.close()
      }
      popups.delete(id)
      return true
    }
  }

  try {
    if (!popupOrId.closed) {
      popupOrId.close()
      return true
    }
  } catch {
    return false
  }

  return false
}

export function closeAllPopups(): number {
  let closedCount = 0

  for (const [id, entry] of Array.from(popups.entries())) {
    try {
      if (!entry.popup.closed) {
        entry.popup.close()
      }
      popups.delete(id)
      closedCount += 1
    } catch {
      popups.delete(id)
    }
  }

  return closedCount
}

export function getOpenPopups(): PopupEntry[] {
  return Array.from(popups.values()).filter((entry) => !entry.popup.closed)
}

export const popupManager = {
  trackPopup,
  openPopup,
  closePopup,
  closeAllPopups,
  getOpenPopups,
}
