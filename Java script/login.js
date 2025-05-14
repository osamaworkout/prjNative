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

      localStorage.setItem("token", data.token);

      window.location.href = "sharedLayout.html";
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
