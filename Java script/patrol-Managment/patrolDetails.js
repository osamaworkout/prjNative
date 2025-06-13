document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    window.location.href = "../Login.html";
    return;
  }

  if (userRole !== "PatrolsSupervisor") {
    window.location.href = `${userRole.toLowerCase()}Dashboard.html`;
    return;
  }
});

function switchTab(tabName) {
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("show");
  });

  document.querySelectorAll(".tab").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.getElementById(tabName).classList.add("show");
  event.target.classList.add("active");
}

function printPage() {
  window.print();
}

function generateReport() {
  alert("يتم توليد التقرير الآن...");
}

function goBack() {
  history.back();
}
