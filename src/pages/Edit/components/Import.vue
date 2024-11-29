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
import { useStore } from 'vuex'
import bus from '@/utils/bus.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import markdown from 'simple-mind-map/src/parse/markdown.js'
import { getData } from '../../../api'

const dialogVisible = ref(false)
const fileList = ref([])
const store = useStore()
const userId = ref(store.state.userId)  // 從 Vuex store 中設置 userId
const currentFileName = ref(store.state.currentFileName) // 從 Vuex store 中設置 currentFileName

watch(
  () => dialogVisible.value,
  (val, oldVal) => {
    if (!val && oldVal) {
      fileList.value = []
    }
  }
)

onMounted(() => {
  bus.on('showImport', handleShowImport)
  bus.on('handle_file_url', handleFileURL)
  bus.on('fileNameUpdated', updateFileName) // 監聽 fileNameUpdated 事件
  bus.on('updataDataBase', updateDatabase)
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  bus.off('showImport', handleShowImport)
  bus.off('handle_file_url', handleFileURL)
  bus.off('fileNameUpdated', updateFileName) // 移除 fileNameUpdated 事件的監聽
  bus.off('updataDataBase', updateDatabase)
  document.removeEventListener('keydown', handleKeyDown)
})

const handleShowImport = () => {
  dialogVisible.value = true
}

const updateFileName = (fileName) => {
  store.dispatch('updateCurrentFileName', fileName); // 更新 Vuex store 中的 currentFileName 
  currentFileName.value = fileName;
}

const handleFileURL = async () => {
  try {
    const fileURL = route.query.fileURL
    if (!fileURL) return
    const macth = /\.(smm|json|xmind|md|xlsx|pdf|mp3|jpg)$/.exec(fileURL)
    if (!macth) {
      return
    }
    const type = macth[1]
    const res = await fetch(fileURL)
    const file = await res.blob()
    const data = {
      raw: file
    }
    if (type === 'smm' || type === 'json') {
      handleSmm(data)
    } else if (type === 'xmind') {
      handleXmind(data)
    } else if (type === 'xlsx') {
      handleExcel(data)
    } else if (type === 'md') {
      handleMd(data)
    } else if (type === 'pdf') {
      handlePdf(data)
    } else if (type === 'mp3') {
      handleMp3(data)
    } else if (type === 'jpg' || type === 'png') {
      handleImg(data)
    }
  } catch (error) {
    console.log(error)
  }
}

