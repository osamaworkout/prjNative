document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");
  const saveButton = document.querySelector(".save-btn");
  const printButton = document.querySelector(".print-btn");
  const backButton = document.querySelector(".back-btn");

  function loadCarData() {
    const carstatus = {
      0: "متاحة",
      1: "مشغولة",
      2: "قيد الصيانة",
    };
    const fuelType = {
      0: "بنزين",
      1: "سولار",
      2: "غاز طبيعي",
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
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleID = urlParams.get("id");

    fetch(`https://movesmartapi.runasp.net/api/Vehicles/${vehicleID}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("بيانات السيارة:", data);
        document.getElementById(
          "car-number"
        ).innerText = `رقم السيارة: ${data.plateNumbers}`;
        document.getElementById(
          "car-make"
        ).innerText = `الماركة: ${data.brandName}`;
        document.getElementById(
          "car-model"
        ).innerText = `الموديل: ${data.modelName}`;
        document.getElementById("car-type").innerText = `نوع السيارة: ${
          carType[data.vehicleType]
        }`;
        document.getElementById(
          "total-km"
        ).innerText = `${data.totalKilometersMoved} KM`;

        document.querySelector('input[name="carNumber"]').value =
          data.plateNumbers || "";
        document.querySelector('input[name="carBrand"]').value =
          data.brandName || "";
        document.querySelector('input[name="carModel"]').value =
          data.modelName || "";
        document.querySelector('input[name="carType"]').value =
          carType[data.vehicleType] || "";
        document.querySelector('input[name="carCondition"]').value =
          carstatus[data.status] || "";
        document.querySelector('input[name="carFunction"]').value =
          data.associatedTask || "";
        document.querySelector('input[name="hospital"]').value =
          data.associatedHospital || "";
        document.querySelector('input[name="fuelConsumption"]').value =
          data.fuelConsumptionRate || "0";
        document.querySelector('input[name="oilConsumption"]').value =
          data.oilConsumptionRate || "0";
        document.querySelector('input[name="fuelType"]').value =
          fuelType[data.fuelType] || "";
      })
      .catch((err) => {
        console.error("فشل تحميل بيانات السيارة:", err);
      });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      tabContents.forEach((c) => (c.style.display = "none"));
      document.getElementById(this.dataset.tab).style.display = "block";

      saveButton.style.display =
        this.dataset.tab === "car-info" ? "block" : "none";
    });
  });

  function validate() {
    const carBrand = document.querySelector('input[name="carBrand"]').value;
    const carModel = document.querySelector('input[name="carModel"]').value;
    const carNumber = document.querySelector('input[name="carNumber"]').value;
    const hospital = document.querySelector('input[name="hospital"]').value;
    const task = document.querySelector('input[name="carFunction"]').value;

    let isValid = true;
    let errorMessages = [];

    if (!carBrand || carBrand.length < 2) {
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

  function editVehicle() {
    const carStatusMap = {
      0: "متاحة",
      1: "مشغولة",
      2: "قيد الصيانة",
    };
    const carTypeMap = {
      0: "سيدان",
      1: "واحد كبينة",
      2: "ثنائي كبينة",
      3: "شاحنة نقل",
      4: "ميكروباص",
      5: "ميني باص",
      6: "أتوبيس",
      7: "اسعاف",
    };

    const fuelTypeMap = {
      0: "بنزين",
      1: "سولار",
      2: "غاز طبيعي",
    };

    // التحقق من صحة البيانات المدخلة
    if (!validate()) {
      return; // إذا كانت البيانات غير صحيحة، لا نتابع
    }
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleID = parseInt(urlParams.get("id")); // استخراج ID من الرابط

    const carData = {
      vehicleID: vehicleID,
      brandName: document.getElementsByName("carBrand")[0].value,
      modelName: document.getElementsByName("carModel")[0].value,
      plateNumbers: document.getElementsByName("carNumber")[0].value,
      vehicleType:
        carTypeMap[document.getElementsByName("carType")[0].value] ?? 0,
      associatedHospital: document.getElementsByName("hospital")[0].value,
      associatedTask: document.getElementsByName("carFunction")[0].value,
      status:
        carStatusMap[document.getElementsByName("carCondition")[0].value] ?? 0,
      totalKilometersMoved:
        parseInt(document.getElementById("total-km").value) || 0,
      fuelType:
        fuelTypeMap[document.getElementsByName("fuelType")[0].value] ?? 0,
      fuelConsumptionRate: parseFloat(
        document.getElementsByName("fuelConsumption")[0].value
      ),
      oilConsumptionRate: parseFloat(
        document.getElementsByName("oilConsumption")[0].value
      ),
    };

    fetch("https://movesmartapi.runasp.net/api/Vehicles", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(carData),
    })
      .then(async (response) => {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json();
        } else {
          const text = await response.text();
          alert(text); 
        }
      })

      .then((data) => {
        console.log("Success:", data);
        // closePop();
        refreshData(); // تحديث البيانات بعد الإضافة
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  saveButton?.addEventListener("click", () => {
    editVehicle();
  });

  backButton?.addEventListener("click", () => {
    window.history.back();
  });

  printButton?.addEventListener("click", () => {
    const tabId = document.querySelector(".tab.active").dataset.tab;
    const content = document.getElementById(tabId);
    const newWin = window.open("", "", "width=800,height=600");
    newWin.document.write(
      `<html><head><title>طباعة</title></head><body>${content.outerHTML}</body></html>`
    );
    newWin.document.close();
    newWin.print();
  });

  function refreshData() {
    loadCarData(); // إعادة تحميل السيارات من الـ API
  }

  document.querySelector("[data-tab='car-info']")?.click();
  loadCarData();
});
