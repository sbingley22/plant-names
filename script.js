const gameContainer = document.getElementById('game-container')
const mainMenuContainer = document.getElementById('main-menu-container')
const quizContainer = document.getElementById('quiz-container')
const statsContainer = document.getElementById('stats-container')
const infoContainer = document.getElementById('info-container')

function hideMenuTabs() {
  mainMenuContainer.style.display = 'none'
  quizContainer.style.display = 'none'
  statsContainer.style.display = 'none'
  infoContainer.style.display = 'none'
}

function showMainMenu() {
  hideMenuTabs()
  mainMenuContainer.style.display = 'flex'
}
function showStats() {
  hideMenuTabs()
  statsContainer.style.display = 'flex'
  populateStats()
}
function showInfo() {
  hideMenuTabs()
  infoContainer.style.display = 'flex'
}
function showQuiz(amount, unanswered=false) {
  hideMenuTabs()
  quizContainer.style.display = 'flex'
  startQuiz(amount, unanswered)
}

//localStorage.removeItem('answeredQuestions')
let answeredQuestions = []
const loadedQuestions =localStorage.getItem('answeredQuestions')
if (loadedQuestions) answeredQuestions = JSON.parse(loadedQuestions)
//console.log("Answered Questions: ", answeredQuestions)

function updateAnsweredQuestions(thisQuestion) {
  if (answeredQuestions.includes(thisQuestion)) return
  answeredQuestions.push(thisQuestion)
  const jsonString = JSON.stringify(answeredQuestions)
  localStorage.setItem('answeredQuestions', jsonString)
}

function populateStats() {
  if (!questionsData) {
    console.warn("Can't find questions data")
    return
  }
  let easyQuestions = 0
  let easyAnswers = 0
  let mediumQuestions = 0
  let mediumAnswers = 0
  let hardQuestions = 0
  let hardAnswers = 0

  questionsData.forEach(question => {
    if (question.difficulty === 'medium') {
      mediumQuestions++
      if (answeredQuestions.includes(question.question)) mediumAnswers++
    }
    else if (question.difficulty === 'hard') {
      hardQuestions++
      if (answeredQuestions.includes(question.question)) hardAnswers++
    }
    else {
      easyQuestions++
      if (answeredQuestions.includes(question.question)) easyAnswers++
    }
  });

  const backBtn = document.createElement('button')
  backBtn.innerText = 'back'
  backBtn.onclick = showMainMenu

  const h3 = document.createElement('h3')
  h3.innerText = 'Questions Answered:'

  const easyQs = document.createElement('p')
  easyQs.innerText = `EASY: ${easyAnswers}/${easyQuestions}`
  const mediumQs = document.createElement('p')
  mediumQs.innerText = `MEDIUM: ${mediumAnswers}/${mediumQuestions}`
  const hardQs = document.createElement('p')
  hardQs.innerText = `HARD: ${hardAnswers}/${hardQuestions}`

  statsContainer.innerHTML = ''
  statsContainer.appendChild(backBtn)
  statsContainer.appendChild(h3)
  statsContainer.appendChild(easyQs)
  statsContainer.appendChild(mediumQs)
  statsContainer.appendChild(hardQs)
}

let questionIndex = 0
let questions = []

function startQuiz(amount, unanswered) {
  questionIndex = 0
  populateQuestions(amount, unanswered)
  displayQuestion()
}

function populateQuestions(amount, unanswered) {
  questions = []
  if (!questionsData) {
    console.warn("Can't find questions data")
    return false
  }
  let sliceAmount = amount
  if (questionsData.length < amount) {
    console.warn('Questions data is too small for this amount of questions')
    sliceAmount = questionsData.length
  }

  // filter questions data based on unanswered
  const arr = unanswered ? 
    [...questionsData.filter((item) => {
      if (answeredQuestions.includes(item.question)) return false
      return true
    })] 
    : 
    [...questionsData]

  // randomly sort questions
  if (arr.length < sliceAmount) sliceAmount = arr.length
  questions = [...arr].sort(() => 0.5 - Math.random()).slice(0, sliceAmount)
}

