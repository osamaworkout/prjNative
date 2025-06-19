// Navigation functionality
console.log("Role from localStorage:", localStorage.getItem("userRole"));
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


// Helper function to safely hide elements
function hideElementIfExists(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.style.display = "none";
}

const apiUrl = "https://movesmartapi.runasp.net/api/v1/JobOrder";
const vehicleApiUrl = "https://movesmartapi.runasp.net/api/Vehicles/All";
const driverApiUrl = "https://movesmartapi.runasp.net/api/Drivers/All";

// Mission Orders APIs
const missionApi = "https://movesmartapi.runasp.net/api/Mission";
const missionJobOrderApi = "https://movesmartapi.runasp.net/api/MissionJobOrder/mission";
// Mission Notes APIs
const missionNotesApi = "https://movesmartapi.runasp.net/api/MissionsNotes";
const userRole = localStorage.getItem("userRole");

// Mission Notes Section (طلبات المأمورية من المدير)
document.getElementById("missionNoteOrder").addEventListener("click", showMissionNotes);

function showMissionNotes() {
  document.getElementById("missionNotePopup").classList.remove("hidden");
  fetchMissionNotes();
  document.getElementById("addMissionNoteSection").style.display = (userRole === "HospitalManager") ? "block" : "none";
}

function closeMissionNotePopup() {
  document.getElementById("missionNotePopup").classList.add("hidden");
}

