import { useTheme } from '@/components/ThemeProvider'
import Tooltip from '@/components/Tooltip'
import { currentThemeAtom } from '@/store'
import { themes } from '@/themes'
import * as Dialog from '@radix-ui/react-dialog'
import { useAtom } from 'jotai'
import React, { useState } from 'react'
import IconPalette from '~icons/tabler/palette'

export default function ThemeSelector() {
  const [currentThemeName, setCurrentThemeName] = useAtom(currentThemeAtom)
  const { changeThemeByName } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const currentTheme = themes.find((t) => t.name === currentThemeName) || themes[0]

  const handleThemeChange = (themeName: string) => {
    setCurrentThemeName(themeName)
    changeThemeByName(themeName)
    setIsOpen(false)
  }

  const getThemePreview = (theme: any) => {
    return {
      background: theme.colors.primary,
      accent: theme.colors.success,
      border: theme.colors.border,
    }
  }

  return (
    <>
      <Tooltip content="切换主题">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center rounded p-[2px] text-lg outline-none transition-colors duration-300 ease-in-out"
          style={{ color: currentTheme.colors.primary }}
          title="切换主题"
        >
          <IconPalette className="icon" />
        </button>
      </Tooltip>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:bg-gray-800">
            <Dialog.Title className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">选择主题</Dialog.Title>

            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>

            <div className="grid grid-cols-2 gap-4">
              {themes.map((theme) => {
                const preview = getThemePreview(theme)
                const isActive = currentTheme.name === theme.name

                return (
                  <button
                    key={theme.name}
                    onClick={() => handleThemeChange(theme.name)}
                    className={`relative rounded-lg border-2 p-4 transition-all duration-200 hover:scale-105 ${
                      isActive ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute right-2 top-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* 主题预览 */}
                    <div className="mb-3 flex h-16 overflow-hidden rounded-lg">
                      <div className="h-full flex-1" style={{ backgroundColor: preview.background }} />
                      <div className="h-full w-1/3" style={{ backgroundColor: preview.accent }} />
                    </div>

                    {/* 主题名称 */}
                    <div className="text-center">
                      <div className="font-medium text-gray-900 dark:text-white">{theme.displayName}</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{theme.colors.primary}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">主题说明</h4>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                <p>
                  • <span className="font-medium">彩虹校园</span> - 充满活力的紫罗兰主题
                </p>
                <p>
                  • <span className="font-medium">樱花校园</span> - 温柔可爱的粉色主题
                </p>
                <p>
                  • <span className="font-medium">海洋校园</span> - 清新自然的蓝色主题
                </p>
                <p>
                  • <span className="font-medium">向日葵校园</span> - 温暖明亮的黄色主题
                </p>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
