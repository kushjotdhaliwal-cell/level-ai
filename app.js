const chat = document.querySelector('#chat');
const form = document.querySelector('#form');
const input = document.querySelector('#prompt');
const statusEl = document.querySelector('#status');
const countEl = document.querySelector('#count');
const imageCount = document.querySelector('#imageCount');

const API_BASE = 'https://level-ai2dpc.onrender.com';

let messages = [];
let remaining = 20;
let images = 5;

function bubble(role, text) {
  const el = document.createElement('div');
  el.className = 'msg ' + role;
  el.textContent = text;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
  return el;
}

function update() {
  countEl.textContent = remaining + ' messages left';
  imageCount.textContent = images + ' left today';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  document.querySelector('.welcome')?.remove();
  bubble('user', text);
  input.value = '';

  remaining--;
  update();

  messages.push({ role: 'user', content: text });

  const wait = bubble('assistant', 'Thinking...');

  try {
    const r = await fetch(API_BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    const data = await r.json();

    if (!r.ok) throw new Error(data.error || 'Request failed');

    wait.textContent = data.text || 'No response returned.';
    messages.push({
      role: 'assistant',
      content: wait.textContent
    });

  } catch (err) {
    wait.textContent = 'Error: ' + err.message;
    statusEl.textContent = 'Backend connection error';
  }
});

document.querySelector('#clearBtn').onclick = () => {
  chat.innerHTML = '';
  messages = [];
  remaining = 20;
  update();
  statusEl.textContent = 'Free for everyone';
};

update();
