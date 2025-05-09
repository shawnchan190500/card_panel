<template>
  <div class="layout" :class="{ 'menu-collapsed': isMenuCollapsed }">
    <!-- Side Menu -->
    <aside 
      class="side-menu"
      @mouseenter="expandMenu"
      @mouseleave="collapseMenu"
    >
      <div class="menu-header">
        <img 
          src="https://landingcms.ankh.com.hk/uploads/logo_114f3606f6.png" 
          alt="ANKH Logo" 
          class="menu-logo"
        />
        <h1>{{ isMenuCollapsed ? 'A' : 'ANKH MKT' }}</h1>
      </div>
      <nav class="menu-items">
        <a href="#" class="menu-item active">
          <span class="icon">🏠</span>
          <span class="menu-text">Main</span>
        </a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Top Bar -->
      <header class="top-bar">
        <div class="search-bar">
          <input 
            type="text" 
            placeholder="Search by card name..." 
            v-model="searchQuery"
            @input="handleSearch"
          />
          <span class="search-icon">🔍</span>
          <button 
            v-if="searchQuery" 
            class="clear-search-btn"
            @click="clearSearch"
            title="Clear search"
          >
            ×
          </button>
        </div>
        <div class="user-menu">
          <span class="notifications">🔔</span>
          <span class="user-avatar">👤</span>
        </div>
      </header>

      <!-- Content Area -->
      <div class="content">
        <slot :searchQuery="searchQuery"></slot>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMenuCollapsed = ref(true)
const searchQuery = ref('')

const expandMenu = () => {
  isMenuCollapsed.value = false
}

const collapseMenu = () => {
  isMenuCollapsed.value = true
}

const handleSearch = () => {
  emit('search', searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('search', '')
}

const emit = defineEmits(['search'])
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.side-menu {
  width: 250px;
  background: #000000;
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  z-index: 10;
}

.side-menu:hover {
  width: 250px;
}

.menu-collapsed .side-menu {
  width: 80px;
}

.menu-collapsed .side-menu:hover {
  width: 250px;
}

.menu-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 2rem 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.menu-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  background-color: white;
  border-radius: 6px;
  padding: 2px;
}

.menu-header h1 {
  font-size: 1.5rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #a0a0a0;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.menu-item:hover {
  background: #333333;
  color: white;
}

.menu-item.active {
  background: #1a1a1a;
  color: white;
}

.icon {
  font-size: 1.25rem;
  min-width: 1.5rem;
  text-align: center;
}

.menu-text {
  overflow: hidden;
  transition: opacity 0.3s ease;
}

.menu-collapsed .menu-text {
  opacity: 0;
  width: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f3f4f6;
}

.top-bar {
  height: 64px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-bar input {
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  width: 300px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-bar input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  width: 350px;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  color: #6b7280;
  pointer-events: none;
}

.clear-search-btn {
  position: absolute;
  right: 2.5rem;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.25rem;
  line-height: 1;
  padding: 0.25rem;
  cursor: pointer;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search-btn:hover {
  color: #374151;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notifications, .user-avatar {
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.notifications:hover, .user-avatar:hover {
  background: #f3f4f6;
}

.content {
  flex: 1;
  padding: 1.5rem;
  overflow: auto;
}
</style> 