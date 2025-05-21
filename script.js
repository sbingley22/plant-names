const gameContainer = document.getElementById('game-container')
const mainMenuContainer = document.getElementById('main-menu-container')
const quizContainer = document.getElementById('quiz-container')
const infoContainer = document.getElementById('info-container')

function hideMenuTabs() {
  mainMenuContainer.style.display = 'none'
  quizContainer.style.display = 'none'
  infoContainer.style.display = 'none'
}

function showMainMenu() {
  hideMenuTabs()
  mainMenuContainer.style.display = 'flex'
}
function showInfo() {
  hideMenuTabs()
  infoContainer.style.display = 'flex'
}
