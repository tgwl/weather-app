import { createApp } from 'vue'
import App from './App.vue'

// 1. 引入 router 实例
import router from './router' 

const app = createApp(App)

// 2. 【重要】注册 router 插件
// 这一步会让 <router-view> 和 <router-link> 全局可用
app.use(router)

app.mount('#app')