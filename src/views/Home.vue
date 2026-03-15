<template>
    <div class="app-container">
      <!-- 调试按钮 -->
      <button class="debug-btn" @click="showDebug = !showDebug">⚙️</button>
      <div v-if="showDebug" class="debug-panel">
        <h4>🛠️ 调试工具箱</h4>
        
        <!-- 模式切换 -->
        <div style="margin-bottom: 15px; padding: 10px; background: #f0f7ff; border-radius: 8px;">
          <label style="display: flex; align-items: center; cursor: pointer; font-size: 14px; font-weight: 600; color: #007AFF;">
            <input type="checkbox" v-model="dragModeEnabled" style="margin-right: 8px; width: 16px; height: 16px;" />
            🎯 开启拖拽定位模式
          </label>
          <p style="font-size: 11px; color: #666; margin: 5px 0 0 24px; line-height: 1.4;">
            开启后，可拖动地图上的红色靶心 🎯 到任意位置。
          </p>
        </div>
  
        <!-- 🆕 地址搜索输入框 (带联想) -->
        <div style="margin-bottom: 15px; position: relative;">
          <p style="font-size: 12px; color:#666; margin-bottom:5px; font-weight:600;">📍 输入地址定位：</p>
          
          <div style="display:flex; gap:5px; position: relative;">
            <input 
              ref="addressInputRef"
              v-model="addressInput" 
              @input="handleAddressInput"
              @focus="showSuggestions = true"
              @blur="hideSuggestionsDelayed"
              @keydown.enter="selectFirstSuggestion"
              placeholder="例：北京朝阳公园 / 上海外滩" 
              style="flex:1; padding:8px; border:1px solid #ddd; border-radius:6px; font-size:13px; outline: none;"
              :class="{ 'input-active': showSuggestions && suggestions.length > 0 }"
            />
            <button 
              @click="searchAddressAndLocate" 
              :disabled="isSearchingAddress || !addressInput.trim()"
              style="padding:8px 12px; background:#007AFF; color:white; border:none; border-radius:6px; cursor:pointer; white-space:nowrap; font-size:13px; opacity: 1; transition: opacity 0.2s;"
              :style="{ opacity: isSearchingAddress || !addressInput.trim() ? 0.6 : 1 }"
            >
              {{ isSearchingAddress ? '...' : '查询' }}
            </button>
          </div>
  
          <!-- 💡 联想提示列表 -->
          <div v-if="showSuggestions && suggestions.length > 0" class="suggestion-list">
            <div 
              v-for="(item, index) in suggestions" 
              :key="index"
              class="suggestion-item"
              @mousedown.prevent="selectSuggestion(item)"
            >
              <span class="suggestion-icon">📍</span>
              <div class="suggestion-content">
                <div class="suggestion-name">{{ item.name }}</div>
                <div class="suggestion-address">{{ item.address }}</div>
              </div>
            </div>
            <div v-if="suggestions.length === 0 && addressInput.trim()" class="suggestion-empty">
              未找到相关地点
            </div>
          </div>
          
          <p v-if="addressError" style="color:#ff4d4f; font-size:11px; margin-top:4px;">{{ addressError }}</p>
        </div>
  
        <!-- 手动输入坐标 (折叠/备用) -->
        <details style="margin-bottom: 10px; font-size: 12px; color: #666;">
          <summary style="cursor: pointer; margin-bottom: 5px;">或直接输入经纬度 (高级)</summary>
          <div style="display:flex; gap:5px; margin-top:5px;">
            <input v-model.number="debugLat" placeholder="纬度" style="flex:1; padding:4px; border:1px solid #eee; border-radius:4px;" />
            <input v-model.number="debugLng" placeholder="经度" style="flex:1; padding:4px; border:1px solid #eee; border-radius:4px;" />
          </div>
          <button @click="applyDebugLocation" style="width:100%; margin-top:5px; padding:6px; background:#f0f0f0; color:#333; border:none; border-radius:4px; cursor:pointer;">应用坐标</button>
        </details>
        
        <button @click="useCurrentBrowserLocation" style="width:100%; padding:6px; background:#f0f0f0; color:#333; border:none; border-radius:6px; cursor:pointer; font-size:12px;">🔄 重试浏览器原生定位</button>
      </div>
  
      <!-- 1. 加载状态 -->
      <div v-if="loading" class="overlay">
        <div class="loader-circle"></div>
        <p class="loading-text">{{ loadingText }}</p>
        <div v-if="lowAccuracyWarning" class="warning-box">
          ⚠️ 检测到定位偏差较大 (>{{ lowAccuracyWarning }}米)<br>
          建议开启右上角 ⚙️ 的<strong>拖拽定位模式</strong>或<strong>输入地址</strong>手动修正。
        </div>
      </div>
  
      <!-- 2. 阴天模式 -->
      <div v-else-if="!isSunny && weatherData.city" class="status-page rainy">
        <div class="glass-card">
          <div class="icon-large">☁️</div>
          <h1>今天不太适合户外</h1>
          <p class="sub-text">{{ weatherData.city }} · {{ weatherData.weather }}</p>
          <div class="temp-big">{{ weatherData.temperature }}°C</div>
          <p class="advice-text">外面正在{{ weatherData.weather }}，不如在室内休息吧。</p>
          <button @click="resetApp" class="btn-outline">刷新天气</button>
        </div>
      </div>
  
      <!-- 3. 晴天模式 -->
      <div v-else-if="isSunny" class="map-page">
        <div id="map-container" ref="mapContainer"></div>
  
        <!-- 📍 定位按钮 -->
        <button 
          class="location-btn" 
          :class="{ 'locating': isLocating, 'error': locationError }"
          @click="relocateUser"
          title="回到我的位置"
        >
          <span class="loc-icon" v-if="!isLocating && !locationError">📍</span>
          <span class="loc-icon" v-else-if="isLocating">🔄</span>
          <span class="loc-icon" v-else>⚠️</span>
        </button>
  
        <!-- 定位状态提示 -->
        <transition name="fade">
          <div v-if="locationToast" class="location-toast">
            {{ locationToast }}
          </div>
        </transition>
  
        <!-- 顶部天气胶囊 -->
        <div class="weather-capsule">
          <div class="weather-left">
            <span class="weather-icon">☀️</span>
            <div class="weather-info">
              <span class="weather-status">{{ weatherData.weather }}</span>
              <span class="weather-temp">{{ weatherData.temperature }}°C</span>
            </div>
          </div>
          <button @click="resetApp" class="btn-icon">↻</button>
        </div>
  
        <!-- A. 附近列表 -->
        <div class="bottom-sheet" v-if="!selectedPoi">
          <div class="sheet-header">
            <h3>🌳 附近好去处</h3>
            <span class="count-badge">{{ poiList.length }} 个地点</span>
          </div>
          <div class="poi-list">
            <div 
              v-for="(item, index) in poiList" 
              :key="index" 
              class="poi-card"
              @click="selectPoi(item)"
            >
              <div class="poi-icon">🌲</div>
              <div class="poi-content">
                <h4 class="poi-name">{{ item.name }}</h4>
                <p class="poi-address">{{ item.address }}</p>
                <div class="poi-meta">
                  <span class="distance">📏 {{ item.distance }}米</span>
                </div>
              </div>
              <div class="poi-arrow">›</div>
            </div>
            <div v-if="poiList.length === 0 && searchStatus === 'searching'" class="empty-state">正在搜索...</div>
            <div v-if="poiList.length === 0 && searchStatus === 'empty'" class="empty-state">附近暂无公园</div>
          </div>
        </div>
  
        <!-- B. 地点详情 & 路径规划 -->
        <div class="detail-sheet" v-else-if="selectedPoi">
          <button class="btn-close-detail" @click="closeDetail">✕</button>
          
          <div class="poi-header" @click="flyToSelected">
            <h3 class="detail-title">{{ selectedPoi.name }}</h3>
            <p class="detail-address">{{ selectedPoi.address }}</p>
            <p class="detail-distance">距离您 {{ selectedPoi.distance }} 米</p>
          </div>
  
          <!-- 出行方式 Tabs -->
          <div class="transport-tabs">
            <div 
              class="tab-item" 
              :class="{ active: transportMode === 'driving' }" 
              @click="switchTransport('driving')"
            >
              <span class="tab-icon">🚗</span>
              <span class="tab-text">驾车</span>
              <span class="tab-summary" v-if="routeResult.driving">{{ routeResult.driving.duration }}</span>
            </div>
            <div 
              class="tab-item" 
              :class="{ active: transportMode === 'walking' }" 
              @click="switchTransport('walking')"
            >
              <span class="tab-icon">🚶</span>
              <span class="tab-text">步行</span>
              <span class="tab-summary" v-if="routeResult.walking">{{ routeResult.walking.duration }}</span>
            </div>
          </div>
  
          <!-- 路线详情 -->
          <div class="route-content" v-if="currentRoute">
            <div class="route-stats">
              <span class="stat-item">📏 {{ currentRoute.distance }}</span>
              <span class="stat-item">⏱️ {{ currentRoute.duration }}</span>
            </div>
            <p class="route-strategy">{{ currentRoute.strategyText }}</p>
            
            <a :href="getNavUrl(transportMode)" target="_blank" class="btn-start-nav">
              开始{{ transportMode === 'driving' ? '驾车' : '步行' }}导航
            </a>
          </div>
          <div class="route-loading" v-else-if="loadingRoute">
            正在规划最佳路线...
          </div>
          <div v-else-if="selectedPoi && !currentRoute && !loadingRoute" class="route-loading">
            暂无可用路线
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, nextTick, computed, onUnmounted, watch } from 'vue';
  import AMapLoader from '@amap/amap-jsapi-loader';
  
  // --- ⚠️ 配置区域 ---
  const AMAP_KEY = '3b50abd3f70f00ec470698ac0a2bae84'; 
  const AMAP_SECURITY_CODE = '148e08a31b83130358b0061024c54347';
  
  // --- 状态 ---
  const loading = ref(true);
  const loadingText = ref('正在定位...');
  const isSunny = ref(false);
  const weatherData = ref({ city: '', weather: '', temperature: '' });
  const poiList = ref([]);
  const searchStatus = ref('idle');
  const showDebug = ref(false);
  const debugLat = ref(34.5925);
  const debugLng = ref(113.690552);
  
  // 🆕 地址搜索相关
  const addressInput = ref('');
  const isSearchingAddress = ref(false);
  const addressError = ref('');
  const suggestions = ref([]); // 联想列表
  const showSuggestions = ref(false); // 是否显示列表
  const addressInputRef = ref(null); // 输入框 DOM 引用
  let autoCompleteInstance = null; // 高德 AutoComplete 实例
  let debounceTimer = null; // 防抖定时器
  
  // 🎯 拖拽定位相关
  const dragModeEnabled = ref(false);
  let dragMarker = null;
  let geocoderInstance = null; 
  
  // 路径规划相关
  const selectedPoi = ref(null);
  const transportMode = ref('driving');
  const routeResult = ref({});
  const loadingRoute = ref(false);
  
  // 📍 定位相关
  const isLocating = ref(false);
  const locationError = ref(false);
  const locationToast = ref('');
  const lowAccuracyWarning = ref('');
  let locationWatchId = null;
  
  let useDebugLocation = false;
  let currentLocation = { lng: 0, lat: 0 };
  let mapInstance = null;
  let markers = [];
  
  // 插件实例
  let plugins = {
    driving: null,
    walking: null
  };
  
  const currentRoute = computed(() => {
    return routeResult.value[transportMode.value] || null;
  });
  
  onMounted(() => startProcess());
  
  onUnmounted(() => {
    if (locationWatchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(locationWatchId);
    }
    if (mapInstance) {
      mapInstance.destroy();
      mapInstance = null;
    }
    if (debounceTimer) clearTimeout(debounceTimer);
  });
  
  async function startProcess() {
    loading.value = true;
    loadingText.value = useDebugLocation ? '使用调试坐标...' : '正在获取位置...';
    lowAccuracyWarning.value = '';
    isSunny.value = false;
    poiList.value = [];
    searchStatus.value = 'idle';
    selectedPoi.value = null;
    routeResult.value = {};
    markers = [];
    suggestions.value = [];
    showSuggestions.value = false;
  
    if (useDebugLocation) {
      currentLocation = { lng: debugLng.value, lat: debugLat.value };
      await proceedWithLocation(currentLocation.lng, currentLocation.lat);
      return;
    }
  
    if (!navigator.geolocation) {
      alert('❌ 您的浏览器不支持定位，请使用右上角 ⚙️ 调试模式。');
      loading.value = false;
      return;
    }
  
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 60000
        });
      });
      
      const accuracy = position.coords.accuracy;
      if (accuracy > 2000) {
        lowAccuracyWarning.value = Math.round(accuracy);
      }
  
      currentLocation = { lng: position.coords.longitude, lat: position.coords.latitude };
      await proceedWithLocation(currentLocation.lng, currentLocation.lat);
      
    } catch (e) {
      console.error('定位失败:', e);
      loading.value = false;
      let msg = '定位超时或失败。';
      if (e.code === 1) msg = '您拒绝了定位权限。';
      if (e.code === 3) msg = '定位超时 (电脑 WiFi 定位常不准)。';
      
      alert(`⚠️ ${msg}\n\n💡 强烈建议：\n点击右上角 ⚙️ -> 输入地址 (如“北京朝阳公园”) 或开启【拖拽定位模式】。`);
    }
  }
  
  async function fetchWeather(lng, lat) {
    loadingText.value = '查询天气中...';
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const cw = data.current_weather;
      let desc = '多云';
      if (cw.weathercode === 0) desc = '晴';
      else if (cw.weathercode >= 1 && cw.weathercode <= 3) desc = '多云';
      else if (cw.weathercode >= 51) desc = '雨';
  
      weatherData.value = { city: '当前位置', weather: desc, temperature: cw.temperature };
  
      if (desc.includes('晴') || desc.includes('多云')) {
        isSunny.value = true;
        await nextTick();
        initMapAndServices(lng, lat);
      } else {
        isSunny.value = false;
        loading.value = false;
      }
    } catch (e) {
      console.warn('天气查询失败', e);
      weatherData.value = { city: '未知', weather: '晴', temperature: '22' };
      isSunny.value = true;
      await nextTick();
      initMapAndServices(lng, lat);
    }
  }
  
  async function proceedWithLocation(lng, lat) {
    fetchWeather(lng, lat);
  }
  
  async function initMapAndServices(lng, lat) {
    loading.value = false;
    window._AMapSecurityConfig = { securityJsCode: AMAP_SECURITY_CODE };
    
    try {
      const AMap = await AMapLoader.load({
        key: AMAP_KEY,
        version: '2.0',
        plugins: ['AMap.PlaceSearch', 'AMap.Driving', 'AMap.Walking', 'AMap.Geocoder', 'AMap.AutoComplete'] // ✅ 加载 AutoComplete
      });
  
      // 初始化地理编码
      AMap.plugin('AMap.Geocoder', function() {
        geocoderInstance = new AMap.Geocoder({ city: "全国", radius: 1000, extensions: "base" });
      });
  
      // ✅ 初始化自动完成插件
      AMap.plugin('AMap.AutoComplete', function() {
        autoCompleteInstance = new AMap.AutoComplete({
          city: "全国",
          datatype: "all"
        });
      });
  
      mapInstance = new AMap.Map('map-container', {
        zoom: 15,
        center: [lng, lat],
        viewMode: '3D',
        zoomControl: false,
        mapStyle: 'amap://styles/whitesmoke'
      });
  
      addUserLocationMarker(lng, lat);
  
      if (dragModeEnabled.value) {
        enableDragMode([lng, lat]);
      }
  
      // 1. 初始化周边搜索
      AMap.plugin('AMap.PlaceSearch', function () {
        var placeSearch = new AMap.PlaceSearch({ pageSize: 20, extensions: 'all' });
        placeSearch.searchNearBy('公园 | 湖泊 |  湿地 | 湿地公园 | 文物古迹 | 森林公园| 城市公园 | 社区公园 | 纪念公园 | 主题公园 | 滨江公园 | 自然风光 | 儿童主题乐园| 生态公园 | 湖泊河流 | 郊野公园 |', [lng, lat], 10000, function (status, result) {
          if (status === 'complete' && result.poiList && result.poiList.pois) {
            poiList.value = result.poiList.pois.map(poi => ({
              ...poi,
              distance: Math.round(poi.distance)
            }));
            searchStatus.value = poiList.value.length > 0 ? 'done' : 'empty';
            
            markers.forEach((m, idx) => { if (idx > 0) m.setMap(null); });
            markers = markers.slice(0, 1);
  
            result.poiList.pois.forEach(poi => {
              const marker = addMarker(poi.location.lng, poi.location.lat, poi.name, false, poi);
              marker.on('click', () => selectPoi(poi));
            });
            if (poiList.value.length > 0) mapInstance.setFitView();
          } else {
            poiList.value = [];
            searchStatus.value = 'empty';
          }
        });
      });
  
      // 2. 初始化驾车插件
      AMap.plugin('AMap.Driving', function () {
        plugins.driving = new AMap.Driving({
          map: mapInstance,
          panel: false,
          policy: '0',
          showTraffic: true
        });
        plugins.driving.on('complete', (data) => handleRouteComplete('driving', data));
        plugins.driving.on('error', (info) => {
          console.error('Driving error:', info);
          handleRouteError();
        });
      });
  
      // 3. 初始化步行插件
      AMap.plugin('AMap.Walking', function () {
        plugins.walking = new AMap.Walking({
          map: mapInstance,
          panel: false,
          policy: '0'
        });
        plugins.walking.on('complete', (data) => handleRouteComplete('walking', data));
        plugins.walking.on('error', (info) => {
          console.error('Walking error:', info);
          handleRouteError();
        });
      });
  
      console.log('✅ 地图及插件初始化成功');
      startLocationWatch();
  
    } catch (error) {
      console.error('地图初始化失败:', error);
      alert('地图加载失败：' + error.message);
    }
  }
  
  // 🆕 处理输入事件 (带防抖)
  function handleAddressInput() {
    if (debounceTimer) clearTimeout(debounceTimer);
    
    const keyword = addressInput.value.trim();
    
    if (!keyword || !autoCompleteInstance) {
      suggestions.value = [];
      showSuggestions.value = false;
      return;
    }
  
    // 防抖 300ms
    debounceTimer = setTimeout(() => {
      querySuggestions(keyword);
    }, 300);
  }
  
  // 🆕 查询联想数据
  function querySuggestions(keyword) {
    if (!autoCompleteInstance) return;
  
    autoCompleteInstance.search(keyword, function(status, result) {
      if (status === 'complete' && result.tips) {
        suggestions.value = result.tips.filter(item => item.location); // 过滤掉没有坐标的（如纯行政区）
        showSuggestions.value = suggestions.value.length > 0;
      } else {
        suggestions.value = [];
        showSuggestions.value = false;
      }
    });
  }
  
  // 🆕 选择提示词
  function selectSuggestion(item) {
    addressInput.value = item.name; // 填充输入框
    showSuggestions.value = false;  // 隐藏列表
    addressError.value = '';
    
    // 直接执行定位逻辑
    locateByCoords(item.location.lng, item.location.lat, item.address || item.name);
  }
  
  // 🆕 回车选择第一个
  function selectFirstSuggestion() {
    if (suggestions.value.length > 0) {
      selectSuggestion(suggestions.value[0]);
    } else {
      // 如果没有联想，尝试直接搜索地址
      searchAddressAndLocate();
    }
  }
  
  // 延迟隐藏列表 (防止点击失效)
  function hideSuggestionsDelayed() {
    setTimeout(() => {
      showSuggestions.value = false;
    }, 200);
  }
  
  // 🆕 核心定位逻辑 (复用)
  function locateByCoords(lng, lat, addressName) {
    isSearchingAddress.value = true;
    locationToast.value = `📍 正在前往：${addressName}`;
  
    currentLocation = { lng, lat };
    debugLat.value = lat;
    debugLng.value = lng;
    
    if (dragMarker) dragMarker.setMap(null);
    dragModeEnabled.value = true; 
    
    refreshDataAtLocation(lng, lat).then(() => {
      setTimeout(() => {
        if(mapInstance) enableDragMode([lng, lat]);
        isSearchingAddress.value = false;
        locationToast.value = `✅ 已定位：${addressName}`;
        setTimeout(() => { locationToast.value = ''; }, 3000);
      }, 500);
    });
  }
  
  // 🆕 原有搜索按钮逻辑 (兼容)
  async function searchAddressAndLocate() {
    if (!addressInput.value.trim()) {
      addressError.value = '请输入地址';
      return;
    }
    if (!geocoderInstance) {
      addressError.value = '服务尚未加载，请稍后';
      return;
    }
  
    isSearchingAddress.value = true;
    addressError.value = '';
    locationToast.value = `🔍 正在查询 "${addressInput.value}"...`;
    showSuggestions.value = false;
  
    try {
      const result = await new Promise((resolve, reject) => {
        geocoderInstance.getLocation(addressInput.value, function(status, result) {
          if (status === 'complete' && result.geocodes.length) {
            resolve(result.geocodes[0]);
          } else {
            reject(new Error('未找到'));
          }
        });
      });
  
      const lng = result.location.getLng();
      const lat = result.location.getLat();
      
      locateByCoords(lng, lat, result.formattedAddress);
  
    } catch (e) {
      addressError.value = '未找到该地址，请尝试从列表中选择';
      locationToast.value = '❌ 查询失败';
      isSearchingAddress.value = false;
    }
  }
  
  // 🎯 开启拖拽模式
  function enableDragMode(center) {
    if (!mapInstance) return;
    if (dragMarker) dragMarker.setMap(null);
  
    const content = `<div style="font-size: 40px; line-height: 40px; text-align: center; transform: translate(-50%, -100%); cursor: move; user-select: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🎯</div>`;
    
    dragMarker = new AMap.Marker({
      position: center,
      content: content,
      offset: new AMap.Pixel(0, 0),
      zIndex: 1000,
      draggable: true,
      cursor: 'move'
    });
  
    dragMarker.setMap(mapInstance);
  
    dragMarker.on('dragend', function (e) {
      const newPos = e.lnglat;
      const lng = newPos.getLng();
      const lat = newPos.getLat();
      
      currentLocation = { lng, lat };
      debugLat.value = lat;
      debugLng.value = lng;
      
      locationToast.value = '📍 已移动到新位置，重新搜索中...';
      setTimeout(() => { locationToast.value = ''; }, 2000);
      
      refreshDataAtLocation(lng, lat);
    });
  }
  
  // 🔄 在某位置刷新数据
  async function refreshDataAtLocation(lng, lat) {
    if (markers[0]) markers[0].setPosition([lng, lat]);
  
    searchStatus.value = 'searching';
    poiList.value = [];
    selectedPoi.value = null;
    routeResult.value = {};
  
    if (mapInstance) {
      mapInstance.setZoomAndCenter(15, [lng, lat]);
  
      AMap.plugin('AMap.PlaceSearch', function () {
        var placeSearch = new AMap.PlaceSearch({ pageSize: 20, extensions: 'all' });
        placeSearch.searchNearBy('公园|湖泊|湿地|湿地公园|文物古迹| 森林公园| 城市公园 | 社区公园 | 纪念公园 | 主题公园 | 滨江公园 | 自然风光 | 儿童主题乐园| 生态公园 | 湖泊河流 | 郊野公园 ', [lng, lat], 10000, function (status, result) {
          if (status === 'complete' && result.poiList && result.poiList.pois) {
            poiList.value = result.poiList.pois.map(poi => ({
              ...poi,
              distance: Math.round(poi.distance)
            }));
            searchStatus.value = 'done';
            
            markers.forEach((m, idx) => { if (idx > 0) m.setMap(null); });
            markers = markers.slice(0, 1);
  
            result.poiList.pois.forEach(poi => {
              const marker = addMarker(poi.location.lng, poi.location.lat, poi.name, false, poi);
              marker.on('click', () => selectPoi(poi));
            });
            if (poiList.value.length > 0) mapInstance.setFitView();
          } else {
            poiList.value = [];
            searchStatus.value = 'empty';
          }
        });
      });
    }
  }
  
  watch(dragModeEnabled, (newVal) => {
    if (newVal && mapInstance && currentLocation.lng) {
      enableDragMode([currentLocation.lng, currentLocation.lat]);
      locationToast.value = '🎯 拖拽模式已开启';
      setTimeout(() => { locationToast.value = ''; }, 2000);
    } else if (!newVal && dragMarker) {
      dragMarker.setMap(null);
      dragMarker = null;
      locationToast.value = '❌ 拖拽模式已关闭';
      setTimeout(() => { locationToast.value = ''; }, 2000);
    }
  });
  
  function handleRouteComplete(mode, data) {
    loadingRoute.value = false;
    if (data?.routes?.length) {
      const route = data.routes[0];
      const distance = route.distance ? (route.distance / 1000).toFixed(1) + '公里' : '-';
      const duration = formatDuration(route.time);
      let strategy = mode === 'driving' ? '时间优先 · 躲避拥堵' : '最短路径';
      routeResult.value[mode] = { distance, duration, strategyText: strategy, rawData: route };
      if (mode === transportMode.value) mapInstance.setFitView();
    } else {
      routeResult.value[mode] = null;
    }
  }
  
  function handleRouteError() {
    loadingRoute.value = false;
    console.warn('路线规划失败');
  }
  
  function selectPoi(poi) {
    selectedPoi.value = poi;
    transportMode.value = 'driving';
    routeResult.value = {};
    if (dragModeEnabled.value) dragModeEnabled.value = false;
    flyToLocation([poi.location.lng, poi.location.lat], poi.name);
    calculateRoute('driving');
    setTimeout(() => calculateRoute('walking'), 100);
  }
  
  function switchTransport(mode) {
    if (transportMode.value === mode) return;
    transportMode.value = mode;
    if (!routeResult.value[mode]) {
      loadingRoute.value = true;
      calculateRoute(mode);
    } else {
      calculateRoute(mode);
    }
  }
  
  function calculateRoute(mode) {
    if (!plugins[mode] || !selectedPoi.value) return;
    loadingRoute.value = true;
    const start = [currentLocation.lng, currentLocation.lat];
    const end = [selectedPoi.value.location.lng, selectedPoi.value.location.lat];
    if (mode === 'driving') plugins.driving.search(start, end);
    else if (mode === 'walking') plugins.walking.search(start, end);
  }
  
  function closeDetail() {
    selectedPoi.value = null;
    routeResult.value = {};
    if (plugins.driving) plugins.driving.clear();
    if (plugins.walking) plugins.walking.clear();
  }
  
  function flyToSelected() {
    if (!selectedPoi.value) return;
    flyToLocation([selectedPoi.value.location.lng, selectedPoi.value.location.lat], selectedPoi.value.name);
  }
  
  function getNavUrl(mode) {
    if (!selectedPoi.value) return '#';
    const from = `${currentLocation.lng},${currentLocation.lat}`;
    const to = `${selectedPoi.value.location.lng},${selectedPoi.value.location.lat}`;
    const mName = encodeURIComponent(selectedPoi.value.name);
    let m = mode === 'walking' ? 'foot' : 'car';
    return `https://uri.amap.com/navigation?from=${from}&to=${to}&mode=${m}&policy=0&coordinate=gaode&callnative=1&name=${mName}`;
  }
  
  function formatDuration(seconds) {
    if (!seconds) return '-';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}小时${m}分` : `${m}分钟`;
  }
  
  function addUserLocationMarker(lng, lat) {
    if (!mapInstance) return;
    const content = `<div class="user-location-marker"><div class="pulse-ring"></div><div class="marker-dot"></div></div>`;
    const marker = new AMap.Marker({
      position: [lng, lat],
      content: content,
      offset: new AMap.Pixel(-10, -10),
      zIndex: 100
    });
    marker.setMap(mapInstance);
    markers.unshift(marker);
  }
  
  function addMarker(lng, lat, title, isUser, poiData = null) {
    if (!mapInstance || isUser) return;
    const marker = new AMap.Marker({
      position: [lng, lat],
      title: title,
      offset: new AMap.Pixel(-13, -30),
      draggable: false,
      cursor: 'pointer'
    });
    marker.setMap(mapInstance);
    markers.push(marker);
    return marker;
  }
  
  function updateUserMarker(lng, lat) {
    if (!mapInstance || !markers[0]) return;
    markers[0].setPosition([lng, lat]);
  }
  
  async function relocateUser() {
    if (isLocating.value) return;
    isLocating.value = true;
    locationError.value = false;
    locationToast.value = '正在重新定位...';
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 });
      });
      const { longitude: lng, latitude: lat } = position.coords;
      currentLocation = { lng, lat };
      if (dragModeEnabled.value) dragModeEnabled.value = false;
      updateUserMarker(lng, lat);
      flyToLocation([lng, lat], '我的位置');
      if (selectedPoi.value) {
        routeResult.value = {};
        calculateRoute(transportMode.value);
      } else {
        refreshDataAtLocation(lng, lat);
      }
      locationToast.value = '✅ 定位成功';
    } catch (e) {
      locationError.value = true;
      locationToast.value = '❌ 定位失败，请尝试输入地址';
      setTimeout(() => { locationError.value = false; }, 3000);
    } finally {
      setTimeout(() => { isLocating.value = false; setTimeout(() => { locationToast.value = ''; }, 1500); }, 800);
    }
  }
  
  function startLocationWatch() {
    if (!navigator.geolocation) return;
  }
  
  function flyToLocation(location, name) {
    if (!mapInstance) return;
    mapInstance.setZoomAndCenter(17, location);
  }
  
  function applyDebugLocation() {
    useDebugLocation = true;
    if (dragModeEnabled.value) dragModeEnabled.value = false;
    startProcess();
  }
  
  function useCurrentBrowserLocation() {
    useDebugLocation = false;
    if (dragModeEnabled.value) dragModeEnabled.value = false;
    startProcess();
  }
  
  function resetApp() {
    location.reload();
  }
  </script>
  
  <style scoped>
  /* --- 全局重置 --- */
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  .app-container { width: 100vw; height: 100vh; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, sans-serif; position: relative; background: #f5f7fa; }
  
  /* --- 基础样式 --- */
  .debug-btn { position: absolute; top: 10px; right: 10px; z-index: 1000; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 36px; height: 36px; font-size: 18px; cursor: pointer; }
  .debug-panel { position: absolute; top: 55px; right: 10px; z-index: 1000; background: white; padding: 15px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); width: 280px; max-height: 80vh; overflow-y: auto; }
  .overlay { position: absolute; inset: 0; background: #fff; z-index: 2000; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; text-align: center; }
  .loader-circle { width: 50px; height: 50px; border: 4px solid #f0f0f0; border-top-color: #007AFF; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
  .loading-text { color: #666; font-size: 16px; font-weight: 500; }
  .warning-box { color: #d35400; font-size: 13px; margin-top: 15px; background: #fff3e0; padding: 10px 15px; border-radius: 8px; border: 1px solid #ffe0b2; max-width: 300px; line-height: 1.5; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .status-page.rainy { height: 100%; display: flex; justify-content: center; align-items: center; background: linear-gradient(135deg, #eef2f3, #dbe6ea); padding: 20px; }
  .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); padding: 40px 30px; border-radius: 24px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.08); max-width: 90%; width: 340px; }
  .icon-large { font-size: 64px; margin-bottom: 10px; }
  h1 { font-size: 22px; color: #333; margin-bottom: 8px; }
  .sub-text { color: #666; font-size: 14px; margin-bottom: 15px; }
  .temp-big { font-size: 48px; font-weight: 800; color: #007AFF; line-height: 1; margin-bottom: 20px; }
  .advice-text { color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 25px; background: #fff3cd; padding: 12px; border-radius: 12px; }
  .btn-outline { background: transparent; border: 2px solid #007AFF; color: #007AFF; padding: 12px 24px; border-radius: 30px; font-size: 16px; font-weight: 600; cursor: pointer; }
  .map-page { position: relative; width: 100%; height: 100%; }
  #map-container { width: 100%; height: 100%; display: block; }
  .weather-capsule { position: absolute; top: 20px; left: 20px; right: 20px; z-index: 900; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); padding: 12px 16px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  .weather-left { display: flex; align-items: center; gap: 10px; }
  .weather-icon { font-size: 24px; }
  .weather-info { display: flex; flex-direction: column; }
  .weather-status { font-weight: 700; color: #333; font-size: 15px; }
  .weather-temp { font-size: 12px; color: #666; }
  .btn-icon { background: #f0f2f5; border: none; width: 32px; height: 32px; border-radius: 50%; font-size: 18px; color: #333; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  
  /* --- 底部列表 --- */
  .bottom-sheet { position: absolute; bottom: 0; left: 0; right: 0; background: white; border-top-left-radius: 24px; border-top-right-radius: 24px; box-shadow: 0 -10px 30px rgba(0,0,0,0.1); z-index: 900; max-height: 45vh; display: flex; flex-direction: column; overflow: hidden; transition: transform 0.3s; }
  .bottom-sheet::before { content: ''; position: absolute; top: 10px; left: 50%; transform: translateX(-50%); width: 40px; height: 4px; background: #e0e0e0; border-radius: 2px; }
  .sheet-header { padding: 20px 20px 10px 20px; display: flex; justify-content: space-between; align-items: baseline; }
  .sheet-header h3 { font-size: 18px; color: #333; font-weight: 700; }
  .count-badge { font-size: 12px; background: #e6f7ff; color: #007AFF; padding: 4px 8px; border-radius: 12px; font-weight: 600; }
  .poi-list { overflow-y: auto; padding: 10px 20px 30px 20px; scrollbar-width: none; }
  .poi-list::-webkit-scrollbar { display: none; }
  .poi-card { display: flex; align-items: center; gap: 12px; padding: 14px; margin-bottom: 12px; background: #fff; border: 1px solid #f0f0f0; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); cursor: pointer; transition: transform 0.2s; }
  .poi-card:active { transform: scale(0.98); background: #f9f9f9; }
  .poi-icon { font-size: 24px; background: #f0f9eb; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0; }
  .poi-content { flex: 1; min-width: 0; }
  .poi-name { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .poi-address { font-size: 12px; color: #999; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .poi-meta { display: flex; gap: 8px; font-size: 11px; }
  .distance { color: #007AFF; font-weight: 600; background: #e6f7ff; padding: 2px 6px; border-radius: 4px; }
  .poi-arrow { color: #ccc; font-size: 20px; font-weight: 300; }
  .empty-state { text-align: center; color: #999; padding: 30px 0; font-size: 14px; }
  
  /* --- 详情卡片 --- */
  .detail-sheet { position: absolute; bottom: 0; left: 0; right: 0; background: white; border-top-left-radius: 24px; border-top-right-radius: 24px; box-shadow: 0 -10px 40px rgba(0,0,0,0.15); z-index: 950; display: flex; flex-direction: column; max-height: 50vh; animation: slideUp 0.3s ease-out; }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  .btn-close-detail { position: absolute; top: 15px; right: 15px; background: #f0f2f5; border: none; width: 28px; height: 28px; border-radius: 50%; font-size: 14px; color: #666; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; }
  .poi-header { padding: 20px 20px 15px 20px; border-bottom: 1px solid #f0f0f0; cursor: pointer; }
  .detail-title { font-size: 18px; font-weight: 700; color: #333; margin-bottom: 6px; }
  .detail-address { font-size: 13px; color: #999; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .detail-distance { font-size: 12px; color: #007AFF; font-weight: 600; }
  .transport-tabs { display: flex; background: #f9f9f9; padding: 10px 10px 0 10px; gap: 10px; }
  .tab-item { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 10px 5px; border-radius: 12px 12px 0 0; cursor: pointer; transition: all 0.2s; color: #999; font-size: 12px; position: relative; }
  .tab-item.active { background: white; color: #007AFF; font-weight: 700; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); }
  .tab-icon { font-size: 20px; margin-bottom: 4px; }
  .tab-summary { font-size: 10px; margin-top: 2px; opacity: 0.8; }
  .route-content { padding: 20px; flex: 1; overflow-y: auto; }
  .route-stats { display: flex; gap: 20px; margin-bottom: 10px; }
  .stat-item { font-size: 16px; font-weight: 600; color: #333; }
  .route-strategy { font-size: 13px; color: #666; margin-bottom: 20px; background: #f0f7ff; padding: 8px 12px; border-radius: 8px; display: inline-block; }
  .btn-start-nav { display: block; width: 100%; background: linear-gradient(135deg, #007AFF, #0055cc); color: white; text-decoration: none; text-align: center; padding: 14px; border-radius: 16px; font-size: 16px; font-weight: 700; box-shadow: 0 6px 15px rgba(0, 122, 255, 0.4); transition: transform 0.2s; }
  .btn-start-nav:active { transform: scale(0.98); }
  .route-loading { padding: 30px; text-align: center; color: #999; font-size: 14px; }
  .location-btn { position: absolute; bottom: 100px; right: 20px; z-index: 920; width: 44px; height: 44px; border-radius: 50%; border: none; background: white; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; }
  .location-btn:hover { transform: scale(1.05); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2); }
  .location-btn:active { transform: scale(0.95); }
  .location-btn.locating .loc-icon { animation: spin 1s linear infinite; }
  .location-btn.error { background: #fff0f0; border: 2px solid #ff4d4f; }
  .loc-icon { font-size: 22px; line-height: 1; }
  .location-toast { position: absolute; bottom: 150px; right: 20px; z-index: 930; background: rgba(0, 0, 0, 0.75); color: white; padding: 10px 16px; border-radius: 8px; font-size: 13px; max-width: 200px; text-align: center; }
  .fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
  .fade-enter-from, .fade-leave-to { opacity: 0; }
  :global(.user-location-marker) { position: relative; width: 20px; height: 20px; display: flex; justify-content: center; align-items: center; }
  :global(.marker-dot) { width: 12px; height: 12px; background-color: #007AFF; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4); z-index: 2; position: relative; }
  :global(.pulse-ring) { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100%; height: 100%; border-radius: 50%; background-color: rgba(0, 122, 255, 0.4); z-index: 1; animation: pulse-animation 2s infinite; }
  @keyframes pulse-animation { 0% { width: 100%; height: 100%; opacity: 0.8; } 100% { width: 250%; height: 250%; opacity: 0; } }
  
  /* 🆕 联想列表样式 */
  .suggestion-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0; /* 包含按钮宽度，需调整 */
    margin-top: 4px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 2000;
    max-height: 200px;
    overflow-y: auto;
    font-size: 12px;
  }
  /* 修正列表宽度，避开右侧按钮 */
  .suggestion-list {
    right: 40px; /* 按钮宽度 + gap */
  }
  
  .suggestion-item {
    padding: 8px 10px;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    border-bottom: 1px solid #f5f5f5;
    transition: background 0.1s;
  }
  .suggestion-item:last-child {
    border-bottom: none;
  }
  .suggestion-item:hover {
    background: #f0f7ff;
  }
  .suggestion-icon {
    font-size: 14px;
    margin-top: 1px;
  }
  .suggestion-content {
    flex: 1;
    overflow: hidden;
  }
  .suggestion-name {
    font-weight: 600;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .suggestion-address {
    font-size: 11px;
    color: #999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  }
  .suggestion-empty {
    padding: 8px 10px;
    color: #999;
    text-align: center;
  }
  .input-active {
    border-color: #007AFF;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  
  @media (max-height: 700px) { .location-btn { bottom: 80px; } .location-toast { bottom: 130px; } }
  </style>