// جلب كل الطلبات (MissionNotes)
async function fetchMissionNotes() {
  const container = document.getElementById("missionNotesContainer");
  container.innerHTML = "جاري التحميل...";
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${missionNotesApi}/All`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log("Mission Notes Data:", data);
    renderMissionNotes(data);
  } catch (err) {
    container.innerHTML = "حدث خطأ أثناء تحميل الطلبات";
  }
}

// عرض كروت الطلبات بناءً على شكل الداتا اللي جاي من السيرفر
function renderMissionNotes(data) {
  const notes = data.$values || [];
  const container = document.getElementById("missionNotesContainer");
  container.innerHTML = "";
  notes.forEach(note => {
    const app = note.application || {};
    let statusText = "";
    if (app.status === 1) statusText = "جديد";
    else if (app.status === 2) statusText = "جاري التنفيذ";
    else if (app.status === 3) statusText = "تم التنفيذ";
    else statusText = "غير معروف";
    container.innerHTML += `
      <div class="card" style="padding:10px; background:#f9f9f9; margin-bottom:10px;">
        <p><strong>رقم الطلب:</strong> ${note.noteID}</p>
        <p><strong>الوصف:</strong> ${app.applicationDescription || ""}</p>
        <p><strong>الحالة:</strong> ${statusText}</p>
        ${userRole === "GeneralSupervisor" ? `<button onclick="openAddMissionOrderFormFromNote(${note.noteID})">إصدار مأمورية</button>` : ""}
      </div>
    `;
  });
}

// Function to decode JWT token and extract user ID
function getUserIdFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    
    // Decode JWT token (split by '.' and decode the payload part)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub; // Extract user ID from 'sub' claim
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

// Function to automatically calculate status based on current time vs start/end times
function calculateStatusByTime() {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); 
  
  const startTimeElement = document.getElementById("startTime");
  const endTimeElement = document.getElementById("endTime");
  
  if (!startTimeElement.value || !endTimeElement.value) {
    return 1; // Default to "قادمة" if times are not set
  }
  
  // Parse start and end times
  const [startHour, startMin] = startTimeElement.value.split(':').map(Number);
  const [endHour, endMin] = endTimeElement.value.split(':').map(Number);
  
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  
  // Calculate status based on current time
  if (currentTime < startTime) {
    return 1; 
  } else if (currentTime >= startTime && currentTime < endTime) {
    return 3;
  } else {
    return 2; 
  }
}

// Function to update status based on time comparison
function updateStatusByTime() {
  const statusElement = document.getElementById("status");
  const calculatedStatus = calculateStatusByTime();
  statusElement.value = calculatedStatus;
}

document.getElementById("jobOrder").addEventListener("click", showJobOrders);

// Handle role-based access for application cards
document.addEventListener("DOMContentLoaded", function() {
  const userRole = localStorage.getItem("userRole");
  
  // Define which roles can access which applications
  const rolePermissions = {
    "SuperUser": ["jobOrder", "purchaseOrder", "payOrder", "maintananceOrder", "missionOrder"],
    "AdministrativeSupervisor": ["jobOrder", "purchaseOrder", "payOrder", "maintananceOrder"],
    "HospitalManager": ["jobOrder", "missionOrder"],
    "GeneralManager": ["jobOrder", "purchaseOrder", "payOrder", "maintananceOrder", "missionOrder"],
    "GeneralSupervisor": ["jobOrder", "purchaseOrder", "payOrder", "maintananceOrder", "missionOrder"],
    "PatrolsSupervisor": ["jobOrder", "missionOrder"],
    "WorkshopSupervisor": ["jobOrder", "maintananceOrder"],
  };
  
  // Get all application cards
  const applicationCards = document.querySelectorAll('.application-card');
  
  applicationCards.forEach(card => {
    const cardId = card.id;
    const userPermissions = rolePermissions[userRole] || [];
    
    if (!userPermissions.includes(cardId)) {
      // Disable card for unauthorized users
      card.classList.add('disabled');
      card.style.opacity = '0.6';
      card.style.cursor = 'not-allowed';
      
      // Update badge to show restricted access
      const badge = card.querySelector('.card-badge');
      if (badge && !badge.classList.contains('active')) {
        badge.textContent = 'غير مسموح';
        badge.style.background = '#dc3545';
      }
      
      // Remove click functionality
      card.onclick = function(e) {
        e.preventDefault();
        showAccessDeniedMessage(card.querySelector('.card-title').textContent);
      };
    } else if (cardId === 'jobOrder') {
      // Job order is available - keep existing functionality
      card.onclick = showJobOrders;
    } else {
      // Other applications - show coming soon message
      card.onclick = function() {
        showComingSoonMessage(card.querySelector('.card-title').textContent);
      };
    }
  });
});

switch (userRole) {
  case "HospitalManager":
    document.getElementById("jobOrder-Btn").style.display = "none";
  case "AdministrativeSupervisor":
    document.getElementById("missionOrder").style.display = "none";
    document.getElementById("missionNoteOrder").style.display = "none";
  default:
}

function showAccessDeniedMessage(applicationName) {
  alert(`عذراً، غير مسموح لك بالوصول إلى ${applicationName}. تحتاج صلاحيات أعلى للوصول لهذه الخدمة.`);
}

function showComingSoonMessage(applicationName) {
  alert(`${applicationName} قيد التطوير حالياً. سيتم إتاحة هذه الخدمة قريباً.`);
}

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
  
  // Set current date for start and end date fields
  const currentDate = new Date().toISOString().slice(0, 10);
  document.getElementById("startDate").value = currentDate;
  document.getElementById("endDate").value = currentDate;
  
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  
  if (!document.getElementById("startTime").value) {
    document.getElementById("startTime").value = currentTime;
  }
  
  if (!document.getElementById("endTime").value) {
    const endTime = new Date(now.getTime() + 60 * 60 * 1000); 
    document.getElementById("endTime").value = endTime.getHours().toString().padStart(2, '0') + ':' + endTime.getMinutes().toString().padStart(2, '0');
  }
  
  setTimeout(() => {
    updateStatusByTime();
    
    document.getElementById("startTime").addEventListener('change', updateStatusByTime);
    document.getElementById("endTime").addEventListener('change', updateStatusByTime);
  }, 100);
  
  populateVehicleDropdown();
  populateDriverDropdown();
}

function closeAddJobOrderForm() {
  document.getElementById("addJobOrderPopup").classList.add("hidden");
}

async function fetchJobOrders() {
  try {
    const token = localStorage.getItem("token");
    const [vehicles, drivers] = await Promise.all([fetchVehicles(), fetchDrivers()]);
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
    console.log("Fetched Job Orders:", orders);

    // ربط اسم السائق ورقم اللوحة بالطلب
    orders.forEach(order => {
      const vehicle = vehicles.find(v => v.vehicleID === order.vehicleID || v.id === order.vehicleID);
      const driver = drivers.find(d => d.driverID === order.driverId || d.id === order.driverId);
      order.plateNumbers = vehicle ? vehicle.plateNumbers : "غير محدد";
      order.driverName = driver ? driver.name : "غير محدد";
    });

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
      <p><strong>الحالة:</strong> ${mapjobOrderStatus(order.application.status)}</p>
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
              <span class="detail-value badge-status ${getStatusClass(order.application.status)}">${mapjobOrderStatus(order.application.status)}</span>
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
              <span class="detail-value">${order.plateNumbers || order.vehicleId}</span>
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
  closePopupDetails(event.target);
  openAddJobOrderForm();
  
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
  
  // Set current date for both start and end dates (readonly fields)
  const currentDate = new Date().toISOString().slice(0, 10);
  document.getElementById("startDate").value = currentDate;
  document.getElementById("endDate").value = currentDate;
  
  // Handle times
  document.getElementById("startTime").value = order.startTime || "00:00";
  document.getElementById("endTime").value = order.endTime || "00:00";
  
  // Calculate and set status automatically based on current time vs start/end times
  setTimeout(() => {
    updateStatusByTime();
    
    // Add event listeners for time changes to update status automatically
    document.getElementById("startTime").addEventListener('change', updateStatusByTime);
    document.getElementById("endTime").addEventListener('change', updateStatusByTime);
  }, 100);
  
  document.getElementById("destination").value = order.destination;
  document.getElementById("odometerBefore").value = order.odometerBefore || 0;
  document.getElementById("odometerAfter").value = order.odometerAfter || 0;

  // Store ID for update
  document.getElementById("jobOrderForm").dataset.editId = order.orderId;
}

async function submitJobOrder(e) {
  e.preventDefault();
  const editId = e.target.dataset.editId;
  const token = localStorage.getItem("token");

  // Combine date and time for start and end dates
  const startDate = document.getElementById("startDate").value;
  const startTime = document.getElementById("startTime").value;
  const endDate = document.getElementById("endDate").value;
  const endTime = document.getElementById("endTime").value;

  const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
  const endDateTime = new Date(`${endDate}T${endTime}`).toISOString();

  // Get user ID from token to ensure data integrity
  const currentUserId = getUserIdFromToken();
  
  // Automatically calculate status based on current time vs start/end times
  const calculatedStatus = calculateStatusByTime();
  
  const payload = {
    orderId: editId ? parseInt(editId) : parseInt(document.getElementById("orderId").value) || 0,
    application: {
      applicationId: parseInt(document.getElementById("applicationId").value) || 0,
      creationDate: new Date().toISOString(),
      status: calculatedStatus, // Use calculated status instead of form value
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

// Helper function to map jobOrder status
function mapjobOrderStatus(code) {
  switch (code) {
    case 1:
      return "قادمة";
    case 2:
      return "منتهي";
    case 3:
      return "قيد العمل";
    case 4:
      return "ملغي";
    default:
      return "غير معروف";
  }
}


function mapStatus(code) {
  switch (code) {
    case 1:
      return "مقبول";
    case 2:
      return "مرفوض";
    case 3:
      return "قيد الانتظار";
    case 4:
      return "ملغي";
    default:
      return "غير معروف";
  }
}

// Helper function to get CSS class for status
function getStatusClass(code) {
  switch (code) {
    case 1:
      return "badge-accepted";
    case 2:
      return "badge-rejected";
    case 3:
      return "badge-pending";
    case 4:
      return "badge-canceled";
    default:
      return "badge-unknown";
  }
}

// Function to fetch vehicles from API
async function fetchVehicles() {
  try {
    const token = localStorage.getItem("token");
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
    const token = localStorage.getItem("token");
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
  
  vehicleSelect.innerHTML = '<option value="">اختر السيارة</option>';
  
  vehicleSelect.innerHTML += '<option value="">جاري التحميل...</option>';
  
  try {
    const vehicles = await fetchVehicles();
    
    vehicleSelect.innerHTML = '<option value="">اختر السيارة</option>';
    
    const availableVehicles = vehicles.filter(vehicle => vehicle.status === 0);
    
    if (availableVehicles.length === 0) {
      vehicleSelect.innerHTML = '<option value="">لا توجد سيارات متاحة</option>';
      return;
    }
    
    availableVehicles.forEach(vehicle => {
      const option = document.createElement("option");
      option.value = vehicle.vehicleID || vehicle.id;
      
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
  
  driverSelect.innerHTML = '<option value="">اختر السائق</option>';
  
  driverSelect.innerHTML += '<option value="">جاري التحميل...</option>';
  
  try {
    const drivers = await fetchDrivers();
    
    driverSelect.innerHTML = '<option value="">اختر السائق</option>';
    
    const availableDrivers = drivers.filter(driver => driver.status === 0);
    
    if (availableDrivers.length === 0) {
      driverSelect.innerHTML = '<option value="">لا يوجد سائقون متاحون</option>';
      return;
    }
    
    availableDrivers.forEach(driver => {
      const option = document.createElement("option");
      option.value = driver.driverID || driver.id;
      
      let optionText = driver.name || `سائق ${driver.driverID || driver.id}`;
      
      option.textContent = optionText;
      driverSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error populating driver dropdown:", error);
    driverSelect.innerHTML = '<option value="">خطأ في تحميل السائقين</option>';
  }
}

// فتح تاب طلبات المأمورية
document.getElementById("missionOrder").addEventListener("click", showMissionOrders);

function showMissionOrders() {
  document.getElementById("missionOrderPopup").classList.remove("hidden");
  fetchMissionOrders();
}

function closeMissionOrderPopup() {
  document.getElementById("missionOrderPopup").classList.add("hidden");
}

// جلب كل المأموريات مع التوكن
async function fetchMissionOrders() {
  const container = document.getElementById("missionOrdersContainer");
  container.innerHTML = "جاري التحميل...";
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(missionApi, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const missions = data.$values || data || [];
    renderMissionOrderCards(missions);
  } catch (err) {
    container.innerHTML = "حدث خطأ أثناء تحميل المأموريات";
  }
}

// عرض كروت المأمورية
function renderMissionOrderCards(missions) {
  const container = document.getElementById("missionOrdersContainer");
  container.innerHTML = "";
  missions.forEach(mission => {
    const card = document.createElement("div");
    card.className = "card";
    card.style = "padding: 10px; background: #f4f4f4; cursor: pointer;";
    card.innerHTML = `
      <p><strong>رقم المأمورية:</strong> ${mission.missionID}</p>
      <p><strong>الوجهة:</strong> ${mission.distination}</p>
      <p><strong>تاريخ البداية:</strong> ${mission.missionStartDate ? new Date(mission.missionStartDate).toLocaleString() : ""}</p>
      <p><strong>تاريخ النهاية:</strong> ${mission.missionEndDate ? new Date(mission.missionEndDate).toLocaleString() : ""}</p>
    `;
    card.onclick = () => showMissionDetails(mission.missionID);
    container.appendChild(card);
  });
}

// فتح فورم إضافة مأمورية
function openAddMissionOrderForm() {
  document.getElementById("addMissionOrderPopup").classList.remove("hidden");
}

function closeAddMissionOrderForm() {
  document.getElementById("addMissionOrderPopup").classList.add("hidden");
}

// حفظ مأمورية جديدة مع التوكن
async function submitMissionNote(e) {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId") ? parseInt(localStorage.getItem("userId")) : 0;
  const now = new Date().toISOString();

  const payload = {
    noteID: 0,
    applicationID: 0,
    application: {
      applicationId: 0,
      creationDate: now,
      status: 1,
      applicationType: 1,
      applicationDescription: document.getElementById("missionNoteDescription").value,
      createdByUserID: userId
    }
  };

  try {
    const res = await fetch(missionNotesApi, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      alert("تم إرسال الطلب بنجاح");
      closeAddMissionNoteForm();
      fetchMissionNotes();
    } else {
      alert("حدث خطأ في إرسال الطلب");
    }
  } catch {
    alert("حدث خطأ في إرسال الطلب");
  }
}

// عرض تفاصيل المأمورية مع التوكن
async function showMissionDetails(missionID) {
  document.getElementById("missionDetailsPopup").classList.remove("hidden");
  const container = document.getElementById("missionDetailsContainer");
  container.innerHTML = "جاري تحميل التفاصيل...";

  try {
    const [mission, notes, vehicles, jobOrders] = await Promise.all([
      fetchJsonWithToken(`${missionApi}/${missionID}`),
      fetchJsonWithToken(`${missionNotesApi}/${missionID}`),
      fetchJsonWithToken(`${missionVehicleApi}/${missionID}`),
      fetchJsonWithToken(`${missionJobOrderApi}/${missionID}`)
    ]);

    container.innerHTML = `
      <div>
        <h3>بيانات المأمورية</h3>
        <p><strong>رقم المأمورية:</strong> ${mission.missionID}</p>
        <p><strong>الوجهة:</strong> ${mission.distination}</p>
        <p><strong>تاريخ البداية:</strong> ${mission.missionStartDate ? new Date(mission.missionStartDate).toLocaleString() : ""}</p>
        <p><strong>تاريخ النهاية:</strong> ${mission.missionEndDate ? new Date(mission.missionEndDate).toLocaleString() : ""}</p>
        <p><strong>أنشئت بواسطة:</strong> ${mission.createdByUser || ""}</p>
      </div>
      <div>
        <h4>الملاحظات</h4>
        <ul>
          ${(Array.isArray(notes.$values) ? notes.$values : []).map(note => `<li>${note.noteContent || note.noteID}</li>`).join("") || "<li>لا توجد ملاحظات</li>"}
        </ul>
      </div>
      <div>
        <h4>العربيات المرتبطة</h4>
        <ul>
          ${(Array.isArray(vehicles.$values) ? vehicles.$values : []).map(vehicle => `<li>${vehicle.plateNumbers || vehicle.vehicleID}</li>`).join("") || "<li>لا توجد عربيات</li>"}
        </ul>
      </div>
      <div>
        <h4>أوامر الشغل المرتبطة</h4>
        <ul>
          ${(Array.isArray(jobOrders.$values) ? jobOrders.$values : []).map(order => `<li>رقم الأمر: ${order.jobOrderID || order.orderID}</li>`).join("") || "<li>لا توجد أوامر شغل</li>"}
        </ul>
      </div>
    `;
  } catch (err) {
    container.innerHTML = "حدث خطأ أثناء تحميل التفاصيل";
  }
}

function closeMissionDetailsPopup() {
  document.getElementById("missionDetailsPopup").classList.add("hidden");
}

// جلب بيانات مع التوكن
async function fetchJsonWithToken(url) {
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
}

// Mission Notes Section (طلبات المأمورية من المدير)
document.getElementById("missionNoteOrder").addEventListener("click", showMissionNotes);

function showMissionNotes() {
  document.getElementById("missionNotePopup").classList.remove("hidden");
  fetchMissionNotes();
  document.getElementById("addMissionNoteSection").style.display = (userRole === "HospitalManager") ? "block" : "none";
}

function closeMissionNotePopup() {
  document.getElementById("missionNotePopup").classList.add("hidden");
}

// جلب كل الطلبات (MissionNotes)
async function fetchMissionNotes() {
  const container = document.getElementById("missionNotesContainer");
  container.innerHTML = "جاري التحميل...";
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${missionNotesApi}/All`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log("Mission Notes Data:", data);
    renderMissionNotes(data);
  } catch (err) {
    container.innerHTML = "حدث خطأ أثناء تحميل الطلبات";
  }
}

