<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue'
import { ref, computed, onUnmounted, watch, nextTick } from 'vue'
import defiQuestions from '../data/defi.json'

type EndReason = 'time' | 'out' | 'max'

/** ========= PRESETS (1 seul slider : Vert / Bleu / Rouge) ========= **/
type Preset = {
  minutes: number
  penalty: number
  delay: number
  tone: 'green' | 'blue' | 'red'
  emoji: string
  name: string
}

type SessionEntry = {
  id: number
  question: string
  reponses: string[]
  bonne_reponse: string
  choix: string
  isCorrect: boolean
}

const sessionLog = ref<SessionEntry[]>([])
const showReport = ref(false)

const PRESETS: Record<1 | 2 | 3, Preset> = {
  1: { minutes: 3,   penalty: 0, delay: 2, tone: 'green', emoji: '🟩', name: 'Tranquille'    },
  2: { minutes: 2,   penalty: 0.5, delay: 2, tone: 'blue',  emoji: '🟦', name: 'Tonique' },
  3: { minutes: 0.25, penalty: 1, delay: 3, tone: 'red',   emoji: '🟥', name: 'Turbo'   }
}
const selectedLevel = ref<1 | 2 | 3>(2)
const selectedPreset = computed(() => PRESETS[selectedLevel.value])

/** ========= Niveaux disponibles selon le JSON ========= **/
const availableClasses = [...new Set((defiQuestions as any[]).map(q => q.classe))] as string[]
const selectedClasse = ref<string>(availableClasses[0] || '4e')

/** ========= Mode Debug ========= **/
const isDebugMode = ref(false)
const debugTotalQuestions = ref(0)     // ➜ total du pool en debug

/** ========= État de partie ========= **/
const isRunning  = ref(false)
const finalScreen = ref(false)
const endReason  = ref<EndReason | null>(null)


const gameInitialTime = ref(120)
const timeLeft = ref(gameInitialTime.value)
let timerId: number | null = null

const totalQuestions = ref(0)
const correctCount   = ref(0)
const score          = ref(0)
const streak         = ref(0)
const isLocked       = ref(false)
const wrongFlash     = ref(false)

/** ========= Données questions ========= **/
type DefiQuestion = {
  id: number
  classe: string
  chapitres: string[]
  question: string
  reponses: string[]
  bonne_reponse: string
}
const currentQuestion = ref<DefiQuestion | null>(null)
const questionQueue   = ref<DefiQuestion[]>([])

/** ========= Calculs affichage ========= **/
const awardedPerGood = computed(() => {
  if (streak.value >= 5) return 2
  if (streak.value >= 3) return 1.5
  return 1
})
const scoreSur20 = computed(() => Math.round(Math.min(score.value, 20) * 10) / 10)
const timeProgress = computed(() => (timeLeft.value / gameInitialTime.value) * 100)
const PENALTY_POINTS   = computed(() => selectedPreset.value.penalty)
const PENALTY_DELAY_MS = computed(() => selectedPreset.value.delay * 1000)

/** ========= outils ========= **/
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** ========= Construction de la file de questions ========= **/
function buildQueue() {
  const pool = (defiQuestions as DefiQuestion[]).filter(q => q.classe === selectedClasse.value)

  if (isDebugMode.value) {
    questionQueue.value = pool.sort((a, b) => a.id - b.id) // ordre croissant
    debugTotalQuestions.value = pool.length                 // ➜ mémorise le total
  } else {
    questionQueue.value = shuffle(pool)
    debugTotalQuestions.value = 0                           // inutile hors debug
  }
}



/** ========= Impression du rapport final ========= **/
function printReport() {
  window.print()
}



/** ========= Logique des questions ========= **/
function loadNextQuestion() {
  if (questionQueue.value.length === 0) {
    stopGame('out')
    return
  }
  currentQuestion.value = questionQueue.value.shift()!
  wrongFlash.value = false
}

function chooseAnswer(rep: string) {
  if (!currentQuestion.value) return

  const q = currentQuestion.value

  // --- ENREGISTREMENT DE LA RÉPONSE ---
  sessionLog.value.push({
    id: q.id,
    question: q.question,
    reponses: q.reponses,
    bonne_reponse: q.bonne_reponse,
    choix: rep,
    isCorrect: rep === q.bonne_reponse
  })

  // --- MODE DEBUG : on avance sans scorer ---
  if (isDebugMode.value) {
    loadNextQuestion()
    return
  }

  if (isLocked.value) return
  totalQuestions.value++

  if (rep === q.bonne_reponse) {
    streak.value++
    correctCount.value++
    score.value += awardedPerGood.value
    if (score.value >= 20) {
      stopGame('max')
      return
    }
    loadNextQuestion()
  } else {
    streak.value = 0
    wrongFlash.value = true
    if (PENALTY_POINTS.value > 0) {
      score.value = Math.max(0, score.value - PENALTY_POINTS.value)
    }
    isLocked.value = true
    setTimeout(() => {
      isLocked.value = false
      if (!finalScreen.value) loadNextQuestion()
    }, PENALTY_DELAY_MS.value)
  }
}



