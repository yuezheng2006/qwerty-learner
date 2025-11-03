export interface Theme {
  name: string
  displayName: string
  colors: {
    // 主色调
    primary: string
    primaryHover: string
    primaryLight: string

    // 成功色
    success: string
    successLight: string

    // 警告色
    warning: string
    warningLight: string

    // 错误色
    error: string
    errorLight: string

    // 背景色
    background: string
    surface: string
    card: string

    // 文字色
    text: string
    textSecondary: string
    textLight: string

    // 边框色
    border: string
    borderLight: string

    // 特殊用途色
    correct: string
    incorrect: string
    highlight: string
  }
  gradients: {
    primary: string
    success: string
    background: string
  }
}

// 🌈 彩虹校园主题 - 适合中小学生的活泼主题
export const rainbowCampusTheme: Theme = {
  name: 'rainbow-campus',
  displayName: '彩虹校园',
  colors: {
    primary: '#8B5CF6', // 紫罗兰色
    primaryHover: '#7C3AED', // 深紫色
    primaryLight: '#DDD6FE', // 浅紫色

    success: '#10B981', // 翠绿色
    successLight: '#D1FAE5', // 浅绿色

    warning: '#F59E0B', // 橙色
    warningLight: '#FEF3C7', // 浅橙色

    error: '#EF4444', // 红色
    errorLight: '#FEE2E2', // 浅红色

    background: '#FAFAFA', // 浅灰背景
    surface: '#FFFFFF', // 白色表面
    card: '#FFFFFF', // 卡片白色

    text: '#1F2937', // 深灰文字
    textSecondary: '#6B7280', // 中灰文字
    textLight: '#9CA3AF', // 浅灰文字

    border: '#E5E7EB', // 边框灰
    borderLight: '#F3F4F6', // 浅边框

    correct: '#10B981', // 正确绿色
    incorrect: '#EF4444', // 错误红色
    highlight: '#FEF3C7', // 高亮黄色
  },
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    background: 'linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%)',
  },
}

// 🌸 樱花校园主题 - 温柔可爱主题
export const sakuraCampusTheme: Theme = {
  name: 'sakura-campus',
  displayName: '樱花校园',
  colors: {
    primary: '#EC4899', // 粉红色
    primaryHover: '#DB2777', // 深粉色
    primaryLight: '#FCE7F3', // 浅粉色

    success: '#14B8A6', // 青绿色
    successLight: '#CCFBF1', // 浅青色

    warning: '#F97316', // 橙色
    warningLight: '#FED7AA', // 浅橙色

    error: '#F43F5E', // 玫红色
    errorLight: '#FECACA', // 浅玫瑰色

    background: '#FFF5F5', // 粉白背景
    surface: '#FFFFFF', // 白色表面
    card: '#FFFFFF', // 卡片白色

    text: '#374151', // 深灰文字
    textSecondary: '#6B7280', // 中灰文字
    textLight: '#9CA3AF', // 浅灰文字

    border: '#FCE7F3', // 粉色边框
    borderLight: '#FDF2F8', // 浅粉色边框

    correct: '#14B8A6', // 正确青绿色
    incorrect: '#F43F5E', // 错误玫瑰色
    highlight: '#FEF3C7', // 高亮黄色
  },
  gradients: {
    primary: 'linear-gradient(135deg, #ff6ec7 0%, #f093fb 100%)',
    success: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
    background: 'linear-gradient(135deg, #fff5f5 0%, #fdf2f8 100%)',
  },
}

// 🌊 海洋校园主题 - 清新蓝色主题
export const oceanCampusTheme: Theme = {
  name: 'ocean-campus',
  displayName: '海洋校园',
  colors: {
    primary: '#3B82F6', // 天蓝色
    primaryHover: '#2563EB', // 深蓝色
    primaryLight: '#DBEAFE', // 浅蓝色

    success: '#10B981', // 绿色
    successLight: '#D1FAE5', // 浅绿色

    warning: '#F59E0B', // 橙色
    warningLight: '#FEF3C7', // 浅橙色

    error: '#EF4444', // 红色
    errorLight: '#FEE2E2', // 浅红色

    background: '#F0F9FF', // 蓝白背景
    surface: '#FFFFFF', // 白色表面
    card: '#FFFFFF', // 卡片白色

    text: '#1E293B', // 深蓝灰文字
    textSecondary: '#475569', // 中蓝灰文字
    textLight: '#64748B', // 浅蓝灰文字

    border: '#BFDBFE', // 蓝色边框
    borderLight: '#EFF6FF', // 浅蓝色边框

    correct: '#10B981', // 正确绿色
    incorrect: '#EF4444', // 错误红色
    highlight: '#FEF3C7', // 高亮黄色
  },
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #4facfe 100%)',
    success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
  },
}

