// Navigation functionality
document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    window.location.href = "../Login.html";
    return;
  }

  // Add click event listener to the page title for navigation
  const pageTitle = document.querySelector("title");
  document.title = "صفحة الطلبات";
  const header = document.createElement("h1");
  header.className = "page-title";
  header.textContent = "صفحة الطلبات";
  header.style.cursor = "pointer";
  header.addEventListener("click", function () {
    window.location.href = `../dash-Boards/${userRole.toLowerCase()}Dashboard.html`;
  });
  document.body.insertBefore(header, document.body.firstChild);
});

//check user role and show or hide the "Requests" button
const userRole = localStorage.getItem("userRole");

switch (userRole) {
  case "AdministrativeSupervisor":
    document.getElementById("purchaseOrder").style.display = "none";
    document.getElementById("payOrder").style.display = "none";
    document.getElementById("missionOrder").style.display = "none";
    document.getElementById("maintananceOrder").style.display = "none";
    break;
  case "HospitalManager":
    document.getElementById("requestsButton").style.display = "none";
    break;
  case "GeneralManager":
    document.getElementById("requestsButton").style.display = "none";
    break;
  case "GeneralSupervisor":
    document.getElementById("requestsButton").style.display = "none";
    break;
  case "PatrolsSupervisor":
    document.getElementById("requestsButton").style.display = "none";
    break;
  case "WorkshopSupervisor":
    document.getElementById("requestsButton").style.display = "none";
    break;
  case "SuperUser":
    document.getElementById("requestsButton").style.display = "none";
    break;
  default:
    window.location.href = "../Login.html";
}
const apiUrl = "https://movesmartapi.runasp.net/api/v1/JobOrder";
// const token = localStorage.getItem("token");

document.getElementById("jobOrder").addEventListener("click", showJobOrders);

function showJobOrders() {
  document.getElementById("jobOrderPopup").classList.remove("hidden");
  fetchJobOrders();
}

function closeJobOrderPopup() {
  document.getElementById("jobOrderPopup").classList.add("hidden");
}

function openAddJobOrderForm() {
  document.getElementById("addJobOrderPopup").classList.remove("hidden");
}

function closeAddJobOrderForm() {
  document.getElementById("addJobOrderPopup").classList.add("hidden");
}

async function fetchJobOrders() {
  try {
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    const orders = data.$values || [];
    console.log("أوامر الشغل:", orders);
    renderJobOrderCards(orders);
  } catch (err) {
    console.error("فشل في جلب أوامر الشغل", err);
  }
}

function renderJobOrderCards(orders) {
  const container = document.getElementById("jobOrdersContainer");
  container.innerHTML = "";

  orders.forEach((order) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style = "padding: 10px; background: #f4f4f4; cursor: pointer;";
    card.innerHTML = `
      <p><strong>رقم الأمر:</strong> ${order.orderId}</p>
      <p><strong>الحالة:</strong> ${mapStatus(order.application.status)}</p>
      <p><strong>تاريخ البداية:</strong> ${new Date(
        order.startDate
      ).toLocaleString()}</p>
    `;
    card.onclick = () => showJobOrderDetails(order);
    container.appendChild(card);
  });
}

function showJobOrderDetails(order) {
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.innerHTML = `
    <div class="popup-content">
      <h3>تفاصيل أمر الشغل</h3>
      <p><strong>الوصف:</strong> ${order.application.applicationDescription}</p>
      <p><strong>الوجهة:</strong> ${order.destination}</p>
      <p><strong>من:</strong> ${new Date(order.startDate).toLocaleString()}</p>
      <p><strong>إلى:</strong> ${new Date(order.endDate).toLocaleString()}</p>
      <p><strong>عداد قبل:</strong> ${order.odometerBefore}</p>
      <p><strong>عداد بعد:</strong> ${order.odometerAfter}</p>
      <div class="flex-between" style="margin-top: 10px">
        <button class="button" onclick="closePopupDetails(this)">إغلاق</button>
        <button class="button-accepted" onclick='editJobOrder(${JSON.stringify(
          order
        )})'>تعديل</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
}

function closePopupDetails(btn) {
  const popup = btn.closest(".popup");
  popup.remove();
}

function editJobOrder(order) {
  closePopupDetails(document.querySelector(".popup-content button"));
  openAddJobOrderForm();
  document.getElementById("description").value =
    order.application.applicationDescription;
  document.getElementById("vehicleId").value = order.vehicleId;
  document.getElementById("driverId").value = order.driverId;
  document.getElementById("startDate").value = order.startDate.slice(0, 16);
  document.getElementById("endDate").value = order.endDate.slice(0, 16);
  document.getElementById("destination").value = order.destination;
  document.getElementById("odometerBefore").value = order.odometerBefore;
  document.getElementById("odometerAfter").value = order.odometerAfter;

  // Store ID for update
  document.getElementById("jobOrderForm").dataset.editId = order.orderId;
}

async function submitJobOrder(e) {
  e.preventDefault();
  const editId = e.target.dataset.editId;

  const payload = {
    orderId: editId ? parseInt(editId) : 0,
    application: {
      applicationId: 0,
      creationDate: new Date().toISOString(),
      status: 1,
      applicationType: 1,
      applicationDescription: document.getElementById("description").value,
      createdByUserID: 0,
    },
    vehicleId: parseInt(document.getElementById("vehicleId").value),
    driverId: parseInt(document.getElementById("driverId").value),
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    startTime: "00:00",
    endTime: "00:00",
    destination: document.getElementById("destination").value,
    odometerBefore: parseInt(document.getElementById("odometerBefore").value),
    odometerAfter: parseInt(document.getElementById("odometerAfter").value),
  };

  try {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${apiUrl}/${editId}` : apiUrl;

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    closeAddJobOrderForm();
    fetchJobOrders();
  } catch (err) {
    console.error("فشل في إرسال أمر الشغل", err);
  }
}

function mapStatus(code) {
  switch (code) {
    case 1:
      return "قيد الانتظار";
    case 2:
      return "مقبول";
    case 3:
      return "مرفوض";
    default:
      return "غير معروف";
  }
}
