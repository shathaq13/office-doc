let documents = JSON.parse(localStorage.getItem("documents")) || [];

const addDocumentBtn = document.getElementById("addDocumentBtn");
const searchInput = document.getElementById("searchInput");

addDocumentBtn.addEventListener("click", async function () {

    const name = prompt("Enter document name:");

    if (!name || name.trim() === "") return;

    const category = prompt("Enter document category:");

    if (!category || category.trim() === "") return;

    const expiryDate = await getExpiryDate();
if (!expiryDate) return;
    const newDocument = {
        id: Date.now(),
        name: name.trim(),
        category: category.trim(),
        expiryDate: expiryDate
    };

    documents.push(newDocument);

    saveDocuments();
    displayDocuments();
    updateDashboard();
});


function saveDocuments() {
    localStorage.setItem("documents", JSON.stringify(documents));
}


function getStatus(expiryDate) {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const difference = expiry - today;
    const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
        return "Expired";
    }

    if (daysLeft <= 30) {
        return "Expiring Soon";
    }

    return "Active";
}


function displayDocuments(searchTerm = "") {

    const table = document.getElementById("documentTable");

    table.innerHTML = "";

    const filteredDocuments = documents.filter(function (doc) {

        return (
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.category.toLowerCase().includes(searchTerm.toLowerCase())
        );

    });


    filteredDocuments.forEach(function (doc) {

        const status = getStatus(doc.expiryDate);

        const row = document.createElement("tr");

        row.innerHTML = `
    <td>${doc.name}</td>
    <td>${doc.category}</td>
    <td>${doc.expiryDate}</td>
    <td>
        <span class="status-badge ${status.toLowerCase().replace(" ", "-")}">
            ${status}
        </span>
    </td>
    <td>
    <button class="edit-btn" onclick="editDocument(${doc.id})">
        Edit
    </button>

    <button class="delete-btn" onclick="deleteDocument(${doc.id})">
        Delete
    </button>
</td>
`;

        table.appendChild(row);
    });
}

function editDocument(id) {

    const doc = documents.find(function (item) {
        return item.id === id;
    });

    if (!doc) return;

    const name = prompt("Edit document name:", doc.name);

    if (!name || name.trim() === "") return;

    const category = prompt("Edit document category:", doc.category);

    if (!category || category.trim() === "") return;

    let expiryDate = prompt(
        "Edit expiry date (YYYYMMDD):",
        doc.expiryDate.replace(/-/g, "")
    );

    if (!expiryDate || expiryDate.trim() === "") return;

    expiryDate = expiryDate.replace(/\D/g, "");

    if (expiryDate.length !== 8) {
        alert("Please enter the date as YYYYMMDD");
        return;
    }

    expiryDate =
        expiryDate.substring(0, 4) + "-" +
        expiryDate.substring(4, 6) + "-" +
        expiryDate.substring(6, 8);

    doc.name = name.trim();
    doc.category = category.trim();
    doc.expiryDate = expiryDate;

    saveDocuments();
    displayDocuments(searchInput.value);
    updateDashboard();
}

function deleteDocument(id) {

    if (!confirm("Are you sure you want to delete this document?")) {
    return;
}

    documents = documents.filter(function (doc) {
        return doc.id !== id;
    });

    saveDocuments();
    displayDocuments(searchInput.value);
    updateDashboard();
}


function updateDashboard() {

    let active = 0;
    let expiring = 0;
    let expired = 0;

    documents.forEach(function (doc) {

        const status = getStatus(doc.expiryDate);

        if (status === "Active") {
            active++;
        }

        if (status === "Expiring Soon") {
            expiring++;
        }

        if (status === "Expired") {
            expired++;
        }

    });


    document.getElementById("totalDocuments").textContent = documents.length;

    document.getElementById("activeDocuments").textContent = active;

    document.getElementById("expiringDocuments").textContent = expiring;

    document.getElementById("expiredDocuments").textContent = expired;
}


searchInput.addEventListener("input", function () {

    displayDocuments(searchInput.value);

});


displayDocuments();
updateDashboard();
function getExpiryDate() {
    return new Promise(function (resolve) {

        const overlay = document.createElement("div");

        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(0,0,0,0.4)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "9999";

        const box = document.createElement("div");

        box.style.background = "white";
        box.style.padding = "25px";
        box.style.borderRadius = "15px";
        box.style.width = "320px";

        box.innerHTML = `
            <h3>Enter expiry date</h3>

            <input
                id="dateInput"
                type="text"
                maxlength="10"
                placeholder="YYYY-MM-DD"
                style="
                    width:100%;
                    padding:12px;
                    box-sizing:border-box;
                    font-size:16px;
                "
            >

            <br><br>

            <button id="cancelDate">Cancel</button>
            <button id="confirmDate">OK</button>
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        const input = document.getElementById("dateInput");

        input.focus();

        input.addEventListener("input", function () {

            let numbers = input.value.replace(/\D/g, "");

            if (numbers.length > 8) {
                numbers = numbers.substring(0, 8);
            }

            let formatted = numbers;

            if (numbers.length > 4) {
                formatted =
                    numbers.substring(0, 4) +
                    "-" +
                    numbers.substring(4);
            }

            if (numbers.length > 6) {
                formatted =
                    numbers.substring(0, 4) +
                    "-" +
                    numbers.substring(4, 6) +
                    "-" +
                    numbers.substring(6);
            }

            input.value = formatted;
        });

        document.getElementById("cancelDate").onclick = function () {
            overlay.remove();
            resolve(null);
        };

        document.getElementById("confirmDate").onclick = function () {

            if (input.value.length !== 10) {
                alert("Please enter a complete date.");
                return;
            }

            overlay.remove();
            resolve(input.value);
        };
    });
}