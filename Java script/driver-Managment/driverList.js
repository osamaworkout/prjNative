// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    window.location.href = '../../Login.html';
    return;
  }

  // Add click event listener to the page title for navigation
  const pageTitle = document.querySelector('h2');
  pageTitle.style.cursor = 'pointer';
  pageTitle.addEventListener('click', function() {
    window.location.href = `../dash-Boards/${userRole.toLowerCase()}Dashboard.html`;
  });
});

// let drivers = [];

function openPop() {
  document.getElementById("add-pop").classList.remove("hidden");
}

function closePop() {
  document.getElementById("add-pop").classList.add("hidden");
}

function submitDriver() {
  const name = document.getElementById("driver-name").value.trim();
  const nationalNo = document.getElementById("nationalNum").value.trim();
  const phone = document.getElementById("driver-phone").value.trim();
  const vehicleID = parseInt(document.getElementById("vehicleID").value);

  const statusText = document.getElementById("driver-status").value;
  const statusMap = {
    "متاح": 0,    // Available
    "غائب": 1,    // Absent
    "قيد العمل": 2  // Working
  };
  const status = statusMap[statusText];

  if (!validate()) {
    alert("يرجى ملء جميع الحقول بشكل صحيح");
    return;
  }

  const newDriver = {
    driverID: 0,
    name,
    nationalNo,
    status,
    phone,
    vehicleID,
  };

  addDriver(newDriver);

  document.getElementById("driver-name").value = "";
  document.getElementById("nationalNum").value = "";
  document.getElementById("driver-status").value = "";
  document.getElementById("driver-phone").value = "";
  document.getElementById("vehicleID").value = "";

  closePop();
}

async function loadDriver() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      "https://movesmartapi.runasp.net/api/Drivers/All",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    const driversList = Array.isArray(data.$values) ? data.$values : [];

    drivers = driversList;
    displayDriver(driversList);
  } catch (error) {
    console.error("خطأ في جلب البيانات:", error);
  }
}

function searchDriver() {
  const searchTerm = document.getElementById("search").value.toLowerCase();

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm) ||
      driver.phone.includes(searchTerm) ||
      String(driver.vehicleID).includes(searchTerm) ||
      String(driver.status).includes(searchTerm)
  );

  displayDriver(filteredDrivers);
}

function filterDriver() {
  const selectedStatus = document.getElementById("filter-select").value;

  if (selectedStatus === "all") {
    displayDriver(drivers);
    return;
  }

  const filteredDrivers = drivers.filter(
    (driver) => String(driver.status) === selectedStatus
  );

  displayDriver(filteredDrivers);
}

function displayDriver(list) {
  const container = document.getElementById("driver-container");
  container.innerHTML = "";

  const driverStatusMap = {
    0: "متاح",     // Available
    1: "غائب",     // Absent
    2: "قيد العمل"  // Working
  };

  list.forEach((driver) => {
    const driverCard = document.createElement("div");
    driverCard.classList.add("card");

    driverCard.innerHTML = `
      <p><strong></strong> <a href="../../Pages/driver-Managment/driverDetails.html?id=${
        driver.driverID
      }">${driver.name}</a></p>
      <p class="status ${driver.status === 0 ? "active" : "inactive"}">
        <strong></strong> ${driverStatusMap[driver.status] || "غير معروف"}
      </p>
      <p><strong></strong> ${driver.phone}</p>
      <p><strong></strong> ${driver.vehicleID}</p>
    `;

    container.appendChild(driverCard);
  });

  document.getElementById("total-count").innerText = list.length;
}

function validate() {
  const name = document.getElementById("driver-name").value.trim();
  const nationalNo = document.getElementById("nationalNum").value.trim();
  const status = document.getElementById("driver-status").value.trim();
  const phone = document.getElementById("driver-phone").value.trim();
  const vehicleID = document.getElementById("vehicleID").value.trim();
  const errorMessage = document.getElementById("error-message");

  errorMessage.innerText = "";
  errorMessage.classList.add("hidden");

  let isValid = true;
  let errorMessages = [];

  if (!name || name.length < 2) {
    isValid = false;
    errorMessages.push(
      "اسم السائق يجب ألا يكون فارغًا وطوله يجب أن يكون 2 حرف على الأقل."
    );
  }
  if (!nationalNo || nationalNo.length != 14) {
    isValid = false;
    errorMessages.push(
      "رقم الهوية يجب ألا يكون فارغًا وطوله يجب أن يكون 14 رقم على الأقل."
    );
  }
  if (!status) {
    isValid = false;
    errorMessages.push("حالة السائق يجب ألا تكون فارغة.");
  }
  if (!phone || phone.length != 11) {
    isValid = false;
    errorMessages.push("رقم الهاتف يجب أن يكون 11 رقم.");
  }
  if (!vehicleID) {
    isValid = false;
    errorMessages.push("رقم السيارة يجب ألا يكون فارغًا.");
  }

  if (!isValid) {
    errorMessage.innerText = errorMessages.join("\n");
    errorMessage.classList.remove("hidden");
  }

  return isValid;
}

async function loadCars() {
  
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      "https://movesmartapi.runasp.net/api/Vehicles/All",
      {
        method: "GET",
        headers: {  Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();

    console.log("البيانات المستلمة:", data);

    const cars = Array.isArray(data.$values) ? data.$values : [];

    displayCars(cars);
  } catch (error) {
    console.error("خطأ في جلب البيانات:", error);
  }
}

function displayCars(cars) {
  const select = document.getElementById("vehicleID");
  select.innerHTML = '<option value="">-- اختر السيارة --</option>';

  cars.forEach((car) => {
    const option = document.createElement("option");
    option.value = car.vehicleID;
    option.textContent = car.plateNumbers; // غيّرها حسب اسم الخاصية الفعلي من الـ API
    select.appendChild(option);
  });
}

async function addDriver(newDriver) {
  const errorMessage = document.getElementById("error-message");

  errorMessage.innerText = "";
  errorMessage.classList.add("hidden");

  if (!validate()) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      "https://movesmartapi.runasp.net/api/drivers",
      {
        method: "POST",
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify(newDriver),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response Error Text:", errorText);
      throw new Error("خطأ في إضافة السائق");
    }

    loadDriver();
  } catch (error) {
    console.error("خطأ أثناء الإضافة:", error);
  }
}

function refreshData() {
  loadDriver();
}

loadCars();
loadDriver();
