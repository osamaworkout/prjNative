let drivers = [];

function openPop() {
  document.getElementById("add-pop").classList.remove("hidden");
}

function closePop() {
  document.getElementById("add-pop").classList.add("hidden");
}

function submitDriver() {
  const name = document.getElementById("driver-name").value.trim();
  const status = document.getElementById("driver-status").value.trim();
  const phone = document.getElementById("driver-phone").value.trim();
  const carId = document.getElementById("driver-car-id").value.trim();

  if (!name || !status || !phone || !carId) {
    alert("يرجى ملء جميع الحقول");
    return;
  }

  const newDriver = { name, status, phone, carId };
  addDriver(newDriver);

  document.getElementById("driver-name").value = "";
  document.getElementById("driver-status").value = "";
  document.getElementById("driver-phone").value = "";
  document.getElementById("driver-car-id").value = "";
  closeModal();
}


async function loadDriver() {
  try {
    const response = await fetch("/api/drivers");
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("البيانات المستلمة ليست في شكل مصفوفة", data);
      return;
    }

    drivers = data;
    displayDriver(drivers);
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
      driver.carId.toLowerCase().includes(searchTerm) ||
      driver.status.toLowerCase().includes(searchTerm)
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
    (driver) => driver.status === selectedStatus
  );
  displayDriver(filteredDrivers);
}

function displayDriver(list) {
  const container = document.getElementById("driver-container");
  container.innerHTML = "";

  list.forEach((driver) => {
    const driverCard = document.createElement("div");
    driverCard.classList.add("card");

    driverCard.innerHTML = `
      <p><strong>اسم السائق</strong> <a href="#">${driver.name}</a></p>
      <p class="status ${driver.status === "متاح" ? "active" : "inactive"}">
        <strong>الحالة:</strong> ${driver.status}
      </p>
      <p><strong>رقم الهاتف</strong> ${driver.phone}</p>
      <p><strong>رقم السيارة</strong> ${driver.carId}</p>
    `;

    container.appendChild(driverCard);
  });

  document.getElementById("total-count").innerText = list.length;
}

async function addDriver(newDriver) {
  try {
    const response = await fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDriver),
    });

    if (!response.ok) {
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

document.addEventListener("DOMContentLoaded", loadDriver);
