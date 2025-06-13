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


const subscribers = [
    { name: 'احمد حمدي', phone: '01204514948', status: 'متاحة' },
    { name: 'احمد عادل', phone: '01204514948', status: 'متاحة' },
    { name: 'عمر شعبان', phone: '01204514948', status: 'متاحة' },
    { name: 'اسامة سيد', phone: '01204514948', status: 'متاحة' },
  ];
  
  function renderSubscribers(list) {
    const tbody = document.getElementById('subscriberList');
    tbody.innerHTML = '';
    list.forEach(sub => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>≡</td>
        <td>${sub.phone}</td>
        <td><span class="status-active">${sub.status}</span></td>
        <td>${sub.name}</td>
      `;
      tbody.appendChild(tr);
    });
  
    // ← تحديث العدد المعروض
    document.getElementById('totalCount').textContent = list.length;
  }
  
  
  document.getElementById('refreshBtn').onclick = () => renderSubscribers(subscribers);
  
  document.getElementById('addSubscriber').onclick = () => {
    document.getElementById('popup').classList.remove('hidden');
  };
  
  function closePopup() {
    document.getElementById('popup').classList.add('hidden');
  }
  
  document.getElementById('filterBtn').onclick = () => {
    document.getElementById('filterMenu').classList.toggle('hidden');
  };
  
  function toggleNameFilter() {
    document.getElementById('nameFilter').classList.toggle('hidden');
    document.getElementById('statusFilter').classList.add('hidden');
  }
  
  function toggleStatusFilter() {
    document.getElementById('statusFilter').classList.toggle('hidden');
    document.getElementById('nameFilter').classList.add('hidden');
  }
  
  function filterByName() {
    const name = document.getElementById('nameInput').value;
    const filtered = subscribers.filter(s => s.name.includes(name));
    renderSubscribers(filtered);
  
    // إغلاق القائمة والفلاتر بعد البحث
    document.getElementById('filterMenu').classList.add('hidden');
    document.getElementById('nameFilter').classList.add('hidden');
  }
  
  function filterByStatus(status) {
    const filtered = subscribers.filter(s => s.status === status);
    renderSubscribers(filtered);
  
    // إغلاق القائمة والفلاتر بعد الاختيار
    document.getElementById('filterMenu').classList.add('hidden');
    document.getElementById('statusFilter').classList.add('hidden');
  }

  function showNotification(message) {
    const note = document.getElementById('notification');
    note.textContent = message;
    note.classList.remove('hidden');
  
    setTimeout(() => {
      note.classList.add('hidden');
    }, 3000);
  }
  
  function saveNewSubscriber() {
    const nameInput = document.getElementById('newName');
    const phoneInput = document.getElementById('newPhone');
    const jobInput = document.getElementById('newJob');
    const idInput = document.getElementById('newId');
  
    // Reset الأخطاء
    [nameInput, phoneInput, jobInput, idInput].forEach(input => input.classList.remove('input-error'));
  
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const job = jobInput.value.trim();
    const id = idInput.value.trim();
    const status = 'متاحة';
  
    if (!name) {
      nameInput.classList.add('input-error');
      showNotification("يرجى إدخال الاسم");
      return;
    }
  
    const phoneRegex = /^01[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      phoneInput.classList.add('input-error');
      showNotification("يرجى إدخال رقم محمول صحيح مكوّن من 11 رقم ويبدأ بـ 01");
      return;
    }
  
    if (!job) {
      jobInput.classList.add('input-error');
      showNotification("يرجى إدخال المسمى الوظيفي");
      return;
    }
  
    const idRegex = /^[0-9]{14}$/;
    if (!idRegex.test(id)) {
      idInput.classList.add('input-error');
      showNotification("يرجى إدخال رقم قومي صحيح مكوّن من 14 رقم");
      return;
    }
  
    // تم التحقق: أضف المشترك
    subscribers.push({ name, phone, status });
    renderSubscribers(subscribers);
    closePopup();
  
    // تفريغ الحقول
    nameInput.value = '';
    phoneInput.value = '';
    jobInput.value = '';
    idInput.value = '';
  }
  
  
  // Initial load
  renderSubscribers(subscribers);
  