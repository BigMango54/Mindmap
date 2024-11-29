<template>
  <el-dialog custom-class="HyperlinkDialog" v-model="dialogVisible" :title="$t('youtube影片連結')">
    <div class="item">
      <span class="name">{{ $t('網址：') }}</span>
      <el-input v-model="linkTitle" size="small" @keyup.native.stop @keydown.native.stop></el-input>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">{{ $t('dialog.cancel') }}</el-button>
        <el-button type="primary" @click="confirm">{{ $t('dialog.confirm') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue'
import bus from '@/utils/bus.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios' 
import markdown from 'simple-mind-map/src/parse/markdown.js'
import { useStore } from 'vuex'
/**
 * @Author: 黄原寅
 * @Desc: 超链接内容设置
 */
const dialogVisible = ref(false)
const link = ref('')
const linkTitle = ref('')
const activeNodes = ref([])
const protocol = ref('https')
const store = useStore()
const userId = ref(null)  // 添加 userId 變量

onMounted(() => {
  userId.value = store.state.userId  // 從 Vuex store 中設置 userId
  bus.on('showLink', handleShowLink)
})

onBeforeMount(() => {
  bus.off('showLink', handleShowLink)
})



const removeProtocol = url => {
  return url.replace(/^https?:\/\//, '')
}

const handleUrl = setProtocolNoneIfNotExist => {
  const res = linkTitle.value.match(/^(https?):\/\//)
  if (res && res[1]) {
    protocol.value = res[1]
  } else if (!linkTitle.value) {
    protocol.value = 'https'
  } else if (setProtocolNoneIfNotExist) {
    protocol.value = 'none'
  }
  linkTitle.value = removeProtocol(linkTitle.value)
}

const handleShowLink = () => {
  linkTitle.value = ''  // 重置linkTitle為空
  bus.emit('startTextEdit')
  dialogVisible.value = true
}

/**
 * @Author: 黄原寅
 * @Desc: 取消
 */
const cancel = () => {
  dialogVisible.value = false
  bus.emit('endTextEdit')
}

/**
 * @Author: 黄原寅
 * @Desc:  确定
 */
 const confirm = async () => {
  try {
    const formData = new FormData();
    formData.append("file", linkTitle.value);
    formData.append('user_id', userId.value); // 傳遞 user_id
    const serverUrl = "http://localhost:5000/uploadLink"; 
    console.log(linkTitle.value)

    console.log("Uploading file to server...");
    const response = await axios.post(serverUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("File uploaded successfully, processing response...");

    // 確保從 response.data 中獲取正確的 markdown_content
      const { markdown_content, video_title, yt_Url} = response.data;
      if (!markdown_content) {
        throw new Error('後端返回為null');
      }

      console.log("Response data:", markdown_content);
      console.log("fuckkkkkkk", yt_Url);
      const yt_code = yt_Url.split('=')[1]
      
      
      let data = await markdown.YTtransformMarkdownTo(markdown_content, yt_code);
      console.log("setData:", data);
      bus.emit('setData', data);
      ElMessage({
        message: '導入成功',
        type: 'success'
      });
      bus.emit('fileNameUpdated', video_title)
      bus.emit('updataDataBase', )
  } catch (error) {
    console.log("Error:", error);
    ElMessage({
      message: '文件解析失敗',
      type: 'error'
    });
  }
  cancel()
}

</script>

<script>
export default {
  name: 'Hyperlink'
}
</script>

<style lang="less" scoped>
.HyperlinkDialog {
  .item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    .name {
      display: block;
      width: 50px;
    }
  }
}
</style>