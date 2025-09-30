import enUS from './locales/en-US.json'
import zhCN from './locales/zh-CN.json'

export const supportedLocales = ['en-US', 'zh-CN']

export const messages = {
  'en-US': enUS,
  'zh-CN': zhCN
}

export function translate(locale, key) {
  const targetLocale = supportedLocales.includes(locale) ? locale : 'en-US'
  const segments = key.split('.')
  let current = messages[targetLocale]

  for (const segment of segments) {
    if (current && Object.prototype.hasOwnProperty.call(current, segment)) {
      current = current[segment]
    } else {
      current = null
      break
    }
  }

  if (typeof current === 'string') {
    return current
  }

  // 尝试使用英文作为回退
  if (targetLocale !== 'en-US') {
    return translate('en-US', key)
  }

  return key
}
