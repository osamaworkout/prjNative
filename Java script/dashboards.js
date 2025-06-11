document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    
    if (!token) {
        window.location.href = '../Login.html';
        return;
    }

    // Display the user's name
    const userNameElement = document.getElementById('userName');
    userNameElement.textContent = userName || 'User';

    // Add logout functionality
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            // Clear all stored data
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('sidebarHidden');
            
            // Redirect to login page
            window.location.href = '../Login.html';
        });
    }
});

function changeContent(page) {
    const content = document.getElementById("content");
    let pagePath = "";
    let scriptPath = "";

    switch (page) {
        case "home":
            pagePath = `../dash-Boards/${userRole.toLowerCase()}Dashboard.html`;
            scriptPath = ""; 
            break;
        case "cars":
            pagePath = "../car-Managment/carList.html";
            scriptPath = "../../Java script/car-Managment/carList.js";
            break;
        case "drivers":
            pagePath = "../driver-Managment/driverList.html";
            scriptPath = "../../Java script/driver-Managment/driverList.js";
            break;
        case "orders":
            pagePath = "../orderList.html";
            scriptPath = "../../Java script/orderList.js";
            break;
        case "consumables":
            pagePath = "../disposalList.html";
            scriptPath = "../../Java script/disposalList.js";
            break;
        case "spareParts":
            pagePath = "../sparePartsList.html";
            scriptPath = "../../Java script/sparePartsList.js";
            break;

        case "patrols" :
            pagePath = "../patrol-Managment/patrolList.html";
            scriptPath = "../../Java script/patrol-Managment/patrolList.js";
            break;

        case "reports":
            pagePath = "../dash-Boards/reports.html";
            scriptPath = "";
            break;
        default:
            pagePath = "../dash-Boards/index.html";
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