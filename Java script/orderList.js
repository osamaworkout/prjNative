// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    window.location.href = '../Login.html';
    return;
  }

  // Add click event listener to the page title for navigation
  const pageTitle = document.querySelector('title');
  document.title = 'صفحة الطلبات';
  const header = document.createElement('h1');
  header.className = 'page-title';
  header.textContent = 'صفحة الطلبات';
  header.style.cursor = 'pointer';
  header.addEventListener('click', function() {
    window.location.href = `../dash-Boards/${userRole.toLowerCase()}Dashboard.html`;
  });
  document.body.insertBefore(header, document.body.firstChild);
});

const allRequests = [
    { id: 1, sender: "Ahmed", date: "2024-02-15", status: "مقبول", badgeClass: "badge-accepted" },
    { id: 2, sender: "Sara", date: "2024-02-14", status: "مرفوض", badgeClass: "badge-rejected" },
    { id: 3, sender: "Ali", date: "2024-02-13", status: "قيد الانتظار", badgeClass: "badge-pending" },
    { id: 4, sender: "Omar", date: "2024-02-12", status: "مقبول", badgeClass: "badge-accepted" },
    { id: 5, sender: "Nada", date: "2024-02-11", status: "مقبول", badgeClass: "badge-accepted" },
    { id: 6, sender: "Yousef", date: "2024-02-10", status: "مقبول", badgeClass: "badge-accepted" },
  ];

  const myRequests = [
    { id: 7, date: "2024-02-09", status: "مقبول", badgeClass: "badge-accepted" },
    { id: 8, date: "2024-02-08", status: "مرفوض", badgeClass: "badge-rejected" },
    { id: 9, date: "2024-02-07", status: "قيد الانتظار", badgeClass: "badge-pending" },
  ];

  let requests = [];
  let viewMy = null;
  let selected = null;

  const listEl = document.getElementById('request-list');

  function renderRequests() {
    listEl.innerHTML = '';
    requests.forEach(req => {
      const card = document.createElement('div');
      card.className = 'card';
      card.onclick = () => openPopup(req);

      let html = `<span>${req.id}</span><span>${req.date}</span>`;
      if (!viewMy) html += `<span>${req.sender}</span>`;
      html += `<span class="badge ${req.badgeClass}">${req.status}</span>`;

      card.innerHTML = html;
      listEl.appendChild(card);
    });
  }

  function showDateInput() {
    document.getElementById('filterDate').classList.remove('hidden');
  }

  function filterByExactDate(date) {
    requests = (viewMy ? myRequests : allRequests).filter(r => r.date === date);
    renderRequests();
    hideFilterMenu();
  }

  function showStatusOptions() {
    document.getElementById('statusOptions').classList.remove('hidden');
  }

  function filterByStatus(status) {
    if (!status) return;
    requests = (viewMy ? myRequests : allRequests).filter(r => r.status === status);
    renderRequests();
    hideFilterMenu();
  }

  function refreshRequests() {
    requests = viewMy ? [...myRequests] : [...allRequests];
    renderRequests();
  }

  function showAllRequests() {
    viewMy = false;
    requests = [...allRequests];
    renderRequests();
  }

  function showMyRequests() {
    viewMy = true;
    requests = [...myRequests];
    renderRequests();
  }

  function openPopup(req) {
    selected = req;
    document.getElementById('popup').classList.remove('hidden');
    document.getElementById('popup-id').textContent = req.id;
    document.getElementById('popup-date').textContent = req.date;
    document.getElementById('popup-status').textContent = req.status;
    document.getElementById('popup-status').className = `badge ${req.badgeClass}`;
  }

  function closePopup() {
    selected = null;
    document.getElementById('popup').classList.add('hidden');
  }

  function toggleFilterMenu() {
    const menu = document.getElementById('filterMenu');
    menu.classList.toggle('hidden');
  }

  function hideFilterMenu() {
    document.getElementById('filterMenu').classList.add('hidden');
    document.getElementById('statusOptions').classList.add('hidden');
    document.getElementById('filterDate').classList.add('hidden');
  }