const onChange = file => {
  let reg = /\.(smm|xmind|json|xlsx|md|pdf|mp3|jpg|png)$/
  if (!reg.test(file.name)) {
    ElMessage({
      message: '請選擇.smm、.json、.xmind、.xlsx、.md、.pdf、.mp3、jpg、png文件',
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

// 檢查文件是否存在 
const checkFileExists = async (fileName, userId) => {
  try {
    const response = await axios.post('http://localhost:5000/check_file_exists', {
      file_name: fileName,
      user_id: userId
    });
    console.log("check file is exists",response.data.exists)
    return response.data.exists;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

const confirm = async () => {
  if (fileList.value.length <= 0) {
    return ElMessage({
      message: '請選擇要導入的文件',
      type: 'warning'
    });
  }

  let file = fileList.value[0];
  
  // 確保 userId 不為 null  
  if (!userId.value) {
    return ElMessage({
      message: '無法獲取用戶ID，請重新登入',
      type: 'error'
    });
  }

  const fileExists = await checkFileExists(file.raw.name, userId.value);
  console.log(file.raw.name, userId.value)
  if (fileExists) {
    // 文件已存在，詢問用戶是否要覆蓋

    const confirmOverwrite = await ElMessageBox.confirm(
      '文件已存在，是否要覆蓋？',
      '文件存在',
      {
        confirmButtonText: '覆蓋',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).catch(() => false);

    if (!confirmOverwrite) {
      return;
    }
  }

  if (/\.(smm|json)$/.test(file.name)) {
    handleSmm(file);
  } else if (/\.xmind$/.test(file.name)) {
    handleXmind(file);
  } else if (/\.xlsx$/.test(file.name)) {
    handleExcel(file);
  } else if (/\.md$/.test(file.name)) {
    await handleMd(file, fileExists); // 傳遞 fileExists 作為覆蓋標誌
  } else if (/\.pdf$/.test(file.name)) {
    handlePdf(file);
  } else if (/\.mp3$/.test(file.name)) {
    handleMp3(file);
  } else if (/\.(jpg|png)$/.test(file.name)) {
    handleImg(file);
  }
  cancel();
};

const handleSmm = async file => {  // 加上 async
  let fileReader = new FileReader();
  fileReader.readAsText(file.raw);
  fileReader.onload = async evt => {  // 加上 async
    try {
      let data = JSON.parse(evt.target.result);
      if (typeof data !== 'object') {
        throw new Error('文件內容有誤');
      }
      bus.emit('setData', data);
      ElMessage({
        message: '導入成功',
        type: 'success'
      });
      updateFileName(file.raw.name);
      await updateDatabase();  // 等待資料庫更新完成
    } catch (error) {
      console.log(error);
      ElMessage({
        message: '文件解析失敗',
        type: 'error'
      });
    }
  };
  cancel();
};

const handleXmind = async file => {
  try {
    let data = await xmind.parseXmindFile(file.raw)
    bus.emit('setData', data)
    ElMessage({
      message: '導入成功',
      type: 'success'
    })
    updateFileName(file.raw.name)
    await updateDatabase();
  } catch (error) {
    console.log(error)
    ElMessage({
      message: '文件解析失敗',
      type: 'error'
    })
  }
}

const handleExcel = async file => {
  try {
    const wb = read(await fileToBuffer(file.raw))
    const data = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
      header: 1
    })
    if (data.length <= 0) {
      return
    }
    let max = 0
    data.forEach(arr => {
      if (arr.length > max) {
        max = arr.length
      }
    })
    let layers = []
    let walk = layer => {
      if (!layers[layer]) {
        layers[layer] = []
      }
      for (let i = 0; i < data.length; i++) {
        if (data[i][layer]) {
          let node = {
            data: {
              text: data[i][layer]
            },
            children: [],
            _row: i
          }
          layers[layer].push(node)
        }
      }
      if (layer < max - 1) {
        walk(layer + 1)
      }
    }
    walk(0)
    let getParent = (arr, row) => {
      for (let i = arr.length - 1; i >= 0; i--) {
        if (row >= arr[i]._row) {
          return arr[i]
        }
      }
    }
    for (let i = 1; i < layers.length; i++) {
      let arr = layers[i]
      for (let j = 0; j < arr.length; j++) {
        let item = arr[j]
        let parent = getParent(layers[i - 1], item._row)
        if (parent) {
          parent.children.push(item)
        }
      }
    }
    bus.emit('setData', layers[0][0])
    ElMessage.success('導入成功')
    updateFileName(file.raw.name)
    await updateDatabase();
  } catch (error) {
    console.log(error)
    ElMessage.error('文件解析失敗')
  }
}

const handleMd = async (file, overwrite = false) => {
  let fileReader = new FileReader();
  fileReader.readAsText(file.raw);
  fileReader.onload = async evt => {
    try {
      // 上傳 Markdown 文件到 Firebase Storage
      const formData = new FormData();
      formData.append('file', new File([evt.target.result], file.raw.name, { type: file.raw.type }));
      formData.append('user_id', userId.value); // 傳遞 user_id
      formData.append('overwrite', overwrite ? 'true' : 'false'); // 傳遞覆蓋標誌

      const serverUrl = 'http://localhost:5000/upload/mindmap';  // 修改這裡的 URL 

      console.log('Uploading file to server...');
      const response = await axios.post(serverUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('File uploaded successfully, processing response...');
      const markdownContent = response.data.markdown_content;
      console.log('markdownContent is :', markdownContent);
      if (!markdownContent) {
        throw new Error('後端返回為null');
      }
      console.log('Response data:', markdownContent);
      let data = await markdown.transformMarkdownTo(markdownContent);
      console.log('setData:', data);
      bus.emit('setData', data);
      ElMessage({
        message: '導入成功',
        type: 'success'
      });
      updateFileName(file.raw.name)
      await updateDatabase();
    } catch (error) {
      console.log('Error:', error);
      ElMessage({
        message: '文件解析失敗',
        type: 'error'
      });
    }
  };
};

const handlePdf = async file => {
  let fileReader = new FileReader();  
  fileReader.readAsArrayBuffer(file.raw);
  fileReader.onload = async evt => {
    try {
      const formData = new FormData();
      formData.append("file", new File([evt.target.result], file.raw.name, { type: file.raw.type }));
      formData.append('user_id', userId.value); // 傳遞 user_id
      const serverUrl = "http://localhost:5000/uploadPdf"; 

      console.log("Uploading file to server...");
      const response = await axios.post(serverUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("File uploaded successfully, processing response...");
      const { markdown_content } = response.data;
      if (!markdown_content) {
        throw new Error('後端返回為null');
      }
      console.log("Response data:", markdown_content);
      let data = await markdown.transformMarkdownTo(markdown_content);
      console.log("setData:", data);
      bus.emit('setData', data);

      ElMessage({
        message: '導入成功',
        type: 'success'
      });
      updateFileName(file.raw.name);
      await updateDatabase();
    } catch (error) {
      console.log("Error:", error);
      ElMessage({
        message: '文件解析失敗',
        type: 'error'
      });
    }
  };
};

const handleMp3 = async file => {
  let fileReader = new FileReader();  
  fileReader.readAsArrayBuffer(file.raw);
  fileReader.onload = async evt => {
    try {
      const formData = new FormData();
      formData.append("file", new File([evt.target.result], file.raw.name, { type: file.raw.type }));
      formData.append('user_id', userId.value); // 傳遞 user_id
      const serverUrl = "http://localhost:5000/uploadMp3"; 

      console.log("Uploading file to server...");
      const response = await axios.post(serverUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("File uploaded successfully, processing response...");

      // 確保從 response.data 中獲取正確的 markdown_content
      const { markdown_content } = response.data;
      if (!markdown_content) {
        throw new Error('後端返回為null');
      }

      console.log("Response data:", markdown_content);
      let data = await markdown.transformMarkdownTo(markdown_content);
      console.log("setData:", data);
      bus.emit('setData', data);
      ElMessage({
        message: '導入成功',
        type: 'success'
      });
      updateFileName(file.raw.name)
      await updateDatabase();
    } catch (error) {
      console.log("Error:", error);
      ElMessage({
        message: '文件解析失敗',
        type: 'error'
      });
    }
  };
}

const handleImg = async file => {
  let fileReader = new FileReader();  
  fileReader.readAsArrayBuffer(file.raw);
  fileReader.onload = async evt => {
    try {
      const formData = new FormData();
      formData.append("file", new File([evt.target.result], file.raw.name, { type: file.raw.type }));
      formData.append('user_id', userId.value); // 傳遞 user_id
      const serverUrl = "http://localhost:5000/uploadImg"; 

      console.log("Uploading file to server...");
      const response = await axios.post(serverUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("File uploaded successfully, processing response...");

      // 確保從 response.data 中獲取正確的 markdown_content
      const { markdown_content } = response.data;
      if (!markdown_content) {
        throw new Error('後端返回為null');
      }

      console.log("Response data:", markdown_content);
      let data = await markdown.transformMarkdownTo(markdown_content);
      console.log("setData:", data);
      bus.emit('setData', data);
      ElMessage({
        message: '導入成功',
        type: 'success'
      });
      updateFileName(file.raw.name)
      await updateDatabase();
    } catch (error) {
      console.log("Error:", error);
      ElMessage({
        message: '文件解析失敗',
        type: 'error'
      });
    }
  };
}

const handleKeyDown = (event) => {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault();  // 阻止瀏覽器預設的保存行為
    handleSave();
  }
};

const handleSave = async () => {
  try {
    await ElMessageBox.confirm(
      '保存更新？',
      '確認',
      {
        confirmButtonText: '確認',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    await updateDatabase();
    ElMessage({
      type: 'success',
      message: '資料庫更新成功'
    });
  } catch (error) {
    if (error !== 'cancel') {
      console.error('資料庫更新失敗:', error);
      ElMessage({
        type: 'error',
        message: '資料庫更新失敗'
      });
    }
  }
};

// 更新上傳md文件的資料
const updateDatabase = async () => {
  try {
    const dataUrl = await mindMap.export('json', false, 'test.json', true);
    console.log("dataUrl:", dataUrl, "type:", typeof dataUrl);

    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
      // 將 data URL 轉換為 Blob
      const blob = dataURLtoBlob(dataUrl);

      // 將 Blob 轉換為文本
      const text = await blob.text();
      console.log("Original text:", text);

      // const jsonString = text.replace(/'/g, '"');
      const jsonString = text.replace(/"([^"]*?)":\s*'([^']*?)'/g, '"$1":"$2"');
      console.log("Modified JSON string:", jsonString);

      // 創建新的 Blob
      const newBlob = new Blob([jsonString], { type: 'application/json' });
      await uploadBlob(newBlob);
    } else {
      throw new Error("Invalid data format returned from mindMap.export");
    }

  } catch (error) {
    console.error("Error processing data:", error);
  }
};

const uploadBlob = async (blob) => {
  try {
    bus.emit('fileNameReset', store.state.currentFileName)
    const formData = new FormData();
    formData.append("file", new File([blob], store.state.currentFileName, { type: "application/json" }));
    formData.append('user_id', userId.value);
    console.log('FormData content:');
    for (var pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    console.log('Uploading update to server...');
    const response = await axios.post('http://localhost:5000/uploadJson', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });
    console.log("File uploaded successfully, processing response...");
    console.log(response.data);
  } catch (error) {
    console.error("Error uploading data:", error);
  }
};

// 將 data URL 轉換為 Blob 的函數
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
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