<template>
  <el-dialog custom-class="nodeImportDialog" v-model="dialogVisible" :title="$t('import.title')" width="600px">
    <el-upload
      ref="upload"
      action="x"
      :file-list="fileList"
      :auto-upload="false"
      :multiple="false"
      :on-change="onChange"
      :limit="1"
      :on-exceed="onExceed"
    >
      <el-button slot="trigger" size="default" type="primary">{{ $t('import.selectFile') }}</el-button>
      <div slot="tip" class="el-upload__tip">{{ $t('import.supportFile') }}</div>
    </el-upload>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">{{ $t('dialog.cancel') }}</el-button>
        <el-button type="primary" @click="confirm">{{ $t('dialog.confirm') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import bus from '@/utils/bus.js'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import markdown from 'simple-mind-map/src/parse/markdown.js'

const dialogVisible = ref(false)
const fileList = ref([])
const userId = ref(null)

// Watch dialog visibility and reset file list when closed
watch(
  () => dialogVisible.value,
  (val, oldVal) => {
    if (!val && oldVal) {
      fileList.value = []
    }
  }
)

// Mount and unmount lifecycle hooks
onMounted(() => {
  bus.on('showOCR', handleShowOCR)
})

onBeforeUnmount(() => {
  bus.off('showOCR', handleShowOCR)
})

const handleShowOCR = () => {
  dialogVisible.value = true
}

// Handle image files
const handleImg = async file => {
  const fileReader = new FileReader()
  fileReader.readAsArrayBuffer(file.raw)
  fileReader.onload = async evt => {
    try {
      const formData = new FormData()
      formData.append("file", new File([evt.target.result], file.raw.name, { type: file.raw.type }))
      formData.append('user_id', userId.value)

      const serverUrl = "http://localhost:5000/uploadImg"

      const response = await axios.post(serverUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const { markdown_content } = response.data
      if (!markdown_content) throw new Error('後端返回為null')

      const data = await markdown.transformMarkdownTo(markdown_content)
      bus.emit('setData', data)
      ElMessage({ message: '導入成功', type: 'success' })
    } catch (error) {
      console.error("Error:", error)
      ElMessage({ message: '文件解析失敗', type: 'error' })
    }
  }
}

const onChange = file => {
  const reg = /\.(jpg|png)$/
  if (!reg.test(file.name)) {
    ElMessage({
      message: '請選擇.jpg或.png文件',
      type: 'error'
    })
    fileList.value = []
  } else {
    fileList.value.push(file)
  }
}

const onExceed = () => {
  ElMessage({
    message: '最多只能選擇一個文件',
    type: 'warning'
  })
}

const cancel = () => {
  dialogVisible.value = false
}

const confirm = () => {
  if (fileList.value.length <= 0) {
    return ElMessage({
      message: '請選擇要導入的文件',
      type: 'warning'
    })
  }

  const file = fileList.value[0]
  handleImg(file)
  cancel()
}
</script>

<script>
export default {
  name: 'Import'
}
</script>

<style lang="less" scoped>
.el-upload__tip {
  margin: 0 0 0 5px;
}
</style>
