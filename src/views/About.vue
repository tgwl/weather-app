<template>
  <div class="book-container">
    <!-- 背景环境 -->
    <div class="desk-surface"></div>
    
    <!-- 3D 书本主体 -->
    <div class="book" :class="{ 'is-mobile': isMobile }">
      
      <!-- 左页：联系与导航 -->
      <div class="page left-page">
        <div class="page-content">
          <div class="book-bindings"></div>
          
          <!-- 头像区域 -->
          <div class="avatar-frame">
            <div class="polaroid">
              <!-- 已清理 URL 空格 -->
              <img src="../assets/avatar.png" alt="Author" class="author-img" />
              <div class="polaroid-bottom"></div>
            </div>
          </div>
          
          <div class="chapter-label">CONNECT WITH ME</div>
          
          <!-- 博客与 Email 入口 -->
          <div class="links-container">
            <!-- 博客链接 (已清理 URL 空格) -->
            <a href="https://zezin.netlify.app/" target="_blank" class="action-link">
              <span class="link-icon">📰</span>
              <div class="link-text-group">
                <span class="link-title">博客</span>
                <span class="link-sub">阅读更多文章</span>
              </div>
              <span class="link-arrow">↗</span>
            </a>
  
            <!-- Email 链接 (请记得替换真实邮箱) -->
            <a href="tg2521150881@gmail.com" class="action-link">
              <span class="link-icon">✉️</span>
              <div class="link-text-group">
                <span class="link-title">Email</span>
                <span class="link-sub">发送邮件给我</span>
              </div>
              <span class="link-arrow">↗</span>
            </a>
          </div>
  
        </div>
      </div>
  
      <!-- 右页：内容页 (核心功能) -->
      <div class="page right-page">
        <div class="page-content">
          <div class="book-bindings"></div>
          
          <!-- 核心入口：作者随笔 -->
          <router-link to="/essays" class="essay-chapter">
            <div class="chapter-number">Chapter 01</div>
            <h2 class="chapter-title">开发随笔</h2>
            <p class="chapter-desc">点击此处，进入我的踩坑路程</p>
            <div class="read-indicator">
              <span>READ MORE</span>
              <span class="arrow">↓</span>
            </div>
          </router-link>
  
          <!-- 诗意金句 -->
          <div class="quote-section">
            <div class="quote-mark">“</div>
            <p class="quote-text">
              我别无所求，<br/>
              只想被阳光晒透
            </p>
            <div class="quote-author">— 《克林索尔的夏天》</div>
          </div>
  
          <!-- 底部微小信息 -->
          <div class="page-footer">
            <span>v1.0.0</span>
            <span>•</span>
            <span>Vue 3</span>
            <span class="disclaimer-mini">仅供学习交流</span>
          </div>
        </div>
      </div>
  
    </div>
    
    <!-- 版权信息 (已加强样式确保显示) -->
    <div class="global-copyright">
      &copy; {{ currentYear }} Made with 煜
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentYear = new Date().getFullYear()
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* --- 变量与基础设置 --- */
:root {
  --paper-color: #fdfbf7;
  --text-color: #2c2c2c;
  --accent-color: #8b5a2b;
  --shadow-color: rgba(0, 0, 0, 0.2);
}

