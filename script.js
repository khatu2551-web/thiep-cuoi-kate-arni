// 1. Lấy tên khách mời từ link (?to=Tên_Khách)
const params = new URLSearchParams(window.location.search);
const guestName = params.get('to');
if (guestName) {
  document.getElementById('guest-name').textContent = guestName;
  document.querySelector('input[name="name"]').value = guestName;
}

// 2. Mở thiệp (bấm nút hoặc vuốt lên) & Tự phát nhạc
const gate = document.getElementById('gate');
const music = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-btn');

function openInvitation() {
  gate.classList.add('opened');
  document.body.classList.remove('locked');
  music.play().then(() => musicBtn.classList.add('playing')).catch(() => {});
}

document.getElementById('go-btn').addEventListener('click', openInvitation);

// Hỗ trợ vuốt lên trên điện thoại để mở vé
let startY = 0;
gate.addEventListener('touchstart', e => startY = e.touches[0].clientY);
gate.addEventListener('touchend', e => {
  if (startY - e.changedTouches[0].clientY > 50) openInvitation();
});

// Bật/tắt nhạc thủ công
musicBtn.addEventListener('click', () => {
  if (music.paused) {
    music.play();
    musicBtn.classList.add('playing');
  } else {
    music.pause();
    musicBtn.classList.remove('playing');
  }
});

// 3. Tạo lịch tháng 12/2026 (đánh dấu ngày 20)
const calGrid = document.getElementById('calendar-grid');
const daysHeader = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
daysHeader.forEach(d => calGrid.innerHTML += `<b>${d}</b>`);
// Ngày 1/12/2026 là Thứ Ba -> thêm 1 ô trống đầu tuần
calGrid.innerHTML += `<span></span>`;
for (let i = 1; i <= 31; i++) {
  const cls = i === 20 ? 'wed-day' : '';
  calGrid.innerHTML += `<span class="${cls}">${i}</span>`;
}

// 4. Đếm ngược tới 11:00 ngày 20/12/2026
const targetDate = new Date('2026-12-20T11:00:00').getTime();
setInterval(() => {
  const diff = Math.max(0, targetDate - Date.now());
  document.getElementById('d').textContent = Math.floor(diff / 86400000);
  document.getElementById('h').textContent = String(Math.floor((diff / 3600000) % 24)).padStart(2, '0');
  document.getElementById('m').textContent = String(Math.floor((diff / 60000) % 60)).padStart(2, '0');
  document.getElementById('s').textContent = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
}, 1000);

// 5. Hiệu ứng hiện dần khi cuộn (Scroll Reveal)
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });
document.querySelectorAll('.rv').forEach(el => observer.observe(el));

// 6. Phóng to ảnh Gallery (Lightbox)
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
document.querySelectorAll('#gallery img').forEach(img => {
  img.addEventListener('click', () => {
    lbImg.src = img.src;
    lightbox.hidden = false;
  });
});
document.getElementById('lb-close').addEventListener('click', () => lightbox.hidden = true);

// 7. Sao chép số tài khoản
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(btn.dataset.copy);
    const oldText = btn.textContent;
    btn.textContent = 'Đã chép ✓';
    setTimeout(() => btn.textContent = oldText, 2000);
  });
});

// 8. Gửi Form RSVP & Lời chúc về Telegram Bot (hoặc Google Sheets)
const TELEGRAM_TOKEN = 'DÁN_BOT_TOKEN_CỦA_BẠN';
const CHAT_ID = 'DÁN_CHAT_ID_CỦA_BẠN';

document.getElementById('rsvp-form').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const text = `💌 XÁC NHẬN THIỆP CƯỚI:\n- Khách: ${fd.get('name')}\n- Trạng thái: ${fd.get('attend')}\n- Số người: ${fd.get('guests')}\n- Lời chúc: ${fd.get('wish')}`;
  
  const msgEl = document.getElementById('form-msg');
  msgEl.textContent = 'Đang gửi...';
  
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text })
    });
    msgEl.textContent = 'Cảm ơn bạn đã gửi xác nhận và lời chúc!';
    e.target.reset();
  } catch {
    msgEl.textContent = 'Đã ghi nhận thông tin của bạn!';
  }
});