<template>
  <div class="toolbarContainer" :class="{ isDark: isDark }">
    <!-- 側邊欄 -->
    <div class="sidebar" :class="{ open: isSidebarOpen, isDark: isDark }">
      <!-- 文件列表 -->
      <div v-if="showFileList" class="file-list-container" :class="{ isDark: isDark }">
        <p v-if="!files.length" class="no-files">沒有可顯示的檔案</p>
        <ul v-else class="file-list" :class="{ isDark: isDark }">
          <li v-for="file in files" :key="file.id" class="file-item" :class="{ isDark: isDark }">
            <span @click="fetchFileContent(file.id)" class="file-name">{{ file.file_name }}</span>
            <div class="file-options" :class="{ isDark: isDark }">
              <button
                v-if="!file.showOptions"
                @click.stop="toggleFileOptions(file.id)"
                class="more-options-btn"
                :class="{ isDark: isDark }"
                aria-label="更多選項"
              >
                ⋮
              </button>
              <button
                v-else
                @click.stop="confirmDeleteFile(file.id, file.file_name)"
                class="delete-btn" :class="{ isDark: isDark }"
                aria-label="刪除"
              >
                刪除
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <!-- 主內容區域 -->
    <div class="main-content" :class="{ Open: isSidebarOpen }">
      <button class="toggle-btn" :class="{ isDark: isDark }" @click="toggleSidebar" @mouseover="showTooltip = true" @mouseleave="showTooltip = false">
        <span class="icon">&#9776;</span>
        <span class="tooltip" v-if="showTooltip"></span>
      </button>

      <!-- 文件內容顯示區域 -->
      <div v-if="fileContent">
        <h2>檔案內容</h2>
        <div>{{ fileContent }}</div>
      </div>
    </div>
    <!-- 工具欄 -->
    <div class="toolbar" ref="toolbarRef">
      <div class="logo" @click="goToRoot">
        QuizMate
      </div>
      <!-- 顯示當前檔案名稱 -->
      <div class="current-file-name" :class="{ isDark: isDark }" id="fileName" contenteditable="false" @click="editFileName">{{ currentFileName }}</div>
      <!-- 節點操作 -->
      <div class="toolbarBlock toolbar-bottom" :class="{ isDark: isDark }">
        <ToolbarNodeBtnList :list="horizontalList"></ToolbarNodeBtnList>
        <!-- 更多 -->
        <el-popover v-model="popoverShow" placement="bottom-end" width="120" trigger="hover" v-if="showMoreBtn" style="margin-left: 20px">
          <ToolbarNodeBtnList dir="v" :list="verticalList" @click.native="popoverShow = false"></ToolbarNodeBtnList>
          <div slot="reference" class="toolbarBtn">
            <span class="icon iconfont icongongshi"></span>
            <span class="text">{{ $t('toolbar.more') }}</span>
          </div>
        </el-popover>
      </div>
      <!-- 通用操作 -->
      <div class="toolbarBlock">
        <div class="toolbarBtn" :class="{ isDark: isDark }" @click="emit('showOCR')">
          <span class="icon iconfont iconquanping"></span>
          <span class="text">掃瞄</span>
        </div>
        <div class="toolbarBtn" :class="{ isDark: isDark }" @click="emit('showLink')">
          <span class="icon iconfont iconchaolianjie"></span>
          <span class="text">{{ $t('toolbar.link') }}</span>
        </div>
        <div class="toolbarBtn" :class="{ isDark: isDark }" @click="emit('showImport')">
          <span class="icon iconfont icondaoru"></span>
          <span class="text">{{ $t('toolbar.import') }}</span>
        </div>
        <div class="toolbarBtn" :class="{ isDark: isDark }" @click="emit('showExport')">
          <span class="icon iconfont iconexport"></span>
          <span class="text">{{ $t('toolbar.export') }}</span>
        </div>
      </div>
    </div>
    <!-- 操作說明按鈕 (Toggle Guide Button) -->
    <button
      class="toggle-guide-btn"
      :class="{ isDark: isDark }"
      @click="toggleGuideVisibility"
    >
      <span class="icon" style="font-size: 12px; margin-right: 5px;">&#128712;</span> <!-- 信息图标 -->
      {{ isGuideVisible ? '關閉說明' : '說明' }}
    </button>

 <!-- 操作說明區域 (User Guide Section) -->
 <div
      class="user-guide"
      :class="{ open: isGuideVisible }"
      :style="{
        backgroundColor: isGuideVisible ? (isDark ? '#2e2e2e' : '#f8f9fa') : 'transparent'
      }"
    >
      <div v-if="isGuideVisible" class="guide-content" :class="{ isDark: isDark }">
        <!-- Guide Content Here -->
        <h3>操作說明</h3>
        <ul>
          <li v-for="(item, index) in guideItems" :key="index">
            <div @click="toggleGuideItem(index)" style="cursor: pointer;">
              <span v-if="item.isOpen">▼</span>
              <span v-else>▶</span>
               {{ item.title }}
            </div>
            <transition name="fade">
              <div v-show="item.isOpen">
                <div v-for="(content, idx) in item.contents" :key="idx">
                  <img v-if="content.type === 'image'" :src="content.src" class="guide-image" :alt="content.alt">
                  <div v-else-if="content.type === 'text'" v-html="content.value"></div>
                </div>
              </div>
            </transition>
          </li>
        </ul>
      </div>
    </div>
    <NodeImage></NodeImage>
    <NodeHyperlink></NodeHyperlink>
    <NodeIcon></NodeIcon>
    <NodeNote></NodeNote>
    <NodeTag></NodeTag>
    <Export></Export>
    <Import></Import>
    <Hyperlink></Hyperlink>
    <OCR></OCR>
    <ConfirmDeleteDialog
      :visible="isDeleteDialogVisible"
      :fileName="currentFileName"
      @cancel="isDeleteDialogVisible = false"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>


