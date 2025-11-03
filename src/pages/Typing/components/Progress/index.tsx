import { TypingContext } from '../../store'
import { useContext, useEffect, useState } from 'react'

export default function Progress({ className }: { className?: string }) {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!
  const [displayProgress, setDisplayProgress] = useState(0)

  // 计算当前阶段（用于渐变色和光效）
  const getProgressColor = (percent: number) => {
    if (percent < 33) {
      return 'from-blue-400 to-cyan-400'
    } else if (percent < 66) {
      return 'from-cyan-400 to-green-400'
    } else {
      return 'from-green-400 to-emerald-400'
    }
  }

  // 计算阴影强度
  const getShadowIntensity = (percent: number) => {
    const intensity = Math.min((percent / 100) * 20, 20)
    return intensity
  }

  useEffect(() => {
    const newProgress = Math.floor((state.chapterData.index / state.chapterData.words.length) * 100)

    // 使用 requestAnimationFrame 实现平滑过渡
    let frameId: number
    let current = displayProgress
    const target = newProgress

    const animate = () => {
      current += (target - current) * 0.15 // 平滑系数
      if (Math.abs(current - target) > 0.5) {
        setDisplayProgress(Math.round(current))
        frameId = requestAnimationFrame(animate)
      } else {
        setDisplayProgress(target)
      }
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.chapterData.index, state.chapterData.words.length])

  const shadowIntensity = getShadowIntensity(displayProgress)
  const gradientClass = getProgressColor(displayProgress)

  return (
    <div className={`relative w-1/4 pt-1 ${className}`}>
      {/* 外层容器 - 背景轨道 */}
      <div
        className="relative mb-4 flex h-3 overflow-hidden rounded-full bg-gradient-to-r from-indigo-100 via-indigo-50 to-indigo-100 text-xs transition-all duration-300 dark:from-indigo-900 dark:via-indigo-800 dark:to-indigo-900"
        style={{
          boxShadow: `inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 -2px 4px rgba(255, 255, 255, 0.3)`,
        }}
      >
        {/* 进度条 - 带渐变和发光效果 */}
        <div
          style={{
            width: `${displayProgress}%`,
            boxShadow: `0 0 ${shadowIntensity}px rgba(59, 130, 246, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.4)`,
          }}
          className={`flex items-center justify-end rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-300 ease-out`}
        >
          {/* 闪光点效果 */}
          {displayProgress > 0 && displayProgress < 100 && (
            <div
              className="absolute right-0 top-1/2 h-2 w-1 -translate-y-1/2 rounded-full bg-white opacity-70 blur-sm"
              style={{
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
          )}
        </div>
      </div>

      {/* 百分比文本显示 */}
      <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-300">
        <span className="font-semibold">
          {state.chapterData.index} / {state.chapterData.words.length}
        </span>
        <span className="font-bold">{displayProgress}%</span>
      </div>

      {/* CSS 动画定义 */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  )
}
