import { shallowRef } from 'vue'

export function useTyping() {
  const typed = shallowRef('')
  const wrong = shallowRef(false)
  let wrongTimer = 0

  function reset() {
    typed.value = ''
    wrong.value = false
  }

  function feed(key: string, target: string): 'ok' | 'wrong' | 'done' {
    const goal = target.toLowerCase()
    if (key === 'Backspace') {
      typed.value = typed.value.slice(0, -1)
      return 'ok'
    }
    const ch = key.length === 1 ? key.toLowerCase() : ''
    if (!ch || !/[a-z ;']/.test(ch)) return 'ok'
    const next = typed.value + ch
    if (goal.startsWith(next)) {
      typed.value = next
      if (next === goal) return 'done'
      return 'ok'
    }
    wrong.value = true
    window.clearTimeout(wrongTimer)
    wrongTimer = window.setTimeout(() => {
      wrong.value = false
    }, 160)
    return 'wrong'
  }

  return { typed, wrong, reset, feed }
}
