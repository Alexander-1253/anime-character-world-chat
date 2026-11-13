const KEY = "faveverse-v2";
const starter = {
  characters: [
    { id: "sora", name: "Sora Akemi", vibe: "Warm, witty, brave", world: "Neon Sakura", backstory: "A night-market musician who collects stories from strangers and believes every person deserves a fresh start.", greeting: "Hey, you made it! The lanterns are just coming on, and the whole city feels like it’s holding its breath. Want to explore with me?", tone: 0 },
    { id: "ren", name: "Ren Kairo", vibe: "Calm, clever, loyal", world: "Glass Horizon", backstory: "An observatory apprentice who maps forgotten constellations and is always looking out for friends.", greeting: "The observatory is quiet tonight. Perfect for a little stargazing—and maybe a secret or two. What’s on your mind?", tone: 1 },
    { id: "mira", name: "Mira Voss", vibe: "Bold, mysterious, magnetic", world: "Moonlit District", backstory: "A daring guide through the city's enchanted backstreets. She knows every shortcut, but not every secret.", greeting: "Careful where you step—the shadows here have stories of their own. Luckily, I know a few shortcuts. Shall we?", tone: 2 }
  ],
  worlds: [
    { id: "neon", name: "Neon Sakura", description: "Rainy alleyways, glowing lanterns, and secret music clubs tucked above the streets.", icon: "✿" },
    { id: "glass", name: "Glass Horizon", description: "Floating cities, moonlit observatories, and mysteries hiding among the stars.", icon: "✧" },
    { id: "moon", name: "Moonlit District", description: "A dreamy old city where magic hides in plain sight after dark.", icon: "☾" }
  ], messages: {}, activeId: "sora"
};
let state = readState();
const $ = (selector) => document.querySelector(selector);
const characterList = $("#characterList"), worldList = $("#worldList"), messages = $("#messages"), input = $("#messageInput");
let activeView = "characters", busy = false;

function readState() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    if (!stored || !Array.isArray(stored.characters) || !stored.characters.length) return structuredClone(starter);
    return { ...structuredClone(starter), ...stored, messages: stored.messages || {}, worlds: stored.worlds || structuredClone(starter.worlds) };
  } catch { return structuredClone(starter); }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { alert("Your browser storage is full. Try using a smaller avatar image."); } }
