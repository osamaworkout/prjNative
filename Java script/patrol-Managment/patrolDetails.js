function switchTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(tab => {
      tab.classList.remove("show");
    });
  
    document.querySelectorAll(".tab").forEach(btn => {
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
  