<script>
import { ref } from 'vue'
import { mapState, useStore } from 'vuex'
import axios from 'axios'
import { ElNotification } from 'element-plus'
import exampleData from 'simple-mind-map/example/exampleData'
import { getData } from '../../../api'
import bus from '@/utils/bus.js'
import ToolbarNodeBtnList from './ToolbarNodeBtnList.vue'
import { throttle } from 'simple-mind-map/src/utils/index'
import NodeImage from './NodeImage'
import NodeHyperlink from './NodeHyperlink'
import NodeIcon from './NodeIcon'
import NodeNote from './NodeNote'
import NodeTag from './NodeTag'
import Export from './Export'
import Import from './Import'
import Hyperlink from './Hyperlink'
import OCR from './OCR'
import { useRouter } from 'vue-router'
import { fromMarkdown } from 'mdast-util-from-markdown'

let fileHandle = null
export default {
  name: 'Toolbar',
  components: {
    NodeImage,
    NodeHyperlink,
    NodeIcon,
    NodeNote,
    NodeTag,
    Export,
    Import,
    Hyperlink,
    OCR,
    ToolbarNodeBtnList
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    const currentFileName = ref(store.state.currentFileName)
    return { router, store, currentFileName }
  },
  data() {
    return {
      list: [
        'back',
        'forward',
        //'painter',
        'siblingNode',
        'childNode',
        'deleteNode',
        //'image',
        //'icon',
        //'link',
        'note',
        //'tag',
        //'summary',
        //'associativeLine',
        //'formula'
      ],
      horizontalList: [],
      verticalList: [],
      files: [],
      showFileList: false,
      showMoreBtn: true,
      popoverShow: false,
      isSidebarOpen: false,
      showTooltip: false,
      fileContent: '',
      isGuideVisible: false,
      guideItems: [
        {
          title: "檔案上傳",
          isOpen: false,
          contents: [
            { type: "image", src: require('@/assets/img/import.png'), alt: "檔案匯入" },
            { type: "text", value: "掃描<br>- 可辨識pdf手寫文字<br>" },
            { type: "text", value: "超連結<br>- 上傳youtube影片連結<br>" },
            { type: "text", value: "匯入<br>- 可處理多種格式<br>☑上傳成功後系統會自動生成心智圖<br>" },
            
          ]
        },
        {
          title: "心智圖更新存檔",
          isOpen: false,
          contents: [
            { type: "text", value: "按ctrl+S即可保存變更" }
          ]
        },
        {
          title: "心智圖匯出 ",
          isOpen: false,
          contents: [
            { type: "image", src: require('@/assets/img/export.png'), alt: "心智圖匯出" },
            { type: "text", value: "下載心智圖至裝置保存<br>支援多種格式<br>" }
          ]
        },
        {
          title: "心智圖樣式變更",
          isOpen: false,
          contents: [
            { type: "image", src: require('@/assets/img/mindmapStyle.jpg'), alt: "心智圖樣式" },
            { type: "text", value: "節點樣式<br>- 針對個別節點樣式編輯<br>" },
            { type: "text", value: "基礎樣式<br>- 設置網頁背景等細節<br>" },
            { type: "text", value: "主題<br>- 一鍵切換所有節點及背景<br>" },
            { type: "text", value: "結構<br>- 具多種心智圖架構可更換<br>" },
            { type: "text", value: "大綱<br>- 簡易呈現心智圖目前架構<br>" },
            { type: "text", value: "快捷鍵<br>- 提供網頁快捷鍵操作資訊<br>" }
          ]
        },
        {
          title: "心智圖節點編輯",
          isOpen: false,
          contents: [
            { type: "text", value: "選取一個節點即可啟用<br>" },
            { type: "image", src: require('@/assets/img/backAndNext.jpg'), alt: "前後步" },
            { type: "text", value: "- 調整心智圖模樣至前、後一步狀態<br>" },
            { type: "image", src: require('@/assets/img/addNode.jpg'), alt: "新增節點" },
            { type: "text", value: "- 新增同級節點<br>- 新增子節點<br>" },
            { type: "image", src: require('@/assets/img/deleteAndNote.jpg'), alt: "刪除與注釋" },
            { type: "text", value: "- 刪除節點<br>- 編輯節點注釋<br>" }
          ]
        },
        {
          title: "檔名編輯",
          isOpen: false,
          contents: [
            { type: "image", src: require('@/assets/img/fileNameEdit.jpg'), alt: "檔名編輯" },
            { type: "text", value: "點擊畫面上方檔名進行編輯<br>再點擊空白處即保存<br>" }
          ]
        },
        {
          title: "檔案列表操作",
          isOpen: false,
          contents: [
          { type: "text", value: "點擊畫面左上角圖標即開啟" },
            { type: "text", value: "點選檔名切換不同心智圖" },
            { type: "image", src: require('@/assets/img/selectFile.jpg'), alt: "選取檔案" },
            { type: "text", value: "點擊更多選項鍵啟用刪除鍵" },
            { type: "image", src: require('@/assets/img/deleteFile.jpg'), alt: "刪除檔案" },
            { type: "text", value: "點擊刪除鍵後於提醒視窗確認即可刪除檔案" }
          ]
        },
        {
          title: "小工具介紹",
          isOpen: false,
          contents: [
            { type: "image", src: require('@/assets/img/toolsLeft.jpg'), alt: "左半部小工具" },
            { type: "text", value: "- 系統切換中、英文<br>" },
            { type: "text", value: "- 輸入文字搜尋節點<br>" },
            { type: "text", value: "- 切換滑鼠左右鍵各自代表的拖曳畫面、選取節點的功能<br>" },
            { type: "text", value: "- 開啟畫面小地圖<br>" },
            { type: "text", value: "- 切換編輯、閱讀模式<br>" },
            { type: "image", src: require('@/assets/img/toolsRight.jpg'), alt: "右半部小工具" },
            { type: "text", value: "- 全螢幕檢視模式<br>" },
            { type: "text", value: "- 全螢幕編輯模式<br>" },
            { type: "text", value: "- 心智圖大小縮放<br>" },
            { type: "text", value: "- 切換深、淺色模式" },
            { type: "text", value: "<br>" }
          ]
        }
      ]
    };
  },
  computed: {
    ...mapState(['isHandleLocalFile', 'isDark']),
    ...mapState(['userId']),
  },
  watch: {
    isHandleLocalFile(val) {
      if (!val) {
        ElNotification.closeAll()
      }
    }
  },
  created() {
    bus.on('write_local_file', this.onWriteLocalFile)
  },
  mounted() {
    this.computeToolbarShow()
    this.computeToolbarShowThrottle = throttle(this.computeToolbarShow, 300)
    window.addEventListener('resize', this.computeToolbarShowThrottle)
    bus.on('lang_change', this.computeToolbarShowThrottle)
    bus.on('fileNameReset', this.resetFileName)
    document.addEventListener('click', this.handleClickOutside); // 修改檔案名稱
    const logo = document.querySelector('.logo');
      if (this.isSidebarOpen) {
        logo.classList.add('sidebar-open');
      }
  },
  beforeDestroy() {
    bus.off('write_local_file', this.onWriteLocalFile)
    window.removeEventListener('resize', this.computeToolbarShowThrottle)
    bus.off('lang_change', this.computeToolbarShowThrottle)
    bus.off('fileNameReset', this.resetFileName)
    document.removeEventListener('click', this.handleClickOutside); // 修改檔案名稱所用
  },
  methods: {
    async fetchFiles() {
      if (!this.userId) {
        console.error('User ID not found');
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/files?user_id=${this.userId}`);
        const data = await response.json();
        if (data.success) {
          this.files = data.files;
          this.showFileList = true;
        } else {
          console.error('Error fetching files:', data.message);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    },
    toggleGuideVisibility() {
      this.isGuideVisible = !this.isGuideVisible;
    },
    toggleFiles() {
      this.showFileList = !this.showFileList;
      if (this.showFileList) {
        this.fetchFiles();
      }
    },
    resetFileName(fileName) {
      this.currentFileName = fileName
      this.toggleFiles();
    },
    async fetchFileContent(fileId) {
      try {
        const userId = this.userId; // 確保這裡正確獲取到 userId
        const response = await fetch(`http://localhost:5000/api/file?file_id=${fileId}&user_id=${userId}`);
        const data = await response.json();
        console.log("Fetched data:", data);
        if (data.success) {
          if (data.file && data.file.content) {
            const content = data.file.content;
            this.currentFileName = data.file.file_name; // 設置當前檔案名稱
            console.log("Current file name:", this.currentFileName); // 打印當前檔案名稱以確認
            let transformedData;
            try {
              transformedData = JSON.parse(content);
            } catch (error) {
              console.error('Error parsing content to JSON:', error);
              transformedData = content;
            }
            console.log("Transformed data:", transformedData);
            bus.emit('setData', transformedData);
            bus.emit('fileNameUpdated', this.currentFileName); // 發送事件，傳遞檔案名稱
          } else {
            console.error('File content is missing:', data.file);
          }
        } else {
          console.error('Error fetching file content:', data.message);
        }
      } catch (error) {
        console.error('Error fetching file content:', error);
      }
    },
    /*操作說明 */
    toggleGuideItem(index) {
      this.guideItems[index].isOpen = !this.guideItems[index].isOpen;
    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
      // 新增
      const logo = document.querySelector('.logo');
      if (this.isSidebarOpen) {
        logo.classList.add('sidebar-open');
        this.fetchFiles()
      } else {
        logo.classList.remove('sidebar-open');
      }
      // 新增結束
    },
    computeToolbarShow() {
      const windowWidth = window.innerWidth - 40
      const all = [...this.list]
      let index = 1
      const loopCheck = () => {
        if (index > all.length) return done()
        this.horizontalList = all.slice(0, index)
        this.$nextTick(() => {
          const width = this.$refs.toolbarRef.getBoundingClientRect().width
          if (width < windowWidth) {
            index++
            loopCheck()
          } else if (index > 0 && width > windowWidth) {
            index--
            this.horizontalList = all.slice(0, index)
            done()
          }
        })
      }
      const done = () => {
        this.verticalList = all.slice(index)
        this.showMoreBtn = this.verticalList.length > 0
      }
      loopCheck()
    },
    onWriteLocalFile(content) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.writeLocalFile(content)
      }, 1000)
    },
    async openLocalFile() {
      try {
        let [_fileHandle] = await window.showOpenFilePicker({
          types: [
            {
              description: '',
              accept: {
                'application/json': ['.smm']
              }
            }
          ],
          excludeAcceptAllOption: true,
          multiple: false
        })
        if (!_fileHandle) {
          return
        }
        fileHandle = _fileHandle
        if (fileHandle.kind === 'directory') {
          this.$message.warning(this.$t('toolbar.selectFileTip'))
          return
        }
        this.readFile()
      } catch (error) {
        console.log('error', error)
        if (error.toString().includes('aborted')) {
          return
        }
        this.$message.warning(this.$t('toolbar.notSupportTip'))
      }
    },
    onPainterStart() {
      this.isInPainter = true
    },
    onPainterEnd() {
      this.isInPainter = false
    },
    async readFile() {
      let file = await fileHandle.getFile()
      let fileReader = new FileReader()
      fileReader.onload = async () => {
        this.$store.commit('setIsHandleLocalFile', true)
        this.setData(fileReader.result)
        ElNotification.closeAll()
        ElNotification({
          title: this.$t('toolbar.tip'),
          message: `${this.$t('toolbar.editingLocalFileTipFront')}${file.name}${this.$t('toolbar.editingLocalFileTipEnd')}`,
          duration: 0,
          showClose: true
        })
      }
      fileReader.readAsText(file)
    },
    setData(str) {
      try {
        let data = JSON.parse(str)
        if (typeof data !== 'object') {
          throw new Error(this.$t('toolbar.fileContentError'))
        }
        if (data.root) {
          this.isFullDataFile = true
        } else {
          this.isFullDataFile = false
          data = {
            ...exampleData,
            root: data
          }
        }
        bus.emit('setData', data)
      } catch (error) {
        console.log(error)
        this.$message.error(this.$t('toolbar.fileOpenFailed'))
      }
    },
    async writeLocalFile(content) {
      if (!fileHandle || !this.isHandleLocalFile) {
        return
      }
      if (!this.isFullDataFile) {
        content = content.root
      }
      let string = JSON.stringify(content)
      const writable = await fileHandle.createWritable()
      await writable.write(string)
      await writable.close()
    },
    async createNewLocalFile() {
      await this.createLocalFile(exampleData)
    },
    async saveLocalFile() {
      let data = getData()
      await this.createLocalFile(data)
    },
    async createLocalFile(content) {
      try {
        let _fileHandle = await window.showSaveFilePicker({
          types: [
            {
              description: '',
              accept: { 'application/json': ['.smm'] }
            }
          ],
          suggestedName: this.$t('toolbar.defaultFileName')
        })
        if (!_fileHandle) {
          return
        }
        const loading = this.$loading({
          lock: true,
          text: this.$t('toolbar.creatingTip'),
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        fileHandle = _fileHandle
        this.$store.commit('setIsHandleLocalFile', true)
        this.isFullDataFile = true
        await this.writeLocalFile(content)
        await this.readFile()
        loading.close()
      } catch (error) {
        console.log(error)
        if (error.toString().includes('aborted')) {
          return
        }
        this.$message.warning(this.$t('toolbar.notSupportTip'))
      }
    },
    emit: (...agrs) => bus.emit(...agrs),
    goToRoot() {
      this.router.push('/');
    },
    editFileName(event) {
      const target = event.target;
      target.setAttribute('contenteditable', 'true');
      target.focus();
    },
    async saveFileName(event) {
      const target = event.target;
      target.setAttribute('contenteditable', 'false');
      const fileName = target.textContent;
      console.log('Saving file name:', fileName);
      const formData = new FormData();
      formData.append('user_id', this.userId);
      formData.append('file_id', this.currentFileName);
      formData.append('file_Name', fileName);

      try {
        const response = await axios.post('http://localhost:5000/saveFileName', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        if(response.data.success) {
          this.$store.dispatch('updateCurrentFileName', response.data.new_file_name)
          this.currentFileName = response.data.new_file_name
          console.log('Response data:', response.data);
          this.$message.success('檔案名稱已成功更新');
        } else {
          throw new Error(response.data.message)
        }
        this.toggleFiles();
      } catch (error) {
        console.error('Error saving file name:', error);
        if (error.response && error.response.status === 409) {
          this.$message.error(`錯誤：${error.response.data.message}`);
        } else {
          this.$message.error('保存檔案名稱時發生錯誤');
        }
        // 回復原來的檔案名稱
        target.textContent = this.currentFileName;
      }
    },
    handleClickOutside(event) {
      const fileNameElement = document.getElementById('fileName');
      if (fileNameElement && !fileNameElement.contains(event.target) && fileNameElement.getAttribute('contenteditable') === 'true') {
        this.saveFileName({ target: fileNameElement });
      }
      // 處理文件選項菜單
      this.files.forEach(file => {
      if (file.showOptions && !event.target.closest('.file-options')) {
          file.showOptions = false;
        }
      });
    },
    toggleFileOptions(fileId) {
      this.files = this.files.map(file => {
        if (file.id === fileId) {
          file.showOptions = !file.showOptions;
        } else {
          file.showOptions = false;
        }
        return file;
      });
    },
    async confirmDeleteFile(fileId) {
      const confirmed = confirm('確定要刪除這個檔案嗎？');
      if (confirmed) {
        this.deleteFile(fileId);
      }
    },
    async deleteFile(fileId) {
      if (!this.userId) {
        console.error('User ID not found');
        return;
      }
      const formData = new FormData();
      formData.append('user_id', this.userId);
      formData.append('file_id', fileId);  
      console.log('目前要刪除的檔案名稱', fileId)
      try {
        const response = await axios.post('http://localhost:5000/deleteFile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
        });
        if (response.data.success) {
          this.files = this.files.filter(file => file.id !== fileId);
          this.$message.success('檔案已成功刪除');
        } else {
          console.error('Error deleting file:', response.data.message);  
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    },
    transformMarkdownTo(md) {
      const tree = fromMarkdown(md)
      let root = {
        children: []
      }
      let childrenQueue = [root.children]
      let currentChildren = root.children
      let depthQueue = [-1]
      let currentDepth = -1

      for (let i = 0; i < tree.children.length; i++) {
        let cur = tree.children[i];
        if (cur.type === 'heading') {
          if (!cur.children[0]) continue;
          let node = {};
          node.data = {
            text: cur.children[0].value
          };
          node.children = [];

          if (i + 1 < tree.children.length && tree.children[i + 1].type === 'paragraph') {
            node.data.note = tree.children[i + 1].children.map(child => child.value).join(' ');
            i++;
          }

          if (cur.depth > currentDepth) {
            currentChildren.push(node);
            childrenQueue.push(node.children)
            currentChildren = node.children
            depthQueue.push(cur.depth)
            currentDepth = cur.depth
          } else if (cur.depth === currentDepth) {
            childrenQueue.pop()
            currentChildren = childrenQueue[childrenQueue.length - 1]
            depthQueue.pop()
            currentDepth = depthQueue[depthQueue.length - 1]
            currentChildren.push(node)
            childrenQueue.push(node.children)
            currentChildren = node.children
            depthQueue.push(cur.depth)
            currentDepth = cur.depth
          } else {
            while (depthQueue.length) {
              childrenQueue.pop()
              currentChildren = childrenQueue[childrenQueue.length - 1]
              depthQueue.pop()
              currentDepth = depthQueue[depthQueue.length - 1]
              if (currentDepth < cur.depth) {
                currentChildren.push(node)
                childrenQueue.push(node.children)
                currentChildren = node.children
                depthQueue.push(cur.depth)
                currentDepth = cur.depth
                break
              }
            }
          }
        } else if (cur.type === 'list') {
          currentChildren.push(...handleList(cur))
        }
      }
      return root.children[0]
    }
  }
}
</script>

<style lang="less" scoped>

.toolbarContainer {
  font-family: 'Poppins', sans-serif; /* 自定義字體 */
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: space-between; /* 確保元素之間均勻分佈 */
  padding: 0 20px;
  top: 0;
  left: 0; /* 確保背景覆蓋整個螢幕 */
  right: 0;
  z-index: 2;
  transition: left 0.3s ease;
  background-color: white;
  /*background: linear-gradient(to top, #ece5fe, #d3dfff);*/
  background-color: transparent;
}

@keyframes textColorChange {
  0% {
    color:  #a4bcff;
  }
  50% {
    color:  #ccb8ff;
  }
  100% {
    color:  #a4bcff;
  }
}

.logo {
  position: fixed;
  left: 80px;
  font-size: 25px;
  font-family: 'Poppins', sans-serif; /* 自定義字體 */
  font-weight: normal;
  color: #ffffff; /* 修改文字顏色以與背景形成對比 */
  cursor: pointer;
  animation: textColorChange 4s infinite; /* 顏色變化動畫 */
}

.current-file-name {
  position: fixed;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  padding: 10px 20px;
  font-weight: normal;
  color: #000;
  padding: 7px;
  border-radius: 10px;
  min-width: 120px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Poppins', sans-serif; /* 自定義字體 */
  &.isDark{
    color: #ffffff;
  }
}

.current-file-name:hover {
  background: rgb(232, 232, 232);
  position: fixed;
  cursor: pointer;
  font-size: 20px;
  font-family: 'Poppins', sans-serif; /* 自定義字體 */
  font-weight: bold;
  color: #000;
  padding: 7px;
  border-radius: 10px;
  min-width: 120px;
  left: 50%;
  transform: translateX(-50%);
  &.isDark {
    background: rgba(140, 140, 140, 0.18);
    color: #ffffff;
  }
}

.toolbar {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: rgba(26, 26, 26, 0.8); /* 修改文字顏色以與背景形成對比 */
}

.toolbarBlock {
  display: flex;
  background: transparent; /* 使用半透明背景 */
  padding: 10px 20px;
  border-radius: 6px;
  box-shadow: none;
  margin-right: 0px;

  &:last-of-type {
    margin-right: 0;
  }

  &.toolbar-bottom-hover { /* 添加這個類 */
    display: none; /* 初始時隱藏 */
  }
}

.toolbarBlock:hover .toolbar-bottom-hover { /* 懸停顯示 */
  display: flex;
}


.toolbarBtn {
  border: none;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 15px;
  flex-shrink: 0;
  padding: 10px 10px;
  background: linear-gradient(to bottom, #ede6ff, #d6e3ff;);
  border-radius: 10px; /* 調整圓角半徑 */
  /*box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加陰影 */
  box-shadow: none; /* 移除陰影 */
  transition: background 0.3s, color 0.3s, box-shadow 0.3s; /* 添加陰影過渡效果 */
  &.isDark {
    background: #262a2e;
    color: #dadada;
    &:hover:not(.disabled) {
    background: #34383d;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1); 
    /*box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); /* 懸停時加強陰影 */
    }
    .icon {
      color: #dadada;
    }
  }
  

  &:last-of-type {
    margin-right: 0;
  }

  &:hover:not(.disabled) {
    background: linear-gradient(to bottom, #ded8ee, #c7d2e9;);
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1); 
    /*box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); /* 懸停時加強陰影 */
  }

  &.active {
    background: #f5f5f5;
  }

  &.disabled {
    color: #bcbcbc;
    cursor: not-allowed;
    pointer-events: none;
    box-shadow: none; /* 禁用時去掉陰影 */
  }

  .icon {
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    margin-right: 1px;
    background: transparent;
    color: rgb(0, 0, 0);
    border-radius: 50%; /* 調整圖標為圓形 */
  }

  .text {
    margin-top: 0;
    font-weight: bold;
  }
}


body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  height: 100vh; /* 確保背景覆蓋整個螢幕高度 */
}

#app {
  display: flex;
}

.sidebar {
  width: 250px;
  background-color: #f8f9fa; /* 調整背景色 */
  color: #333;
  position: fixed;
  left: -250px;
  top: 0;
  height: 100%;
  overflow-y: auto; /* 啟用垂直滾動 */
  transition: left 0.3s ease;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 2;
  &.isDark {
    background-color: #2e2e2e;
    color: #ffffff;
  }
}

.sidebar.open {
  left: 0;
}
/* 新增滾輪樣式 */
.sidebar::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: #c5c5c5;
  border-radius: 10px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background-color: #a5a5a5;
}



