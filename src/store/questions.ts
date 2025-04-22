import { defineStore } from 'pinia'
import questionsData from '../data/questions.json'

export interface Question {
  question: string;
  reponses?: string[];
  bonne_reponse: string;
  classe: string;
  chapitres: string[];
}

export const useQuestionStore = defineStore('questionStore', {
  state: () => ({
    questions: questionsData as Question[],
    currentQuestions: [] as Question[]
  }),
  actions: {
    loadRandomQuestions(count = 1, classe: string | null = null, chapitres: string[] = []) {
      let filtered = this.questions

      if (classe) {
        filtered = filtered.filter(q => q.classe === classe)
      }
      if (chapitres.length > 0) {
        filtered = filtered.filter(q => chapitres.some(ch => q.chapitres.includes(ch)))
      }

      const shuffled = [...filtered].sort(() => Math.random() - 0.5)
      this.currentQuestions = shuffled.slice(0, Math.min(count, shuffled.length))
    }
  }
})