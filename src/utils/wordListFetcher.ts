import type { Word } from '@/typings'

export async function wordListFetcher(url: string): Promise<Word[]> {
  // 检查是否为自定义词典
  if (url.startsWith('custom://')) {
    const dictId = url.replace('custom://', '')

    try {
      const saved = localStorage.getItem('customDicts')
      if (!saved) throw new Error('未找到自定义词典')

      const customDicts = JSON.parse(saved)
      const dict = customDicts.find((d: any) => d.id === dictId)

      if (!dict) throw new Error('词典不存在')

      return dict.words
    } catch (error) {
      console.error('加载自定义词典失败:', error)
      throw error
    }
  }

  // 加载内置词典
  const URL_PREFIX: string = REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''

  const response = await fetch(URL_PREFIX + url)
  const words: Word[] = await response.json()
  return words
}