.book-container {
  min-height: 100vh;
  width: 100%;
  background-color: #e8e6e1;
  background-image: radial-gradient(circle at 50% 30%, #f5f3ef 0%, #e8e6e1 100%);
  display: flex;
  flex-direction: column;
  justify-content: center; /* 垂直居中 */
  align-items: center;     /* 水平居中 */
  padding: 40px 20px 60px; /* 关键：增加底部 padding，给版权信息留出空间 */
  box-sizing: border-box;  /* 确保 padding 不增加总高度导致溢出 */
  font-family: "Songti SC", "SimSun", "Times New Roman", serif;
  position: relative;
}

/* --- 3D 书本容器 --- */
.book {
  position: relative;
  width: 800px;
  height: 550px;
  perspective: 1500px;
  display: flex;
  justify-content: center;
  transition: transform 0.5s ease;
  z-index: 1; /* 确保书本在背景之上 */
  flex-shrink: 0; /* 防止书本被压缩 */
}

/* 移动端适配 */
@media (max-width: 768px) {
  .book {
    flex-direction: column;
    width: 100%;
    max-width: 360px;
    height: auto;
    perspective: none;
    gap: 20px;
  }
  .page {
    transform: none !important;
    position: relative !important;
    margin: 0 !important;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }
  .left-page, .right-page {
    width: 100%;
    height: 520px;
  }
  .book-bindings {
    display: none;
  }
  .book-container {
    padding: 20px 10px 50px; /* 移动端也保留底部空间 */
    justify-content: flex-start; /* 移动端从顶部开始，避免上半部分被切 */
    padding-top: 40px;
  }
}

/* --- 书页通用样式 --- */
.page {
  width: 400px;
  height: 550px;
  background-color: #fdfbf7;
  position: relative;
  transform-style: preserve-3d;
  box-shadow: inset 0 0 30px rgba(0,0,0,0.05), 5px 5px 15px rgba(0,0,0,0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.left-page {
  border-radius: 4px 0 0 4px;
  transform: rotateY(-5deg);
  transform-origin: right center;
  margin-right: -2px;
  z-index: 1;
}

.right-page {
  border-radius: 0 4px 4px 0;
  transform: rotateY(5deg);
  transform-origin: left center;
  margin-left: -2px;
  z-index: 1;
  background-image: linear-gradient(to right, rgba(0,0,0,0.03) 0%, transparent 10%);
}

.page-content {
  padding: 30px 25px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: var(--text-color);
  position: relative;
  z-index: 2;
}

.book-bindings {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40px;
  background: linear-gradient(to right, rgba(0,0,0,0.15), transparent);
  pointer-events: none;
  z-index: 3;
}
.left-page .book-bindings { right: 0; }
.right-page .book-bindings { left: 0; background: linear-gradient(to left, rgba(0,0,0,0.15), transparent); }

/* --- 左页内容 --- */
.avatar-frame {
  margin: 20px 0 15px;
  transform: scale(0.9);
}

.polaroid {
  background: #fff;
  padding: 8px 8px 20px 8px;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.15);
  transform: rotate(-3deg);
  transition: transform 0.3s;
  display: inline-block;
}

.polaroid:hover {
  transform: rotate(0deg) scale(1.05);
}

.author-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  filter: sepia(20%);
  display: block;
  border-radius: 2px;
}

.chapter-label {
  font-size: 9px;
  letter-spacing: 2px;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 20px;
  font-family: sans-serif;
}

.links-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 10px;
}

.action-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  padding: 12px 15px;
  border: 1px dashed #ccc;
  border-radius: 6px;
  background: rgba(255,255,255,0.5);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.action-link:hover {
  border-color: var(--accent-color);
  background: rgba(139, 90, 43, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

.link-icon {
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.link-text-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.link-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  line-height: 1.2;
}

.link-sub {
  font-size: 10px;
  color: #888;
  margin-top: 2px;
  font-family: sans-serif;
}

.link-arrow {
  font-size: 14px;
  color: var(--accent-color);
  opacity: 0.6;
  transition: transform 0.3s;
}

.action-link:hover .link-arrow {
  transform: translateX(3px);
  opacity: 1;
}

/* --- 右页内容 --- */
.essay-chapter {
  text-decoration: none;
  color: inherit;
  display: block;
  margin-bottom: 30px;
  padding: 20px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  transition: all 0.3s;
  background: rgba(255,255,255,0.4);
  width: 100%;
  box-sizing: border-box;
}

.essay-chapter:hover {
  border-color: var(--accent-color);
  background: rgba(139, 90, 43, 0.05);
  transform: translateY(-2px);
}

.chapter-number {
  font-size: 10px;
  color: var(--accent-color);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-family: sans-serif;
}

.chapter-title {
  font-size: 24px;
  margin: 0 0 8px;
  font-weight: bold;
}

.chapter-desc {
  font-size: 12px;
  color: #666;
  margin: 0 0 15px;
  font-family: sans-serif;
}

.read-indicator {
  font-size: 10px;
  color: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-weight: bold;
  font-family: sans-serif;
}

.quote-section {
  position: relative;
  margin-top: auto;
  padding: 20px;
  background: rgba(0,0,0,0.02);
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
}

.quote-mark {
  position: absolute;
  top: 10px;
  left: 15px;
  font-size: 40px;
  color: rgba(139, 90, 43, 0.2);
  font-family: serif;
  line-height: 1;
}

.quote-text {
  font-size: 16px;
  line-height: 1.8;
  color: #444;
  margin: 10px 0;
  font-style: italic;
  position: relative;
  z-index: 1;
}

.quote-author {
  font-size: 10px;
  color: #888;
  text-align: right;
  margin-top: 10px;
  font-family: sans-serif;
}

.page-footer {
  margin-top: 15px;
  font-size: 10px;
  color: #aaa;
  display: flex;
  gap: 8px;
  align-items: center;
  font-family: sans-serif;
}

.disclaimer-mini {
  opacity: 0.7;
}

/* --- 版权信息 (修复显示问题) --- */
.global-copyright {
  margin-top: 30px; /* 增加与书本的间距 */
  margin-bottom: 10px; /* 确保底部有留白 */
  font-size: 13px;
  color: #777; /* 加深颜色，确保可见 */
  font-family: sans-serif;
  text-align: center;
  white-space: nowrap;
  z-index: 10;
  position: relative;
  text-shadow: 0 1px 2px rgba(255,255,255,0.8); /* 增加文字阴影，提升对比度 */
}

/* 桌面端微调 */
@media (min-width: 769px) {
  .global-copyright {
    margin-top: 40px;
  }
}
</style>