import Layout from '../../components/Layout'
import { DictChapterButton } from './components/DictChapterButton'
import PronunciationSwitcher from './components/PronunciationSwitcher'
import ResultScreen from './components/ResultScreen'
import Speed from './components/Speed'
import StartButton from './components/StartButton'
import Switcher from './components/Switcher'
import WordList from './components/WordList'
import WordPanel from './components/WordPanel'
import { useChapterProgress } from './hooks/useChapterProgress'
import { useConfetti } from './hooks/useConfetti'
import { useWordList } from './hooks/useWordList'
import { TypingContext, TypingStateActionType, initialState, typingReducer } from './store'
import { DonateCard } from '@/components/DonateCard'
import Header from '@/components/Header'
import Tooltip from '@/components/Tooltip'
import { idDictionaryMap } from '@/resources/dictionary'
import { currentChapterAtom, currentDictIdAtom, isReviewModeAtom, randomConfigAtom, reviewModeInfoAtom } from '@/store'
import { IsDesktop, isLegal } from '@/utils'
import { useSaveChapterRecord } from '@/utils/db'
import { useMixPanelChapterLogUploader } from '@/utils/mixpanel'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import type React from 'react'
import { useCallback, useEffect, useState, useRef } from 'react'
import { useImmerReducer } from 'use-immer'

