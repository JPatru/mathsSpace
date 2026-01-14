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

  padding: 0.9rem 1.4rem;
  background-color: #ffffff;

  border-bottom: 2px solid #0892D5;
  border-radius: 12px 12px 0 0;
  margin-bottom: 1rem;

  font-family: 'Fredoka', sans-serif;
}

/* ---------- MENU WRAPPER ---------- */

.menu-wrapper {
  position: relative;
}

/* ---------- BOUTON BURGER ---------- */

.burger {
  font-size: 1.4rem;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 42px;
  height: 42px;

  border: 2px solid #0892D5;
  border-radius: 10px;

  background: rgba(8, 146, 213, 0.08);
  color: #075b85;

  transition: background-color 0.2s ease, transform 0.15s ease;
}

.burger:hover {
  background: rgba(8, 146, 213, 0.18);
}

#burger-toggle {
  display: none;
}

/* ---------- MENU DÉROULANT (VERTICAL) ---------- */

.burger-menu {
  display: none;
  flex-direction: column;
  gap: 0.4rem;

  position: absolute;
  right: 0;
  top: calc(100% + 0.6rem);

  min-width: 200px;
  background: #ffffff;

  padding: 0.6rem;
  border: 2px solid rgba(8, 146, 213, 0.35);
  border-radius: 12px;

  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  z-index: 10;
}

/* ---------- LIENS ---------- */

.burger-menu a {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  padding: 0.55rem 0.75rem;
  border-radius: 10px;

  text-decoration: none;
  font-weight: 600;
  color: #2c3e50;

  transition: background-color 0.2s ease, color 0.2s ease;
}

.burger-menu a:hover {
  background: rgba(8, 146, 213, 0.12);
}

/* lien actif Vue Router */
.burger-menu a.router-link-active {
  background-color: #0892D5;
  color: #ffffff;
}

/* ---------- TOGGLE ---------- */

#burger-toggle:checked + .burger + .burger-menu {
  display: flex;
}

</style>
