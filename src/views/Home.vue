<template>
  <div class="header-bar">
    <h1>Maths Space</h1>
  
    <div class="controls-top-row">
      <label>Classe :
        <select v-model="selectedClasse">
          <option value="">Toutes</option>
          <option value="6e">6e</option>
          <option value="5e">5e</option>
          <option value="4e">4e</option>
          <option value="3e">3e</option>
        </select>
      </label>
  
      <label>Nombre de questions :
        <input type="number" v-model.number="questionCount" min="1" max="4" />
      </label>
  
      <label>
        Générer :
        <button @click="loadRandom">Générer</button>
      </label>
  
      <router-link to="/ajouter" class="button-link">
        <span class="icon">＋</span> Ajouter une question
      </router-link>
      
    </div>
  
    <div class="quiz-selector">
      <label>Choisir un quiz :  
        <select v-model="selectedSet" @change="switchSet">
          <option value="base">Général</option>
          <option value="eleves">Par les élèves</option>
          <option value="course">Course aux nombres</option>
        </select>
      </label>
    </div>
  </div>
  
    
    <div class="app">
  
    <div class="main-zone">
      <div v-if="selectedClasse && availableChapitres.length" class="chapitres-vertical">
        <label v-for="ch in availableChapitres" :key="ch" class="chapitre-item">
          <input type="checkbox" :value="ch" v-model="selectedChapitres" />
          <span>{{ ch }}</span>
        </label>

      </div>
    
      <div class="questions-grid">
        <QuestionCard
          v-for="(q, idx) in questions"
          :key="idx"
          :question="q"
        />
      </div>
    </div>

    </div>
  </template>
  
  <script setup lang="ts">
  import base from '../data/questions.json'
  import eleves from '../data/eleves.json'
  import course from '../data/courseNombres.json'
  import QuestionCard from '../components/QuestionCard.vue'
  declare global {
    interface Window {
      MathJax: any;
    }
  }
  import { onMounted, ref, watch } from 'vue'
  import { useQuestionStore } from '../store/questions'
  import { storeToRefs } from 'pinia'
  
  const store = useQuestionStore()
  const selectedSet = ref('base')
  const { currentQuestions: questions } = storeToRefs(store)
  
  const selectedClasse = ref('')
  const questionCount = ref(1)
  const availableChapitres = ref<string[]>([])
  const selectedChapitres = ref<string[]>([])
  const revealed = ref<{ [key: number]: boolean }>({})
  
  function loadRandom() {
    const chapitres = selectedChapitres.value
    store.loadRandomQuestions(questionCount.value, selectedClasse.value || null, chapitres)
    revealed.value = {}
  }
  
  function switchSet() {
    let data = base
    if (selectedSet.value === 'eleves') data = eleves
    else if (selectedSet.value === 'course') data = course
    store.questions = data
    loadRandom()
  }
  
  watch(selectedClasse, (newClasse) => {
    if (!newClasse) {
      availableChapitres.value = []
      return
    }
    const all = store.questions
      .filter(q => q.classe === newClasse)
      .map(q => q.chapitres)
      .reduce((acc, val) => acc.concat(val), [])
    availableChapitres.value = [...new Set(all)]
  })
  
  onMounted(() => {
    loadRandom()
    setTimeout(() => {
      if (window.MathJax?.typesetPromise) {
        window.MathJax.typesetPromise()
      }
    }, 0)
  })
  
  watch(questions, () => {
    setTimeout(() => {
      if (window.MathJax?.typesetPromise) {
        window.MathJax.typesetPromise()
      }
    }, 0)
  })
  </script>
  
  <style scoped>
  
  body {
    background-color: #f5f7fa;
    color: #333;
    font-family: 'Inter', sans-serif;
  }
  
  h1 {
    font-family: 'Fredoka', sans-serif;
    font-weight: 500;
    text-align: center;
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: #2c3e50;
  }
  
  button,
  select,
  input,
  label {
    font-family: 'Inter', sans-serif;
  }
  
  .quiz-selector {
    text-align: center;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  
  .app {
    width: 100%;
    margin: 0 auto;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .controls {
    background-color: #eef2f7;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 2rem;
    gap: 1.5rem;
  }

  .header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    padding: 1rem 2rem;
    background-color: #ffffff;
    border-bottom: 1px solid #ddd;
    border-radius: 12px 12px 0 0;
    margin-bottom: 1rem;
  }

  .controls-top-row {
    display: flex;
  flex: 1;
    gap: 1.5rem;
    align-items: center;
    justify-content: center;
  }
  
  label {
    font-weight: 500;
    display: flex;
    flex-direction: column;
  }
  
  select,
  input[type="number"] {
    padding: 0.4rem;
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid #ccc;
    margin-top: 0.25rem;
  }
  
  button {
    align-self: start;
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  .button-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #f3f4f6;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    color: #333;
    text-decoration: none;
    transition: background-color 0.2s ease;
    margin-bottom: 1.5rem;
  }
  
  .button-link:hover {
    background-color: #e0e0e0;
  }
  
  .button-link .icon {
    font-size: 1.2rem;
    color: #007bff;
  }
  
  .questions-grid {
    display: flex;
    flex-wrap: nowrap;
    gap: 1.5rem;
    overflow-x: auto;
    padding-bottom: 1rem;
    width: 100%;
    box-sizing: border-box;
    justify-content: center; /* ✅ centrer les cartes */
  }
  
  .questions-grid > * {
    flex: 0 0 15%;
    min-width: 220px;
    max-width: 15%;
  }

  .nav-link {
    display: inline-block;
    margin-bottom: 1rem;
    color: #007bff;
    text-decoration: none;
  }
  
  .nav-link:hover {
    text-decoration: underline;
  }

  .header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #ddd;
  border-radius: 12px 12px 0 0;
}
  
  .header-bar h1 {
    margin: 0;
    font-size: 1.8rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }
  
  .quiz-selector label {
    font-weight: 500;
    font-size: 0.95rem;
    color: #444;
  }
  
  .quiz-selector {
    margin-left: auto;
  }
    
  .quiz-selector select {
    margin-left: 0.5rem;
    padding: 0.3rem 0.6rem;
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid #ccc;
  }

  .main-zone {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
  }
  
  .chapitres-vertical {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 200px;
    background-color: #fffbe6;
    border-left: 5px solid #f3d250;
    padding: 1rem;
    border-radius: 8px;
  }

  .chapitre-item {
    display: flex;
    flex-direction: row;         /* ⬅️ assure l'horizontale */
    align-items: center;         /* ⬅️ aligne case + texte verticalement */
    gap: 0.5rem;                 /* ⬅️ espace entre case et texte */
    white-space: nowrap;
    font-weight: 500;
  }


  .chapitre-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding-left: 0.5rem;
  }
  
  .controls-top-row .button-link {
    align-self: end;
    padding: 0.4rem 0.8rem;
    font-size: 0.95rem;
  }
  
  .generer-label {
    margin-left: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  </style>
