const alertSound = new Audio("https://www.myinstants.com/media/sounds/alarm.mp3"); 

const sections = document.querySelectorAll("section");

function updateScoreDisplay() {
    let bestScoresList = document.getElementById("best-scores");
    let lastScoreDisplay = document.getElementById("last-score");

    // Récupérer les scores enregistrés
    let scores = JSON.parse(localStorage.getItem("bestScores")) || [];

    // Mettre à jour le dernier score
    if (scores.length > 0) {
        lastScoreDisplay.innerText = `${scores[0].score} (${scores[0].time})`;
    }

    // Vider la liste des meilleurs scores
    bestScoresList.innerHTML = "";

    // Ajouter les scores au HTML
    scores.forEach((entry, index) => {
        let li = document.createElement("li");
        li.innerText = `#${index + 1} - ${entry.score} points (${entry.time})`;
        bestScoresList.appendChild(li);
    });
}

let timer; // Stocke l'intervalle du timer
let timeLeft = 300; // 5 minutes (300 secondes)


function showSection(sectionId) {
    sections.forEach(sec => sec.classList.add("hidden"));
    let targetSection = document.getElementById(sectionId);
    targetSection.classList.remove("hidden");

    // Récupère la position exacte de la section sélectionnée
    let sectionPosition = targetSection.getBoundingClientRect().top + window.scrollY;

    // Ajuste le scroll pour que le texte apparaisse à 170px du haut
    let scrollTarget = sectionPosition - 170;

    // Animation fluide du scrolling
    window.scrollTo({ top: scrollTarget, behavior: "smooth" });

    // Met à jour les scores si on va dans l'onglet "Scores"
    if (sectionId === "scores") {
        updateScoreDisplay();
    }
}




// Données des quiz
const quizData = {
    beginner: [
        { question: "Qu'est-ce que la cristallisation ?", answers: ["Processus chimique", "Réaction thermique", "Fusion"], correct: 0 },
        { question: "Quel solvant est souvent utilisé ?", answers: ["Eau", "Acide sulfurique", "Ethanol"], correct: 0 },
    ],
    intermediate: [
        { question: "À quelle température l'eau cristallise ?", answers: ["0°C", "100°C", "50°C"], correct: 0 },
        { question: "Quel est le but principal ?", answers: ["Purification", "Évaporation", "Fusion"], correct: 0 },
    ],
    advanced: [
        { question: "Quel type de cristallisation existe ?", answers: ["Fractionnée", "Fusion", "Condensation"], correct: 0 },
        { question: "Comment améliorer la cristallisation ?", answers: ["Refroidissement lent", "Chauffage rapide", "Congélation"], correct: 0 },
    ]
};

let currentQuiz, currentQuestionIndex, score;

function startQuiz(level) {  
    currentQuiz = quizData[level];
    currentQuestionIndex = 0;
    score = 0;
    timeLeft = 300; // Réinitialise le temps à 5 minutes
    updateTimerDisplay();
      // Démarrer le timer
    clearInterval(timer); // Réinitialise le timer s'il était actif
    timer = setInterval(updateTimer, 1000); // mise à jour toutes les 1000 ms
  
    showQuestion();
    document.getElementById("quiz-container").classList.remove("hidden");
    document.getElementById("quiz-result").classList.add("hidden");
}

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--; // Diminue le temps restant
        updateTimerDisplay();

        // Joue un son si le temps restant est 10 secondes
        if (timeLeft === 10) {
            alertSound.play();
        }
    } else {
        clearInterval(timer);
        showTimeUpMessage(); // Affiche un message "Temps écoulé !"
    }
}

/*//Ajouter un timer
function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--; // Diminue le temps restant
        updateTimerDisplay();
    } else {
        clearInterval(timer);
        endQuiz(); // Termine le quiz quand le temps est écoulé
    }
}*/

// Met à jour l’affichage numérique du timer (MM:SS). Met à jour la largeur de la barre de temps pour qu’elle diminue progressivement. Change la barre en rouge quand il reste moins d’une minute !
function updateTimerDisplay() {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    document.getElementById("timer-text").innerText = 
        (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

    // Mise à jour de la barre de progression
    let progress = (timeLeft / 300) * 100; // Calcul du pourcentage restant
    document.getElementById("timer-bar").style.width = progress + "%";

    // Change la couleur en rouge quand il reste moins d'une minute
    if (timeLeft <= 60) {
        document.getElementById("timer-bar").style.background = "#dc3545"; // Rouge
    }
}




function showQuestion() {
    let q = currentQuiz[currentQuestionIndex];
    document.getElementById("question").innerText = q.question;
    let answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = ""; // Nettoyage des anciennes réponses

    q.answers.forEach((answer, i) => {
        let btn = document.createElement("button");
        btn.innerText = answer;
        btn.classList.add("answer-btn");
        btn.onclick = () => checkAnswer(i, btn);
        answersDiv.appendChild(btn);
    });
}


function checkAnswer(selected, selectedBtn) {
    let correctIndex = currentQuiz[currentQuestionIndex].correct;
    let answerButtons = document.querySelectorAll(".answer-btn");

    // Ajouter les couleurs
    answerButtons.forEach((btn, index) => {
        if (index === correctIndex) {
            btn.classList.add("correct"); // Bonne réponse en vert
        }
        if (index === selected && index !== correctIndex) {
            btn.classList.add("wrong"); // Mauvaise réponse en rouge
        }
        // Désactiver tous les boutons après réponse
        btn.disabled = true;
    });

    // Mise à jour du score si la réponse est correcte
    if (selected === correctIndex) score++;

    // Afficher le bouton "Suivant"
    document.getElementById("next-btn").classList.remove("hidden");
}

// Passer à la question suivante
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuiz.length) {
        showQuestion();
        document.getElementById("next-btn").classList.add("hidden"); // Cacher le bouton "Suivant"
    } else {
        endQuiz();
    }
}


function endQuiz() {
    clearInterval(timer); // Stoppe le timer à la fin du quiz
    document.getElementById("score").innerText = score;
    document.getElementById("quiz-container").classList.add("hidden");
    document.getElementById("quiz-result").classList.remove("hidden");
    let resultContainer = document.getElementById("quiz-result");
  
    setTimeout(() => {
        resultContainer.classList.add("show");
    }, 200);
        resultContainer.classList.remove("hidden");
  
    // Stockage du score avec l'heure actuelle
    let now = new Date();
    let scoreEntry = {
        score: score,
        time: now.toLocaleString()
    };

    // Récupérer les scores existants depuis localStorage
    let scores = JSON.parse(localStorage.getItem("bestScores")) || [];

    // Ajouter le nouveau score
    scores.push(scoreEntry);

    // Trier par score décroissant
    scores.sort((a, b) => b.score - a.score);

    // Garder uniquement les 3 meilleurs
    scores = scores.slice(0, 3);

    // Sauvegarder dans localStorage
    localStorage.setItem("bestScores", JSON.stringify(scores));

    // Mettre à jour l'affichage
    updateScoreDisplay();
}


function restartQuiz() {
    document.getElementById("quiz-result").classList.add("hidden");
    showSection("quiz");
}

function showTimeUpMessage() {
    let messageBox = document.getElementById("time-up-message");
    messageBox.classList.add("show");

    setTimeout(() => {
        messageBox.classList.remove("show");
        endQuiz(); // Termine le quiz après 2 secondes
    }, 2000);
}