// تحميل السيارات من قاعدة البيانات
async function loadCars() {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch("https://movesmartapi.runasp.net/api/Vehicles/All",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    console.log("البيانات المستلمة:", data);

    let cars = Array.isArray(data.$values) ? data.$values : [];

    displayCars(cars);
  } catch (error) {
    console.error("خطأ في جلب البيانات:", error);
  }
}

// let cars = [];

// البحث في جميع الحقول كما هو
function searchCars() {
  const searchTerm = document.getElementById("search").value.toLowerCase();

  const filteredCars = cars.filter(
    (car) =>
      car.vehicleID.includes(searchTerm) ||
      car.brandName.toLowerCase().includes(searchTerm) ||
      car.modelName.toLowerCase().includes(searchTerm) ||
      car.vehicleType.toLowerCase().includes(searchTerm) ||
      car.associatedHospital.toLowerCase().includes(searchTerm) ||
      car.status.toLowerCase().includes(searchTerm)
  );

  displayCars(filteredCars);
}

// الفلترة حسب "الحالة" فقط 
function filterCars() {
  const selectedStatus = document.getElementById("filter-select").value;

  if (selectedStatus === "all") {
    loadCars();
    return;
  }

  const filteredCars = cars.filter((car) => car.status === selectedStatus);
  displayCars(filteredCars);
}

// عرض السيارات في الصفحة
function displayCars(filteredList) {
  const carstatus = {
    0: "متاحة",
    1: "مشغولة",
    2: "قيد الصيانة",
  }
  const carType = {
        0: "سيدان",
        1: "واحد كبينة",
        2: "ثنائي كبينة",
        3: "شاحنة نقل",
        4: "ميكروباص",
        5: "ميني باص",
        6: "أتوبيس",
        7: "اسعاف"
    }
  const container = document.getElementById("cars-container");
  container.innerHTML = "";

  filteredList.forEach((car) => {
    const carCard = document.createElement("div");
    carCard.classList.add("card");

    carCard.innerHTML = `
    <p><strong></strong> <a href="../../Pages/car-Managment/carDetails.html?id=${car.vehicleID}">${car.plateNumbers}</a></p>
    <p><strong></strong> ${car.brandName}</p>
    <p><strong></strong> ${car.modelName}</p>
    <p><strong></strong> ${carType[car.vehicleType] || "غير معروف"}</p>
    <p><strong></strong> ${car.associatedHospital}</p>
    <p class="status ${car.status === "متاحة" ? "active" : "inactive"}">
        <strong></strong> ${carstatus[car.status] || "غير معروف"}
    </p>
`;

    container.appendChild(carCard);
  });

  document.getElementById("total-count").innerText = filteredList.length;
}

 function validate() {
    const carBrand = document.getElementById('car-brand').value;
    const carModel = document.getElementById('car-model').value;
    const carNumber = document.getElementById('car-plate').value;
    const hospital = document.getElementById('car-hospital').value;
    const task = document.getElementById('car-task').value;

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

    if (!isValid) {
      alert(errorMessages.join("\n"));
    }

    return isValid;
  }

// إضافة سيارة جديدة
function submitVehicle() {
  // التحقق من صحة البيانات المدخلة
  if (!validate()) {
    return; // إذا كانت البيانات غير صحيحة، لا نتابع
  }

  const carData = {     
      vehicleID: 0,
      brandName: document.getElementById('car-brand').value,
      modelName: document.getElementById('car-model').value,
      plateNumbers: document.getElementById('car-plate').value,
      vehicleType: parseInt(document.getElementById('car-type').value),
      associatedHospital: document.getElementById('car-hospital').value,
      associatedTask: document.getElementById('car-task').value,
      status: parseInt(document.getElementById('car-status').value),
      totalKilometersMoved: parseInt(document.getElementById('car-kilometers').value),
      fuelType: parseInt(document.getElementById('fuel-type').value),
      fuelConsumptionRate: parseFloat(document.getElementById('fuel-consumption').value),
      oilConsumptionRate: parseFloat(document.getElementById('oil-consumption').value)
  };
  const token = localStorage.getItem("token");
  fetch('https://movesmartapi.runasp.net/api/Vehicles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` ,
    },
    body: JSON.stringify(carData),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    closePop(); 
    refreshData(); // تحديث البيانات بعد الإضافة
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

// إظهار نافذة الإضافة
function openPop() {
  document.getElementById("add-pop").classList.remove("hidden");
}
// إغلاق نافذة الإضافة
function closePop() {
  document.getElementById("add-pop").classList.add("hidden");
}
// إغلاق نافذة الإضافة عند الضغط على زر الإغلاق
function refreshData() {
  loadCars(); // إعادة تحميل السيارات من الـ API
}

loadCars();
document.addEventListener("DOMContentLoaded", loadCars);

