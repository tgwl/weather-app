<template>
  <div class="tab-bar">
    <router-link 
      v-for="item in tabList" 
      :key="item.path" 
      :to="item.path" 
      class="tab-item"
      active-class="active"
    >
      <!-- 图标区域 -->
      <div class="icon-wrapper">
        <span class="icon">{{ item.icon }}</span>
        <!-- 可选：如果有红点通知，可以加在这里 -->
      </div>
      <!-- 文字区域 -->
      <span class="text">{{ item.title }}</span>
    </router-link>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tabList = ref([
  { path: '/', title: '首页', icon: '🏠' },
  { path: '/about', title: '关于', icon: '👤' }
])
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px; /* 标准高度 */
  background-color: #ffffff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 500;
  
  /* 【关键】适配 iPhone 底部安全区域 (Home Indicator) */
  padding-bottom: env(safe-area-inset-bottom);
  /* 如果背景色不是白色，可能需要设置背景延伸至安全区 */
  /* padding-bottom: calc(env(safe-area-inset-bottom)); */ 
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #999999;
  font-size: 10px; /* 移动端字体通常较小 */
  flex: 1;
  height: 100%;
  /* 增加点击区域，提升用户体验 */
  min-width: 60px; 
  tap-highlight-color: transparent; /* 移除移动端点击高亮背景 */
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.icon {
  font-size: 20px;
  line-height: 1;
  transition: transform 0.2s;
}

.text {
  line-height: 1.2;
  font-weight: 500;
}

/* 激活状态样式 */
.tab-item.active {
  color: #007bff; /* 主题色 */
}

.tab-item.active .icon {
  transform: scale(1.1); /* 激活时图标微微放大 */
}
</style>