const App: React.FC = () => {
  const [state, dispatch] = useImmerReducer(typingReducer, structuredClone(initialState))
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { words } = useWordList()

  const [currentDictId, setCurrentDictId] = useAtom(currentDictIdAtom)
  const [currentChapter, setCurrentChapter] = useAtom(currentChapterAtom)
  const randomConfig = useAtomValue(randomConfigAtom)
  const chapterLogUploader = useMixPanelChapterLogUploader(state)
  const saveChapterRecord = useSaveChapterRecord()

  const reviewModeInfo = useAtomValue(reviewModeInfoAtom)
  const isReviewMode = useAtomValue(isReviewModeAtom)

  // 进度保存和恢复
  const { loadProgress, clearProgress } = useChapterProgress(state, dispatch)
  const [progressRestored, setProgressRestored] = useState(false)
  // 使用 null 而不是 undefined，避免首次渲染时误判为"切换"
  const prevChapterRef = useRef<number | null>(null)
  const prevDictIdRef = useRef<string | null>(null)

  useEffect(() => {
    // 检测用户设备
    if (!IsDesktop()) {
      setTimeout(() => {
        alert(
          ' Qwerty Learner 目的为提高键盘工作者的英语输入效率，目前暂未适配移动端，希望您使用桌面端浏览器访问。如您使用的是 Ipad 等平板电脑设备，可以使用外接键盘使用本软件。',
        )
      }, 500)
    }
  }, [])

  // 在组件挂载和currentDictId改变时，检查当前字典是否存在，如果不存在，则将其重置为默认值
  useEffect(() => {
    const id = currentDictId
    if (!(id in idDictionaryMap)) {
      setCurrentDictId('cet4')
      setCurrentChapter(0)
      return
    }
  }, [currentDictId, setCurrentChapter, setCurrentDictId])

  // 当章节或字典切换时清除旧进度
  useEffect(() => {
    // 首次渲染时初始化 ref，不清除进度
    if (prevChapterRef.current === null || prevDictIdRef.current === null) {
      prevChapterRef.current = currentChapter
      prevDictIdRef.current = currentDictId
      return
    }

    // 只有在章节或字典真正改变时才清除进度
    if (prevChapterRef.current !== currentChapter || prevDictIdRef.current !== currentDictId) {
      console.log('🗑️ 字典或章节切换，清除旧进度:', {
        prev: { chapter: prevChapterRef.current, dictId: prevDictIdRef.current },
        current: { chapter: currentChapter, dictId: currentDictId },
      })
      clearProgress()
      prevChapterRef.current = currentChapter
      prevDictIdRef.current = currentDictId
    }
  }, [currentChapter, currentDictId, clearProgress])

  const skipWord = useCallback(() => {
    dispatch({ type: TypingStateActionType.SKIP_WORD })
  }, [dispatch])

  useEffect(() => {
    const onBlur = () => {
      dispatch({ type: TypingStateActionType.SET_IS_TYPING, payload: false })
    }
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('blur', onBlur)
    }
  }, [dispatch])

  useEffect(() => {
    state.chapterData.words?.length > 0 ? setIsLoading(false) : setIsLoading(true)
  }, [state.chapterData.words])

  useEffect(() => {
    if (!state.isTyping) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (!isLoading && e.key !== 'Enter' && (isLegal(e.key) || e.key === ' ') && !e.altKey && !e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          dispatch({ type: TypingStateActionType.SET_IS_TYPING, payload: true })
        }
      }
      window.addEventListener('keydown', onKeyDown)

      return () => window.removeEventListener('keydown', onKeyDown)
    }
  }, [state.isTyping, isLoading, dispatch])

  useEffect(() => {
    if (words !== undefined && words.length > 0) {
      // 尝试恢复保存的进度
      console.log('🔍 检查恢复进度:', { currentDictId, currentChapter, wordsLength: words.length })
      const savedProgress = loadProgress()
      console.log('📦 加载的进度:', savedProgress)

      let initialIndex = 0
      let restoreProgressData = undefined

      if (savedProgress && savedProgress.wordIndex < words.length) {
        // 有保存的进度，恢复它
        console.log('🔄 恢复进度:', savedProgress)
        initialIndex = savedProgress.wordIndex
        restoreProgressData = savedProgress
      } else {
        if (savedProgress) {
          // 进度存在但不匹配（可能是索引超出范围，或字典/章节不匹配）
          console.log('⚠️ 进度存在但不匹配:', {
            savedWordIndex: savedProgress.wordIndex,
            wordsLength: words.length,
            savedDictId: savedProgress.dictId,
            currentDictId,
            savedChapter: savedProgress.chapter,
            currentChapter,
          })
          // 如果进度不匹配当前字典/章节，清除它（这些进度属于其他字典/章节）
          // 注意：这里不匹配是因为 loadProgress 已经检查过了，所以这里应该是索引超出范围的情况
          if (savedProgress.dictId !== currentDictId || savedProgress.chapter !== currentChapter) {
            console.log('🗑️ 清除不匹配的旧进度')
            clearProgress()
          }
        }
        if (isReviewMode && reviewModeInfo.reviewRecord?.index) {
          // 复习模式使用复习记录的索引
          initialIndex = reviewModeInfo.reviewRecord.index
        }
      }

      dispatch({
        type: TypingStateActionType.SETUP_CHAPTER,
        payload: {
          words,
          shouldShuffle: restoreProgressData ? false : randomConfig.isOpen,
          initialIndex,
          restoreProgress: restoreProgressData,
        },
      })

      // 如果恢复了进度，显示提示
      if (restoreProgressData) {
        console.log('✅ 进度恢复成功，将显示提示')
        setProgressRestored(true)
        // 注意：不在这里清除进度，保持进度直到章节完成或切换
        // 这样多次刷新都能恢复同一进度
        // 3秒后隐藏提示
        setTimeout(() => {
          setProgressRestored(false)
        }, 3000)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words])

  useEffect(() => {
    // 当用户完成章节后且完成 word Record 数据保存，记录 chapter Record 数据,
    if (state.isFinished && !state.isSavingRecord) {
      chapterLogUploader()
      saveChapterRecord(state)
      // 清除保存的进度
      clearProgress()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isFinished, state.isSavingRecord])

  useEffect(() => {
    // 启动计时器
    let intervalId: number
    if (state.isTyping) {
      intervalId = window.setInterval(() => {
        dispatch({ type: TypingStateActionType.TICK_TIMER })
      }, 1000)
    }
    return () => clearInterval(intervalId)
  }, [state.isTyping, dispatch])

  useConfetti(state.isFinished)

  return (
    <TypingContext.Provider value={{ state: state, dispatch }}>
      {state.isFinished && <DonateCard />}
      {state.isFinished && <ResultScreen />}
      {progressRestored && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 transform rounded-lg bg-green-500 px-4 py-2 text-white shadow-lg">
          ✅ 已恢复上次进度，可以继续练习
        </div>
      )}
      <Layout>
        <Header>
          <DictChapterButton />
          <PronunciationSwitcher />
          <Switcher />
          <StartButton isLoading={isLoading} />
          <Tooltip content="跳过该词">
            <button
              className={`${
                state.isShowSkip ? 'bg-orange-400' : 'invisible w-0 bg-gray-300 px-0 opacity-0'
              } my-btn-primary transition-all duration-300 `}
              onClick={skipWord}
            >
              Skip
            </button>
          </Tooltip>
        </Header>
        <div className="container mx-auto flex h-full flex-1 flex-col items-center justify-center pb-5">
          <div className="container relative mx-auto flex h-full flex-col items-center">
            <div className="container flex flex-grow items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center ">
                  <div
                    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid  border-indigo-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    role="status"
                  ></div>
                </div>
              ) : (
                !state.isFinished && <WordPanel />
              )}
            </div>
            <Speed />
          </div>
        </div>
      </Layout>
      <WordList />
    </TypingContext.Provider>
  )
}

export default App
