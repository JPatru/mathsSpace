<template>
  <header class="header-bar">
    <h1>Espace Maths</h1>

    <div class="menu-wrapper">
      <input type="checkbox" id="burger-toggle" />
      <label for="burger-toggle" class="burger">☰</label>

      <nav class="burger-menu">
        <router-link to="/">🏠 Accueil</router-link>
        <router-link to="/evaluation">📋 Évaluation</router-link>
        <router-link to="/defi">🏁 Défi</router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #ddd;
  border-radius: 12px 12px 0 0;
  margin-bottom: 1rem;
  font-family: 'Fredoka', sans-serif;
}

.menu-wrapper {
  position: relative;
}

.burger {
  font-size: 1.6rem;
  cursor: pointer;
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

#burger-toggle {
  display: none;
}

.burger-menu {
  display: none;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
  position: absolute;
  right: 0;
  background: white;
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  z-index: 10;
}

#burger-toggle:checked + .burger + .burger-menu {
  display: flex;
}
</style>
