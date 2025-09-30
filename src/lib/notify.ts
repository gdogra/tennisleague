export function isOptedIn(): boolean {
  try {
    return localStorage.getItem('notify_opt_in') === 'true';
  } catch {
    return false;
  }
}

export async function requestOptIn(): Promise<boolean> {
  try {
    localStorage.setItem('notify_opt_in', 'true');
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
    return false;
  } catch {
    return false;
  }
}

export function revokeOptIn() {
  try { localStorage.setItem('notify_opt_in', 'false'); } catch {}
}

export function maybeNotify(title: string, body: string) {
  try {
    if (!isOptedIn()) return;
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  } catch {}
}

