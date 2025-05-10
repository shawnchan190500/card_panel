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
          src="https://i.pinimg.com/736x/cc/d8/5e/ccd85e5948eb4eb1c7cc6a83fc04e554.jpg" 
          alt="Card Emporium Logo" 
          class="menu-logo"
        />
        <h1>{{ isMenuCollapsed ? 'C' : 'Card Emporium' }}</h1>
      </div>
      <nav class="menu-items">
        <a href="#" class="menu-item active">
          <span class="icon">⚪</span>
          <span class="menu-text">Main</span>
        </a>
        <a href="https://www.one-pos.com/boxestreasure/box_login.asp" class="menu-item" target="_blank">
          <img src="https://www.one-pos.com/boxestreasure/Logo.JPG" alt="POS Logo" class="menu-logo" />
          <span class="menu-text">POS</span>
        </a>
        <a href="https://www.psacard.com/cert" class="menu-item" target="_blank">
          <img src="https://powerssportsmemorabilia.com/cdn/shop/articles/psa_600x.png?v=1675956865" alt="PSA Logo" class="menu-logo" />
          <span class="menu-text">PSA Check</span>
        </a>
        <a href="https://www.cardrush-pokemon.jp/" class="menu-item" target="_blank">
          <img src="https://pbs.twimg.com/profile_images/889356757008437248/aGyG1GyG_400x400.jpg" alt="カードラッシュ Icon" class="menu-logo" />
          <span class="menu-text">カードラッシュ</span>
        </a>
        <a href="https://www.hareruya2.com/" class="menu-item" target="_blank">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAmVBMVEXsAADrAADoAADveYD73d/74OL85uj5z9LznqPqUlj0kJD6w8P6ysr2trnvPz/mAADqRU7////ybGzuMDD5vr7xWVn4xMjoMDrzoabycXH0h4fxZmb4r6/tFxf72Nj97O7oERzpLzj++fnze3v+9fb2mZn3pqbwh43sX2bwU1P0goLqPEfnFCHuKSnta3LoJTDwgYjsVl/nFyayx1J/AAABoklEQVR4AW2PBbbcMAxFJYepzhsITXggGYb9L67WSbn/Bq1rC+hv2KAWmHgJCcuXSVm249qeH6jFhVGcfGPWqZaVBQi2FsfJini92XKGnM0yWGShxJUVr1dM7nqH2gQ4X6TFIuuGW6y4jqiDpOo7CINIDqvtiD37I7ewzFFliztoEngDeMz2wchWG+mJzBQtNqqJKyQmLVImVYj0F8nHivmEsS8BJIp4EjkzGc3nE1MMXDiWbJpUn1/n4404lW575vX9Hu3uyK5aXx/TcZpzrZQv3ZaNgTYHTvWzcLHg+k9tpKQTbNYF/mA0J/sdl6FAd/cPlTkAcYpkez5vG/U8AP7ULVmC1yjSgnDoewm3z/cB5sedgnoEqYcj0tIZAGe24c4TDGN9AJHSue+O+v2rj+Px5x8ZWOlBDgK1BwnC0CWpS1prpRTfIBT9zaqTbFO/rtcwBynPyZJQPwBhQDod87nOBrwikZLj5/je+2PO18DrU8BI8wdXJ1hwHsH0SK3AsiHSgpxcpDC2WeaMEIhTGJoaX0CkXWnE+lqqo/vqVf6V/A6LEi+kSO+RgQAAAABJRU5ErkJggg==" alt="晴れる屋2 Icon" class="menu-logo" />
          <span class="menu-text">晴れる屋2</span>
        </a>
        <a href="https://www.torecolo.jp/shop/default.aspx" class="menu-item" target="_blank">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAY1BMVEUAHp8GJKIMKaQjPKw2TLIWMqgAHZ8TL6aKmNPW2+/O1O1necYAGJ8+VbelsN3///94iMz5+f0AFJ6Ek9EdN6mxuuJpe8dRZb3ByOgtRK/Hzuri5fSbp9kpQq/Q1u2BkNA7UrXgQqtEAAAAh0lEQVR4AbXSQwLAMBAAwLC23f7/kzVTa67BEgAAESYtygEWxxNBbEiysj6kqqa3DIXbPTT/OrS4wfrQpk6PwlW2rtzzfJ5jD0V3IDirQ3MUhAp7OIm+PIyjQYI5tk4hDXsYcusOKT2O+2Mq/x/yxM4am9uHsG83cnX1sFnqtGg1Q1xjNueaCr5+F/Hf4JU1AAAAAElFTkSuQmCC" alt="トレコロ Icon" class="menu-logo" />
          <span class="menu-text">トレコロ</span>
        </a>
        <a href="https://www.toretoku.jp/?srsltid=AfmBOopTV7AioGXKhydw5fCD-IvnDGjVrtob555zv8yuBn6NlhcmaGZn" class="menu-item" target="_blank">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAABzUlEQVR4AbWUAURDURSGgwCCANii6b03RSGeAEhhAGAI8bCYZiQAABUmMAA0k2EDYAUACgYsgJEAEAPodX+9x/Hv3bN3EH7YvTvfPd8528ZZp2HKwSBOTm+iTeWOGgvo2OXLJc3S+hcgunHFJzlofxB/CCgeULcB9a46ovgyGsTnnm6f7UBFX/0pftQeZNGs6UPeLyZH2wblazVzV2meXF+Z+DQD7PLm7RAQ1mcNtGLepDpZAd5Po8bDS3jZew33rL8zfjQglOUKELNy0JQyw0OsUNTKFLdgDD8lPISVossRA60wDox5Z4jDDNQj8K0VhLHIBnIwX9Q6/r6bRidlYO7utfyeGMsfsBbubNXC6tAl3Q2qVwVdL0SBES2Vdrcnzxk4BjDLp8uhvIgN1jSTjVnxHwYpBQQwAR5SN1x4QfqQBtcsAjK4LaCqZk1fPiaXH5egqMNAbllJzTM8gOok+I6ANWmG1YpQOQbMp5nP+cEuc3G3750htImLSBefK+dtgvXFGaAVfWnYO2lUNCfQJj5rUr2uhG8oalijphkZrtn4wAvk4bNm2mboCxRL83UdmjSX3U4NaNasb6cdqGpW9BmAVs2kzwq0aiZ9en4BWZS14nBZCcwAAAAASUVORK5CYII=" alt="トレトク Icon" class="menu-logo" />
          <span class="menu-text">トレトク</span>
        </a>
        <a href="https://yuyu-tei.jp/top/poc" class="menu-item" target="_blank">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAABCFBMVEVHcEwAq+kCisQAr+wAruoLSX8Aq+cArusAr+wAsOwApOAAr+sAqucAr+wAr+wAr+wArusAr+sAruoAsOwAr+sAsOwAqeQAodsApN8ApN8An9kAn9kAntcAndYAl88BlM0BksgAksgBkskCi8EBjsUBjsQDiL0Dib4BhLkAfrMDiL0Ad60AfrMAea4AerAAd6wAdKkKUYYAdKkAcKQPQ3gAdKkAbaEPO3IAa58BZpkCZZgAaJsCZpgBZZkMWIsDYpQMW40MWIoPWIoPVIYPVYgNUoYPPHEVLmYSQHQRRXgRO28TNGsQPXERQXUROW4RPnIYKGEWKmIVLmUWLGMZJl8XK2IcJl8YJ2BnKxFhAAAAWHRSTlMAFg9bbQgeMDuWJoRKi8+upPy96eCPgOvV9q9e0cT+b9jI86U6sP/owJLTL/251n1ZHP2lJcjkFfPK1rn/eG/m94/kvdVbMUJNhZ1zY6/U/Mep7rKb1f+CGAFzKAAAAc5JREFUeAFdycViEEEQRdFb1TI9Ezfc4QNwtrjDiv9kg7u76xZ3j45145DktZQc/kYA9N/HpO7v3gE2m44iADYClU7H4IGsDBmgnVOxyzaCb6Ep8KOaAYABoIfhjryKhakEG5rYUad/2G++dAS1Ez2lhCZ4U8bOOv3BYEdsAW3PeJkV4ivjRrvcxG8MQUc6EZFYeh12rWl9M5xbWix0y2hnLlGS+TZArsk10vsu73wHClk2MuBtZmHm61e5+tpbj8ggWFQUlahNwdPF0fjGmdIuezarACUEg/+RYDVKeEruJc/rKjiwLJYWsZI0Ke4xAVVi31OvIKwQkTKUKYwUrZcJLEqpdWauo9y2LhkTOl1/CF4KGzKRzntdRQALIbqRDClBMFZsnaNRGQGFc15uJ2vyIuu03gVXiP1C4W6DAt/81stajw4PHzf+4+c2uZNDWzkNCMB2kUPALqFNR4AV8zhSAwpwxJi9Dg5WaFTYtiC+rvmL1LVsh13W+tMRDamGf0iyCHzIVDfASpK7MQm/ampgPrHtXs2NJIFJeNW6sA4xHgbZbbM4GUkTZu62by2MH9lnTRqbgq8afVYc3d+OH3Tp9djwUaZnG6wAt5V/+Q4Ltp8ZlTxzlwAAAABJRU5ErkJggg==" alt="遊々亭 Icon" class="menu-logo" />
          <span class="menu-text">遊々亭</span>
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
const isDropdownOpen = ref(false)

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

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
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

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  left: 0;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.dropdown-item {
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  color: black;
}
</style> 