function displayQuestion() {
  if (questionIndex >= questions.length) {
    showMainMenu()
    return
  }

  const question = questions[questionIndex]

  const quitBtn = document.createElement('button')
  quitBtn.textContent = 'quit'
  quitBtn.style.alignSelf = 'end'
  quitBtn.style.width = '30%'
  quitBtn.addEventListener('click', ()=>{
    showMainMenu()
  })

  const h3 = document.createElement('h3')
  h3.textContent = question.question

  const nextQuestionBtn = document.createElement('button')
  nextQuestionBtn.id = 'next-question-btn'
  nextQuestionBtn.innerText = "Next"
  nextQuestionBtn.style.display = 'none'
  nextQuestionBtn.onclick = () => {
    questionIndex += 1
    displayQuestion()
  }

  let answersDiv = null
  if (question.type === 'multi-choice') answersDiv = createMultiChoiceDiv(question)
  else answersDiv = createSingleChoiceDiv(question)

  const quizInfo = document.createElement('p')
  quizInfo.id = "quiz-info"

  quizContainer.innerHTML = ''
  quizContainer.appendChild(quitBtn)
  quizContainer.appendChild(h3)
  quizContainer.appendChild(answersDiv)
  quizContainer.appendChild(quizInfo)
  quizContainer.appendChild(nextQuestionBtn)
}

function createSingleChoiceDiv(question) {
  const form = document.createElement('form')
  form.id = "quiz-form"

  const answer = question.options[question.answer]
  
  const options = [...question.options].sort(() => 0.5 - Math.random())
  options.forEach((o, index) => {
    const radio = document.createElement('input')
    radio.type = "radio"
    radio.id = o
    radio.value = o
    radio.name = 'choices'

    const label = document.createElement('label')
    label.htmlFor = o
    label.innerText = o

    const d = document.createElement('div')
    d.appendChild(radio)
    d.appendChild(label)
    form.appendChild(d)
  })

  const submit = document.createElement('button')
  submit.type = "submit"
  submit.textContent = "Answer"

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const selectedAnswer = form.querySelector('input[name="choices"]:checked')
    const info = document.getElementById('quiz-info')
    if (!selectedAnswer) {
      info.textContent = 'please selected an answer'
      info.style.color = 'black'
      return
    }
    if (selectedAnswer.value === answer) {
      info.textContent = answer + " is correct!"
      info.style.color = 'blue'
      info.style.border = "4px solid blue"
      updateAnsweredQuestions(question.question)
    }
    else {
      info.textContent = "Wrong, the answer is: " + answer
      info.style.color = 'black'
      info.style.border = "4px solid red"
    }
    const nextQuestionBtn = document.getElementById('next-question-btn')
    nextQuestionBtn.style.display = 'inline'
    form.innerHTML = ''
  })
  form.appendChild(submit)

  return form
}

function createMultiChoiceDiv(question) {
  const form = document.createElement('form')
  form.id = "quiz-form"

  const answers = []
  question.answer.forEach(answerIndex => {
    answers.push(question.options[answerIndex])
  });
  
  const options = [...question.options].sort(() => 0.5 - Math.random())
  options.forEach((o) => {
    const checkbox = document.createElement('input')
    checkbox.type = "checkbox"
    checkbox.id = "mc: " + o
    checkbox.value = o
    checkbox.name = 'choices'

    const label = document.createElement('label')
    label.htmlFor = "mc: " + o
    label.innerText = o

    const d = document.createElement('div')
    d.appendChild(checkbox)
    d.appendChild(label)
    form.appendChild(d)
  })

  const submit = document.createElement('button')
  submit.type = "submit"
  submit.textContent = "Answer"

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const selectedAnswers = form.querySelectorAll('input[name="choices"]:checked')
    const info = document.getElementById('quiz-info')

    if (!selectedAnswers.length === 0) {
      info.textContent = 'please selecte at least one answer'
      info.style.color = 'black'
      return
    }

    const selectedValues = Array.from(selectedAnswers).map(checkbox => checkbox.value)

    const doArraysMatch = (arr1, arr2) => {
      if (arr1.length !== arr2.length) return false
      const sortedArr1 = arr1.sort()
      const sortedArr2 = arr2.sort()
      for (let i=0; i<arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false
      }
      return true
    }

    if (doArraysMatch(selectedValues, answers)) {
      info.textContent = "You are correct!"
      info.style.color = 'blue'
      info.style.border = "4px solid blue"
      updateAnsweredQuestions(question.question)
    }
    else {
      info.textContent = "Wrong, the answers are: " + answers.join(', ')
      info.style.color = 'black'
      info.style.border = "4px solid red"
    }

    const nextQuestionBtn = document.getElementById('next-question-btn')
    nextQuestionBtn.style.display = 'inline'
    form.innerHTML = ''
  })
  form.appendChild(submit)

  return form

}