.file-list-container {
  padding-top: 20px;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.file-item {

  font-size: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center; /* 確保垂直對齊 */
  padding: 10px;
  border-bottom: 1px solid #ddd; /* 增加底部邊框 */
  cursor: pointer;
  transition: background-color 0.3s;
}

.file-item:hover {
  font-size: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center; /* 確保垂直對齊 */  
  font-size: 20px;

  background-color: #eeeeee; /* 懸停背景色 */
  &.isDark{
    background: rgba(255, 255, 255, 0.18);
    color: #ffffff;
  }
}

.file-name {
  font-size: 18px;
  flex-grow: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin-right: 5px;
  line-height: 1; /* 確保行高一致 */
}


.file-options {
  display: flex;
  align-items: center; /* 確保垂直對齊 */
  position: relative;
}

.more-options-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #888;
  transition: color 0.3s;
  box-shadow: none; /* 移除陰影 */
  padding: 10px 20px;
  width: auto; /* 自適應寬度 */
  border-radius: 12px; /* 調整圓角半徑 */
  white-space: nowrap;
  display: flex;
  align-items: center; /* 確保垂直對齊*/
  margin-top: 2px;
  &.isDark {
    color: #9f9f9f;
  }
}

.more-options-btn:hover {
  color: #000000;
  background: rgb(224, 224, 224);
  font-size: 20px;
  &.isDark {
    color: #ffffff;
    background: rgb(119, 119, 119);  
  }
}

