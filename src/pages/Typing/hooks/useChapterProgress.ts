import type { TypingState } from '../store/type'
import { currentChapterAtom, currentDictIdAtom, isReviewModeAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useEffect, useCallback } from 'react'

const PROGRESS_STORAGE_KEY = 'typing_chapter_progress'

interface SavedProgress {
  dictId: string
  chapter: number
  wordIndex: number
  userInputLogs: TypingState['chapterData']['userInputLogs']
  timerData: TypingState['timerData']
  wordCount: number
  correctCount: number
  wrongCount: number
  wordRecordIds: number[]
  isReviewMode: boolean
}

/**
 * Hook to save and restore chapter progress
 */
export function useChapterProgress(state: TypingState, dispatch: (action: any) => void) {
  const currentDictId = useAtomValue(currentDictIdAtom)
  const currentChapter = useAtomValue(currentChapterAtom)
  const isReviewMode = useAtomValue(isReviewModeAtom)

  // 保存进度到 localStorage
  const saveProgress = useCallback(() => {
    // 如果已完成章节，不保存进度
    if (state.isFinished) {
      return
    }

    // 如果单词列表为空，不保存
    if (state.chapterData.words.length === 0) {
      return
    }

    // 如果没有任何进度（未开始输入），不保存
    if (state.chapterData.wordCount === 0 && state.chapterData.index === 0) {
      return
    }

    const progress: SavedProgress = {
      dictId: currentDictId,
      chapter: currentChapter,
      wordIndex: state.chapterData.index,
      userInputLogs: state.chapterData.userInputLogs,
      timerData: state.timerData,
      wordCount: state.chapterData.wordCount,
      correctCount: state.chapterData.correctCount,
      wrongCount: state.chapterData.wrongCount,
      wordRecordIds: state.chapterData.wordRecordIds,
      isReviewMode,
    }

    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
      console.log('💾 进度已保存:', {
        wordIndex: progress.wordIndex,
        wordCount: progress.wordCount,
        dictId: progress.dictId,
        chapter: progress.chapter,
      })
    } catch (error) {
      console.error('保存进度失败:', error)
    }
  }, [state, currentDictId, currentChapter, isReviewMode])

  // 加载保存的进度（不自动清除，让调用者决定）
  const loadProgress = useCallback((): SavedProgress | null => {
    try {
      const saved = localStorage.getItem(PROGRESS_STORAGE_KEY)
      if (!saved) {
        console.log('📭 没有保存的进度')
        return null
      }

      const progress: SavedProgress = JSON.parse(saved)
      console.log('📖 读取到进度:', progress)

      // 验证进度是否属于当前字典和章节
      const dictMatch = progress.dictId === currentDictId
      const chapterMatch = progress.chapter === currentChapter
      const reviewModeMatch = progress.isReviewMode === isReviewMode

      if (!dictMatch || !chapterMatch || !reviewModeMatch) {
        // 不匹配，但不立即清除，返回 null 让调用者处理
        console.log('❌ 进度不匹配（不自动清除，等待切换时清除):', {
          saved: { dictId: progress.dictId, chapter: progress.chapter, isReviewMode: progress.isReviewMode },
          current: { dictId: currentDictId, chapter: currentChapter, isReviewMode },
          matches: { dictMatch, chapterMatch, reviewModeMatch },
        })
        return null
      }

      console.log('✅ 找到匹配的进度:', { wordIndex: progress.wordIndex, wordCount: progress.wordCount })
      return progress
    } catch (error) {
      console.error('加载进度失败:', error)
      // 解析失败时清除损坏的数据
      localStorage.removeItem(PROGRESS_STORAGE_KEY)
      return null
    }
  }, [currentDictId, currentChapter, isReviewMode])

  // 清除保存的进度
  const clearProgress = useCallback(() => {
    console.log('🧹 清除进度')
    localStorage.removeItem(PROGRESS_STORAGE_KEY)
  }, [])

  // 检查是否有未完成的进度
  const hasUnfinishedProgress = useCallback((): boolean => {
    const progress = loadProgress()
    return progress !== null
  }, [loadProgress])

  // 当进度变化时自动保存（仅在完成单词后，而非输入过程中）
  useEffect(() => {
    // 只在单词完成时保存（wordCount 增加），不在输入过程中保存
    if (!state.isFinished && state.chapterData.words.length > 0 && state.chapterData.wordCount > 0) {
      console.log('🔄 触发保存，原因：wordCount 变化为', state.chapterData.wordCount)
      saveProgress()
    }
  }, [
    state.chapterData.wordCount, // 只监听 wordCount 变化，每完成一个单词保存一次
    state.isFinished,
    saveProgress,
  ])

  // 监听刷新前事件
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 只有在有未完成进度时才提示
      if (!state.isFinished && state.chapterData.words.length > 0 && state.chapterData.wordCount > 0) {
        // 保存进度
        saveProgress()

        // 显示提示
        e.preventDefault()
        e.returnValue = '您的章节进度尚未完成，确定要离开吗？进度已自动保存，刷新后可以继续。'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [state, saveProgress])

  return {
    saveProgress,
    loadProgress,
    clearProgress,
    hasUnfinishedProgress,
  }
}

/**
 * Hook to restore progress on mount
 */
export function useRestoreProgress(
  words: Array<{ index: number }>,
  dispatch: (action: any) => void,
  loadProgress: () => SavedProgress | null,
) {
  const restoreProgress = useCallback(() => {
    if (words.length === 0) {
      return false
    }

    const progress = loadProgress()
    if (!progress) {
      return false
    }

    // 验证 wordIndex 是否有效
    if (progress.wordIndex >= words.length) {
      return false
    }

    // 恢复进度 - 通过 dispatch SETUP_CHAPTER 并设置 initialIndex
    dispatch({
      type: 'SETUP_CHAPTER',
      payload: {
        words,
        shouldShuffle: false, // 恢复时不应该重新打乱
        initialIndex: progress.wordIndex,
        restoreProgress: progress, // 传递完整进度信息用于恢复
      },
    })

    return true
  }, [words, dispatch, loadProgress])

  return restoreProgress
}
