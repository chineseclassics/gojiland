import { onWatcherCleanup, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { playSound } from '../game/audio'

const PITCH_MAX = 78
const DRAG_YAW = 0.48
const DRAG_PITCH = 0.36

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

/**
 * 按住拖曳自由旋轉，角度寫進 CSS 變數，不走 Vue 狀態。
 */
export function useHoloPointer(
  stageRef: Ref<HTMLElement | null>,
  enabled: MaybeRefOrGetter<boolean>,
  faceUp: MaybeRefOrGetter<boolean>,
) {
  let faceUpNow = toValue(faceUp)
  let revealing = false

  watch(() => toValue(faceUp), (next) => {
    if (next && !faceUpNow) revealing = true
    faceUpNow = next
  })

  watch(
    [stageRef, () => toValue(enabled)],
    ([node, on]) => {
      if (!node || !on) return

      let raf = 0
      let baseYaw = faceUpNow ? 0 : 180
      let basePitch = 8
      let dragging = false
      let lastX = 0
      let lastY = 0
      let t = 0
      let gyroYaw = 0
      let gyroPitch = 0
      let flipLane = Math.floor((baseYaw + 90) / 180)

      const apply = () => {
        raf = requestAnimationFrame(apply)
        t += 0.016
        if (revealing) {
          baseYaw += (0 - baseYaw) * 0.11
          basePitch += (8 - basePitch) * 0.11
          if (Math.abs(baseYaw) < 0.35) {
            baseYaw = 0
            revealing = false
          }
        }
        const idleYaw = dragging || revealing ? 0 : Math.sin(t * 0.55) * 4.5
        const idlePitch = dragging || revealing ? 0 : Math.cos(t * 0.4) * 3.2
        const yaw = baseYaw + idleYaw + gyroYaw
        const pitch = clamp(basePitch + idlePitch + gyroPitch, -PITCH_MAX, PITCH_MAX)
        const radY = (yaw * Math.PI) / 180
        const radX = (pitch * Math.PI) / 180
        const sx = Math.sin(radY)
        const sy = Math.sin(radX)
        node.style.setProperty('--sx', sx.toFixed(4))
        node.style.setProperty('--sy', sy.toFixed(4))
        node.style.setProperty('--mx', `${(50 + sx * 42).toFixed(2)}%`)
        node.style.setProperty('--my', `${(50 + sy * 42).toFixed(2)}%`)
        node.style.setProperty('--rx', `${pitch.toFixed(2)}deg`)
        node.style.setProperty('--ry', `${yaw.toFixed(2)}deg`)
        node.style.setProperty('--foil', (0.28 + Math.abs(Math.cos(radY)) * 0.55).toFixed(3))
      }

      const onDown = (e: PointerEvent) => {
        if (e.button !== 0) return
        dragging = true
        revealing = false
        lastX = e.clientX
        lastY = e.clientY
        node.setPointerCapture(e.pointerId)
        e.stopPropagation()
      }
      const onMove = (e: PointerEvent) => {
        if (!dragging) return
        baseYaw += (e.clientX - lastX) * DRAG_YAW
        basePitch = clamp(basePitch - (e.clientY - lastY) * DRAG_PITCH, -PITCH_MAX, PITCH_MAX)
        lastX = e.clientX
        lastY = e.clientY
        const lane = Math.floor((baseYaw + 90) / 180)
        if (lane !== flipLane) {
          flipLane = lane
          playSound('flip')
        }
      }
      const onUp = (e: PointerEvent) => {
        dragging = false
        if (node.hasPointerCapture(e.pointerId)) node.releasePointerCapture(e.pointerId)
      }
      const onOri = (e: DeviceOrientationEvent) => {
        if (dragging) return
        gyroYaw = clamp((e.gamma ?? 0) * 0.85, -50, 50)
        gyroPitch = clamp(((e.beta ?? 45) - 45) * 0.55, -36, 36)
      }

      const enableGyro = () => {
        const DOE = window.DeviceOrientationEvent as (typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<string>
        }) | undefined
        if (!DOE) return
        const attach = () => window.addEventListener('deviceorientation', onOri)
        if (typeof DOE.requestPermission === 'function') {
          void DOE.requestPermission().then((perm) => {
            if (perm === 'granted') attach()
          }).catch(() => {})
        } else {
          attach()
        }
      }

      node.addEventListener('pointerdown', onDown)
      node.addEventListener('pointermove', onMove)
      node.addEventListener('pointerup', onUp)
      node.addEventListener('pointercancel', onUp)
      enableGyro()
      raf = requestAnimationFrame(apply)

      onWatcherCleanup(() => {
        cancelAnimationFrame(raf)
        node.removeEventListener('pointerdown', onDown)
        node.removeEventListener('pointermove', onMove)
        node.removeEventListener('pointerup', onUp)
        node.removeEventListener('pointercancel', onUp)
        window.removeEventListener('deviceorientation', onOri)
      })
    },
    { flush: 'post' },
  )
}
