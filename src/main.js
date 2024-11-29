import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/icon-font/iconfont.css'
import '@/assets/icon-font/iconfont.css'
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'
import i18n from './i18n.js'

// 引入 vue3-google-login
import vue3GoogleLogin from 'vue3-google-login'

// Google 登錄
const GoogleLoginOptions = { 
  clientId: '376299672022-hs90pkc8sqrjc59si6no7psea00f9m2n.apps.googleusercontent.com' 
}

const app = createApp(App)

app.config.productionTip = false

// 使用 Google 登錄
app.use(vue3GoogleLogin, GoogleLoginOptions)
   .use(ElementPlus)
   .use(VueViewer)
   .use(store)
   .use(router)
   .use(i18n)
   .mount('#app')
