document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.querySelector(".save-btn");
    const printButton = document.querySelector(".print-btn");
    const backButton = document.querySelector(".back-btn");
    const tabs = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");
    const ordersContent = document.querySelector(".orders-content");
    const maintenanceContent = document.querySelector(".maintenance-content");

    //  تحميل بيانات السيارة من JSON عبر API أو من `localStorage`
    function loadCarData() {
        fetch('carData.json') // استبدل هذا بعنوان API أو ملف JSON
            .then(response => response.json())
            .then(data => {
                const carData = data;
                if (carData) {
                    //  تعبئة الحقول بالبيانات
                    document.querySelector('input[name="carNumber"]').value = carData.carNumber || "";
                    document.querySelector('input[name="carBrand"]').value = carData.carBrand || "";
                    document.querySelector('input[name="carModel"]').value = carData.carModel || "";
                    document.querySelector('input[name="fuelConsumption"]').value = carData.fuelConsumption || "";
                    document.querySelector('input[name="mileage"]').value = carData.mileage || "";

                    // تعبئة سجلات أوامر الشغل
                    populateOrders(carData.orders || []);
                    populateMaintenance(carData.maintenance || []);
                }
            })
            .catch(error => console.error('Error loading car data:', error));
    }

   // دالة الطباعة
if (printButton) {
    printButton.addEventListener("click", function () {
        // تحديد التبويب النشط
        const activeTab = document.querySelector(".tab.active");
        if (activeTab) {
            const activeTabId = activeTab.getAttribute("data-tab");
            const activeTabContent = document.getElementById(activeTabId);

            if (activeTabContent) {
                // نسخ المحتوى الخاص بالتبويب النشط فقط
                const printContent = activeTabContent.cloneNode(true);

                // إنشاء نافذة جديدة للطباعة
                const printWindow = window.open('', '', 'height=600,width=800');

                // إضافة التنسيقات لتناسب الطباعة
                printWindow.document.write('<html><head><title>طباعة</title>');
                printWindow.document.write('<style>body { font-family: Arial, sans-serif; direction: rtl; }</style>');
                printWindow.document.write('</head><body>');
                
                // إضافة المحتوى القابل للطباعة
                printWindow.document.write(printContent.outerHTML);

                // إنهاء الإعدادات وإغلاق النافذة
                printWindow.document.write('</body></html>');
                printWindow.document.close(); // إنهاء تحميل المحتوى في النافذة
                printWindow.print(); // تنفيذ الطباعة
            }
        }
    });
}

    //  دالة الرجوع
    if (backButton) {
        backButton.addEventListener("click", function () {
            window.history.back();
        });
    }

    //  التنقل بين التبويبات
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            tabs.forEach(t => t.classList.remove("active")); 
            this.classList.add("active"); 

            tabContents.forEach(content => {
                content.style.display = "none"; 
            });

            const activeTab = document.getElementById(this.dataset.tab); 
            if (activeTab) {
                activeTab.style.display = "block"; 
            }

            // إظهار أو إخفاء زر الحفظ بناءً على التبويب
            if (this.dataset.tab === "car-info") {
                saveButton.style.display = "block";  
            } else {
                saveButton.style.display = "none";  
            }
        });
    });

    //  عرض أوامر الشغل
    function populateOrders(orders) {
        if (!orders || orders.length === 0) {
            ordersContent.innerHTML = "<tr><td colspan='6'>لا توجد أوامر شغل</td></tr>";
            return;
        }
        ordersContent.innerHTML = ""; 
        orders.forEach(order => {
            const orderRow = document.createElement("tr");
            orderRow.innerHTML = `
                <td>${order.car}</td>
                <td>${order.date}</td>
                <td>${order.time}</td>
                <td>${order.trip}</td>
                <td>${order.km}</td>
                <td>${order.orderNumber}</td>
            `;
            ordersContent.appendChild(orderRow);
        });
    }

    //  عرض سجل الصيانة
function populateMaintenance(maintenance) {
    if (!maintenance || maintenance.length === 0) {
        maintenanceContent.innerHTML = "<tr><td colspan='3'>لا توجد سجلات صيانة</td></tr>";
        return;
    }
    maintenanceContent.innerHTML = ""; 
    maintenance.forEach(record => {
        const recordRow = document.createElement("tr");
        recordRow.innerHTML = `
            <td>${record.sequenceNumber}</td>
            <td>${record.date}</td>
            <td>
                ${record.details} 
                <button class="details-btn" data-details="${record.details}">عرض التفاصيل</button>
            </td>
        `;
        maintenanceContent.appendChild(recordRow);
    });

    //  إضافة وظيفة زر عرض التفاصيل
    const detailsButtons = document.querySelectorAll(".details-btn");
    detailsButtons.forEach(button => {
        button.addEventListener("click", function () {
            const details = this.getAttribute("data-details");
            showDetailsPopup(details);
        });
    });
}

// دالة لعرض التفاصيل في نافذة منبثقة
function showDetailsPopup(details) {
    const popup = document.createElement("div");
    popup.classList.add("details-popup");
    popup.innerHTML = `
        <div class="popup-content">
            <span class="close-btn">&times;</span>
            <h3>تفاصيل الصيانة</h3>
            <p>${details}</p>
        </div>
    `;
    document.body.appendChild(popup);

    const closeButton = popup.querySelector(".close-btn");
    closeButton.addEventListener("click", function () {
        document.body.removeChild(popup);
    });
}


    //تعيين التبويب الافتراضي وتحميل البيانات
    document.querySelector("[data-tab='car-info']")?.click();  
    loadCarData();
});