// عرض كروت الطلبات بناءً على شكل الداتا اللي جاي من السيرفر
function renderMissionNotes(data) {
  const notes = data.$values || [];
  const container = document.getElementById("missionNotesContainer");
  container.innerHTML = "";
  notes.forEach(note => {
    const app = note.application || {};
    let statusText = "";
    if (app.status === 1) statusText = "جديد";
    else if (app.status === 2) statusText = "جاري التنفيذ";
    else if (app.status === 3) statusText = "تم التنفيذ";
    else statusText = "غير معروف";
    container.innerHTML += `
      <div class="card" style="padding:10px; background:#f9f9f9; margin-bottom:10px;">
        <p><strong>رقم الطلب:</strong> ${note.noteID}</p>
        <p><strong>الوصف:</strong> ${app.applicationDescription || ""}</p>
        <p><strong>الحالة:</strong> ${statusText}</p>
        ${userRole === "GeneralSupervisor" ? `<button onclick="openAddMissionOrderFormFromNote(${note.noteID})">إصدار مأمورية</button>` : ""}
      </div>
    `;
  });
}

// فتح فورم إرسال طلب مأمورية
function openAddMissionNoteForm() {
  document.getElementById("addMissionNotePopup").classList.remove("hidden");
}

// غلق فورم إرسال طلب مأمورية
function closeAddMissionNoteForm() {
  document.getElementById("addMissionNotePopup").classList.add("hidden");
}

