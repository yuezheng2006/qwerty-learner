import { exampleWords, llmWords } from './dictExamples'
import Layout from '@/components/Layout'
import { currentDictIdAtom } from '@/store'
import { saveAs } from 'file-saver'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'
import IconCheck from '~icons/tabler/check'
import IconX from '~icons/tabler/x'

interface CustomDict {
  id: string
  name: string
  category: string
  chapterLength: number
  words: Word[]
  createdAt: string
}

interface Word {
  name: string
  trans: string[]
  usphone?: string
  ukphone?: string
}

export default function DictImportPage() {
  const navigate = useNavigate()
  const [, setCurrentDictId] = useAtom(currentDictIdAtom)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')
  const [previewData, setPreviewData] = useState<{
    fileName: string
    rawContent: string
    words: Word[]
    formattedJson: string
  }>({
    fileName: '未命名',
    rawContent: '',
    words: [],
    formattedJson: JSON.stringify({ words: [] }, null, 2),
  })
  const [editableJson, setEditableJson] = useState(JSON.stringify({ words: [] }, null, 2))

  // 词典属性
  const [dictName, setDictName] = useState('')
  const [dictCategory, setDictCategory] = useState('自定义词典')
  const [chapterLength, setChapterLength] = useState(20)
  const [showFormatHelp, setShowFormatHelp] = useState(false)

  const onBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  useHotkeys('enter,esc', onBack, { preventDefault: true })

  // 解析 JSON 并更新预览
  const parseJson = (jsonText: string) => {
    try {
      setImportError('')
      const data = JSON.parse(jsonText)
      let words: Word[] = []

      if (Array.isArray(data)) {
        words = data
      } else if (data.words && Array.isArray(data.words)) {
        words = data.words
      } else {
        throw new Error('JSON 格式不正确：需要包含 words 数组或直接是数组')
      }

      // 验证单词格式
      const validWords = words.filter((word) => word && word.name && word.trans)
      if (validWords.length === 0) {
        throw new Error('没有找到有效的单词')
      }

      // 格式化 JSON
      const formattedJson = JSON.stringify({ words: validWords }, null, 2)

      setPreviewData({
        fileName: previewData?.fileName || '未命名',
        rawContent: jsonText,
        words: validWords,
        formattedJson,
      })
      setEditableJson(formattedJson)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'JSON 解析失败')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportError('')
    setImportSuccess('')

    try {
      const text = await file.text()
      let words: Word[] = []

      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text)
        if (Array.isArray(data)) {
          words = data
        } else if (data.words && Array.isArray(data.words)) {
          words = data.words
        } else {
          throw new Error('JSON 格式不正确')
        }
      } else if (file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
        const lines = text.split('\n').filter((line) => line.trim())

        for (const line of lines) {
          let parts: string[] = []

          if (line.includes('\t')) {
            parts = line.split('\t')
          } else if (line.includes(',')) {
            parts = line.split(',').map((p) => p.trim())
          } else {
            parts = line.trim().split(/\s+/)
          }

          if (parts.length >= 1) {
            const word: Word = {
              name: parts[0].trim(),
              trans: parts.length > 1 ? [parts[1].trim()] : ['无释义'],
            }

            if (parts.length > 2) {
              word.usphone = parts[2].trim()
            }
            if (parts.length > 3) {
              word.ukphone = parts[3].trim()
            }

            words.push(word)
          }
        }
      } else {
        throw new Error('请上传 .json、.txt 或 .csv 文件')
      }

      if (words.length === 0) {
        throw new Error('文件中没有找到有效的单词')
      }

      // 生成格式化的 JSON 用于预览
      const formattedJson = JSON.stringify({ words }, null, 2)

      // 更新预览数据
      setPreviewData({
        fileName: file.name,
        rawContent: text,
        words,
        formattedJson,
      })
      setEditableJson(formattedJson)
      setIsImporting(false)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : '导入失败')
      setIsImporting(false)
    } finally {
      event.target.value = ''
    }
  }

  const handleConfirmImport = () => {
    if (previewData.words.length === 0) return

    // 验证必填项
    if (!dictName.trim()) {
      setImportError('请输入词典名称')
      return
    }

    if (chapterLength < 1) {
      setImportError('每章节单词数必须大于0')
      return
    }

    setIsImporting(true)
    setImportError('')
    setImportSuccess('')

    try {
      // 获取现有的自定义词典
      const existingCustomDicts: CustomDict[] = (() => {
        try {
          const saved = localStorage.getItem('customDicts')
          return saved ? JSON.parse(saved) : []
        } catch {
          return []
        }
      })()

      const newDict: CustomDict = {
        id: `custom_${Date.now()}`,
        name: dictName.trim(),
        category: dictCategory.trim() || '自定义词典',
        chapterLength: chapterLength || 20,
        words: previewData.words,
        createdAt: new Date().toLocaleString('zh-CN'),
      }

      const updatedDicts = [...existingCustomDicts, newDict]
      localStorage.setItem('customDicts', JSON.stringify(updatedDicts))

      setCurrentDictId(newDict.id)
      setImportSuccess(`成功导入 ${previewData.words.length} 个单词！共 ${Math.ceil(previewData.words.length / chapterLength)} 个章节`)

      // 刷新页面以更新词典列表
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : '导入失败')
      setIsImporting(false)
    }
  }

  const handleReset = () => {
    setPreviewData({
      fileName: '未命名',
      rawContent: '',
      words: [],
      formattedJson: JSON.stringify({ words: [] }, null, 2),
    })
    setEditableJson(JSON.stringify({ words: [] }, null, 2))
    setDictName('')
    setDictCategory('自定义词典')
    setChapterLength(20)
    setImportError('')
    setImportSuccess('')
  }

  // 当文件名变化时，自动填充词典名称
  useEffect(() => {
    if (previewData.fileName && previewData.fileName !== '未命名' && !dictName) {
      const nameWithoutExt = previewData.fileName.replace(/\.[^/.]+$/, '')
      setDictName(nameWithoutExt)
    }
  }, [previewData.fileName])

  const handleJsonChange = (value: string) => {
    setEditableJson(value)
  }

  const handleParseJson = () => {
    parseJson(editableJson)
  }

  const exportTemplate = () => {
    const template = [
      {
        name: 'hello',
        trans: ['你好'],
        usphone: 'həˈloʊ',
        ukphone: 'həˈləʊ',
      },
    ]

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    saveAs(blob, '单词库模板.json')
  }

  const getExampleJson = () => {
    return JSON.stringify({ words: exampleWords }, null, 2)
  }

  const loadExample = useCallback(() => {
    const exampleJson = getExampleJson()
    setEditableJson(exampleJson)
    parseJson(exampleJson)
  }, [previewData.fileName])

  const loadLLMDict = useCallback(() => {
    const llmJson = JSON.stringify({ words: llmWords }, null, 2)
    setEditableJson(llmJson)
    parseJson(llmJson)
    setDictName('LLM相关英语')
    setDictCategory('专业词汇')
  }, [previewData.fileName])

  // 初始化时自动加载示例
  useEffect(() => {
    if (previewData.words.length === 0) {
      loadExample()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setEditableJson(previewData.formattedJson)
  }, [previewData])

  return (
    <Layout>
      <div className="flex h-full w-full flex-col overflow-hidden pl-20 pr-20 pt-12">
        {/* 头部 */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">导入自定义词典</h1>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
              文件：{previewData.fileName} | 共 {previewData.words.length} 个单词
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        {/* 格式说明和示例 - 紧凑版本 */}
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-2.5 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-blue-800 dark:text-blue-200">
              <button
                onClick={() => setShowFormatHelp(!showFormatHelp)}
                className="font-medium hover:text-blue-900 dark:hover:text-blue-100"
              >
                {showFormatHelp ? '▼' : '▶'} 格式说明
              </button>
              <span className="text-blue-600 dark:text-blue-400">|</span>
              <button onClick={exportTemplate} className="hover:text-blue-900 dark:hover:text-blue-100">
                下载模板
              </button>
              <span className="text-blue-600 dark:text-blue-400">|</span>
              <button onClick={loadExample} className="hover:text-blue-900 dark:hover:text-blue-100">
                重新加载示例
              </button>
              <span className="text-blue-600 dark:text-blue-400">|</span>
              <button onClick={loadLLMDict} className="hover:text-blue-900 dark:hover:text-blue-100">
                一键导入 LLM 词典
              </button>
            </div>
          </div>
          {showFormatHelp && (
            <div className="mt-2 space-y-1.5 border-t border-blue-200 pt-2 text-xs text-blue-800 dark:border-blue-700 dark:text-blue-200">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div>
                  <code className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-800">words</code>：数组，包含单词对象
                </div>
                <div>
                  <code className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-800">name</code>：必填，单词名称（字符串）
                </div>
                <div>
                  <code className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-800">trans</code>：必填，释义数组（字符串数组）
                </div>
                <div>
                  <code className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-800">usphone</code>：可选，美式音标（字符串）
                </div>
                <div className="col-span-2">
                  <code className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-800">ukphone</code>：可选，英式音标（字符串）
                </div>
              </div>
              <div className="mt-2 max-h-20 overflow-y-auto rounded border border-blue-200 bg-white p-2 dark:border-blue-700 dark:bg-gray-800">
                <div className="mb-0.5 text-xs font-semibold text-blue-900 dark:text-blue-100">示例：</div>
                <pre className="overflow-x-auto text-[10px] leading-tight text-gray-700 dark:text-gray-300">
                  {`{"words":[{"name":"hello","trans":["你好"],"usphone":"həˈloʊ"}]}`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* 主要内容区域 */}
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* 左侧：JSON 编辑器 */}
          <div className="flex w-1/2 flex-col overflow-hidden rounded-lg border bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-shrink-0 items-center justify-between border-b bg-gray-100 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">JSON 编辑器</h3>
              <div className="flex gap-2">
                <label className="cursor-pointer rounded bg-gray-200 px-2.5 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                  <input type="file" className="sr-only" accept=".json,.txt,.csv" onChange={handleFileUpload} disabled={isImporting} />
                  上传文件
                </label>
                <button
                  onClick={handleParseJson}
                  disabled={isImporting}
                  className="rounded bg-indigo-600 px-2.5 py-1 text-xs text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isImporting ? '解析中...' : '解析'}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-3">
              <textarea
                value={editableJson}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="h-full w-full resize-none rounded border border-gray-300 bg-white p-3 font-mono text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                placeholder='{"words": [{"name": "hello", "trans": ["你好"], "usphone": "həˈloʊ"}]}'
                spellCheck={false}
              />
              {previewData.words.length === 0 && editableJson.trim() !== '' && (
                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">💡 提示：编辑完成后点击&ldquo;解析&rdquo;按钮更新预览</div>
              )}
            </div>
          </div>

          {/* 右侧：单词预览 */}
          <div className="flex w-1/2 flex-col overflow-hidden rounded-lg border bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex-shrink-0 border-b bg-gray-100 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                单词预览
                {previewData.words.length > 0 && <span className="ml-2 text-xs text-gray-500">（前 20 个）</span>}
              </h3>
            </div>
            <div className="flex-1 overflow-auto p-3">
              {previewData.words.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-400 dark:text-gray-500">
                  <div className="mb-2 text-4xl">📝</div>
                  <div className="mb-1 font-medium">暂无预览数据</div>
                  <div className="text-xs">请在左侧编辑 JSON 或上传文件，然后点击&ldquo;解析&rdquo;按钮</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {previewData.words.slice(0, 20).map((word, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white">{word.name}</div>
                          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{word.trans.join(', ')}</div>
                          {(word.usphone || word.ukphone) && (
                            <div className="mt-1 flex gap-3 text-xs text-gray-500 dark:text-gray-500">
                              {word.usphone && (
                                <span>
                                  <span className="font-medium">美音</span>: {word.usphone}
                                </span>
                              )}
                              {word.ukphone && (
                                <span>
                                  <span className="font-medium">英音</span>: {word.ukphone}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {previewData.words.length > 20 && (
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-2 text-center text-xs text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">
                      还有 {previewData.words.length - 20} 个单词未显示...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 词典属性设置 */}
        {previewData.words.length > 0 && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">词典属性</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  词典名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={dictName}
                  onChange={(e) => setDictName(e.target.value)}
                  placeholder="请输入词典名称"
                  className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">分类</label>
                <input
                  type="text"
                  value={dictCategory}
                  onChange={(e) => setDictCategory(e.target.value)}
                  placeholder="自定义词典"
                  className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">每章节单词数</label>
                <input
                  type="number"
                  min="1"
                  value={chapterLength}
                  onChange={(e) => setChapterLength(Math.max(1, parseInt(e.target.value) || 20))}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                />
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  共 {Math.ceil(previewData.words.length / chapterLength)} 个章节
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 底部操作栏 */}
        <div className="mt-4 flex flex-shrink-0 items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            共 <span className="font-semibold text-indigo-600 dark:text-indigo-400">{previewData.words.length}</span> 个单词
            {previewData.words.length > 0 && <span className="ml-2">| {Math.ceil(previewData.words.length / chapterLength)} 个章节</span>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={isImporting}
              className="flex items-center gap-1.5 rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <IconX className="h-3.5 w-3.5" />
              重置
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={isImporting || previewData.words.length === 0 || !dictName.trim()}
              className="flex items-center gap-1.5 rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              <IconCheck className="h-3.5 w-3.5" />
              {isImporting ? '导入中...' : '确认导入'}
            </button>
          </div>
        </div>

        {/* 错误和成功提示 */}
        {importError && (
          <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">{importError}</div>
        )}

        {importSuccess && (
          <div className="mt-3 rounded-lg bg-green-50 p-2 text-xs text-green-600 dark:bg-green-900/20 dark:text-green-400">
            {importSuccess}
          </div>
        )}
      </div>
    </Layout>
  )
}
