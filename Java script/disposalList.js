var consumables = [];
var editindex = null;

var partconsumables = document.getElementById("consumables");
var consumablesCards = document.getElementById("consumablesCards");
var totalconsumables = document.getElementById("total");
var searchinput = document.getElementById("search");
var addBtnSubmit = document.getElementById("addBtnSubmit");
var editBtnSubmit = document.getElementById("editBtnSubmit");

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
  editindex = null;
  clearInputs();
}

// مسح الحقول
function clearInputs() {
  document.getElementById("newconsumableName").value = "";
  // document.getElementById("newCarType").value = "";
  // document.getElementById("newCode").value = "";
  document.getElementById("newQuantity").value = "";
  document.getElementById("newLifetime").value = "";
  // document.getElementById("newCost").value = "";
}

// جلب البيانات
async function fetchconsumables() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("يرجى تسجيل الدخول أولاً");
      window.location.href = "login.html";
      return;
    }
    const response = await fetch(
      "https://movesmartapi.runasp.net/api/VehicleConsumable",
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
      consumables = data.$values;
    } else {
      consumables = [];
    }

    renderconsumablesList();
  } catch (err) {
    console.error("حدث خطأ أثناء جلب البيانات:", err);
  }
}

// عرض البيانات
function renderconsumablesList() {
  partconsumables.innerHTML = "";
  consumablesCards.innerHTML = "";

  if (consumables.length === 0) {
    partconsumables.innerHTML = "<li>لا توجد قطع غيار حالياً.</li>";
  } else {
    consumables.forEach((part, index) => {
      const li = document.createElement("li");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.onclick = () => toggleCard(index);
      li.appendChild(checkbox);
      li.appendChild(document.createTextNode(` ${part.consumableName}`));
      partconsumables.appendChild(li);
    });
    totalconsumables.innerText = consumables.length;
  }
}

// عرض الكارد
function toggleCard(index) {
  const existing = document.getElementById(`card-${index}`);
  if (existing) {
    existing.remove();
    return;
  }

  const part = consumables[index];
  const card = document.createElement("div");
  card.className = "card";
  card.id = `card-${index}`;
  card.innerHTML = `
    <h3>${part.consumableName}</h3>
    <div class="card-details">
      <p><strong>الكمية:</strong> ${part.quantity}</p>
      <p><strong>العمر الافتراضي:</strong> ${part.validityLength} يوم</p>
    </div>
    <div class="card-buttons">
      <button onclick="editPart(${index})">✏️ تعديل</button>
      <button onclick="deletePart(${index})">🗑️ حذف</button>
    </div>
  `;
  consumablesCards.appendChild(card);
}

// بدء التعديل
function editPart(index) {
  editindex = index;
  const part = consumables[index];
  document.getElementById("newconsumableName").value = part.consumableName;
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
    const id = consumables[index].consumableId;
    console.log("ببعت التعديل على ID:", id);
    await fetch(`https://movesmartapi.runasp.net/api/VehicleConsumable/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchconsumables();
  } catch (err) {
    console.error("فشل الحذف:", err);
  }
}

// إضافة
async function addPart() {
  const newPart = {
    consumableName: document.getElementById("newconsumableName").value,
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
      "https://movesmartapi.runasp.net/api/VehicleConsumable",
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
    //   consumables = data.$values;
    // } else {
    //   consumables = [];
    // }

    if (response.ok) {
      closePop();
      await fetchconsumables();
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
    consumableId: consumables[editindex].consumableId,
    consumableName: document.getElementById("newconsumableName").value,
    validityLength: +document.getElementById("newLifetime").value,
    quantity: +document.getElementById("newQuantity").value,
  };

  try {
    // const id = consumables[editindex].consumableId;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("يرجى تسجيل الدخول أولاً");
      window.location.href = "login.html";
      return;
    }

    const response = await fetch(
      `https://movesmartapi.runasp.net/api/VehicleConsumable`,
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
      editindex = null;
      await fetchconsumables();
    } else {
      alert("فشل التعديل، يرجى المحاولة لاحقاً.");
    }
  } catch (err) {
    console.error("فشل التعديل:", err);
  }
}

// بحث
// i.oninput = function () {
//   const keyword = this.value.toLowerCase();
//   const filtered = consumables.filter((p) =>
//     p.consumableName.toLowerCase().includes(keyword)
//   );
//   partconsumables.innerHTML = "";
//   consumablesCards.innerHTML = "";
//   filtered.forEach((part, index) => {
//     const li = document.createElement("li");
//     const checkbox = document.createElement("input");
//     checkbox.type = "checkbox";
//     checkbox.onclick = () => toggleCard(index);
//     li.appendChild(checkbox);
//     li.appendChild(document.createTextNode(` ${part.consumableName}`));
//     partconsumables.appendChild(li);
//   });
// };

// أول تحميل
fetchconsumables();

// تحديث
document.getElementById("refreshBtn").onclick = fetchconsumables;
