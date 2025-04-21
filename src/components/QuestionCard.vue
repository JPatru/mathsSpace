<template>
  <div class="question-card" @click="revealAnswer">
    <p v-html="question.question" class="question-text"></p>

    <ul v-if="question.reponses">
      <li
        v-for="(rep, i) in question.reponses"
        :key="i"
        :class="{ correct: showAnswer && rep === question.bonne_reponse }"
      >
        <span v-html="rep"></span>
      </li>
    </ul>

    <div
      v-else-if="showAnswer"
      class="reponse-directe"
      v-html="question.bonne_reponse"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

defineOptions({ name: 'QuestionCard' })

const props = defineProps<{
  question: {
    question: string
    reponses?: string[]
    bonne_reponse: string
  }
}>()

const showAnswer = ref(false)
function revealAnswer() {
  showAnswer.value = true
}

watch(showAnswer, async (val) => {
  if (val && typeof window.MathJax !== 'undefined' && window.MathJax.typesetPromise) {
    await nextTick() // ⬅️ attend que la réponse soit dans le DOM
    window.MathJax.typesetPromise()
  }
})

watch(() => props.question, () => {
  showAnswer.value = false
}, { immediate: true, deep: true })
</script>

<style scoped>
.question-card {
  font-family: 'Inter', sans-serif;
  background-color: #eef2f7;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: box-shadow 0.2s ease-in-out;
  cursor: pointer;
}

.question-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.question-card ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
}
.question-card .question-text {
  /*font-family: 'Fredoka', sans-serif;*/
  font-size: 1rem;
}
.question-card li {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  margin: 0.25rem 0;
  transition: background-color 0.2s ease-in-out;
}

.correct {
  background-color: #d4edda !important;
  font-weight: bold;
  color: inherit;
}

.reponse-directe {
  margin-top: 1rem;
  background-color: #d4edda;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 500;
  color: #333;
}
</style>
