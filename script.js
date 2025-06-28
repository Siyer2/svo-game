let data = [];
let subjects = new Set();
let verbs = new Set();
let objects = new Set();
let currentIndex = 0;
let stage = 'subject';
let offsets = {};
let sentenceElem, wordBankElem, imageElem;

function loadJSON() {
  fetch('svo.json')
    .then(r => r.json())
    .then(json => {
      data = json;
      collectWords();
      setupElements();
      loadEntry();
    });
}

function collectWords() {
  data.forEach(item => {
    subjects.add(item.subject.text);
    verbs.add(item.verb.text);
    objects.add(item.object.text);
  });
}

function setupElements() {
  wordBankElem = document.getElementById('word-bank');
  imageElem = document.getElementById('media-image');
  sentenceElem = document.getElementById('sentence');
}

function loadEntry() {
  if (currentIndex >= data.length) {
    sentenceElem.textContent = 'Great job!';
    imageElem.src = '';
    wordBankElem.innerHTML = '';
    return;
  }
  stage = 'subject';
  offsets = {};
  let entry = data[currentIndex];
  computeOffsets(entry);
  sentenceElem.textContent = '';
  updateImage(entry.subject.mediaPath);
  buildWordBank(Array.from(subjects));
}

function computeOffsets(entry) {
  const sentence = entry.fullSentence;
  const lower = sentence.toLowerCase();
  let idxS = lower.indexOf(entry.subject.text.toLowerCase());
  offsets.subject = idxS + entry.subject.text.length;
  let idxV = lower.indexOf(entry.verb.text.toLowerCase(), offsets.subject);
  offsets.verb = idxV + entry.verb.text.length;
  let idxO = lower.indexOf(entry.object.text.toLowerCase(), offsets.verb);
  offsets.object = idxO + entry.object.text.length;
}

function buildWordBank(words) {
  wordBankElem.innerHTML = '';
  shuffle(words).forEach(w => {
    let btn = document.createElement('button');
    btn.textContent = w;
    btn.addEventListener('click', () => handleWordClick(w));
    wordBankElem.appendChild(btn);
  });
}

function handleWordClick(word) {
  let entry = data[currentIndex];
  if (word === entry[stage].text) {
    revealText(entry);
    nextStage(entry);
  }
}

function revealText(entry) {
  const sentence = entry.fullSentence;
  let end = offsets[stage];
  sentenceElem.textContent = sentence.substring(0, end);
}

function nextStage(entry) {
  if (stage === 'subject') {
    stage = 'verb';
    updateImage(entry.verb.mediaPath);
    buildWordBank(Array.from(verbs));
  } else if (stage === 'verb') {
    stage = 'object';
    updateImage(entry.object.mediaPath);
    buildWordBank(Array.from(objects));
  } else {
    stage = 'done';
    sentenceElem.textContent = entry.fullSentence;
    setTimeout(() => {
      currentIndex++;
      loadEntry();
    }, 1000);
  }
}

function updateImage(src) {
  imageElem.src = src;
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

window.addEventListener('load', loadJSON);
