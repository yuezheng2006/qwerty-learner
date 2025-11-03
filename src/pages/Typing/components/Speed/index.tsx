import { TypingContext } from '../../store'
import InfoBox from './InfoBox'
import { useContext } from 'react'

export default function Speed() {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!
  const seconds = state.timerData.time % 60
  const minutes = Math.floor(state.timerData.time / 60)
  const secondsString = seconds < 10 ? '0' + seconds : seconds + ''
  const minutesString = minutes < 10 ? '0' + minutes : minutes + ''
  const inputNumber = state.chapterData.correctCount + state.chapterData.wrongCount

  const tooltips = {
    time: '从开始练习到现在的总耗时',
    inputCount: '已经输入的总字符数（包括错误的字符）',
    wpm: 'Words Per Minute，每分钟字数，打字速度指标',
    correctCount: '完全正确输入的单词/字符数',
    accuracy: '正确输入的字符数 ÷ 总输入字符数 × 100%',
  }

  return (
    <div className="my-card flex w-3/5 rounded-xl bg-white p-4 py-10 opacity-50 transition-colors duration-300 dark:bg-gray-800">
      <InfoBox info={`${minutesString}:${secondsString}`} description="时间" tooltip={tooltips.time} />
      <InfoBox info={inputNumber + ''} description="输入数" tooltip={tooltips.inputCount} />
      <InfoBox info={state.timerData.wpm + ''} description="WPM" tooltip={tooltips.wpm} />
      <InfoBox info={state.chapterData.correctCount + ''} description="正确数" tooltip={tooltips.correctCount} />
      <InfoBox info={state.timerData.accuracy + ''} description="正确率" tooltip={tooltips.accuracy} />
    </div>
  )
}