// إرسال طلب مأمورية (MissionNote)
async function submitMissionNote(e) {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const payload = {
    application: {
      creationDate: new Date().toISOString(),
      status: 1, // جديد
      applicationType: 1, // نوع الطلب مأمورية
      applicationDescription: document.getElementById("missionNoteDescription").value,
      createdByUserID: localStorage.getItem("userId") ? parseInt(localStorage.getItem("userId")) : 0
    }
  };
  try {
    const res = await fetch(missionNotesApi, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      alert("تم إرسال الطلب بنجاح");
      closeAddMissionNoteForm();
      fetchMissionNotes();
    } else {
      alert("حدث خطأ في إرسال الطلب");
    }
  } catch {
    alert("حدث خطأ في إرسال الطلب");
  }
}

// فتح فورم إضافة مأمورية من طلب
function openAddMissionOrderFormFromNote(noteID) {
  fillMissionNoteSelect(noteID);
  document.getElementById("addMissionOrderPopup").classList.remove("hidden");
}

// تعبئة قائمة الطلبات في فورم المأمورية
async function fillMissionNoteSelect(selectedId) {
  const select = document.getElementById("missionNoteId");
  select.innerHTML = "<option value=''>اختر طلب مأمورية</option>";
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${missionNotesApi}/All`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const notes = data.$values || data || [];
    notes.forEach(note => {
      const option = document.createElement("option");
      option.value = note.noteID;
      option.textContent = `#${note.noteID} - ${note.application?.applicationDescription || ""}`;
      if (selectedId && note.noteID == selectedId) option.selected = true;
      select.appendChild(option);
    });
  } catch {
    select.innerHTML = "<option value=''>لا توجد طلبات</option>";
  }
}