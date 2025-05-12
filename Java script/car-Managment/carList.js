// تحميل السيارات من قاعدة البيانات
async function loadCars() {
    try {
        const response = await fetch('/api/cars'); // تعديل هذا الـ API لاحقًا وفقًا لقاعدة البيانات
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error("البيانات المستلمة ليست في شكل مصفوفة", data);
            return;
        }

        displayCars(data);
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
    }
}

// البحث في جميع الحقول كما هو
function searchCars() {
    const searchTerm = document.getElementById("search").value.toLowerCase();
    
    const filteredCars = cars.filter(car => 
        car.id.includes(searchTerm) ||
        car.brand.toLowerCase().includes(searchTerm) ||
        car.model.toLowerCase().includes(searchTerm) ||
        car.type.toLowerCase().includes(searchTerm) ||
        car.hospital.toLowerCase().includes(searchTerm) ||
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

    const filteredCars = cars.filter(car => car.status === selectedStatus);
    displayCars(filteredCars);
}

// عرض السيارات في الصفحة
function displayCars(filteredList) {
    const container = document.getElementById("cars-container");
    container.innerHTML = ""; 

    filteredList.forEach(car => {
        const carCard = document.createElement("div");
        carCard.classList.add("card");

        carCard.innerHTML = `
            <p><strong>رقم السيارة:</strong> <a href="#">${car.id}</a></p>
            <p><strong>الماركة:</strong> ${car.brand}</p>
            <p><strong>الموديل:</strong> ${car.model}</p>
            <p><strong>النوع:</strong> ${car.type}</p>
            <p><strong>المستشفى:</strong> ${car.hospital}</p>
            <p class="status ${car.status === "متاحة" ? "active" : "inactive"}">
                <strong>الحالة:</strong> ${car.status}
            </p>
        `;

        container.appendChild(carCard);
    });

    document.getElementById("total-count").innerText = filteredList.length;
}


// async function addCar(newCar) {
//     try {
//         const response = await fetch('/api/cars', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(newCar)
//         });

//         if (!response.ok) {
//             throw new Error("خطأ في إضافة السيارة");
//         }

//         loadCars(); 
//     } catch (error) {
//         console.error("خطأ أثناء الإضافة:", error);
//     }
// }

function submitBus() {
 
  const carData = {
    vehicle: {
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
    }
  };


  fetch('/buses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(carData),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    closePop(); 
   
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

function openPop() {
  document.getElementById("add-pop").classList.remove("hidden");
}

function closePop() {
  document.getElementById('add-pop').classList.add('hidden');
}



function refreshData() {
    loadCars();
}

document.addEventListener("DOMContentLoaded", loadCars);
