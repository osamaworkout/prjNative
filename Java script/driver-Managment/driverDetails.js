document.addEventListener("DOMContentLoaded", function () {
  const saveButton = document.querySelector(".save-btn");
  const deleteButton = document.querySelector(".delete-btn");
  const printButton = document.querySelector(".print-btn");
  const backButton = document.querySelector(".back-btn");
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");
  const inputs = document.querySelectorAll("input");
  const addVacationButton = document.querySelector(".add-vacation-btn");
  const vacationContent = document.querySelector(".vacation-content");
  const leaveModal = document.getElementById("leave-modal");
  const closeModal = document.querySelector(".close-modal");
  const saveLeaveButton = document.getElementById("save-leave-btn");
  const leaveFromInput = document.getElementById("leave-from");
  const leaveToInput = document.getElementById("leave-to");

  //  تحميل بيانات السائق من localStorage عند فتح الصفحة
  function loadSavedData() {
    const driverStatusMap = {
      0: "متاح",
      1: "غائب",
      2: "مشغول",
    } 
    const urlParams = new URLSearchParams(window.location.search);
    const driverID = urlParams.get("id");
    const token = localStorage.getItem("token");
    fetch(`https://movesmartapi.runasp.net/api/Drivers/ByID/${driverID}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("بيانات السائق:", data);
        document.getElementById(
          "driver-name"
        ).innerText = `اسم السائق: ${data.name}`;
        document.getElementById(
          "driver-national-id"
        ).innerText = `الرقم القومي: ${data.nationalNo}`;
        document.getElementById(
          "driver-phone"
        ).innerText = `رقم الهاتف: ${data.phone}`;
        document.getElementById(
          "driver-status"
        ).innerText = `حالة السائق: ${
          driverStatusMap[data.status] || "غير محدد"}`;
        document.querySelector('input[name="name"]').value = data.name || "";
        document.querySelector('input[name="vehicleID"]').value =
          data.vehicleID || "";
        document.querySelector('input[name="phone"]').value = data.phone || "";
        document.querySelector('input[name="nationalNum"]').value =
          data.nationalNo || "";
        document.querySelector('input[name="status"]').value =
          driverStatusMap[data.status] || "غير محدد";
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
      });
  }
  //  دالة الحفظ
  if (saveButton) {
    saveButton.addEventListener("click", function () {
      const updatedDriver = {
        name: document.querySelector('input[name="name"]').value,
        carNumber: document.querySelector('input[name="carNumber"]').value,
        phone: document.querySelector('input[name="phone"]').value,
        nationalId: document.querySelector('input[name="nationalId"]').value,
        status: document.querySelector('input[name="status"]').value,
        vacations: getVacationsData(),
        image: document.getElementById("driver-image")?.src,
      };

      localStorage.setItem("selectedDriver", JSON.stringify(updatedDriver));
      alert("✅ تم حفظ التعديلات بنجاح!");

      loadSavedData();
    });
  }

  //  دالة الحذف
  if (deleteButton) {
    deleteButton.addEventListener("click", function () {
      if (confirm("⚠ هل أنت متأكد من حذف بيانات السائق؟")) {
        localStorage.removeItem("selectedDriver");
        alert("✅ تم حذف بيانات السائق!");
        window.location.reload();
      }
    });
  }

  // دالة الطباعة
  if (printButton) {
    printButton.addEventListener("click", function () {
      window.print();
    });
  }

  //  دالة الرجوع
  if (backButton) {
    backButton.addEventListener("click", function () {
      window.history.back();
    });
  }

  //  التنقل بين التبويبات
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      tabContents.forEach((content) => (content.style.display = "none"));
      document.getElementById(this.dataset.tab).style.display = "block";

      if (saveButton) {
        saveButton.style.display =
          this.dataset.tab === "driver-info" ? "block" : "none";
      }
      if (addVacationButton) {
        addVacationButton.style.display =
          this.dataset.tab === "vacation-record" ? "block" : "none";
      }
    });
  });

  //  إضافة إجازة جديدة
  if (addVacationButton) {
    addVacationButton.addEventListener("click", function () {
      leaveModal.style.display = "flex";
    });
  }

  if (closeModal) {
    closeModal.addEventListener("click", function () {
      leaveModal.style.display = "none";
    });
  }

  // حفظ الإجازة
  if (saveLeaveButton) {
    saveLeaveButton.addEventListener("click", function () {
      const fromDate = leaveFromInput.value;
      const toDate = leaveToInput.value;

      if (fromDate && toDate) {
        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);
        const days = Math.ceil(
          Math.abs(toDateObj - fromDateObj) / (1000 * 60 * 60 * 24)
        );

        const newRow = document.createElement("div");
        newRow.classList.add("vacation-entry");
        newRow.innerHTML = `
                    <span>${fromDate}</span>
                    <span>${toDate}</span>
                    <span>${days} أيام</span>
                    <button class="delete-vacation-btn">🗑 حذف</button>
                `;

        vacationContent.appendChild(newRow);

        newRow
          .querySelector(".delete-vacation-btn")
          .addEventListener("click", function () {
            newRow.remove();
          });

        leaveModal.style.display = "none";
        leaveFromInput.value = "";
        leaveToInput.value = "";
      } else {
        alert("⚠ يرجى اختيار التواريخ!");
      }
    });
  }

  // جلب بيانات الإجازات
  function getVacationsData() {
    const vacations = [];
    document.querySelectorAll(".vacation-entry").forEach((entry) => {
      const spans = entry.querySelectorAll("span");
      vacations.push({
        from: spans[0].innerText,
        to: spans[1].innerText,
        days: spans[2].innerText,
      });
    });
    return vacations;
  }

  // عرض الإجازات عند تحميل الصفحة
  function populateVacations(vacations) {
    vacationContent.innerHTML = "";
    vacations.forEach((vac) => {
      const newRow = document.createElement("div");
      newRow.classList.add("vacation-entry");
      newRow.innerHTML = `
                <span>${vac.from}</span>
                <span>${vac.to}</span>
                <span>${vac.days} أيام</span>
                <button class="delete-vacation-btn">🗑 حذف</button>
            `;
      vacationContent.appendChild(newRow);
      newRow
        .querySelector(".delete-vacation-btn")
        .addEventListener("click", function () {
          newRow.remove();
        });
    });
  }

  // تعيين التبويب الافتراضي وتحميل البيانات
  document.querySelector("[data-tab='driver-info']")?.click();
  loadSavedData();
});
