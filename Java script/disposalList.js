let parts = [];
let editIndex = null;

const partList = document.getElementById('parts');
const cardsContainer = document.getElementById('cardsContainer');
const totalSpan = document.getElementById('total');

// استدعاء البيانات من API (GET)
async function fetchParts() {
  try {
    const response = await fetch('YOUR_API_URL_HERE'); // <--- عدل هنا
    parts = await response.json();
    renderPartsList();
  } catch (err) {
    console.error('حدث خطأ أثناء جلب البيانات:', err);
  }
}

function renderPartsList() {
  partList.innerHTML = '';
  cardsContainer.innerHTML = '';
  parts.forEach((part, index) => {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', () => toggleCard(index));
    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(` ${part.name}`));
    partList.appendChild(li);
  });
  totalSpan.innerText = parts.length;
}

function toggleCard(index) {
  const card = document.getElementById(`card-${index}`);
  if (card) {
    card.remove();
  } else {
    const part = parts[index];
    const div = document.createElement('div');
    div.className = 'card';
    div.id = `card-${index}`;
    div.innerHTML = `
      <h3>${part.name}</h3>
      <div class="card-details">
        <p><strong>نوع السيارة:</strong> ${part.carType}</p>
        <p><strong>الكود:</strong> ${part.code}</p>
        <p><strong>الكمية:</strong> ${part.quantity}</p>
        <p><strong>العمر الافتراضي:</strong> ${part.lifetime} يوم</p>
        <p><strong>التكلفة:</strong> ${part.cost} جنيه</p>
      </div>
      <div class="card-buttons">
        <button class="edit" onclick="editPart(${index})">تعديل</button>
        <button class="remove" onclick="deletePart(${index})">حذف</button>
      </div>
    `;
    cardsContainer.appendChild(div);
  }
}

function editPart(index) {
  editIndex = index;
  const part = parts[index];
  document.getElementById('newPartName').value = part.name;
  document.getElementById('newCarType').value = part.carType;
  document.getElementById('newCode').value = part.code;
  document.getElementById('newQuantity').value = part.quantity;
  document.getElementById('newLifetime').value = part.lifetime;
  document.getElementById('newCost').value = part.cost;
  document.getElementById('addPartPopup').style.display = 'flex';
}

async function deletePart(index) {
  const confirmDelete = confirm('هل أنت متأكد أنك تريد حذف هذه القطعة؟');
  if (!confirmDelete) return;

  try {
    const part = parts[index];
    await fetch(`YOUR_API_URL_HERE/${part.id}`, {
      method: 'DELETE'
    });
    parts.splice(index, 1);
    renderPartsList();
  } catch (err) {
    console.error('فشل الحذف:', err);
  }
}

// إضافة أو تعديل القطعة
document.getElementById('submitAddPart').addEventListener('click', async () => {
  const newPart = {
    name: document.getElementById('newPartName').value,
    carType: document.getElementById('newCarType').value,
    code: document.getElementById('newCode').value,
    quantity: +document.getElementById('newQuantity').value,
    lifetime: +document.getElementById('newLifetime').value,
    cost: +document.getElementById('newCost').value
  };

  try {
    if (editIndex === null) {
      // إضافة جديدة (POST)
      await fetch('YOUR_API_URL_HERE', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPart)
      });
    } else {
      // تعديل (PUT)
      const existing = parts[editIndex];
      await fetch(`YOUR_API_URL_HERE/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPart)
      });
      editIndex = null;
    }

    document.getElementById('addPartPopup').style.display = 'none';
    await fetchParts();
  } catch (err) {
    console.error('فشل الحفظ:', err);
  }
});

document.getElementById('cancelAddPart').addEventListener('click', () => {
  editIndex = null;
  document.getElementById('addPartPopup').style.display = 'none';
});

// تحديث البيانات
document.getElementById('refreshBtn').addEventListener('click', fetchParts);

// البحث
document.getElementById('search').addEventListener('input', e => {
  const keyword = e.target.value.toLowerCase();
  const filtered = parts.filter(p => p.name.toLowerCase().includes(keyword));
  partList.innerHTML = '';
  cardsContainer.innerHTML = '';
  filtered.forEach((part, index) => {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', () => toggleCard(index));
    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(` ${part.name}`));
    partList.appendChild(li);
  });
});

// عرض البيانات عند التحميل
window.onload = fetchParts;
