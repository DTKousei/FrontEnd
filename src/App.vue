<template>
  <div class="app-container">
    <!-- 
      Ideally, we would have a layout component here that includes the sidebar 
      if the user is authenticated. For now, we just render the route.
    -->
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
// Global app logic
</script>

<style>
/* Reset and Base Styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f4f6f8;
}

.app-container {
  min-height: 100vh;
}
</style>
