async function loadData() {
  const res = await fetch('svo.json');
  return await res.json();
}

function uniqueWords(data, key) {
  const set = new Set();
  data.forEach(item => set.add(item[key].text));
  return Array.from(set);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const wordBankEl = document.getElementById('word-bank');
const imgEl = document.getElementById('word-image');
const sentenceEl = document.getElementById('sentence');
const feedbackEl = document.getElementById('feedback');

let data = [];
let stage = 0; // 0 subject,1 verb,2 object
let index = 0;
let subjects = [], verbs = [], objects = [];

function showFeedback(message, positive) {
  feedbackEl.textContent = message;
  feedbackEl.className = positive ? 'positive' : 'negative';
  setTimeout(() => {
    feedbackEl.textContent = '';
    feedbackEl.className = '';
  }, 1000);
}

function updateWordBank() {
  wordBankEl.innerHTML = '';
  let words = stage === 0 ? subjects : stage === 1 ? verbs : objects;
  const entry = currentEntry();
  const correctWord = stage === 0 ? entry.subject.text : stage === 1 ? entry.verb.text : entry.object.text;

  // Get 4 random words (excluding the correct one) + the correct word
  const otherWords = words.filter(word => word !== correctWord);
  const randomWords = shuffle([...otherWords]).slice(0, 4);
  const wordsToShow = shuffle([...randomWords, correctWord]);

  wordsToShow.forEach(word => {
    const btn = document.createElement('button');
    btn.textContent = word;
    btn.addEventListener('click', (e) => handleSelect(word, e.target));
    wordBankEl.appendChild(btn);
  });
}

function currentEntry() {
  return data[index];
}

function updateImage() {
  const entry = currentEntry();
  const imgPath = stage === 0 ? entry.subject.mediaPath : stage === 1 ? entry.verb.mediaPath : entry.object.mediaPath;
  imgEl.src = imgPath;
}

function revealSentence() {
  const entry = currentEntry();
  const fs = entry.fullSentence;

  // Create sentence with blanks for unguessed words
  let displaySentence = fs;

  if (stage === 0) {
    // Haven't guessed subject yet - show blank for subject
    displaySentence = displaySentence.replace(new RegExp(entry.subject.text, 'gi'), '_____');
    displaySentence = displaySentence.replace(new RegExp(entry.verb.text, 'gi'), '_____');
    displaySentence = displaySentence.replace(new RegExp(entry.object.text, 'gi'), '_____');
  } else if (stage === 1) {
    // Subject guessed, show subject but blank for verb and object
    displaySentence = displaySentence.replace(new RegExp(entry.verb.text, 'gi'), '_____');
    displaySentence = displaySentence.replace(new RegExp(entry.object.text, 'gi'), '_____');
  } else if (stage === 2) {
    // Subject and verb guessed, show them but blank for object
    displaySentence = displaySentence.replace(new RegExp(entry.object.text, 'gi'), '_____');
  }
  // If stage > 2, show full sentence (already handled in handleSelect)

  sentenceEl.textContent = displaySentence;
}

function handleSelect(word, btn) {
  const entry = currentEntry();
  const expected = stage === 0 ? entry.subject.text : stage === 1 ? entry.verb.text : entry.object.text;
  if (word === expected) {
    btn.classList.add('correct');
    showFeedback('Great job!', true);
    setTimeout(() => btn.classList.remove('correct'), 500);
    stage++;
    if (stage > 2) {
      // completed this entry
      sentenceEl.textContent = entry.fullSentence;
      setTimeout(() => {
        index = (index + 1) % data.length;
        stage = 0;
        updateImage();
        updateWordBank();
        revealSentence();
      }, 1000);
    } else {
      updateImage();
      updateWordBank();
      revealSentence();
    }
  } else {
    btn.classList.add('wrong');
    showFeedback('Try again!', false);
    setTimeout(() => btn.classList.remove('wrong'), 500);
  }
}

loadData().then(json => {
  data = json;
  subjects = uniqueWords(data, 'subject');
  verbs = uniqueWords(data, 'verb');
  objects = uniqueWords(data, 'object');
  updateImage();
  updateWordBank();
  revealSentence();
});
