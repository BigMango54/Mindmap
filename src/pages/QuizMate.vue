<template>
  <div class="container">
    <div class="logo-container">
      <!--img src="logo.png" alt="QuizMate Logo" class="logo"/-->
    </div>
    <h1 class="title">QuizMate</h1>
    <button @click.stop="googleSignin" class="google-button">Google 登入</button>
  </div>
</template>

<script>
import { googleTokenLogin } from "vue3-google-login";
import axios from 'axios';
import { mapMutations } from 'vuex';

export default {
  name: 'StartPage',
  methods: {
    ...mapMutations(['setUserId']),
    googleSignin() {
      googleTokenLogin().then(async (response) => {
        console.log(response.access_token);
        try {
          const res = await axios.post('http://localhost:5000/verify-token', { token: response.access_token });
          console.log(res.data);
          if (res.data.message === "Google sign-in success") {
            this.setUserId(res.data.user.id);  // 存儲 user_id 到 Vuex store
            this.$router.push('/index');  // 跳轉到 /index 頁面
          } else {
            console.error('Google 登錄失敗: ' + res.data.message);
          }
        } catch (error) {
          console.error('Error:', error.response ? error.response.data : error.message);
        }
      }).catch((error) => {
        console.error('Google sign-in failed:', error);
      });
    },
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap');

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes textColorChange {
  0% {
    color: #ffffff;
  }
  50% {
    color: hsl(0, 0%, 0%);
  }
  100% {
    color: #ffffff;
  }
}

body, html {
  height: 100%;
  margin: 0;
  font-family: Arial, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom, #dfd5fe, #bccdff); /* 垂直方向的漸層背景色 */
}

.container {
  text-align: center;
  animation: fadeIn 2s ease-in;
}

.logo-container {
  animation: rotate 4s linear infinite;
}

.logo {
  width: 100px;
  height: auto;
}

.title {
  font-size: 5em;
  margin: 20px 0;
  font-family: 'Poppins', sans-serif; /* 自定義字體 */
  animation: textColorChange 3s infinite; /* 顏色變化動畫 */
}

button {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  position: relative;
  background: #9b59b6;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2); /* 陰影效果 */
  border-radius: 25px;
  padding: 15px 30px;
  border: none; /* 去掉邊框 */
  margin-top: 10px; /* 增加標題和按鈕之間的間距 */
  transition: background-color 0.3s, transform 0.3s;
}

button:active {
  transform: scale(0.95);
}

.google-button {
  font-size: 24px;
  font-weight: bold;
  background-color: #ffffff;
  color: #000000;
  cursor: pointer;
  position: relative;

  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2); /* 陰影效果 */
  border-radius: 25px;
  padding: 15px 30px;
  border: none; /* 去掉邊框 */
  margin-top: 10px; /* 增加標題和按鈕之間的間距 */
  transition: background-color 0.3s, transform 0.3s;
}

.google-button:hover {
  color: #ffffff;
  background: #000000;
  transform: scale(1.05);
}

.google-button:active {
  transform: scale(0.95);
}
</style>