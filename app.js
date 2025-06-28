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

let data = [];
let stage = 0; // 0 subject,1 verb,2 object
let index = 0;
let subjects = [], verbs = [], objects = [];

function updateWordBank() {
  wordBankEl.innerHTML = '';
  let words = stage === 0 ? subjects : stage === 1 ? verbs : objects;
  shuffle([...words]).forEach(word => {
    const btn = document.createElement('button');
    btn.textContent = word;
    btn.addEventListener('click', () => handleSelect(word));
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
  let revealIndex = 0;
  if (stage > 0) {
    const sIdx = fs.toLowerCase().indexOf(entry.subject.text.toLowerCase());
    revealIndex = sIdx + entry.subject.text.length;
    if (stage > 1) {
      const vIdx = fs.toLowerCase().indexOf(entry.verb.text.toLowerCase(), revealIndex);
      revealIndex = vIdx + entry.verb.text.length;
      if (stage > 2) {
        const oIdx = fs.toLowerCase().indexOf(entry.object.text.toLowerCase(), revealIndex);
        revealIndex = fs.length; // show full sentence when completed
      }
    }
  }
  sentenceEl.textContent = fs.slice(0, revealIndex);
}

function handleSelect(word) {
  const entry = currentEntry();
  const expected = stage === 0 ? entry.subject.text : stage === 1 ? entry.verb.text : entry.object.text;
  if (word === expected) {
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
