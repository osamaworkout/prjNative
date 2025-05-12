async function validateForm(event) {
  event.preventDefault(); // Prevent form submission
  let isValid = true;
  const nationalNo = document.getElementById("nationalNo").value;
  const password = document.getElementById("password").value;
  const nationalNoError = document.getElementById("nationalNoError");
  const passwordError = document.getElementById("passwordError");
  const serverError = document.getElementById("serverError");

  // nationalNo validation (basic pattern check)
  const nationalIdPattern = /^[0-9]{14}$/;
  if (!nationalIdPattern.test(nationalNo)) {
    nationalNoError.style.display = "block";
    isValid = false;
  } else {
    nationalNoError.style.display = "none";

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      passwordError.style.display = "block";
      isValid = false;
    } else {
      passwordError.style.display = "none";
    }

    try {
      const basetUrl = "https://movesmartapi.runasp.net/api/v1/User/login";

      const response = await fetch(basetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
             nationalNo : nationalNo, 
             password: password
             }),
      });
      if (response.ok) {
        // const data = await response.json();
       
          window.location.href = "sharedLayout.html";
        } else {
          serverError.style.display = "block";
          serverError.textContent =
            data.message || "فشل تسجيل الدخول. حاول مرة أخرى.";
            console.log(data);
          isValid = false;
        }
      }
     catch (error) {
      serverError.style.display = "block";
      serverError.textContent = "حدث خطأ في الاتصال بالخادم. حاول مرة أخرى.";
      isValid = false;
    }

    return false;
  }
}
