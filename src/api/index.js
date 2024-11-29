import exampleData from 'simple-mind-map/example/exampleData'
import { simpleDeepClone } from 'simple-mind-map/src/utils/index'
import Vue from 'vue'
import bus from '@/utils/bus.js'

const SIMPLE_MIND_MAP_DATA = 'SIMPLE_MIND_MAP_DATA'
const SIMPLE_MIND_MAP_LANG = 'SIMPLE_MIND_MAP_LANG'
const SIMPLE_MIND_MAP_LOCAL_CONFIG = 'SIMPLE_MIND_MAP_LOCAL_CONFIG'


// 創建Mindmap資料&激活
const copyMindMapTreeData = (tree, root) => {
  tree.data = simpleDeepClone(root.data)
  // tree.data.isActive = false
  tree.children = []
  if (root.children && root.children.length > 0) {
    root.children.forEach((item, index) => {
      tree.children[index] = copyMindMapTreeData({}, item)
    })
  }
  return tree
}

//獲取緩存的Mindmap資料
export const getData = () => {
  let store = localStorage.getItem(SIMPLE_MIND_MAP_DATA)
  if (store === null) {
    return simpleDeepClone(exampleData)
  } else {
    try {
      return JSON.parse(store)
    } catch (error) {
      return simpleDeepClone(exampleData)
    }
  }
}

//儲存Mindmap資料
export const storeData = data => {
  try {
    let originData = getData()
    originData.root = copyMindMapTreeData({}, data)
    bus.emit('write_local_file', originData)
    let dataStr = JSON.stringify(originData)
    localStorage.setItem(SIMPLE_MIND_MAP_DATA, dataStr)
  } catch (error) {
    console.log(error)
  }
}


//儲存Mindmap配置資料
export const storeConfig = config => {
  try {
    let originData = getData()
    originData = {
      ...originData,
      ...config
    }
    bus.emit('write_local_file', originData)
    let dataStr = JSON.stringify(originData)
    localStorage.setItem(SIMPLE_MIND_MAP_DATA, dataStr)
  } catch (error) {
    console.log(error)
  }
}

//儲存語言
export const storeLang = lang => {
  localStorage.setItem(SIMPLE_MIND_MAP_LANG, lang)
}

//獲取儲存語言
export const getLang = () => {
  return 'zh-TW';
}

//儲存本地配置
export const storeLocalConfig = config => {
  localStorage.setItem(SIMPLE_MIND_MAP_LOCAL_CONFIG, JSON.stringify(config))
}

//獲取本地配置
export const getLocalConfig = () => {
  let config = localStorage.getItem(SIMPLE_MIND_MAP_LOCAL_CONFIG)
  if (config) {
    return JSON.parse(config)
  }
  return null
}