/** ========= Cycle du jeu ========= **/
function startTimer() {
  if (isDebugMode.value) return   // ➜ chrono désactivé en debug
  timerId = window.setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) { timeLeft.value = 0; stopGame('time') }
  }, 1000)
}

function stopTimer() {
  if (timerId !== null) { clearInterval(timerId); timerId = null }
}
function startGame() {
  sessionLog.value = []
  showReport.value = false
  isRunning.value = true
  finalScreen.value = false
  endReason.value = null

  gameInitialTime.value = Math.round(selectedPreset.value.minutes * 60)
  timeLeft.value = gameInitialTime.value

  totalQuestions.value = 0
  correctCount.value   = 0
  score.value          = 0
  streak.value         = 0
  isLocked.value       = false
  wrongFlash.value     = false

  buildQueue()
  loadNextQuestion()
  startTimer()
}
function stopGame(reason: EndReason = 'time') {
  stopTimer()
  isRunning.value = false
  finalScreen.value = true
  endReason.value = reason
}

/** ========= MathJax ========= **/
watch(currentQuestion, async (val) => {
  if (!val) return
  const mj = (window as any)?.MathJax
  if (!mj?.typesetPromise) return
  await nextTick()
  mj.typesetPromise()
})

watch(showReport, async (val) => {
  if (!val) return
  const mj = (window as any)?.MathJax
  if (!mj?.typesetPromise) return
  await nextTick()
  mj.typesetPromise()
})

onUnmounted(() => stopTimer())
</script>

