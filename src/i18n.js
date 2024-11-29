import { createI18n } from 'vue-i18n/index'
import messages from './lang'
import { getLang } from '@/api'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-TW',
  locale: getLang(),
  messages
})

export default i18n