// 🌻 向日葵校园主题 - 温暖黄色主题
export const sunflowerCampusTheme: Theme = {
  name: 'sunflower-campus',
  displayName: '向日葵校园',
  colors: {
    primary: '#F59E0B', // 金黄色
    primaryHover: '#D97706', // 深黄色
    primaryLight: '#FEF3C7', // 浅黄色

    success: '#10B981', // 绿色
    successLight: '#D1FAE5', // 浅绿色

    warning: '#F97316', // 橙色
    warningLight: '#FED7AA', // 浅橙色

    error: '#EF4444', // 红色
    errorLight: '#FEE2E2', // 浅红色

    background: '#FFFBEB', // 黄白背景
    surface: '#FFFFFF', // 白色表面
    card: '#FFFFFF', // 卡片白色

    text: '#374151', // 深灰文字
    textSecondary: '#6B7280', // 中灰文字
    textLight: '#9CA3AF', // 浅灰文字

    border: '#FDE68A', // 黄色边框
    borderLight: '#FFFBEB', // 浅黄色边框

    correct: '#10B981', // 正确绿色
    incorrect: '#EF4444', // 错误红色
    highlight: '#DBEAFE', // 高亮蓝色
  },
  gradients: {
    primary: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    background: 'linear-gradient(135deg, #fffbf0 0%, #fef3c7 100%)',
  },
}

// 默认主题集合
export const cottonCandyTheme: Theme = {
  name: 'cotton-candy',
  displayName: '🎀 奶油棉花糖',
  colors: {
    primary: '#FF9FCC',
    primaryHover: '#FF85C0',
    primaryLight: '#FFCCE6',
    success: '#7FE8A8',
    successLight: '#C8F7DC',
    warning: '#FFD699',
    warningLight: '#FFE8CC',
    error: '#FF9B9B',
    errorLight: '#FFCCCC',
    background: '#FFF8FC',
    surface: '#FFFFFF',
    card: '#FFFBFE',
    text: '#6B5B7A',
    textSecondary: '#9B8BA8',
    textLight: '#C4B5D0',
    border: '#FFD6E8',
    borderLight: '#FFF0F6',
    correct: '#7FE8A8',
    incorrect: '#FF9B9B',
    highlight: '#FFE8B6',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #FF9FCC 0%, #FFB3D9 100%)',
    success: 'linear-gradient(135deg, #7FE8A8 0%, #4FC97C 100%)',
    background: 'linear-gradient(135deg, #fff8fc 0%, #ffe6f0 100%)',
  },
}

export const rainbowCandyTheme: Theme = {
  name: 'rainbow-candy',
  displayName: '🌈 彩虹糖果',
  colors: {
    primary: '#FF6B9D',
    primaryHover: '#FF5588',
    primaryLight: '#FFB3D9',
    success: '#1DD1A1',
    successLight: '#A8EDEA',
    warning: '#FFD93D',
    warningLight: '#FFF5B8',
    error: '#FF6B6B',
    errorLight: '#FFB3B3',
    background: '#FFF5E1',
    surface: '#FFFFFF',
    card: '#FFFCF2',
    text: '#FF6B9D',
    textSecondary: '#FF8AB3',
    textLight: '#FFADD2',
    border: '#FFD1DC',
    borderLight: '#FFE8F0',
    correct: '#1DD1A1',
    incorrect: '#FF6B6B',
    highlight: '#FFD93D',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #FF6B9D 0%, #FF85B3 100%)',
    success: 'linear-gradient(135deg, #1DD1A1 0%, #10AC84 100%)',
    background: 'linear-gradient(135deg, #fff5e1 0%, #ffe8cc 100%)',
  },
}

// 默认使用彩虹校园主题
export const defaultTheme = rainbowCampusTheme

// 主题工具函数
export const getThemeCSSVariables = (theme: Theme) => {
  return {
    '--color-primary': theme.colors.primary,
    '--color-primary-hover': theme.colors.primaryHover,
    '--color-primary-light': theme.colors.primaryLight,
    '--color-success': theme.colors.success,
    '--color-success-light': theme.colors.successLight,
    '--color-warning': theme.colors.warning,
    '--color-warning-light': theme.colors.warningLight,
    '--color-error': theme.colors.error,
    '--color-error-light': theme.colors.errorLight,
    '--color-background': theme.colors.background,
    '--color-surface': theme.colors.surface,
    '--color-card': theme.colors.card,
    '--color-text': theme.colors.text,
    '--color-text-secondary': theme.colors.textSecondary,
    '--color-text-light': theme.colors.textLight,
    '--color-border': theme.colors.border,
    '--color-border-light': theme.colors.borderLight,
    '--color-correct': theme.colors.correct,
    '--color-incorrect': theme.colors.incorrect,
    '--color-highlight': theme.colors.highlight,
    '--gradient-primary': theme.gradients.primary,
    '--gradient-success': theme.gradients.success,
    '--gradient-background': theme.gradients.background,
  }
}
