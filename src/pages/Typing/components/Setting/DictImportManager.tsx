import { currentDictIdAtom } from '@/store'
import { saveAs } from 'file-saver'
import { useAtom } from 'jotai'
import React, { useState } from 'react'
import IconCloudUpload from '~icons/tabler/cloud-upload'
import IconDownload from '~icons/tabler/download'
import IconFileDescription from '~icons/tabler/file-description'
import IconTrash from '~icons/tabler/trash'

interface CustomDict {
  id: string
  name: string
  words: Word[]
  createdAt: string
}

interface Word {
  name: string
  trans: string[]
  usphone?: string
  ukphone?: string
}

export default function DictImportManager() {
  const [, setCurrentDictId] = useAtom(currentDictIdAtom)
  const [customDicts, setCustomDicts] = useState<CustomDict[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string>('')

  // 从 localStorage 加载自定义词典
  React.useEffect(() => {
    const saved = localStorage.getItem('customDicts')
    if (saved) {
      try {
        setCustomDicts(JSON.parse(saved))
      } catch (error) {
        console.error('加载自定义词典失败:', error)
      }
    }
  }, [])

  // 保存自定义词典到 localStorage
  const saveCustomDicts = (dicts: CustomDict[]) => {
    localStorage.setItem('customDicts', JSON.stringify(dicts))
    setCustomDicts(dicts)
  }

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportError('')

    try {
      const text = await file.text()
      let words: Word[] = []

      // 判断文件格式并解析
      if (file.name.endsWith('.json')) {
        // JSON 格式
        const data = JSON.parse(text)
        if (Array.isArray(data)) {
          words = data
        } else if (data.words && Array.isArray(data.words)) {
          words = data.words
        } else {
          throw new Error('JSON 格式不正确，请确保是单词数组或包含 words 字段的对象')
        }
      } else if (file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
        // TXT/CSV 格式 - 支持多种分隔符
        const lines = text.split('\n').filter((line) => line.trim())

        for (const line of lines) {
          // 尝试不同的分隔符：制表符、逗号、多个空格
          let parts: string[] = []

          if (line.includes('\t')) {
            parts = line.split('\t')
          } else if (line.includes(',')) {
            parts = line.split(',').map((p) => p.trim())
          } else {
            // 多个空格分隔
            parts = line.trim().split(/\s+/)
          }

          if (parts.length >= 1) {
            const word: Word = {
              name: parts[0].trim(),
              trans: parts.length > 1 ? [parts[1].trim()] : ['无释义'],
            }

            // 如果有音标信息
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
        throw new Error('不支持的文件格式，请上传 .json、.txt 或 .csv 文件')
      }

      if (words.length === 0) {
        throw new Error('文件中没有找到有效的单词数据')
      }

      // 创建自定义词典
      const newDict: CustomDict = {
        id: `custom_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''), // 移除文件扩展名
        words,
        createdAt: new Date().toLocaleString('zh-CN'),
      }

      // 保存词典
      const updatedDicts = [...customDicts, newDict]
      saveCustomDicts(updatedDicts)

      // 自动切换到新导入的词典
      setCurrentDictId(newDict.id)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : '导入失败，请检查文件格式')
    } finally {
      setIsImporting(false)
      // 重置文件输入
      event.target.value = ''
    }
  }

  // 删除自定义词典
  const deleteDict = (dictId: string) => {
    const updatedDicts = customDicts.filter((dict) => dict.id !== dictId)
    saveCustomDicts(updatedDicts)
  }

  // 使用自定义词典
  const handleUseDict = (dictId: string) => {
    setCurrentDictId(dictId)
  }

  // 导出词典模板
  const exportTemplate = () => {
    const template = [
      {
        name: 'hello',
        trans: ['你好，喂'],
        usphone: 'həˈloʊ',
        ukphone: 'həˈləʊ',
      },
      {
        name: 'world',
        trans: ['世界，地球'],
        usphone: 'wɜːrld',
        ukphone: 'wɜːld',
      },
      {
        name: 'apple',
        trans: ['苹果'],
        usphone: 'ˈæpəl',
        ukphone: 'ˈæpəl',
      },
    ]

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    saveAs(blob, '单词库模板.json')
  }

  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold text-gray-700">
          <IconFileDescription className="mr-2 inline-block" />
          自定义单词库
        </h3>
        <p className="mb-4 text-sm text-gray-600">导入您自己的单词库来练习。支持 JSON、TXT 和 CSV 格式。</p>
      </div>

      {/* 导入区域 */}
      <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-indigo-400">
        <div className="text-center">
          <IconCloudUpload className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <label htmlFor="dict-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">点击上传单词库文件</span>
            <span className="mt-1 block text-xs text-gray-500">支持 JSON、TXT、CSV 格式</span>
            <input
              id="dict-upload"
              name="dict-upload"
              type="file"
              className="sr-only"
              accept=".json,.txt,.csv"
              onChange={handleFileUpload}
              disabled={isImporting}
            />
          </label>
        </div>

        {isImporting && <div className="mt-4 text-center text-sm text-indigo-600">正在导入中...</div>}

        {importError && <div className="mt-4 text-center text-sm text-red-600">{importError}</div>}
      </div>

      {/* 帮助信息 */}
      <div className="mb-6 rounded-lg bg-blue-50 p-4">
        <h4 className="mb-2 text-sm font-semibold text-blue-900">文件格式说明：</h4>
        <div className="space-y-1 text-xs text-blue-800">
          <p>
            <strong>JSON 格式：</strong> [{"{name: '单词', trans: ['释义'], usphone: '美式音标', ukphone: '英式音标'}"}]
          </p>
          <p>
            <strong>TXT/CSV 格式：</strong> 每行一个单词，用制表符、逗号或空格分隔单词和释义
          </p>
          <p>
            <strong>示例：</strong> hello 你好 həˈloʊ həˈləʊ
          </p>
        </div>
        <button
          onClick={exportTemplate}
          className="mt-3 rounded bg-blue-600 px-3 py-1 text-xs text-white transition-colors hover:bg-blue-700"
        >
          <IconDownload className="mr-1 inline-block" />
          下载模板文件
        </button>
      </div>

      {/* 已导入的词典列表 */}
      {customDicts.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-700">已导入的单词库：</h4>
          <div className="space-y-2">
            {customDicts.map((dict) => (
              <div
                key={dict.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{dict.name}</div>
                  <div className="text-xs text-gray-500">
                    {dict.words.length} 个单词 · {dict.createdAt}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      handleUseDict(dict.id)
                    }}
                    className="rounded bg-indigo-600 px-3 py-1 text-xs text-white transition-colors hover:bg-indigo-700"
                  >
                    使用
                  </button>
                  <button
                    onClick={() => deleteDict(dict.id)}
                    className="p-1 text-red-600 transition-colors hover:text-red-800"
                    title="删除词典"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
