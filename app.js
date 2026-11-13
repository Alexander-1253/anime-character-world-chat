const KEY = "faveverse-v1";
const starter = {
  characters: [
    { id: "sora", name: "Sora Akemi", vibe: "Warm, witty, brave", world: "Neon Sakura", greeting: "Hey, you made it! The lanterns are just coming on, and the whole city feels like it’s holding its breath. Want to explore with me?", tone: 0 },
    { id: "ren", name: "Ren Kairo", vibe: "Calm, clever, loyal", world: "Glass Horizon", greeting: "The observatory is quiet tonight. Perfect for a little stargazing—and maybe a secret or two. What’s on your mind?", tone: 1 },
    { id: "mira", name: "Mira Voss", vibe: "Bold, mysterious, magnetic", world: "Moonlit District", greeting: "Careful where you step—the shadows here have stories of their own. Luckily, I know a few shortcuts. Shall we?", tone: 2 }
  ],
  worlds: [
    { id: "neon", name: "Neon Sakura", description: "Rainy alleyways, glowing lanterns, and secret music clubs tucked above the streets.", icon: "✿" },
    { id: "glass", name: "Glass Horizon", description: "Floating cities, moonlit observatories, and mysteries hiding among the stars.", icon: "✧" },
    { id: "moon", name: "Moonlit District", description: "A dreamy old city where magic hides in plain sight after dark.", icon: "☾" }
  ],
  messages: {},
  activeId: "sora"
};
let state = readState();
const $ = (selector) => document.querySelector(selector);
const characterList = $("#characterList");
const worldList = $("#worldList");
const messages = $("#messages");
const input = $("#messageInput");
let activeView = "characters";

