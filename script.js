// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDhfLzEbMhbgKUfz7VHMquUGZCFIzOyGwQ",
  authDomain: "student-vote-1fbc3.firebaseapp.com",
  projectId: "student-vote-1fbc3",
  storageBucket: "student-vote-1fbc3.appspot.com",
  messagingSenderId: "326710956459",
  appId: "1:326710956459:web:19e82d2fc27011be5c42ee",
  measurementId: "G-TNG7FLE933"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.firestore();

const urlParams = new URLSearchParams(window.location.search);
const isRespondView = urlParams.get("view") === "respond";

if (isRespondView) {
  document.getElementById("settingsTab").style.display = "none";
  document.getElementById("settingsContainer").style.display = "none";
}

const questionsContainer = document.getElementById("questionsContainer");
const responsesContainer = document.getElementById("responsesContainer");
const settingsContainer = document.getElementById("settingsContainer");
const questionsSettings = document.getElementById("questionsSettings");
const addQuestionBtn = document.getElementById("addQuestionBtn");
const questionsTab = document.getElementById("questionsTab");
const settingsTab = document.getElementById("settingsTab");
const responsesTab = document.getElementById("responsesTab");
const saveContinueBtn = document.getElementById("saveContinueBtn");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const allowedNamesContainer = document.getElementById("allowedNamesContainer");
const newAllowedNameInput = document.getElementById("newAllowedName");
const addAllowedNameBtn = document.getElementById("addAllowedNameBtn");
const allowedNamesList = document.getElementById("allowedNamesList");
const passwordContainer = document.getElementById("passwordContainer");
const settingsPasswordInput = document.getElementById("settingsPassword");
const checkPasswordBtn = document.getElementById("checkPasswordBtn");
const editControl = document.getElementById("editControl");
const enableEditQuestions = document.getElementById("enableEditQuestions");
const enableEditTitleDesc = document.getElementById("enableEditTitleDesc");
const formTitle = document.getElementById("formTitle");
const formDescription = document.getElementById("formDescription");

const resetAllBtn = document.createElement("button");
resetAllBtn.textContent = "Reset All";
resetAllBtn.className = "save-btn";
resetAllBtn.style.display = "none"; 
settingsContainer.appendChild(resetAllBtn);

const SETTINGS_PASSWORD = "1234";

let questions = [];
const allowedNames = [];
let isSubmitted = false;
let userName = "";

function updateAllowedNamesList() {
  allowedNamesList.innerHTML = "";
  allowedNames.forEach(n => {
    const li = document.createElement("li");
    li.textContent = n;
    allowedNamesList.appendChild(li);
  });
}

addAllowedNameBtn.addEventListener("click", () => {
  const name = newAllowedNameInput.value.trim();
  if (name && !allowedNames.includes(name)) {
    allowedNames.push(name);
    updateAllowedNamesList();
    newAllowedNameInput.value = "";

    db.collection("settings").doc("allowedNames").set({ names: allowedNames })
      .then(() => console.log("Allowed names saved to Firestore"))
      .catch(error => console.error("Error saving allowed names:", error));
  }
});

enableEditTitleDesc.addEventListener("change", () => {
  formTitle.contentEditable = enableEditTitleDesc.checked ? "true" : "false";
  formDescription.contentEditable = enableEditTitleDesc.checked ? "true" : "false";
});

