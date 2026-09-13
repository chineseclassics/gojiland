import { onMounted, onUnmounted } from 'vue'

export function useKeys(onKey: (key: string) => void) {
  function handler(event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (event.isComposing) return
    const key = event.key
    if (key === 'Backspace' || key === ' ' || /^[a-zA-Z;']$/.test(key)) {
      event.preventDefault()
      onKey(key)
    }
  }

  onMounted(() => window.addEventListener('keydown', handler))
  onUnmounted(() => window.removeEventListener('keydown', handler))
}