function readState() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    if (!stored || !Array.isArray(stored.characters) || !stored.characters.length) return structuredClone(starter);
    return { ...structuredClone(starter), ...stored, messages: stored.messages || {} };
  } catch { return structuredClone(starter); }
}
function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
function activeCharacter() { return state.characters.find((character) => character.id === state.activeId) || state.characters[0]; }
function initials(name) { return name.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase(); }
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
function getMessages(character) {
  if (!state.messages[character.id]) state.messages[character.id] = [{ sender: "character", text: character.greeting }];
  return state.messages[character.id];
}
function renderCharacters() {
  characterList.innerHTML = "";
  state.characters.forEach((character) => {
    const button = document.createElement("button");
    button.className = `character-card${character.id === state.activeId ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `<span class="avatar tone-${Number(character.tone) % 4}">${escapeHTML(initials(character.name))}</span><span class="card-copy"><strong>${escapeHTML(character.name)}</strong><small>${escapeHTML(character.world)}</small></span><i class="online" aria-label="Available"></i>`;
    button.addEventListener("click", () => { state.activeId = character.id; save(); render(); });
    characterList.appendChild(button);
  });
}
function renderWorlds() {
  worldList.innerHTML = "";
  state.worlds.forEach((world) => {
    const item = document.createElement("article");
    item.className = "world-card";
    item.innerHTML = `<span class="world-icon">${escapeHTML(world.icon || "✦")}</span><span><strong>${escapeHTML(world.name)}</strong><p>${escapeHTML(world.description)}</p></span>`;
    worldList.appendChild(item);
  });
}
function renderMessages() {
  const character = activeCharacter();
  messages.innerHTML = "";
  getMessages(character).forEach((message) => {
    const row = document.createElement("article");
    row.className = `message ${message.sender === "user" ? "user" : "character"}`;
    const avatar = message.sender === "user" ? "✦" : initials(character.name);
    const name = message.sender === "user" ? "You" : character.name;
    row.innerHTML = `<span class="avatar tone-${Number(character.tone) % 4}">${escapeHTML(avatar)}</span><div class="bubble"><div class="sender">${escapeHTML(name)}</div><p></p></div>`;
    row.querySelector("p").textContent = message.text;
    messages.appendChild(row);
  });
  messages.scrollTop = messages.scrollHeight;
}
function render() {
  const character = activeCharacter();
  $("#activeName").textContent = character.name;
  $("#activeAvatar").textContent = initials(character.name);
  $("#activeAvatar").className = `avatar large tone-${Number(character.tone) % 4}`;
  $("#activeSubtitle").textContent = `${character.vibe} · ${character.world}`;
  $(".chat-title .eyebrow").textContent = "YOUR CURRENT STORY";
  input.placeholder = `Say something to ${character.name.split(" ")[0]}...`;
  renderCharacters(); renderWorlds(); renderMessages();
  if (activeView === "characters") showView("characters");
}
function showView(view) {
  activeView = view;
  $("#charactersView").classList.toggle("hidden", view !== "characters");
  $("#worldsView").classList.toggle("hidden", view !== "worlds");
  $("#createView").classList.toggle("hidden", view !== "create");
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === view));
}
function answerFor(text, character) {
  const lower = text.toLowerCase();
  if (/\b(hello|hi|hey|hiya)\b/.test(lower)) return `Hey, ${text.toLowerCase().includes("hey") ? "you" : "there"}! ${character.greeting}`;
  if (/\b(world|place|where|city|home)\b/.test(lower)) return `${character.world} is a place of unexpected little wonders. ${character.greeting}`;
  if (/\b(adventure|quest|explore|go|travel)\b/.test(lower)) return "I was hoping you'd say that! Let's take the long way around and see what we discover. What should we look for first?";
  if (/\b(sad|lonely|bad day|upset|tired)\b/.test(lower)) return "Hey, you don't have to figure everything out right now. I'm happy to sit here with you for a while. Want to tell me what's going on?";
  if (/\b(who|yourself|about you|personality)\b/.test(lower)) return `I'm ${character.name}. People say I'm ${character.vibe.toLowerCase()}, but I think there's more to everyone than a few words. What about you?`;
  return `Hmm, I hadn't thought of it that way. ${character.name} smiles. “Tell me more—I want to hear where this story goes.”`;
}
function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const character = activeCharacter();
  getMessages(character).push({ sender: "user", text: trimmed });
  save(); renderMessages(); input.value = "";
  window.setTimeout(() => {
    if (activeCharacter().id !== character.id) return;
    getMessages(character).push({ sender: "character", text: answerFor(trimmed, character) });
    save(); renderMessages();
  }, 450);
}
$("#chatForm").addEventListener("submit", (event) => { event.preventDefault(); sendMessage(input.value); });
$("#suggestions").addEventListener("click", (event) => { if (event.target.matches("button")) sendMessage(event.target.textContent); });
document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => showView(tab.dataset.view)));
$("#newCharacter").addEventListener("click", () => { showView("create"); selectForm("characterForm"); });
$("#newWorld").addEventListener("click", () => { showView("create"); selectForm("worldForm"); });
function selectForm(formId) {
  document.querySelectorAll(".create-form").forEach((form) => form.classList.toggle("hidden", form.id !== formId));
  document.querySelectorAll(".form-tab").forEach((button) => button.classList.toggle("active", button.dataset.form === formId));
}
document.querySelectorAll(".form-tab").forEach((button) => button.addEventListener("click", () => selectForm(button.dataset.form)));
$("#characterForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const character = { id: `custom-${Date.now()}`, name: data.get("name").trim(), vibe: data.get("vibe").trim(), world: data.get("world").trim(), greeting: data.get("greeting").trim(), tone: state.characters.length % 4 };
  state.characters.unshift(character); state.activeId = character.id; state.messages[character.id] = [{ sender: "character", text: character.greeting }];
  save(); event.currentTarget.reset(); showView("characters"); render();
});
$("#worldForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  state.worlds.unshift({ id: `custom-${Date.now()}`, name: data.get("name").trim(), description: data.get("description").trim(), icon: "✧" });
  save(); event.currentTarget.reset(); selectForm("characterForm"); showView("worlds"); renderWorlds();
});
render();