function renderQuestions() {
  questionsContainer.innerHTML = "";

  const nameBox = document.createElement("div");
  nameBox.className = "question-box";

  const nameLabel = document.createElement("div");
  nameLabel.className = "question-label";
  nameLabel.textContent = "Name";

  const nameGroup = document.createElement("div");
  nameGroup.className = "name-save-group";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Enter your name";
  nameInput.value = userName;
  nameInput.style.flex = "1";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.className = "save-btn";

  if (userName) {
    nameInput.disabled = true;
    saveBtn.disabled = true;
  }

  saveBtn.addEventListener("click", () => {
    const enteredName = nameInput.value.trim();
    if (!enteredName) {
      alert("Please enter a valid name!");
    } else if (!allowedNames.includes(enteredName)) {
      alert("INCORRECT USER");
    } else {
      userName = enteredName;
      nameInput.disabled = true;
      saveBtn.disabled = true;

      db.collection("users").doc(userName).set({
        name: userName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => {
        console.log("User name saved to Firestore");
        renderQuestions();
      })
      .catch(error => {
        console.error("Error saving user name:", error);
        alert("Failed to save name to database!");
      });
    }
  });

  nameGroup.appendChild(nameInput);
  nameGroup.appendChild(saveBtn);
  nameBox.appendChild(nameLabel);
  nameBox.appendChild(nameGroup);
  questionsContainer.appendChild(nameBox);

  questions.forEach((q, qIdx) => {
    const box = document.createElement("div");
    box.className = "question-box";

    const label = document.createElement("div");
    label.className = "question-label";
    label.textContent = q.title;
    label.contentEditable = enableEditQuestions.checked ? "true" : "false";
    label.addEventListener("input", () => {
      q.title = label.textContent;
    });

    const group = document.createElement("div");
    group.className = "checkbox-group";

    q.options.forEach((opt, idx) => {
      const remaining = opt.limit - opt.count;
      const canSelect = (remaining > 0 || q.userSelected === idx);

      const wrapper = document.createElement("label");
      wrapper.className = "option-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = q.userSelected === idx;
      checkbox.disabled = isSubmitted || !canSelect;

      checkbox.addEventListener("change", () => {
        if (!userName) {
          alert("Please save your name first!");
          checkbox.checked = false;
          return;
        }

        if (checkbox.checked) {
          if (q.userSelected !== null && q.userSelected !== idx) {
            alert("You can only select one option per question.");
            checkbox.checked = false;
            return;
          }
          q.userSelected = idx;
        } else {
          q.userSelected = null;
        }
        renderQuestions();
      });

      const span = document.createElement("span");
      span.textContent = `${opt.name} (${remaining} left)`;

      wrapper.appendChild(checkbox);
      wrapper.appendChild(span);
      group.appendChild(wrapper);
    });

    box.appendChild(label);
    box.appendChild(group);
    questionsContainer.appendChild(box);
  });

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Save & Submit";
  submitBtn.className = "save-btn";
  submitBtn.disabled = isSubmitted;
  submitBtn.addEventListener("click", () => {
    if (!userName) {
      alert("Please save your name first!");
      return;
    }
    if (isSubmitted) return;

    // Read latest questions from Firestore
    db.collection("settings").doc("questions").get()
      .then(doc => {
        if (!doc.exists) throw new Error("Questions not found");
        const dbQuestions = doc.data().questions;

        questions.forEach((q, qIdx) => {
          const selectedIdx = q.userSelected;
          if (selectedIdx !== null) {
            if (dbQuestions[qIdx].options[selectedIdx].count < dbQuestions[qIdx].options[selectedIdx].limit) {
              dbQuestions[qIdx].options[selectedIdx].count += 1;
            } else {
              throw new Error(`Slot full for ${dbQuestions[qIdx].options[selectedIdx].name}`);
            }
          }
        });

        return db.collection("settings").doc("questions").set({ questions: dbQuestions });
      })
      .then(() => {
        const userResponses = questions.map(q => {
          const selectedOption = q.userSelected !== null ? q.options[q.userSelected].name : null;
          return { question: q.title, selected: selectedOption };
        });

        return db.collection("responses").add({
          name: userName,
          answers: userResponses,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(() => {
        const nameIndex = allowedNames.indexOf(userName);
        if (nameIndex !== -1) allowedNames.splice(nameIndex, 1);
        return db.collection("settings").doc("allowedNames").set({ names: allowedNames });
      })
      .then(() => {
        updateAllowedNamesList();
        isSubmitted = true;

        const thankYouPanel = document.createElement("div");
        thankYouPanel.className = "container";
        thankYouPanel.innerHTML = `<h2 style="color: #6a1b9a;">Thank you! Your response was submitted.</h2>`;
        questionsContainer.innerHTML = "";
        questionsContainer.appendChild(thankYouPanel);

        renderResponses();
      })
      .catch(error => {
        console.error("Error submitting:", error);
        alert("Error: " + error.message);
      });
  });

  questionsContainer.appendChild(submitBtn);
}

function renderSettings() {
  questionsSettings.innerHTML = "";
  questions.forEach((q, qIdx) => {
    const box = document.createElement("div");
    box.className = "settings-box";

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = q.title;
    titleInput.style.width = "100%";
    titleInput.addEventListener("input", () => {
      q.title = titleInput.value;
    });

    const optionsDiv = document.createElement("div");
    q.options.forEach((opt, idx) => {
      const optionWrapper = document.createElement("div");
      optionWrapper.className = "option-item";

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = opt.name;
      nameInput.addEventListener("input", () => {
        opt.name = nameInput.value;
      });

      const limitInput = document.createElement("input");
      limitInput.type = "number";
      limitInput.min = 1;
      limitInput.value = opt.limit;
      limitInput.addEventListener("input", () => {
        opt.limit = parseInt(limitInput.value);
        if (opt.count > opt.limit) {
          opt.count = opt.limit;
        }
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "❌";
      deleteBtn.className = "save-btn";
      deleteBtn.addEventListener("click", () => {
        q.options.splice(idx, 1);
        renderSettings();
      });

      optionWrapper.appendChild(nameInput);
      optionWrapper.appendChild(limitInput);
      optionWrapper.appendChild(deleteBtn);
      optionsDiv.appendChild(optionWrapper);
    });

    const addOptDiv = document.createElement("div");
    addOptDiv.className = "add-option";

    const newOptName = document.createElement("input");
    newOptName.type = "text";
    newOptName.placeholder = "New option";

    const newOptLimit = document.createElement("input");
    newOptLimit.type = "number";
    newOptLimit.placeholder = "Limit";
    newOptLimit.min = 1;

    const addBtn = document.createElement("button");
    addBtn.textContent = "Add";
    addBtn.className = "save-btn";
    addBtn.addEventListener("click", () => {
      if (newOptName.value.trim() && newOptLimit.value) {
        q.options.push({
          name: newOptName.value.trim(),
          limit: parseInt(newOptLimit.value),
          count: 0
        });
        newOptName.value = "";
        newOptLimit.value = "";
        renderSettings();
      }
    });

    addOptDiv.appendChild(newOptName);
    addOptDiv.appendChild(newOptLimit);
    addOptDiv.appendChild(addBtn);

    box.appendChild(titleInput);
    box.appendChild(optionsDiv);
    box.appendChild(addOptDiv);

    questionsSettings.appendChild(box);
  });
}

function renderResponses() {
  responsesContainer.innerHTML = "<h2>All Responses (Table View)</h2>";

  db.collection("responses").orderBy("timestamp").get().then(snapshot => {
    if (snapshot.empty) {
      responsesContainer.innerHTML += "<p>No responses yet.</p>";
      return;
    }

    // Prepare option names list (collect all options from questions)
    let optionNames = new Set();
    questions.forEach(q => {
      q.options.forEach(opt => {
        optionNames.add(opt.name);
      });
    });
    optionNames = Array.from(optionNames);

    // Create a map for each option -> list of names
    const optionMap = {};
    optionNames.forEach(opt => optionMap[opt] = []);

    // Group responses
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.answers) {
        data.answers.forEach(ans => {
          const optName = ans.selected;
          if (optName && optionMap[optName]) {
            optionMap[optName].push(data.name);
          }
        });
      }
    });

    // Find maximum number of rows needed (longest option list)
    let maxRows = 0;
    optionNames.forEach(opt => {
      if (optionMap[opt].length > maxRows) {
        maxRows = optionMap[opt].length;
      }
    });

    // Create table
    const table = document.createElement("table");
    table.border = "1";
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";

    // Create header row
    const headerRow = document.createElement("tr");
    optionNames.forEach(opt => {
      const th = document.createElement("th");
      th.textContent = opt;
      th.style.background = "#9b5de5";
      th.style.color = "white";
      th.style.padding = "8px";
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Fill rows
    for (let i = 0; i < maxRows; i++) {
      const row = document.createElement("tr");
      optionNames.forEach(opt => {
        const td = document.createElement("td");
        td.style.padding = "8px";
        td.style.textAlign = "center";
        td.textContent = optionMap[opt][i] || "—";
        row.appendChild(td);
      });
      table.appendChild(row);
    }

    responsesContainer.appendChild(table);
  })
  .catch(error => {
    console.error("Error fetching responses:", error);
    responsesContainer.innerHTML += "<p>Error loading responses.</p>";
  });
}

resetAllBtn.addEventListener("click", () => {
  if (!confirm("Are you sure you want to reset everything? This cannot be undone!")) return;

  db.collection("responses").get().then(snapshot => {
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    return batch.commit();
  }).then(() => {
    console.log("Responses cleared");
  }).catch(err => {
    console.error("Error clearing responses:", err);
  });

  db.collection("settings").doc("allowedNames").set({ names: [] })
    .then(() => {
      allowedNames.length = 0;
      updateAllowedNamesList();
      console.log("Allowed names reset");
    })
    .catch(err => {
      console.error("Error resetting allowed names:", err);
    });

  db.collection("settings").doc("questions").set({ questions: [] })
    .then(() => {
      questions.length = 0;
      renderSettings();
      console.log("Questions reset");
    })
    .catch(err => {
      console.error("Error resetting questions:", err);
    });

  alert("All data has been reset!");
});

// ✅ Tabs & Buttons
copyLinkBtn.addEventListener("click", () => {
  const url = window.location.origin + window.location.pathname + "?view=respond";
  navigator.clipboard.writeText(url).then(() => alert("Link copied! Share with responders."));
});

addQuestionBtn.addEventListener("click", () => {
  questions.push({ title: "New Question", options: [], userSelected: null });
  renderSettings();
});

questionsTab.addEventListener("click", () => {
  questionsTab.classList.add("active");
  responsesTab.classList.remove("active");
  settingsTab.classList.remove("active");
  questionsContainer.style.display = "block";
  responsesContainer.style.display = "none";
  settingsContainer.style.display = "none";
  renderQuestions();
});

responsesTab.addEventListener("click", () => {
  responsesTab.classList.add("active");
  questionsTab.classList.remove("active");
  settingsTab.classList.remove("active");
  questionsContainer.style.display = "none";
  responsesContainer.style.display = "block";
  settingsContainer.style.display = "none";
  renderResponses();
});

settingsTab.addEventListener("click", () => {
  settingsTab.classList.add("active");
  questionsTab.classList.remove("active");
  responsesTab.classList.remove("active");
  questionsContainer.style.display = "none";
  responsesContainer.style.display = "none";
  settingsContainer.style.display = "block";
  passwordContainer.style.display = "block";
  questionsSettings.style.display = "none";
  addQuestionBtn.style.display = "none";
  saveContinueBtn.style.display = "none";
  editControl.style.display = "none";
  exportPdfBtn.style.display = "none";
});

checkPasswordBtn.addEventListener("click", () => {
  if (settingsPasswordInput.value === SETTINGS_PASSWORD) {
    passwordContainer.style.display = "none";
    questionsSettings.style.display = "block";
    addQuestionBtn.style.display = "block";
    saveContinueBtn.style.display = "block";
    editControl.style.display = "block";
    exportPdfBtn.style.display = "block";
    allowedNamesContainer.style.display = "block";
    copyLinkBtn.style.display = "block";
    resetAllBtn.style.display = "block";
    renderSettings();
  } else {
    alert("Incorrect password!");
  }
});

saveContinueBtn.addEventListener("click", () => {
  db.collection("settings").doc("questions").set({ questions })
    .then(() => alert("Questions saved to Firestore!"))
    .catch(err => alert("Error saving questions: " + err));
});

exportPdfBtn.addEventListener("click", () => {
  db.collection("responses").orderBy("timestamp").get().then(snapshot => {
    if (snapshot.empty) {
      alert("No responses to export.");
      return;
    }

    // Collect option names
    let optionNames = new Set();
    questions.forEach(q => {
      q.options.forEach(opt => {
        optionNames.add(opt.name);
      });
    });
    optionNames = Array.from(optionNames);

    // Prepare map option -> names
    const optionMap = {};
    optionNames.forEach(opt => optionMap[opt] = []);

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.answers) {
        data.answers.forEach(ans => {
          const optName = ans.selected;
          if (optName && optionMap[optName]) {
            optionMap[optName].push(data.name);
          }
        });
      }
    });

    // Find max rows
    let maxRows = 0;
    optionNames.forEach(opt => {
      if (optionMap[opt].length > maxRows) {
        maxRows = optionMap[opt].length;
      }
    });

    // Build rows for the table
    const bodyRows = [];
    for (let i = 0; i < maxRows; i++) {
      const row = optionNames.map(opt => optionMap[opt][i] || "—");
      bodyRows.push(row);
    }

    // Generate PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Responses Summary", 14, 20);

    // Using autoTable
    doc.autoTable({
      head: [optionNames],
      body: bodyRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [155, 93, 229] }
    });

    doc.save("responses.pdf");
  }).catch(err => {
    console.error("Error exporting PDF:", err);
    alert("Error exporting PDF");
  });
});

// ✅ Load
db.collection("settings").doc("allowedNames").get()
  .then(doc => {
    if (doc.exists && doc.data().names) {
      allowedNames.push(...doc.data().names);
      updateAllowedNamesList();
    }
    return db.collection("settings").doc("questions").get();
  })
  .then(doc => {
    if (doc.exists && doc.data().questions) {
      questions = doc.data().questions;

      // ⭐ Reset userSelected for all questions so no options are checked initially
      questions.forEach(q => {
        q.userSelected = null;
      });
    }
    renderQuestions();
  })
  .catch(error => {
    console.error("Error loading settings:", error);
    renderQuestions();
  });
