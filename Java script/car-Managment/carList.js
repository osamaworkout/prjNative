// Navigation functionality
document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    window.location.href = "../../Login.html";
    return;
  }

  // Add click event listener to the page title for navigation
  const pageTitle = document.querySelector("h2");
  pageTitle.style.cursor = "pointer";
  pageTitle.addEventListener("click", function () {
    window.location.href = `../dash-Boards/${userRole.toLowerCase()}Dashboard.html`;
  });
});

let allCars = []; // كل العربيات (فيكيلز وباصات)
let userRole = null;

// الرولز المسموح لها تشوف الكل
const allowedRoles = [
  "SuperUser",
  "HospitalManager",
  "GeneralManager",
  "GeneralSupervisor",
  "AdminstrativeSupervisor",
  "PatrolsSupervisor",
  "WorkshopSupervisor",
];

// تحميل السيارات والباصات معًا
async function loadCars() {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  try {
    // جلب الفيكيلز
    let vehicles = [];
    try {
      const vRes = await fetch(
        "https://movesmartapi.runasp.net/api/Vehicles/All",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (vRes.ok) {
        const vData = await vRes.json();
        vehicles = Array.isArray(vData.$values) ? vData.$values : [];
      }
    } catch (e) {
      vehicles = [];
    }

    // جلب الباصات
    let buses = [];
    try {
      const bRes = await fetch("https://movesmartapi.runasp.net/api/Buses/All", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (bRes.ok) {
        const bData = await bRes.json();
        buses = Array.isArray(bData.$values) ? bData.$values : [];
      }
    } catch (e) {
      buses = [];
    }

    // دمج البيانات
    const busesMapped = buses.map((bus) => ({
      ...bus.vehicle,
      isBus: true,
      busID: bus.busID,
      capacity: bus.capacity,
      availableSpace: bus.availableSpace,
    }));
    const vehiclesMapped = vehicles.map((v) => ({
      ...v,
      isBus: false,
    }));

    // فقط PatrolsSupervisor يشوف الباصات فقط
    if (userRole === "PatrolsSupervisor") {
      allCars = busesMapped;
      const typeFilter = document.getElementById("type-filter");
      if (typeFilter) {
        typeFilter.value = "bus";
        typeFilter.disabled = true;
      }
    } else {
      allCars = [...vehiclesMapped, ...busesMapped];
      const typeFilter = document.getElementById("type-filter");
      if (typeFilter) {
        typeFilter.value = "all";
        typeFilter.disabled = false;
      }
    }

    displayCars(allCars);
  } catch (error) {
    console.error("خطأ في جلب البيانات:", error);
  }
}

// البحث والفلترة
function searchCars() {
  const searchTerm = document.getElementById("search").value.toLowerCase();
  filterCars(searchTerm);
}

function filterCars(searchTerm = "") {
  const statusVal = document.getElementById("filter-select").value;
  const typeVal = document.getElementById("type-filter").value;

  let filtered = allCars;

  // فلترة النوع
  if (typeVal === "vehicle") filtered = filtered.filter((c) => !c.isBus);
  else if (typeVal === "bus") filtered = filtered.filter((c) => c.isBus);

  // فلترة الحالة
  if (statusVal !== "all")
    filtered = filtered.filter((c) => String(c.status) === statusVal);

  // فلترة البحث
  if (searchTerm) {
    filtered = filtered.filter(
      (car) =>
        (car.vehicleID && String(car.vehicleID).includes(searchTerm)) ||
        (car.brandName && car.brandName.toLowerCase().includes(searchTerm)) ||
        (car.modelName && car.modelName.toLowerCase().includes(searchTerm)) ||
        (car.vehicleType !== undefined &&
          String(car.vehicleType).includes(searchTerm)) ||
        (car.associatedHospital &&
          car.associatedHospital.toLowerCase().includes(searchTerm)) ||
        (car.status !== undefined && String(car.status).includes(searchTerm)) ||
        (car.plateNumbers &&
          car.plateNumbers.toLowerCase().includes(searchTerm))
    );
  }

  displayCars(filtered);
}

// عرض السيارات والباصات
function displayCars(filteredList) {
  const carstatus = {
    0: "متاحة",
    1: "مشغولة",
    2: "قيد الصيانة",
  };
  const carType = {
    0: "سيدان",
    1: "واحد كبينة",
    2: "ثنائي كبينة",
    3: "شاحنة نقل",
    4: "ميكروباص",
    5: "ميني باص",
    6: "أتوبيس",
    7: "اسعاف",
  };
  const container = document.getElementById("cars-container");
  container.innerHTML = "";

  filteredList.forEach((car) => {
    const carCard = document.createElement("div");
    carCard.classList.add("card");

    if (car.isBus) {
      carCard.innerHTML = `
        <p><strong></strong> <a href="../../Pages/car-Managment/carDetails.html?id=${
          car.vehicleID
        }&type=bus">${car.plateNumbers}</a></p>
        <p><strong></strong> ${car.brandName}</p>
        <p><strong></strong> ${car.modelName}</p>
        <p><strong></strong> ${carType[car.vehicleType] || "غير معروف"}</p>
        <p><strong></strong> ${car.associatedHospital}</p>
        <p class="status ${car.status === 0 ? "active" : "inactive"}">
          <strong></strong> ${carstatus[car.status] || "غير معروف"}
        </p>
        <p>السعة: ${car.capacity} | المتاح: ${car.availableSpace}</p>
      `;
    } else {
      carCard.innerHTML = `
        <p><strong></strong> <a href="../../Pages/car-Managment/carDetails.html?id=${
          car.vehicleID
        }&type=vehicle">${car.plateNumbers}</a></p>
        <p><strong></strong> ${car.brandName}</p>
        <p><strong></strong> ${car.modelName}</p>
        <p><strong></strong> ${carType[car.vehicleType] || "غير معروف"}</p>
        <p><strong></strong> ${car.associatedHospital}</p>
        <p class="status ${car.status === 0 ? "active" : "inactive"}">
          <strong></strong> ${carstatus[car.status] || "غير معروف"}
        </p>
      `;
    }

    container.appendChild(carCard);
  });

  document.getElementById("total-count").innerText = filteredList.length;
}

// إظهار/إخفاء حقول الباص في البوب أب
function toggleAddType() {
  const type = document.getElementById("add-type-select").value;
  document.getElementById("vehicle-fields").style.display = "block";
  document.getElementById("bus-fields").style.display =
    type === "bus" ? "block" : "none";
}

// إضافة سيارة أو باص
function submitVehicle() {
  const type = document.getElementById("add-type-select").value;
  if (!validate(type)) return;

  const token = localStorage.getItem("token");

  if (type === "vehicle") {
    // نفس الكود القديم
    const carData = {
      vehicleID: 0,
      brandName: document.getElementById("car-brand").value,
      modelName: document.getElementById("car-model").value,
      plateNumbers: document.getElementById("car-plate").value,
      vehicleType: parseInt(document.getElementById("car-type").value),
      associatedHospital: document.getElementById("car-hospital").value,
      associatedTask: document.getElementById("car-task").value,
      status: parseInt(document.getElementById("car-status").value),
      totalKilometersMoved: parseInt(
        document.getElementById("car-kilometers").value
      ),
      fuelType: parseInt(document.getElementById("fuel-type").value),
      fuelConsumptionRate: parseFloat(
        document.getElementById("fuel-consumption").value
      ),
      oilConsumptionRate: parseFloat(
        document.getElementById("oil-consumption").value
      ),
    };
    fetch("https://movesmartapi.runasp.net/api/Vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(carData),
    })
      .then((response) => response.json())
      .then((data) => {
        closePop();
        refreshData();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else if (type === "bus") {
    // أضف الباص
    const vehicleData = {
      vehicleID: 0,
      brandName: document.getElementById("car-brand").value,
      modelName: document.getElementById("car-model").value,
      plateNumbers: document.getElementById("car-plate").value,
      vehicleType: parseInt(document.getElementById("car-type").value),
      associatedHospital: document.getElementById("car-hospital").value,
      associatedTask: document.getElementById("car-task").value,
      status: parseInt(document.getElementById("car-status").value),
      totalKilometersMoved: parseInt(
        document.getElementById("car-kilometers").value
      ),
      fuelType: parseInt(document.getElementById("fuel-type").value),
      fuelConsumptionRate: parseFloat(
        document.getElementById("fuel-consumption").value
      ),
      oilConsumptionRate: parseFloat(
        document.getElementById("oil-consumption").value
      ),
    };
    const busData = {
      busID: 0,
      capacity: parseInt(document.getElementById("bus-capacity").value),
      availableSpace: parseInt(
        document.getElementById("bus-available-space").value
      ),
      vehicle: vehicleData,
    };
    fetch("https://movesmartapi.runasp.net/api/Buses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(busData),
    })
      .then((response) => response.json())
      .then((data) => {
        closePop();
        refreshData();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

// التحقق من صحة البيانات
function validate(type = "vehicle") {
  const carBrand = document.getElementById("car-brand").value;
  const carModel = document.getElementById("car-model").value;
  const carNumber = document.getElementById("car-plate").value;
  const hospital = document.getElementById("car-hospital").value;
  const task = document.getElementById("car-task").value;

  let isValid = true;
  let errorMessages = [];

  if (carBrand.length < 2) {
    isValid = false;
    errorMessages.push(
      "البراند نيم يجب ألا يكون فارغًا وطوله يجب أن يكون 2 حرف على الأقل."
    );
  }
  if (!carModel) {
    isValid = false;
    errorMessages.push("الموديل نيم يجب ألا يكون فارغًا.");
  }
  if (!carNumber || !(carNumber.length === 6 || carNumber.length === 7)) {
    isValid = false;
    errorMessages.push("رقم السيارة يجب أن يكون 6 أو 7 حروف.");
  }
  if (!hospital) {
    isValid = false;
    errorMessages.push("المستشفى يجب ألا يكون فارغًا.");
  }
  if (!task) {
    isValid = false;
    errorMessages.push("التاسك يجب ألا يكون فارغًا.");
  }

  if (type === "bus") {
    const capacity = document.getElementById("bus-capacity").value;
    const availableSpace = document.getElementById("bus-available-space").value;
    if (!capacity || capacity <= 0) {
      isValid = false;
      errorMessages.push("سعة الباص مطلوبة ويجب أن تكون أكبر من صفر.");
    }
    if (availableSpace === "" || availableSpace < 0) {
      isValid = false;
      errorMessages.push("عدد المقاعد المتاحة مطلوب ولا يمكن أن يكون سالب.");
    }
  }

  if (!isValid) {
    alert(errorMessages.join("\n"));
  }
  return isValid;
}

// إظهار نافذة الإضافة
function openPop() {
  document.getElementById("add-pop").classList.remove("hidden");
  document.getElementById("add-type-select").value = "vehicle";
  toggleAddType();
}
// إغلاق نافذة الإضافة
function closePop() {
  document.getElementById("add-pop").classList.add("hidden");
}
// إغلاق نافذة الإضافة عند الضغط على زر الإغلاق
function refreshData() {
  loadCars(); // إعادة تحميل السيارات من الـ API
}

// تحميل البيانات عند بداية الصفحة
loadCars();
