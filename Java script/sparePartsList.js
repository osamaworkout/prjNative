let parts = [];
let editIndex = null;

const partList = document.getElementById("parts");
const cardsContainer = document.getElementById("cardsContainer");
const totalSpan = document.getElementById("total");
const searchInput = document.getElementById("search");
const addBtnSubmit = document.getElementById("addBtnSubmit");
const editBtnSubmit = document.getElementById("editBtnSubmit");

// فتح البوب أب
function openPop() {
  document.getElementById("addPartPopup").classList.remove("hidden");
  addBtnSubmit.classList.remove("hidden");
  editBtnSubmit.classList.add("hidden");
  clearInputs();
}

// إغلاق البوب أب
function closePop() {
  document.getElementById("addPartPopup").classList.add("hidden");
  editIndex = null;
  clearInputs();
}

// مسح الحقول
function clearInputs() {
  document.getElementById("newPartName").value = "";
  // document.getElementById("newCarType").value = "";
  // document.getElementById("newCode").value = "";
  document.getElementById("newQuantity").value = "";
  document.getElementById("newLifetime").value = "";
  // document.getElementById("newCost").value = "";
}

// جلب البيانات
async function fetchParts() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("يرجى تسجيل الدخول أولاً");
      window.location.href = "login.html";
      return;
    }
    const response = await fetch(
      "https://movesmartapi.runasp.net/api/SparePart",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    console.log(data);

    if (Array.isArray(data.$values)) {
      parts = data.$values;
    } else {
      parts = [];
    }

    renderPartsList();
  } catch (err) {
    console.error("حدث خطأ أثناء جلب البيانات:", err);
  }
}

// عرض البيانات
function renderPartsList() {
  partList.innerHTML = "";
  cardsContainer.innerHTML = "";

  if (parts.length === 0) {
    partList.innerHTML = "<li>لا توجد قطع غيار حالياً.</li>";
  } else {
    parts.forEach((part, index) => {
      const li = document.createElement("li");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.onclick = () => toggleCard(index);
      li.appendChild(checkbox);
      li.appendChild(document.createTextNode(` ${part.partName}`));
      partList.appendChild(li);
    });
    totalSpan.innerText = parts.length;
  }
}

// عرض الكارد
function toggleCard(index) {
  const existing = document.getElementById(`card-${index}`);
  if (existing) {
    existing.remove();
    return;
  }

  const part = parts[index];
  const card = document.createElement("div");
  card.className = "card";
  card.id = `card-${index}`;
  card.innerHTML = `
    <h3>${part.partName}</h3>
    <div class="card-details">
      <p><strong>الكمية:</strong> ${part.quantity}</p>
      <p><strong>العمر الافتراضي:</strong> ${part.validityLength} يوم</p>
    </div>
    <div class="card-buttons">
      <button onclick="editPart(${index})">✏️ تعديل</button>
      <button onclick="deletePart(${index})">🗑️ حذف</button>
    </div>
  `;
  cardsContainer.appendChild(card);
}

// بدء التعديل
function editPart(index) {
  editIndex = index;
  const part = parts[index];
  document.getElementById("newPartName").value = part.partName;
  document.getElementById("newQuantity").value = part.quantity;
  document.getElementById("newLifetime").value = part.validityLength;

  document.getElementById("addPartPopup").classList.remove("hidden");
  addBtnSubmit.classList.add("hidden");
  editBtnSubmit.classList.remove("hidden");
}

// حذف
async function deletePart(index) {
  const confirmDelete = confirm("هل تريد حذف القطعة؟");
  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("يرجى تسجيل الدخول أولاً");
      window.location.href = "login.html";
      return;
    }
    const id = parts[index].sparePartId;
    console.log("ببعت التعديل على ID:", id);
    await fetch(`https://movesmartapi.runasp.net/api/SparePart/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchParts();
  } catch (err) {
    console.error("فشل الحذف:", err);
  }
}

// إضافة
async function addPart() {
  const newPart = {
    partName: document.getElementById("newPartName").value,
    validityLength: +document.getElementById("newLifetime").value,
    quantity: +document.getElementById("newQuantity").value,
  };

  try {
    const token = localStorage.getItem("token");
    console.log(token);
    if (!token) {
      alert("يرجى تسجيل الدخول أولاً");
      window.location.href = "login.html";
      return;
    }

    const response = await fetch(
      "https://movesmartapi.runasp.net/api/SparePart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPart),
      }
    );

    //  const data = await response.json();
    // const successMsg = await response.text();
    // alert(successMsg);
    //  console.log(data);

    // if (Array.isArray(data.$values)) {
    //   parts = data.$values;
    // } else {
    //   parts = [];
    // }

    if (response.ok) {
      closePop();
      await fetchParts();
    } else {
      alert("فشل الإضافة، يرجى المحاولة لاحقاً.");
    }
  } catch (err) {
    console.error("فشل الإضافة:", err);
  }
}

// تعديل
async function updatePart() {
  const updatedPart = {
    sparePartId: parts[editIndex].sparePartId,
    partName: document.getElementById("newPartName").value,
    validityLength: +document.getElementById("newLifetime").value,
    quantity: +document.getElementById("newQuantity").value,
  };

  try {
    // const id = parts[editIndex].sparePartId;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("يرجى تسجيل الدخول أولاً");
      window.location.href = "login.html";
      return;
    }

    const response = await fetch(
      `https://movesmartapi.runasp.net/api/SparePart`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPart),
      }
    );

    if (response.ok) {
      closePop();
      editIndex = null;
      await fetchParts();
    } else {
      alert("فشل التعديل، يرجى المحاولة لاحقاً.");
    }
  } catch (err) {
    console.error("فشل التعديل:", err);
  }
}

// بحث
// searchInput.oninput = function () {
//   const keyword = this.value.toLowerCase();
//   const filtered = parts.filter((p) =>
//     p.partName.toLowerCase().includes(keyword)
//   );
//   partList.innerHTML = "";
//   cardsContainer.innerHTML = "";
//   filtered.forEach((part, index) => {
//     const li = document.createElement("li");
//     const checkbox = document.createElement("input");
//     checkbox.type = "checkbox";
//     checkbox.onclick = () => toggleCard(index);
//     li.appendChild(checkbox);
//     li.appendChild(document.createTextNode(` ${part.partName}`));
//     partList.appendChild(li);
//   });
// };

// أول تحميل
fetchParts();

// تحديث
document.getElementById("refreshBtn").onclick = fetchParts;
