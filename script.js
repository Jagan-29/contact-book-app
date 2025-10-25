// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js")
      .then(() => console.log("Service Worker registered!"))
      .catch(err => console.log("Service Worker registration failed:", err));
  });
}

// Global variables
let editMode = false;
let editName = "";

// Display contacts in the page
function displayContacts(contacts) {
  const contactDiv = document.getElementById("contacts");
  contactDiv.innerHTML = "";

  if (contacts.length === 0) {
    contactDiv.innerHTML = "<p>No contacts found.</p>";
    return;
  }

  contacts.forEach(contact => {
    const div = document.createElement("div");
    div.classList.add("contact");
    div.innerHTML = `
      <span>${contact.name} — ${contact.phone} (${contact.email})</span>
      <span>
        <button class="edit-btn" onclick="startEdit('${contact.name}')">✏️</button>
        <button class="delete-btn" onclick="deleteContact('${contact.name}')">🗑️</button>
      </span>
    `;
    contactDiv.appendChild(div);
  });
}

// Load contacts from localStorage
function loadContacts() {
  const contacts = JSON.parse(localStorage.getItem("contacts") || "[]");
  displayContacts(contacts);
}

// Add or Save contact
function addContact() {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;

  if (!name || !phone || !email) return alert("Please fill all fields");

  let contacts = JSON.parse(localStorage.getItem("contacts") || "[]");

  if (editMode) {
    const index = contacts.findIndex(c => c.name === editName);
    contacts[index] = { name, phone, email };
    editMode = false;
    editName = "";
  } else {
    contacts.push({ name, phone, email });
  }

  localStorage.setItem("contacts", JSON.stringify(contacts));

  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("email").value = "";

  loadContacts();
}

// Start editing a contact
function startEdit(name) {
  let contacts = JSON.parse(localStorage.getItem("contacts") || "[]");
  const contact = contacts.find(c => c.name === name);
  editMode = true;
  editName = name;
  document.getElementById("name").value = contact.name;
  document.getElementById("phone").value = contact.phone;
  document.getElementById("email").value = contact.email;
}

// Delete contact
function deleteContact(name) {
  let contacts = JSON.parse(localStorage.getItem("contacts") || "[]");
  contacts = contacts.filter(c => c.name !== name);
  localStorage.setItem("contacts", JSON.stringify(contacts));
  loadContacts();
}

// Search contacts
function searchContacts() {
  const query = document.getElementById("search").value.toLowerCase();
  const contacts = JSON.parse(localStorage.getItem("contacts") || "[]");
  const filtered = contacts.filter(c => c.name.toLowerCase().includes(query));
  displayContacts(filtered);
}

// Initial load
loadContacts();
