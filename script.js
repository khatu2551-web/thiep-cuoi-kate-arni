// 1. Lấy tên khách mời từ link (?to=Tên_Khách)
const params = new URLSearchParams(window.location.search);
const guestName = params.get('to');
if (guestName) {
  document.getElementById('guest-name').textContent = guestName;
  const nameInput = document.querySelector('input[name="name"]');
  if (nameInput) nameInput.value = guestName;
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

// 3. Tạo lịch tháng 7/2027 (đánh dấu Thứ Bảy ngày 17)
const calGrid = document.getElementById('calendar-grid');
const daysHeader = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
daysHeader.forEach(d => calGrid.innerHTML += `<b>${d}</b>`);
// Ngày 1/7/2027 là Thứ Năm -> thêm 3 ô trống (T2, T3, T4)
calGrid.innerHTML += `<span></span><span></span><span></span>`;
for (let i = 1; i <= 31; i++) {
  const cls = i === 17 ? 'wed-day' : '';
  calGrid.innerHTML += `<span class="${cls}">${i}</span>`;
}

// 4. Đếm ngược chuẩn xác tới 16:30 ngày 17/07/2027 (Giờ Việt Nam +07:00)
const targetDate = new Date('2027-07-17T16:30:00+07:00').getTime();

function updateCountdown() {
  const now = Date.now();
  const diff = Math.max(0, targetDate - now);
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById('d').textContent = days;
  document.getElementById('h').textContent = String(hours).padStart(2, '0');
  document.getElementById('m').textContent = String(minutes).padStart(2, '0');
  document.getElementById('s').textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// 5. Hiệu ứng hiện dần khi cuộn (Scroll Reveal)
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });
document.querySelectorAll('.rv').forEach(el => observer.observe(el));

// 6. Phóng to ảnh Gallery, Love Story & Dresscode (Lightbox)
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
document.querySelectorAll('#gallery img, .story-photos img, .dresscode-img').forEach(img => {
  img.addEventListener('click', () => {
    lbImg.src = img.src;
    lightbox.hidden = false;
  });
});
document.getElementById('lb-close').addEventListener('click', () => lightbox.hidden = true);

// 7. Gửi Form RSVP & Lời chúc tự động về Telegram
const TELEGRAM_TOKEN = '9269268365:AAHAiLFgfJpSVzMKDDYzmool6VTokbeRsIg';
const CHAT_ID = '9011614930';

document.getElementById('rsvp-form').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  const msgEl = document.getElementById('form-msg');

  const senderName = fd.get('name');
  const attendStatus = fd.get('attend');
  const guestCount = attendStatus === 'Vắng mặt' ? 0 : (fd.get('guests') || 1);
  const wishText = fd.get('wish') || '(Không có lời chúc)';

  const message = 
`💌 XÁC NHẬN THIỆP CƯỚI KATE & ARNI
👤 Khách mời: ${senderName}
📌 Trạng thái: ${attendStatus}
👥 Số người tham dự: ${guestCount} người
💬 Lời chúc: ${wishText}`;

  submitBtn.disabled = true;
  msgEl.textContent = 'Đang gửi xác nhận... / Wird gesendet...';

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message
      })
    });

    if (res.ok) {
      msgEl.textContent = '✓ Cảm ơn Quý vị đã gửi xác nhận và lời chúc tới Kate & Arni! ♥';
      form.reset();
    } else {
      throw new Error('Telegram API Error');
    }
  } catch (err) {
    msgEl.textContent = 'Có lỗi kết nối, vui lòng thử lại giúp chúng mình nhé!';
  } finally {
    submitBtn.disabled = false;
  }
});