function activeCharacter() { return state.characters.find((character) => character.id === state.activeId) || state.characters[0]; }
function initials(name = "?") { return name.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase(); }
function escapeHTML(value) { return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
function avatarMarkup(person, large = false) {
  const cls = `avatar tone-${Number(person.tone || 0) % 4}${large ? " large" : ""}`;
  const url = safeImageUrl(person.avatarUrl);
  return url ? `<span class="${cls}"><img src="${escapeHTML(url)}" alt="" /></span>` : `<span class="${cls}">${escapeHTML(initials(person.name))}</span>`;
}
function safeImageUrl(value) {
  if (!value) return "";
  if (/^data:image\/(png|jpeg|webp|gif);base64,/i.test(value) && value.length < 750000) return value;
  try { const url = new URL(value); return url.protocol === "https:" ? url.href : ""; } catch { return ""; }
}
function getMessages(character) {
  if (!state.messages[character.id]) state.messages[character.id] = [{ sender: "character", text: character.greeting }];
  return state.messages[character.id];
}
function renderCharacters() {
  characterList.replaceChildren();
  state.characters.forEach((character) => {
    const button = document.createElement("button");
    button.className = `character-card${character.id === state.activeId ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `${avatarMarkup(character)}<span class="card-copy"><strong>${escapeHTML(character.name)}</strong><small>${escapeHTML(character.world)}</small></span><span class="card-arrow">↗</span>`;
    button.addEventListener("click", () => { state.activeId = character.id; save(); render(); });
    characterList.appendChild(button);
  });
}
function renderWorlds() {
  worldList.replaceChildren();
  state.worlds.forEach((world) => {
    const item = document.createElement("article"); item.className = "world-card";
    item.innerHTML = `<span class="world-icon">${escapeHTML(world.icon || "✦")}</span><div class="world-copy"><strong>${escapeHTML(world.name)}</strong><p>${escapeHTML(world.description)}</p><button class="edit-world" type="button">Edit world ↗</button></div>`;
    item.querySelector(".edit-world").addEventListener("click", () => editWorld(world.id));
    worldList.appendChild(item);
  });
}
function renderProfile() {
  const character = activeCharacter();
  $("#profileCard").innerHTML = `${avatarMarkup(character, true)}<h3>${escapeHTML(character.name)}</h3><p class="profile-vibe">${escapeHTML(character.vibe)}</p><div class="profile-detail"><span>WORLD</span><strong>${escapeHTML(character.world)}</strong></div><div class="profile-detail"><span>ABOUT</span><p>${escapeHTML(character.backstory || "A character ready to begin a story with you.")}</p></div><div class="profile-detail"><span>FIRST MESSAGE</span><p class="profile-quote">“${escapeHTML(character.greeting)}”</p></div>`;
}
function renderMessages() {
  const character = activeCharacter(); messages.replaceChildren();
  getMessages(character).forEach((message) => {
    const row = document.createElement("article"); row.className = `message ${message.sender === "user" ? "user" : "character"}`;
    row.innerHTML = `${message.sender === "user" ? '<span class="user-avatar">✦</span>' : avatarMarkup(character)}<div class="bubble"><div class="sender">${message.sender === "user" ? "You" : escapeHTML(character.name)}</div><p></p></div>`;
    row.querySelector("p").textContent = message.text;
    messages.appendChild(row);
  });
  messages.scrollTop = messages.scrollHeight;
}
function render() {
  const character = activeCharacter();
  $("#activeName").textContent = character.name;
  $("#activeAvatar").outerHTML = avatarMarkup(character, true).replace("<span", '<span id="activeAvatar"');
  $("#activeSubtitle").textContent = `${character.vibe} · ${character.world}`;
  input.placeholder = `Say something to ${character.name.split(" ")[0]}...`;
  $("#typingName").textContent = `${character.name.split(" ")[0]} is thinking…`;
  renderCharacters(); renderWorlds(); renderProfile(); renderMessages();
  if (["characters", "profile"].includes(activeView)) showView(activeView);
}
function showView(view) {
  activeView = view;
  [["charactersView", "characters"], ["worldsView", "worlds"], ["createView", "create"], ["profileView", "profile"]].forEach(([id, name]) => $("#" + id).classList.toggle("hidden", view !== name));
  document.querySelectorAll(".nav-button").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
}
function selectForm(formId) {
  document.querySelectorAll(".create-form").forEach((form) => form.classList.toggle("hidden", form.id !== formId));
  document.querySelectorAll(".form-tab").forEach((button) => button.classList.toggle("active", button.dataset.form === formId));
}
function editCharacter(id) {
  const person = state.characters.find((item) => item.id === id); if (!person) return;
  const form = $("#characterForm");
  Object.entries({ id: person.id, name: person.name, vibe: person.vibe, world: person.world, backstory: person.backstory || "", greeting: person.greeting, avatarUrl: person.avatarUrl || "" }).forEach(([key, value]) => { form.elements[key].value = value; });
  $("#avatarFile").value = "";
  form.querySelector(".primary-button").textContent = "Save changes";
  $("#deleteCharacter").classList.remove("hidden");
  showView("create"); selectForm("characterForm");
}
function editWorld(id) {
  const world = state.worlds.find((item) => item.id === id); if (!world) return;
  const form = $("#worldForm"); form.elements.id.value = world.id; form.elements.name.value = world.name; form.elements.description.value = world.description;
  form.querySelector(".primary-button").textContent = "Save changes";
  $("#deleteWorld").classList.remove("hidden");
  showView("create"); selectForm("worldForm");
}
function resetForm(formId) {
  const form = $("#" + formId); form.reset(); form.elements.id.value = "";
  form.querySelector(".primary-button").textContent = formId === "characterForm" ? "Create character" : "Create world";
  $(formId === "characterForm" ? "#deleteCharacter" : "#deleteWorld").classList.add("hidden");
}
async function checkAI() {
  const status = $("#aiStatus");
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    status.classList.toggle("ready", data.ready === true);
    status.querySelector("span").textContent = data.ready ? "AI ready" : "AI setup needed";
    status.title = data.ready ? "AI chat is connected" : "The app owner needs to configure OPENAI_API_KEY on the server";
  } catch {
    status.classList.remove("ready"); status.querySelector("span").textContent = "AI server needed";
    status.title = "Deploy on Vercel and configure the server-side OPENAI_API_KEY to enable AI chat.";
  }
}
async function sendMessage(text) {
  const trimmed = text.trim(); if (!trimmed || busy) return;
  const character = activeCharacter();
  const history = getMessages(character);
  history.push({ sender: "user", text: trimmed }); save(); renderMessages(); input.value = "";
  busy = true; $("#typingIndicator").classList.remove("hidden"); $("#chatForm").querySelector("button").disabled = true;
  try {
    const response = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ character: { name: character.name, vibe: character.vibe, world: character.world, backstory: character.backstory || "", greeting: character.greeting }, messages: history.slice(-20).map(({ sender, text: content }) => ({ role: sender === "user" ? "user" : "assistant", content })) })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "The AI couldn't reply. Please try again.");
    history.push({ sender: "character", text: data.reply }); save();
  } catch (error) {
    history.push({ sender: "character", text: `I couldn't connect to the AI just now. ${error.message} Your message is still here—please try again in a moment.` }); save();
  } finally {
    busy = false; $("#typingIndicator").classList.add("hidden"); $("#chatForm").querySelector("button").disabled = false; renderMessages();
  }
}
$("#chatForm").addEventListener("submit", (event) => { event.preventDefault(); sendMessage(input.value); });
$("#suggestions").addEventListener("click", (event) => { if (event.target.matches("button")) sendMessage(event.target.textContent); });
document.querySelectorAll(".nav-button").forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
$("#newCharacter").addEventListener("click", () => { resetForm("characterForm"); showView("create"); selectForm("characterForm"); });
$("#newWorld").addEventListener("click", () => { resetForm("worldForm"); showView("create"); selectForm("worldForm"); });
$("#openProfile").addEventListener("click", () => showView("profile"));
$("#editProfile").addEventListener("click", () => editCharacter(activeCharacter().id));
document.querySelectorAll(".form-tab").forEach((button) => button.addEventListener("click", () => selectForm(button.dataset.form)));
$("#characterForm").addEventListener("submit", async (event) => {
  event.preventDefault(); const form = event.currentTarget, data = new FormData(form), id = data.get("id");
  const existing = state.characters.find((item) => item.id === id);
  const character = { id: id || `custom-${Date.now()}`, name: data.get("name").trim(), vibe: data.get("vibe").trim(), world: data.get("world").trim(), backstory: data.get("backstory").trim(), greeting: data.get("greeting").trim(), avatarUrl: safeImageUrl(data.get("avatarUrl").trim()), tone: existing?.tone ?? state.characters.length % 4 };
  const file = form.elements.avatarFile.files[0];
  if (file) {
    if (!file.type.startsWith("image/") || file.size > 500 * 1024) { alert("Please choose an image under 500 KB."); return; }
    character.avatarUrl = await new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => resolve(""); reader.readAsDataURL(file); });
  } else if (!data.get("avatarUrl").trim() && existing?.avatarUrl) character.avatarUrl = existing.avatarUrl;
  if (existing) state.characters = state.characters.map((item) => item.id === id ? character : item);
  else { state.characters.unshift(character); state.messages[character.id] = [{ sender: "character", text: character.greeting }]; }
  state.activeId = character.id; save(); resetForm("characterForm"); showView("characters"); render();
});
$("#worldForm").addEventListener("submit", (event) => {
  event.preventDefault(); const form = event.currentTarget, data = new FormData(form), id = data.get("id");
  const previous = state.worlds.find((item) => item.id === id);
  const world = { id: id || `custom-${Date.now()}`, name: data.get("name").trim(), description: data.get("description").trim(), icon: previous?.icon || "✧" };
  if (previous) state.worlds = state.worlds.map((item) => item.id === id ? world : item); else state.worlds.unshift(world);
  save(); resetForm("worldForm"); showView("worlds"); renderWorlds();
});
$("#deleteCharacter").addEventListener("click", () => {
  const id = $("#characterForm").elements.id.value; if (!id || !confirm("Delete this character and its chat history?")) return;
  state.characters = state.characters.filter((item) => item.id !== id); delete state.messages[id];
  if (!state.characters.length) state.characters = structuredClone(starter.characters);
  if (state.activeId === id) state.activeId = state.characters[0].id;
  save(); resetForm("characterForm"); showView("characters"); render();
});
$("#deleteWorld").addEventListener("click", () => {
  const id = $("#worldForm").elements.id.value; if (!id || !confirm("Delete this world? Characters using its name won't be deleted.")) return;
  state.worlds = state.worlds.filter((item) => item.id !== id); save(); resetForm("worldForm"); showView("worlds"); renderWorlds();
});
render(); checkAI();