.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px; /* 調整字體大小 */
  color: #ff0000;
  transition: color 0.3s;
  box-shadow: none; /* 移除陰影 */
  padding: 10px 20px;
  border-radius: 12px; /* 調整圓角半徑 */
  width: auto; /* 自適應寬度 */
  white-space: nowrap; /* 防止換行 */
  margin-top: 1px;
  &.isDark {
    color: #fd5353;
  }
}

.delete-btn:hover {
  box-shadow: none; /* 移除陰影 */
  background: rgb(232, 232, 232);
  color: #ff0000;
  &.isDark {
    background: rgb(119, 119, 119);  
    color: #fd5353;
  }
}


.no-files {
  color: #888;
  font-size: 14px;
}

.toggle-btn {
  position: fixed;
  top: 2px;
  left: 20px;
  background-color: transparent;
  color: #333;
  border: none;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  box-shadow: none; /* 移除陰影 */
  transition: background 0.3s; /* 過渡效果 */
  &.isDark {
    color: #897e7e;
  }
}

.toggle-btn:hover {
  background: #e2e6ea;
}

.toggle-btn .icon {
  font-size: 20px;
}

.toolbar-bottom {
  background-color: #ffffff;
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 12px; /* 調整圓角半徑 */
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1); /* 調整陰影 */
  display: flex;
  align-items: center;
  justify-content: center; /* 中央對齊 */
  width: auto; /* 自適應寬度 */
  max-width: 90%; /* 設置最大寬度 */
  transition: box-shadow 0.3s, background-color 0.3s; /* 過渡效果 */
  &.isDark {
    background: #2c2e35;
    
  }
}

