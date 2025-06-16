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

//check user role and show or hide the order buttons
const userRole = localStorage.getItem("userRole");

// Helper function to safely hide elements
function hideElementIfExists(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = "none";
  }
}

switch (userRole) {
  case "AdministrativeSupervisor":
    hideElementIfExists("purchaseOrder");
    hideElementIfExists("payOrder");
    hideElementIfExists("missionOrder");
    hideElementIfExists("maintananceOrder");
    break;
  case "HospitalManager":
    hideElementIfExists("requestsButton");
    break;
  case "GeneralManager":
    hideElementIfExists("requestsButton");
    break;
  case "GeneralSupervisor":
    hideElementIfExists("requestsButton");
    break;
  case "PatrolsSupervisor":
    hideElementIfExists("requestsButton");
    break;
  case "WorkshopSupervisor":
    hideElementIfExists("requestsButton");
    break;
  case "SuperUser":
    hideElementIfExists("requestsButton");
    break;
  default:
    window.location.href = "../Login.html";
}
const apiUrl = "https://movesmartapi.runasp.net/api/v1/JobOrder";
const vehicleApiUrl = "https://movesmartapi.runasp.net/api/Vehicles/All";
const driverApiUrl = "https://movesmartapi.runasp.net/api/Drivers/All";

// Function to decode JWT token and extract user ID
function getUserIdFromToken() {
  try {
    if (!token) return null;
    
    // Decode JWT token (split by '.' and decode the payload part)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub; // Extract user ID from 'sub' claim
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

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
  
  // Automatically set the user ID from the token
  const userId = getUserIdFromToken();
  if (userId) {
    document.getElementById("createdByUserID").value = userId;
  }
  
  // Populate vehicle and driver dropdowns
  populateVehicleDropdown();
  populateDriverDropdown();
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
    
    if (!res.ok) {
      if (res.status === 403) {
        console.error("المستخدم غير مصرح له بالوصول لأوامر الشغل");
        document.getElementById("jobOrdersContainer").innerHTML = 
          '<p style="text-align: center; color: red;">غير مصرح لك بعرض أوامر الشغل</p>';
        return;
      } else if (res.status === 401) {
        console.error("انتهت صلاحية الجلسة");
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        window.location.href = "../Login.html";
        return;
      } else {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    }
    
    const data = await res.json();
    const orders = data.$values || [];
    console.log("أوامر الشغل:", orders);
    renderJobOrderCards(orders);
  } catch (err) {
    console.error("فشل في جلب أوامر الشغل", err);
    document.getElementById("jobOrdersContainer").innerHTML = 
      '<p style="text-align: center; color: red;">حدث خطأ في جلب أوامر الشغل</p>';
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
    <div class="popup-content job-details-popup">
      <div class="details-header">
        <h2>تفاصيل أمر الشغل</h2>
        <button type="button" class="close-btn" onclick="closePopupDetails(this)">
          ✕
        </button>
      </div>
      
      <div class="details-content">
        <!-- Basic Information -->
        <div class="details-section">
          <h3 class="details-section-title">معلومات عامة</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">رقم الأمر:</span>
              <span class="detail-value">${order.orderId}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">الحالة:</span>
              <span class="detail-value badge-status ${getStatusClass(order.application.status)}">${mapStatus(order.application.status)}</span>
            </div>
            <div class="detail-item full-width">
              <span class="detail-label">الوصف:</span>
              <span class="detail-value">${order.application.applicationDescription}</span>
            </div>
          </div>
        </div>

        <!-- Vehicle & Driver Information -->
        <div class="details-section">
          <h3 class="details-section-title">معلومات السيارة والسائق</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">السيارة:</span>
              <span class="detail-value">${order.plateNumbers || order.vehicleID}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">السائق:</span>
              <span class="detail-value">${order.driverName || order.driverId}</span>
            </div>
            <div class="detail-item full-width">
              <span class="detail-label">الوجهة:</span>
              <span class="detail-value">${order.destination}</span>
            </div>
          </div>
        </div>

        <!-- Time Information -->
        <div class="details-section">
          <h3 class="details-section-title">معلومات التوقيت</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">تاريخ البداية:</span>
              <span class="detail-value">${new Date(order.startDate).toLocaleDateString('ar-SA')}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">وقت البداية:</span>
              <span class="detail-value">${order.startTime || new Date(order.startDate).toLocaleTimeString('ar-SA', {hour: '2-digit', minute: '2-digit'})}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">تاريخ النهاية:</span>
              <span class="detail-value">${new Date(order.endDate).toLocaleDateString('ar-SA')}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">وقت النهاية:</span>
              <span class="detail-value">${order.endTime || new Date(order.endDate).toLocaleTimeString('ar-SA', {hour: '2-digit', minute: '2-digit'})}</span>
            </div>
          </div>
        </div>

        <!-- Odometer Information -->
        <div class="details-section">
          <h3 class="details-section-title">قراءة العداد</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">عداد قبل:</span>
              <span class="detail-value">${order.odometerBefore ? order.odometerBefore.toLocaleString() : 'غير محدد'} كم</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">عداد بعد:</span>
              <span class="detail-value">${order.odometerAfter ? order.odometerAfter.toLocaleString() : 'غير محدد'} كم</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">المسافة المقطوعة:</span>
              <span class="detail-value highlight">${(order.odometerAfter && order.odometerBefore) ? (order.odometerAfter - order.odometerBefore).toLocaleString() : 'غير محسوبة'} كم</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="details-actions">
        <button class="btn btn-primary" onclick='editJobOrder(${JSON.stringify(order)})'>
          <span>✏️</span> تعديل
        </button>
        <button class="btn btn-secondary" onclick="closePopupDetails(this)">
          <span>✕</span> إغلاق
        </button>
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
  
  // Fill in all the form fields with existing data
  document.getElementById("orderId").value = order.orderId;
  document.getElementById("applicationId").value = order.application.applicationId;
  document.getElementById("status").value = order.application.status;
  document.getElementById("applicationType").value = order.application.applicationType;
  document.getElementById("applicationDescription").value = order.application.applicationDescription;
  document.getElementById("createdByUserID").value = order.application.createdByUserID;
  
  // Handle vehicle selection - wait for dropdown to be populated
  setTimeout(() => {
    document.getElementById("vehicleId").value = order.vehicleID;
  }, 500);
  
  // Handle driver selection - wait for dropdown to be populated
  setTimeout(() => {
    document.getElementById("driverId").value = order.driverId;
  }, 500);
  
  // Handle dates - extract date part
  const startDate = new Date(order.startDate);
  const endDate = new Date(order.endDate);
  document.getElementById("startDate").value = startDate.toISOString().slice(0, 10);
  document.getElementById("endDate").value = endDate.toISOString().slice(0, 10);
  
  // Handle times
  document.getElementById("startTime").value = order.startTime || "00:00";
  document.getElementById("endTime").value = order.endTime || "00:00";
  
  document.getElementById("destination").value = order.destination;
  document.getElementById("odometerBefore").value = order.odometerBefore || 0;
  document.getElementById("odometerAfter").value = order.odometerAfter || 0;

  // Store ID for update
  document.getElementById("jobOrderForm").dataset.editId = order.orderId;
}

async function submitJobOrder(e) {
  e.preventDefault();
  const editId = e.target.dataset.editId;

  // Combine date and time for start and end dates
  const startDate = document.getElementById("startDate").value;
  const startTime = document.getElementById("startTime").value;
  const endDate = document.getElementById("endDate").value;
  const endTime = document.getElementById("endTime").value;

  const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
  const endDateTime = new Date(`${endDate}T${endTime}`).toISOString();

  // Get user ID from token to ensure data integrity
  const currentUserId = getUserIdFromToken();
  
  const payload = {
    orderId: editId ? parseInt(editId) : parseInt(document.getElementById("orderId").value) || 0,
    application: {
      applicationId: parseInt(document.getElementById("applicationId").value) || 0,
      creationDate: new Date().toISOString(),
      status: parseInt(document.getElementById("status").value),
      applicationType: parseInt(document.getElementById("applicationType").value),
      applicationDescription: document.getElementById("applicationDescription").value,
      createdByUserID: parseInt(currentUserId),
    },
    vehicleID: parseInt(document.getElementById("vehicleId").value),
    driverId: parseInt(document.getElementById("driverId").value),
    startDate: startDateTime,
    endDate: endDateTime,
    startTime: document.getElementById("startTime").value,
    endTime: document.getElementById("endTime").value,
    destination: document.getElementById("destination").value,
    odometerBefore: parseInt(document.getElementById("odometerBefore").value),
    odometerAfter: parseInt(document.getElementById("odometerAfter").value),
  };

  try {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${apiUrl}/${editId}` : apiUrl;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert("تم حفظ أمر الشغل بنجاح");
      closeAddJobOrderForm();
      fetchJobOrders();
      // Clear form
      document.getElementById("jobOrderForm").reset();
      delete document.getElementById("jobOrderForm").dataset.editId;
      
      // Re-populate user ID and vehicle dropdown after form reset
      const userId = getUserIdFromToken();
      if (userId) {
        document.getElementById("createdByUserID").value = userId;
      }
      
      // Re-populate vehicle and driver dropdowns
      populateVehicleDropdown();
      populateDriverDropdown();
    } else if (response.status === 403) {
      alert("غير مصرح لك بحفظ أوامر الشغل");
    } else if (response.status === 401) {
      alert("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      window.location.href = "../Login.html";
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (err) {
    console.error("فشل في إرسال أمر الشغل", err);
    alert("حدث خطأ في حفظ أمر الشغل");
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

// Helper function to get CSS class for status
function getStatusClass(code) {
  switch (code) {
    case 1:
      return "badge-pending";
    case 2:
      return "badge-accepted";
    case 3:
      return "badge-rejected";
    default:
      return "badge-unknown";
  }
}

// Function to fetch vehicles from API
async function fetchVehicles() {
  try {
    const response = await fetch(vehicleApiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.$values || data || [];
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return [];
  }
}

// Function to fetch drivers from API
async function fetchDrivers() {
  try {
    const response = await fetch(driverApiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.$values || data || [];
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return [];
  }
}

// Function to populate vehicle dropdown
async function populateVehicleDropdown() {
  const vehicleSelect = document.getElementById("vehicleId");
  
  // Clear existing options except the first one
  vehicleSelect.innerHTML = '<option value="">اختر السيارة</option>';
  
  // Show loading state
  vehicleSelect.innerHTML += '<option value="">جاري التحميل...</option>';
  
  try {
    const vehicles = await fetchVehicles();
    
    // Clear loading state
    vehicleSelect.innerHTML = '<option value="">اختر السيارة</option>';
    
    // Filter vehicles to show only those with status 0 (active/available)
    const availableVehicles = vehicles.filter(vehicle => vehicle.status === 0);
    
    if (availableVehicles.length === 0) {
      vehicleSelect.innerHTML = '<option value="">لا توجد سيارات متاحة</option>';
      return;
    }
    
    // Populate with available vehicles only
    availableVehicles.forEach(vehicle => {
      const option = document.createElement("option");
      option.value = vehicle.vehicleID || vehicle.id;
      
      // Create descriptive text for the option - prioritize plate numbers
      let optionText = '';
      if (vehicle.plateNumbers) {
        optionText = vehicle.plateNumbers;
        if (vehicle.model) {
          optionText += ` (${vehicle.model})`;
        }
        if (vehicle.brand) {
          optionText += ` - ${vehicle.brand}`;
        }
      } else {
        // Fallback if no plate number is available
        optionText = `${vehicle.vehicleID || vehicle.id}`;
        if (vehicle.model) {
          optionText += ` (${vehicle.model})`;
        }
        if (vehicle.brand) {
          optionText += ` - ${vehicle.brand}`;
        }
      }
      
      option.textContent = optionText;
      vehicleSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error populating vehicle dropdown:", error);
    vehicleSelect.innerHTML = '<option value="">خطأ في تحميل السيارات</option>';
  }
}

// Function to populate driver dropdown
async function populateDriverDropdown() {
  const driverSelect = document.getElementById("driverId");
  
  // Clear existing options except the first one
  driverSelect.innerHTML = '<option value="">اختر السائق</option>';
  
  // Show loading state
  driverSelect.innerHTML += '<option value="">جاري التحميل...</option>';
  
  try {
    const drivers = await fetchDrivers();
    
    // Clear loading state
    driverSelect.innerHTML = '<option value="">اختر السائق</option>';
    
    // Filter drivers to show only those with status 0 (active/available)
    const availableDrivers = drivers.filter(driver => driver.status === 0);
    
    if (availableDrivers.length === 0) {
      driverSelect.innerHTML = '<option value="">لا يوجد سائقون متاحون</option>';
      return;
    }
    
    // Populate with available drivers only
    availableDrivers.forEach(driver => {
      const option = document.createElement("option");
      option.value = driver.driverID || driver.id;
      
      // Display driver name
      let optionText = driver.name || `سائق ${driver.driverID || driver.id}`;
      
      option.textContent = optionText;
      driverSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error populating driver dropdown:", error);
    driverSelect.innerHTML = '<option value="">خطأ في تحميل السائقين</option>';
  }
}