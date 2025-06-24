document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    window.location.href = '../Login.html';
    return;
  }

  const pageTitle = document.querySelector('.page-title');
  pageTitle.style.cursor = 'pointer';
  pageTitle.addEventListener('click', function () {
    window.location.href = `../dash-Boards/${userRole.toLowerCase()}Dashboard.html`;
  });

  // عناصر DOM
  const partconsumables = document.getElementById("consumables");
  const consumablesCards = document.getElementById("consumablesCards");
  const totalconsumables = document.getElementById("total");
  const searchinput = document.getElementById("search");
  const addBtnSubmit = document.getElementById("addBtnSubmit");
  const editBtnSubmit = document.getElementById("editBtnSubmit");
  const refreshBtn = document.getElementById("refreshBtn");

  // متغيرات التطبيق
  let consumables = [];
  let editindex = null;

  // أحداث الأزرار
  addBtnSubmit.addEventListener("click", addPart);
  editBtnSubmit.addEventListener("click", updatePart);
  refreshBtn.addEventListener("click", fetchconsumables);

  // البحث
  searchinput.oninput = function () {
    const keyword = this.value.toLowerCase();
    const filtered = consumables.filter((p) =>
      p.consumableName.toLowerCase().includes(keyword)
    );
    partconsumables.innerHTML = "";
    consumablesCards.innerHTML = "";

    filtered.forEach((part) => {
      const indexInOriginal = consumables.indexOf(part); 
      const li = document.createElement("li");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.onclick = () => toggleCard(indexInOriginal); 
      li.appendChild(checkbox);
      li.appendChild(document.createTextNode(` ${part.consumableName}`));
      partconsumables.appendChild(li);
    });

    totalconsumables.innerText = filtered.length;
  };


  // أول تحميل
  fetchconsumables();

  // جلب البيانات من السيرفر
  async function fetchconsumables() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("يرجى تسجيل الدخول أولاً");
        window.location.href = "login.html";
        return;
      }

      const response = await fetch("https://movesmartapi.runasp.net/api/VehicleConsumable", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      consumables = Array.isArray(data.$values) ? data.$values : [];
      renderconsumablesList();
    } catch (err) {
      console.error("حدث خطأ أثناء جلب البيانات:", err);
    }
  }

  // عرض العناصر في القائمة
  function renderconsumablesList() {
    partconsumables.innerHTML = "";
    consumablesCards.innerHTML = "";

    if (consumables.length === 0) {
      partconsumables.innerHTML = "<li>لا توجد قطع غيار حالياً.</li>";
    } else {
      console.log(" القطع:", consumables);
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

  // عرض الكارت
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

  // فتح النافذة
  window.openPop = function () {
    document.getElementById("addPartPopup").classList.remove("hidden");
    addBtnSubmit.classList.remove("hidden");
    editBtnSubmit.classList.add("hidden");
    clearInputs();
  };

  // إغلاق النافذة
  window.closePop = function () {
    document.getElementById("addPartPopup").classList.add("hidden");
    editindex = null;
    clearInputs();
  };

  function clearInputs() {
    document.getElementById("newconsumableName").value = "";
    document.getElementById("newQuantity").value = "";
    document.getElementById("newLifetime").value = "";
  }

  // تعديل قطعة
  window.editPart = function (index) {
    editindex = index;
    const part = consumables[index];
    document.getElementById("newconsumableName").value = part.consumableName;
    document.getElementById("newQuantity").value = part.quantity;
    document.getElementById("newLifetime").value = part.validityLength;

    document.getElementById("addPartPopup").classList.remove("hidden");
    addBtnSubmit.classList.add("hidden");
    editBtnSubmit.classList.remove("hidden");
  };

  // حذف قطعة
  window.deletePart = async function (index) {
    const confirmDelete = confirm("هل تريد حذف القطعة؟");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const id = consumables[index].consumableId;

      await fetch(`https://movesmartapi.runasp.net/api/VehicleConsumable/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchconsumables();
    } catch (err) {
      console.error("فشل الحذف:", err);
    }
  };

  // إضافة قطعة جديدة
  async function addPart() {
    console.log("جاري الإضافة...");
    const newPart = {
      consumableName: document.getElementById("newconsumableName").value,
      validityLength: +document.getElementById("newLifetime").value,
      quantity: +document.getElementById("newQuantity").value,
    };

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("https://movesmartapi.runasp.net/api/VehicleConsumable", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPart),
      });

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

  // تحديث بيانات القطعة
  async function updatePart() {
    const updatedPart = {
      consumableId: consumables[editindex].consumableId,
      consumableName: document.getElementById("newconsumableName").value,
      validityLength: +document.getElementById("newLifetime").value,
      quantity: +document.getElementById("newQuantity").value,
    };

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("https://movesmartapi.runasp.net/api/VehicleConsumable", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPart),
      });

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
  window.updatePart = updatePart;
  window.openPop = openPop;
  window.closePop = closePop;
  window.addPart = addPart;
  window.editPart = editPart;
  window.deletePart = deletePart;

});