<template>
  <div class="defi-wrapper">  
  
    <div class="app-header-wrapper">
      <AppHeader />
    </div>
    <!-- HEADER -->
    <header class="header-bar">
      <!-- MODE NORMAL -->
      <template v-if="!isDebugMode">
        <div class="score-block">
          <div class="score-label">SCORE ACTUEL</div>
          <div class="score-value">
            {{ scoreSur20 }}/20
            <span v-if="streak >= 3" class="combo-badge" :class="{ big: streak >= 5 }">
              Combo ×{{ streak }} • +{{ awardedPerGood }}
            </span>
          </div>
          <div class="score-detail">
            {{ correctCount }} bonne<span v-if="correctCount !== 1">s</span> /
            {{ totalQuestions }} tentatives
          </div>
        </div>

        <div class="timer-block">
          <div class="timer-label">TEMPS RESTANT</div>
          <div class="timer-circle-wrapper">
            <svg class="timer-circle-svg" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" stroke-width="4" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="#0ea5e9" stroke-width="4" stroke-linecap="round"
                      :stroke-dasharray="100" :stroke-dashoffset="100 - timeProgress" />
            </svg>
            <div class="timer-value">{{ timeLeft }}</div>
          </div>
          <div class="timer-total">/ {{ gameInitialTime }} s</div>
        </div>
      </template>

      <!-- MODE DEBUG -->
      <template v-else>
        <div class="debug-header">
          <span class="debug-badge">Mode debug </span>
          <span class="debug-progress" v-if="currentQuestion">
            {{ (debugTotalQuestions - questionQueue.length) }}/{{ debugTotalQuestions }}
          </span>
        </div>
      </template>
    </header>


    <!-- CONTENU -->
    <main class="main-area">
      <!-- AVANT DEMARRAGE -->
      <section v-if="!isRunning && !finalScreen" class="card intro-card">
        <h2 class="card-title">Défi Maths</h2>

        <!-- Sélecteur de classe -->
        <div class="setting">
          <label for="classe">Niveau : </label>
          <select id="classe" v-model="selectedClasse">
            <option v-for="c in availableClasses" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <!-- Slider 3 niveaux -->
        <div class="preset">
          <label for="level">Niveau :
            <span class="preset-pill" :class="selectedPreset.tone">
              {{ selectedPreset.emoji }} {{ selectedPreset.name }}
            </span>
          </label>
          <input id="level" type="range" min="1" max="3" step="1" v-model.number="selectedLevel" />
          <div class="ticks three"><span>🟩</span><span>🟦</span><span>🟥</span></div>
          <div class="preset-details">
            Temps <strong>{{ Math.round(selectedPreset.minutes * 60) }}</strong> s •
            Pénalité <strong>-{{ selectedPreset.penalty }}</strong> pt •
            Délai <strong>{{ selectedPreset.delay }}</strong> s
          </div>
        </div>

        <!-- Mode debug -->
        <div class="setting debug-setting">
          <label>
            <input type="checkbox" v-model="isDebugMode" />
            Mode debug (ordre + id + solution)
          </label>
        </div>

        <button class="btn-primary" @click="startGame">Lancer le défi</button>
      </section>

      <!-- EN COURS -->
      <section v-else-if="isRunning && !finalScreen && currentQuestion"
               class="card question-card-defi" :class="{ locked: isLocked, wrong: wrongFlash }">
        <p v-if="isDebugMode && currentQuestion" class="debug-id">ID : {{ currentQuestion.id }}</p>

        <p class="question-text" v-html="currentQuestion.question"></p>

        <ul class="answers-list">
          <li
            v-for="(rep, i) in currentQuestion.reponses"
            :key="i"
            class="answer-item"
            :class="{ correct: isDebugMode && rep === currentQuestion.bonne_reponse }"
            @click="chooseAnswer(rep)"
          >
            <span v-html="rep"></span>
          </li>

        </ul>

        <div class="meta-line">
          <span v-if="currentQuestion.classe">{{ currentQuestion.classe }}</span>
          <span v-if="currentQuestion.chapitres && currentQuestion.chapitres.length">
            — {{ currentQuestion.chapitres.join(', ') }}
          </span>
        </div>
      </section>

      <!-- FIN -->
      <section v-else-if="finalScreen" class="card final-card">
        <h2 class="card-title">
          {{
            endReason === 'out'
              ? (isDebugMode ? 'Fin du défilement (debug) ✅' : 'Plus de questions ✅')
              : endReason === 'max'
              ? 'Objectif atteint 🎉'
              : 'Temps écoulé ⏲️'
          }}
        </h2>

        <template v-if="!isDebugMode">
          <div class="final-score">{{ scoreSur20 }}/20</div>
          <div class="final-details">
            Bonnes réponses : <strong>{{ correctCount }}</strong><br />
            Total de questions jouées : <strong>{{ totalQuestions }}</strong>
          </div>
        </template>

        <template v-else>
          <div class="final-details">
            Questions parcourues : <strong>{{ debugTotalQuestions }}</strong><br />
            (score et chrono désactivés en mode debug)
          </div>
        </template>
        
        <button class="btn-secondary" @click="showReport = !showReport" v-if="sessionLog.length">
          {{ showReport ? 'Masquer le rapport' : 'Voir le rapport' }}
        </button>

        <button class="btn-secondary" v-if="showReport" @click="printReport">
          Imprimer le rapport (PDF)
        </button>

        <button class="btn-primary" @click="startGame">Rejouer</button>

        <!-- ===== RAPPORT DE SESSION ===== -->
        <div v-if="showReport" class="report">
          <h3 class="report-title">Rapport de la session</h3>

          <div v-for="(e, i) in sessionLog" :key="i" class="report-item">
            <div class="report-head">
              <span class="report-id">#{{ e.id }}</span>
              <span :class="['report-badge', e.isCorrect ? 'ok' : 'ko']">
                {{ e.isCorrect ? 'OK' : 'Erreur' }}
              </span>
            </div>

            <div class="report-question" v-html="e.question"></div>

            <ul class="report-answers">
              <li
                v-for="(r, j) in e.reponses"
                :key="j"
                :class="{
                  chosen: r === e.choix,
                  correct: r === e.bonne_reponse
                }"
              >
                <span v-html="r"></span>
              </li>
            </ul>

            <div class="report-line">
              Réponse de l’élève :
              <strong><span v-html="e.choix"></span></strong>
            </div>

            <div class="report-line">
              Correction :
              <strong><span v-html="e.bonne_reponse"></span></strong>
            </div>
          </div>
        </div>
        
      </section>

    </main>
  </div>
</template>

<style scoped>
  
/* Wrapper du AppHeader dans la page Défi */
.app-header-wrapper {
  width: 100%;
  max-width: 500px;        /* mets la même valeur que ton layout défi */
  margin: 0 auto;          /* centre parfaitement */
}

/* Si jamais l'AppHeader a un width:100% interne, on le laisse mais on centre le wrapper */
.app-header-wrapper :deep(.header-bar) {
  width: 100%;
  box-sizing: border-box;
}


/* Descendre uniquement le bouton burger du AppHeader, dans la page Défi */
.app-header-wrapper :deep(.burger) {
  transform: translateY(20px);
}


.defi-wrapper {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", Roboto, "Helvetica Neue", sans-serif;
  min-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #1e293b;
  padding: 1rem;
}

.header-bar {
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #1e293b;
}

.score-block {
  text-align: left;
  line-height: 1.2;
}

.score-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.combo-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: #dcfce7;
  color: #166534;
  border: 1px solid #16a34a;
}

