function changeContent(page) {
  const content = document.getElementById("content");
  let pagePath = "";
  let scriptPath = "";

  switch (page) {
    case "home":
      pagePath = "../../Pages/dash-Boards/index.html";
      scriptPath = ""; 
      break;
    case "cars":
      pagePath = "../../Pages/car-Managment/carList.html";
      scriptPath = "../../Java script/car-Managment/carList.js";
      break;
    case "drivers":
      pagePath = "../../Pages/driver-Managment/driverList.html";
      scriptPath = "../../Java script/driver-Managment/driverList.js";
      break;
    case "orders":
      pagePath = "../../Pages/orderList.html";
      scriptPath = "../../Java script/orderList.js";
      break;
    case "consumables":
      pagePath = "../Pages/disposalList.html";
      scriptPath = "../../Java script/disposalList.js";
      break;
    case "spareParts":
      pagePath = "../../Pages/car-Managment/spareParts.html";
      scriptPath = "";
      break;
    case "reports":
      pagePath = "../../Pages/dash-Boards/reports.html";
      scriptPath = "";
      break;
    default:
      pagePath = "../../Pages/dash-Boards/index.html";
      scriptPath = "";
  }

  fetch(pagePath)
    .then((res) => res.text())
    .then((html) => {
      content.innerHTML = html;

      if (scriptPath) {
        const existingScript = document.querySelector(`script[src="${scriptPath}"]`);
        if (existingScript) existingScript.remove();

        const script = document.createElement("script");
        script.src = scriptPath;
        script.defer = true;
        document.body.appendChild(script);
      }
    })
    .catch((err) => {
      content.innerHTML = "<p>حدث خطأ أثناء تحميل الصفحة.</p>";
      console.error(err);
    });

  const menuItems = document.querySelectorAll(".menu li");
  menuItems.forEach((item) => item.classList.remove("active"));

  event.currentTarget.classList.add("active");
}
