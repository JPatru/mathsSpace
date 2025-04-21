<template>
  <div class="form-container">
    <h2>Ajouter une question</h2>
    <router-link to="/" class="nav-link">⬅ Retour à l'accueil</router-link>

    <form @submit.prevent="addQuestion">
      <label>Classe :
        <select v-model="newQuestion.classe" required>
          <option disabled value="">-- Sélectionner --</option>
          <option>6e</option>
          <option>5e</option>
          <option>4e</option>
          <option>3e</option>
        </select>
      </label>

      <label>Chapitres :</label>
      <div class="chapitres">
        <label v-for="ch in chapitresDisponibles" :key="ch">
          <input type="checkbox" :value="ch" v-model="newQuestion.chapitres" /> {{ ch }}
        </label>
        <div class="new-chapitre">
          <input type="text" v-model="nouveauChapitre" placeholder="Ajouter un chapitre" />
          <button type="button" @click="ajouterChapitre">➕</button>
        </div>
      </div>

      <label>Énoncé :
        <textarea v-model="newQuestion.question" required></textarea>
      </label>

      <label>Réponses (4) :
        <div class="reponses">
          <input v-for="(r, i) in newQuestion.reponses" :key="i" v-model="newQuestion.reponses[i]" required />
        </div>
      </label>

      <label>Bonne réponse :
        <select v-model="newQuestion.bonne_reponse" required>
          <option v-for="r in newQuestion.reponses" :key="r" :value="r">{{ r }}</option>
        </select>
      </label>

      <button type="submit">Ajouter</button>
    </form>

    <div class="preview" v-if="newQuestion.question">
      <h3>Prévisualisation</h3>
      <QuestionCard :question="newQuestion" />
    </div>
  </div>
  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <h3>Question à copier</h3>
      <pre>{{ formattedQuestion }}</pre>
      <div class="modal-actions">
        <button @click="copyToClipboard">📋 Copier</button>
        <button @click="showModal = false">✖ Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch} from 'vue'
import { useQuestionStore } from '../store/questions'
import QuestionCard from '../components/QuestionCard.vue'

const store = useQuestionStore()

const newQuestion = ref({
  id: Date.now(),
  classe: '',
  chapitres: [] as string[],
  question: '',
  reponses: ['', '', '', ''],
  bonne_reponse: '',
})

const chapitresDisponibles = ref<string[]>([])
const nouveauChapitre = ref('')

function ajouterChapitre() {
  const ch = nouveauChapitre.value.trim()
  if (ch && !chapitresDisponibles.value.includes(ch)) {
    chapitresDisponibles.value.push(ch)
  }
  if (ch && !newQuestion.value.chapitres.includes(ch)) {
    newQuestion.value.chapitres.push(ch)
  }
  nouveauChapitre.value = ''
}

watch(() => newQuestion.value.classe, (classe) => {
  if (!classe) {
    chapitresDisponibles.value = []
    return
  }
  const all = store.questions
    .filter(q => q.classe === classe)
    .map(q => q.chapitres)
    .reduce((acc, val) => acc.concat(val), [])
  chapitresDisponibles.value = [...new Set(all)]
})

const showModal = ref(false)
const formattedQuestion = ref('')

function addQuestion() {
  try {
    const questionToCopy = {
      ...newQuestion.value,
      id: Date.now()
    }
    formattedQuestion.value = JSON.stringify(questionToCopy, null, 2)
    showModal.value = true
  } catch (error) {
    alert('Erreur : ' + error)
  }
}

function copyToClipboard() {
  navigator.clipboard.writeText(formattedQuestion.value)
    .then(() => {
      alert('✅ Question copiée dans le presse-papiers.')
    })
    .catch(() => {
      alert('❗ Impossible de copier automatiquement. Copie manuelle nécessaire.')
    })
}


</script>

<style scoped>
.form-container {
  max-width: 500px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
form label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.reponses {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.chapitres {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.new-chapitre {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.preview {
  margin-top: 2rem;
  padding: 1rem;
  border-top: 1px solid #ccc;
  background-color: #f9f9f9;
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
.modal pre {
  background: #f3f3f3;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 300px;
}
.modal-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
</style>
