import { createStore } from 'vuex'
import exampleData from 'simple-mind-map/example/exampleData'
import { storeLocalConfig } from '@/api'

const store = createStore({
  state: {
    mindMapData: null, // 思維導圖數據
    isHandleLocalFile: false, // 是否操作的是本地文件
    localConfig: {
      // 本地配置
      isZenMode: false, // 是否是禪模式
      openNodeRichText: true, // 是否開啟節點富文本
      useLeftKeySelectionRightKeyDrag: false, // 鼠標行為
      isShowScrollbar: false // 是否顯示滾動條
    },
    activeSidebar: '', // 當前顯示的側邊欄
    isDark: false, // 是否是暗黑模式
    isOutlineEdit: false, // 是否是大綱編輯模式
    isReadonly: false, // 是否只讀
    userId: null,
    currentFileName: '',
  },
  mutations: {
    setCurrentFileName(state, fileName) {
      state.currentFileName = fileName
    },
    /*設定傳入的userID*/
    setUserId(state, userId) {
      state.userId = userId;
    },
    /**
     * @Author: 黃原寅
     * @Desc: 設置思維導圖數據
     */
    setMindMapData(state, data) {
      state.mindMapData = data
    },
    /**
     * @Author: 黃原寅
     * @Desc: 設置操作本地文件標誌位
     */
    setIsHandleLocalFile(state, data) {
      state.isHandleLocalFile = data
    },
    /**
     * @Author: 黃原寅
     * @Desc: 設置本地配置
     */
    setLocalConfig(state, data) {
      state.localConfig = {
        ...state.localConfig,
        ...data
      }
      storeLocalConfig(state.localConfig)
    },
    /**
     * @Author: 黃原寅
     * @Desc: 側邊欄的控制
     */
    setActiveSidebar(state, data) {
      state.activeSidebar = data
    },
    /**
     * @Author: 黃原寅
     * @Desc: 設置暗黑模式
     */
    setIsDark(state, data) {
      state.isDark = data
    },
    /**
     * @Author: 黃原寅
     * @Desc: 設置大綱編輯模式
     */
    setIsOutlineEdit(state, data) {
      state.isOutlineEdit = data
    },
    // 設置是否只讀
    setIsReadonly(state, data) {
      state.isReadonly = data
    },
    // 
  },
  actions: {
    updateCurrentFileName({ commit }, fileName) {
      commit('setCurrentFileName', fileName)
    },
    /**
     * @Author: 黃原寅
     * @Desc: 設置初始思維導圖數據
     */
    getUserMindMapData(ctx) {
      try {
        let { data } = {
          data: {
            data: {
              mindMapData: exampleData
            }
          }
        }
        ctx.commit('setMindMapData', data.data)
      } catch (error) {
        console.log(error)
      }
    }
  },
  getters: {
    currentFileName: state => state.currentFileName
  }
})

export default store