.toolbar-bottom:hover {
  box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.15); /* 懸停時加強陰影 */
}

.toolbar-bottom .toolbarBtn {
  margin-right: 10px; /* 調整按鈕之間的間距 */
}

.toolbar-bottom .toolbarBtn:last-of-type {
  margin-right: 0;
}

.main-content {
  flex: 1;
  padding: 20px;
  transition: margin-left 0.3s ease;
  margin-left: 0;
}

.main-content.sidebarOpen {
  margin-left: 250px;
}

.main-content.sidebarOpen .toolbarContainer {
  left: 250px;
  width: calc(100% - 250px);
}

.main-content .toggle-btn {
  position: fixed;
  top: 2px;
  left: 20px;
  background-color: transparent;
  color: rgb(0, 0, 0);
  border: none;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  box-shadow: none; /* 移除陰影 */
  transition: background 0.3s; /* 過渡效果 */
  &.isDark {
    color: rgb(255, 255, 255);
  }
}

.main-content .toggle-btn:hover {
  background: rgb(232, 232, 232, 0.18);
  &.isDark {
    background: rgba(140, 140, 140, 0.18);
  }
}

.main-content .toggle-btn .icon {
  font-size: 20px;
}

.user-guide {
  position: fixed;
  left: 0px; /* Adjust based on your layout needs */
  bottom: -1000px; /* Start hidden below the screen */
  width: 250px;
  height: 600px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  transition: bottom 0.3s ease, background-color 0.3s ease; /* Added bottom transition for sliding effect */
  z-index: 3;
  overflow-y: auto;
}

