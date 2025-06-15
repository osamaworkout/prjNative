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
