async function validateForm(event) {
  event.preventDefault();
  let isValid = true;
  const nationalNo = document.getElementById("nationalNo").value;
  const password = document.getElementById("password").value;
  const nationalNoError = document.getElementById("nationalNoError");
  const passwordError = document.getElementById("passwordError");
  const serverError = document.getElementById("serverError");

  const nationalIdPattern = /^[0-9]{14}$/;
  if (!nationalIdPattern.test(nationalNo)) {
    nationalNoError.style.display = "block";
    isValid = false;
  } else {
    nationalNoError.style.display = "none";
  }

  if (password.length < 6) {
    passwordError.style.display = "block";
    isValid = false;
  } else {
    passwordError.style.display = "none";
  }

  if (!isValid) return false;

  try {
    const basetUrl = "https://movesmartapi.runasp.net/api/v1/User/login";

    const response = await fetch(basetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nationalNo: nationalNo,
        password: password,
      }),
    });

    if (response.ok) {
      const data = await response.json();

      // Store token, user role, and user name in localStorage
      localStorage.setItem("userName", data.name || "User");
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.role);

      console.log(data);

      // Redirect based on role
      switch (data.role) {
        case "SuperUser":
          window.location.href = "dash-Boards/superUserDashboard.html";
          break;
        case "HospitalManager":
          window.location.href = "dash-Boards/hospitalManagerDashboard.html";
          break;
        case "GeneralManager":
          window.location.href = "dash-Boards/generalManagerDashboard.html";
          break;
        case "GeneralSupervisor":
          window.location.href = "dash-Boards/generalSupervisorDashboard.html";
          break;
        case "AdministrativeSupervisor":
          window.location.href = "dash-Boards/administrativeSupervisorDashboard.html";
          break;
        case "WorkshopSupervisor":
          window.location.href = "dash-Boards/workshopSupervisorDashboard.html";
          break;
        case "PatrolsSupervisor":
          window.location.href = "dash-Boards/patrolsSupervisorDashboard.html";
          break;
        default:
          // Fallback to shared layout if role is not recognized
          window.location.href = "sharedLayout.html";
      }
    } else {
      serverError.style.display = "block";
      const data = await response.json();
      serverError.textContent =
        data.message || "فشل تسجيل الدخول. حاول مرة أخرى.";
      console.log(data);
      isValid = false;
    }
  } catch (error) {
    serverError.style.display = "block";
    serverError.textContent = "حدث خطأ في الاتصال بالخادم. حاول مرة أخرى.";
    console.error(error);
    isValid = false;
  }

  return false;
}
