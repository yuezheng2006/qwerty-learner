import Tooltip from '@/components/Tooltip'
import { currentDictIdAtom } from '@/store'
import * as Dialog from '@radix-ui/react-dialog'
import { saveAs } from 'file-saver'
import { useAtom } from 'jotai'
import { useState } from 'react'
import IconCloudUpload from '~icons/tabler/cloud-upload'
import IconX from '~icons/tabler/x'

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

export default function DictImportButton() {
  const [, setCurrentDictId] = useAtom(currentDictIdAtom)
  const [isOpen, setIsOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')

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
        name: file.name.replace(/\.[^/.]+$/, ''),
        words,
        createdAt: new Date().toLocaleString('zh-CN'),
      }

      const updatedDicts = [...existingCustomDicts, newDict]
      localStorage.setItem('customDicts', JSON.stringify(updatedDicts))

      setCurrentDictId(newDict.id)
      setImportSuccess(`成功导入 ${words.length} 个单词！`)

      // 刷新页面以更新词典列表
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : '导入失败')
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
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

  return (
    <>
      <Tooltip content="导入自定义词典">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center rounded p-[2px] text-lg text-indigo-500 outline-none transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white"
          title="导入自定义词典"
        >
          <IconCloudUpload className="icon" />
        </button>
      </Tooltip>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] dark:bg-gray-800">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">导入自定义词典</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              支持上传 JSON、TXT、CSV 格式的单词文件
            </Dialog.Description>

            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <IconX className="h-4 w-4" />
            </button>

            <div className="mt-6">
              <div className="mb-4 rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-indigo-400">
                <div className="text-center">
                  <IconCloudUpload className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                  <label htmlFor="dict-upload-modal" className="cursor-pointer">
                    <span className="block text-sm font-medium text-gray-900 dark:text-white">点击选择文件</span>
                    <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">支持 .json、.txt、.csv</span>
                    <input
                      id="dict-upload-modal"
                      name="dict-upload-modal"
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

                {importSuccess && <div className="mt-4 text-center text-sm text-green-600">{importSuccess}</div>}
              </div>

              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <h4 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">格式说明：</h4>
                <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                  <p>
                    <strong>TXT格式：</strong>单词 [制表符/逗号] 释义 [音标]
                  </p>
                  <p>
                    <strong>示例：</strong>hello 你好 həˈloʊ
                  </p>
                </div>
                <button
                  onClick={exportTemplate}
                  className="mt-3 rounded bg-blue-600 px-3 py-1 text-xs text-white transition-colors hover:bg-blue-700"
                >
                  下载模板
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