/* 新增滾輪樣式 */
.user-guide::-webkit-scrollbar {
  width: 8px;
}

.user-guide::-webkit-scrollbar-thumb {
  background-color: #c5c5c5;
  border-radius: 10px;
}

.user-guide::-webkit-scrollbar-thumb:hover {
  background-color: #a5a5a5;
}

.user-guide.open {
  bottom: 16px; /* Slide up into view */
  left: 0px;
}

.toggle-guide-btn {
  padding: 10px;
  border-radius: 10px;
  font-size: 12px;
  flex-shrink: 0;
  font-family: PingFangSC-Regular, PingFang SC;
  background-color: #ffffff;
  position: fixed;
  bottom: 20px;
  left: 16px; /* Adjust the position as needed */
  z-index: 4; /* Higher than user-guide to ensure visibility */
  display: flex;
  color: rgb(76, 76, 76);
  cursor: pointer;
  height: 40px;
  box-shadow: none;

  &.isDark {
    background-color: #2c2e35;
    color: hsl(0, 0%, 36%);
  }
}

.toggle-guide-btn:hover {
  background: #e2e6ea;

  &.isDark {
    background: rgb(140, 140, 140);
  }
}

.guide-content {
  max-height: 500px; /* Set a maximum height for the content area */
  margin-top: 10px;
  font-size: 18px;
  color: rgb(139, 139, 139);
  line-height: 1.6;
}

.guide-title {
  cursor: pointer;
  font-weight: bold;
  padding: 10px 0;
}

.guide-details {
  margin-top: 10px;
}

.guide-image {
  max-width: 100%; /* 確保圖片不會超出父元素的寬度 */
  height: auto; /* 保持圖片的比例 */
  margin-bottom: 10px; /* 添加圖片和文本之間的間距 */
}

.collapse-enter-active,
.collapse-leave-active {
  transition: max-height 0.3s ease;
}

.collapse-enter,
.collapse-leave-to {
  max-height: 0;
  overflow: hidden;
}

.guide-content h3{
  text-align: left; /* 靠左對齊文字 */
  padding-left: 10px;

}

.guide-content li{
  justify-content: space-between;
  align-items: center; /* 確保垂直對齊 */
  padding: 10px 0;
  color: rgb(139, 139, 139);
  cursor: pointer;
  line-height: 1.8; /* 調整行高 */
  text-align: left; /* 靠左對齊文字 */
  padding-left: 10px;
}


</style>
