<template>
  <Layout @search="handleSearch">
    <template #default="{ searchQuery }">
      <Panel title="Card Panel" :searchQuery="searchQuery" />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')

const handleSearch = (query: string) => {
  searchQuery.value = query
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  color: #374151;
}

.container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

body {
  background-color: #f3f4f6;
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  color: #374151;
  margin: 0;
  padding: 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

li::before {
  content: "•";
  color: #6b7280;
  position: absolute;
  left: 0;
}
</style>
