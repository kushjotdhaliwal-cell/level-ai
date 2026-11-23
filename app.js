
const chat = document.querySelector('#chat');
const form = document.querySelector('#form');
const input = document.querySelector('#prompt');
const statusEl = document.querySelector('#status');
const countEl = document.querySelector('#count');
const imageCount = document.querySelector('#imageCount');

const API_BASE = 'https://level-ai-2dpc.onrender.com';

let messages = [];
let remaining = 20;
let images = 5;
let sending = false;

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

  if (sending) return;

  const text = input.value.trim();
  if (!text) return;

  if (remaining <= 0) {
    bubble('assistant', 'You have used your 20 messages for this chat.');
    return;
  }

  sending = true;
  input.disabled = true;
  statusEl.textContent = 'Connecting to LEVEL AI...';

  document.querySelector('.welcome')?.remove();
  bubble('user', text);
  input.value = '';

  remaining--;
  update();

  messages.push({ role: 'user', content: text });

  const wait = bubble('assistant', 'Thinking...');

  try {
    const response = await fetch(API_BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error ${response.status}`);
    }

    wait.textContent = data.text || 'No response returned.';
    messages.push({ role: 'assistant', content: wait.textContent });
    statusEl.textContent = 'LEVEL AI is online';

  } catch (err) {
    wait.textContent = 'Connection error: ' + err.message;
    statusEl.textContent = 'Connection failed';
    remaining++;
    messages.pop();
    update();
  } finally {
    sending = false;
    input.disabled = false;
    input.focus();
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
