const urlParams = new URLSearchParams(window.location.search);
const isRespondView = urlParams.get("view") === "respond";

if (isRespondView) {
  document.getElementById("tabSettings").style.display = "none";
  document.getElementById("settingsContainer").style.display = "none";
  activeTab = "questions";
  renderActiveTab();
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
  }
});

const passwordContainer = document.getElementById("passwordContainer");
const settingsPasswordInput = document.getElementById("settingsPassword");
const checkPasswordBtn = document.getElementById("checkPasswordBtn");

const editControl = document.getElementById("editControl");
const enableEditQuestions = document.getElementById("enableEditQuestions");
const enableEditTitleDesc = document.getElementById("enableEditTitleDesc");

const formTitle = document.getElementById("formTitle");
const formDescription = document.getElementById("formDescription");

const SETTINGS_PASSWORD = "1234";

let questions = [
  {
    title: "Subjects",
    options: [
      { name: "Anatomy", limit: 3, count: 0 },
      { name: "Physiology", limit: 2, count: 0 },
    ],
    userSelected: null
  }
];

const allowedNames = [];
const responses = [];
let isSubmitted = false;
let userName = "";

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
  saveBtn.addEventListener("click", () => {
  const enteredName = nameInput.value.trim();
  if (!enteredName) {
    alert("Please enter a valid name!");
  } else if (!allowedNames.includes(enteredName)) {
    alert("INCORRECT USER");
  } else {
    userName = enteredName;
    renderQuestions();
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
      if (opt.count < opt.limit || q.userSelected === idx) {
        const wrapper = document.createElement("label");
        wrapper.className = "option-item";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = q.userSelected === idx;
        checkbox.disabled = isSubmitted;

        checkbox.addEventListener("change", () => {
          if (!userName) {
            alert("Please save your name first!");
            checkbox.checked = false;
            return;
          }

          if (checkbox.checked) {
            if (q.userSelected !== null && q.userSelected !== idx) {
              checkbox.checked = false;
              return;
            }
            opt.count++;
            q.userSelected = idx;
            responses.push({
              name: userName,
              response: opt.name
            });
          } else {
            opt.count--;
            const i = responses.findIndex(r => r.name === userName && r.response === opt.name);
            if (i !== -1) responses.splice(i, 1);
            q.userSelected = null;
          }
          renderQuestions();
        });

        const span = document.createElement("span");
        span.textContent = opt.name;

        wrapper.appendChild(checkbox);
        wrapper.appendChild(span);
        group.appendChild(wrapper);
      }
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
    isSubmitted = true;

    const thankYouPanel = document.createElement("div");
    thankYouPanel.className = "container";
    thankYouPanel.innerHTML = `<h2 style="color: #6a1b9a;">Thank you! Your response was submitted.</h2>`;

    questionsContainer.innerHTML = "";
    questionsContainer.appendChild(thankYouPanel);

    renderResponses();
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
      deleteBtn.style.padding = "4px 8px";
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
  responsesContainer.innerHTML = "<h2>All Responses</h2>";
  if (responses.length === 0) {
    responsesContainer.innerHTML += "<p>No responses yet.</p>";
    return;
  }

  const table = document.createElement("table");
  table.border = "1";
  const headerRow = document.createElement("tr");
  ["S.No", "Name", "Response"].forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    th.style.background = "#9b5de5";
    th.style.color = "white";
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  responses.forEach((r, idx) => {
    const row = document.createElement("tr");
    [idx + 1, r.name, r.response].forEach(text => {
      const td = document.createElement("td");
      td.textContent = text;
      row.appendChild(td);
    });
    table.appendChild(row);
  });

  responsesContainer.appendChild(table);
}

copyLinkBtn.addEventListener("click", () => {
  const url = window.location.origin + window.location.pathname + "?view=respond";
  navigator.clipboard.writeText(url).then(() => {
    alert("Link copied! Share this with responders.");
  });
});

addQuestionBtn.addEventListener("click", () => {
  questions.push({
    title: "New Question",
    options: [],
    userSelected: null
  });
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
    renderSettings();
  } else {
    alert("Incorrect password!");
  }
});

addAllowedNameBtn.addEventListener("click", () => {
  const name = newAllowedNameInput.value.trim();
  if (name && !allowedNames.includes(name)) {
    allowedNames.push(name);
    updateAllowedNamesList();
    newAllowedNameInput.value = "";
  }
});

saveContinueBtn.addEventListener("click", () => {
  alert("Settings saved! You can now continue.");
});

exportPdfBtn.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Responses Summary", 14, 20);

  const headers = ["S.No", "Name", "Response"];
  const startX = 14;
  const startY = 30;
  const cellWidth = [20, 70, 70];
  const rowHeight = 10;

  doc.setFillColor(173, 216, 230);
  doc.rect(startX, startY, cellWidth[0] + cellWidth[1] + cellWidth[2], rowHeight, "F");

  let x = startX;
  headers.forEach((header, i) => {
    doc.setTextColor(0, 0, 0);
    doc.text(header, x + 2, startY + 7);
    x += cellWidth[i];
  });

  responses.forEach((r, idx) => {
    let rowY = startY + rowHeight * (idx + 1);

    x = startX;
    for (let i = 0; i < headers.length; i++) {
      doc.rect(x, rowY, cellWidth[i], rowHeight);
      x += cellWidth[i];
    }

    x = startX;
    doc.text(String(idx + 1), x + 2, rowY + 7);
    x += cellWidth[0];

    doc.text(r.name, x + 2, rowY + 7);
    x += cellWidth[1];

    doc.text(r.response, x + 2, rowY + 7);
  });

  doc.save("responses.pdf");
});

renderQuestions();