.combo-badge.big {
  background: #bbf7d0;
}

.score-detail {
  font-size: 0.8rem;
  color: #64748b;
}

.timer-block {
  text-align: right;
  line-height: 1.2;
  color: #1e293b;
}

.timer-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
}

.timer-circle-wrapper {
  position: relative;
  width: 56px;
  height: 56px;
  margin: 0.25rem auto;
}

.timer-circle-svg {
  width: 56px;
  height: 56px;
  transform: rotate(-90deg);
  display: block;
}

.timer-value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: #1e293b;
}

.timer-total {
  font-size: 0.8rem;
  color: #64748b;
}

.main-area {
  width: 100%;
  max-width: 500px;
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.card {
  width: 100%;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  padding: 1rem 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
  color: #1e293b;
}

.intro-card .card-text {
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.4;
  max-width: 32rem;
  margin: 0 auto;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.btn-primary {
  background-color: #0ea5e9;
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #0284c7;
}

.setting {
  margin-bottom: 0.5rem;
}

.debug-setting {
  font-size: 0.8rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.debug-id {
  font-size: 0.8rem;
  color: #94a3b8;
  font-family: monospace;
  margin: -0.5rem 0 0.3rem;
}

.preset {
  display: grid;
  gap: 0.5rem;
  text-align: left;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  padding: 0.75rem;
  background: #f8fafc;
}

.preset label {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
}

.preset input[type='range'] {
  width: 100%;
}

.ticks.three {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  margin-top: 0.2rem;
}

.preset-details {
  font-size: 0.9rem;
  color: #475569;
}

.preset-pill {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.8rem;
  margin-left: 0.25rem;
  border: 1px solid transparent;
}

.preset-pill.green {
  background:#dcfce7;
  color:#166534;
  border-color:#16a34a;
}

.preset-pill.blue {
  background:#dbeafe;
  color:#1e40af;
  border-color:#3b82f6;
}

.preset-pill.red {
  background:#fee2e2;
  color:#991b1b;
  border-color:#ef4444;
}

.question-card-defi {
  text-align: left;
  transition: border-color .15s ease, background-color .15s ease, opacity .15s ease;
}

.locked {
  pointer-events: none;
  opacity: 0.6;
}

.wrong {
  animation: flashRed 0.3s ease-in-out;
  border-color: #ef4444 !important;
}

@keyframes flashRed {
  0% { background-color: #fee2e2; }
  100% { background-color: #ffffff; }
}

.answers-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.answer-item {
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.3;
  color: #1e293b;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.answer-item:hover {
  background-color: #f0f9ff;
  border-color: #38bdf8;
}

.question-text {
  font-size: 1rem;
  line-height: 1.4;
  color: #1e293b;
}

.meta-line {
  text-align: right;
  font-size: 0.7rem;
  color: #94a3b8;
  line-height: 1.2;
}

.final-card {
  text-align: center;
}

.final-score {
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
}

.final-details {
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.4;
}

.debug-setting {
  font-size: 0.85rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.debug-id {
  font-size: 0.8rem;
  color: #94a3b8;
  font-family: monospace;
  margin: -0.25rem 0 0.25rem;
}

.answer-item.correct {
  background-color: #ecfdf5;
  border-color: #10b981;
  color: #065f46;
  font-weight: 600;
}

.btn-secondary {
  margin-top: 0.5rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.5rem 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.report {
  margin-top: 1rem;
  text-align: left;
}

.report-item {
  border-top: 1px solid #e2e8f0;
  padding: 0.75rem 0;
}

.report-head {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.report-id {
  font-family: monospace;
  color: #64748b;
}

.report-badge.ok {
  color: #065f46;
}

.report-badge.ko {
  color: #991b1b;
}

.report-answers li.correct {
  background: #ecfdf5;
}

.report-answers li.chosen {
  outline: 2px solid #38bdf8;
}

@media print {
  body {
    background: white;
  }  
  
  @page {
    margin: 0.8cm;
  }

  /* Masquer tout sauf le rapport */
  .header-bar,
  .btn-primary,
  .btn-secondary:not(.print-keep),
  .intro-card {
    display: none !important;
  }

  .report {
    display: block;
    font-size: 11pt;
    column-count: 2;
    column-gap: 0.5cm;
  }

  .report-item {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  
  /* Force le navigateur à conserver les couleurs */
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Au cas où le background est ignoré : bordure + texte vert */
  .report-answers li.correct {
    border: 2px solid #10b981 !important;
    color: #065f46 !important;
    background: #ecfdf5 !important; /* si fond imprimé, tant mieux */
  }

  /* Pareil pour le choix de l'élève si tu veux */
  .report-answers li.chosen {
    outline: 2px solid #0ea5e9 !important;
    outline-offset: 1px !important;
  }
}


</style>

