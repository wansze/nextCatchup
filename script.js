const zones = [
  { key: 'my', label: 'Kuala Lumpur', flag: '🇲🇾', tz: 'Asia/Kuala_Lumpur', abbr: 'MYT +8'  },
  { key: 'uk', label: 'London',       flag: '🇬🇧', tz: 'Europe/London',     abbr: 'GMT/BST' },
  { key: 'ca', label: 'Toronto',      flag: '🇨🇦', tz: 'America/Toronto',   abbr: 'ET'       },
];

let activeIdx = 0;
let sliderMinutes = 720;

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getSelectedBaseDate() {
  const val = document.getElementById('datePicker').value || todayString();
  const [y, m, d] = val.split('-').map(Number);
  return new Date(y, m - 1, d, Math.floor(sliderMinutes / 60), sliderMinutes % 60, 0);
}

function getTzOffsetMinutes(date, tz) {
  const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' });
  const tzStr  = date.toLocaleString('en-US', { timeZone: tz });
  return (new Date(tzStr) - new Date(utcStr)) / 60000;
}

function getConvertedTime(baseDate, fromTz, toTz) {
  const fromOff = getTzOffsetMinutes(baseDate, fromTz);
  const toOff   = getTzOffsetMinutes(baseDate, toTz);
  return new Date(baseDate.getTime() + (toOff - fromOff) * 60000);
}

function formatTime(date) {
  let h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return { time: `${h}:${m}`, period };
}

function formatDate(date) {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function render() {
  const grid = document.getElementById('clockGrid');
  const activeZone = zones[activeIdx];
  const baseDate = getSelectedBaseDate();

  grid.innerHTML = '';

  zones.forEach((z, i) => {
    const t = getConvertedTime(baseDate, activeZone.tz, z.tz);
    const { time, period } = formatTime(t);
    const isActive = i === activeIdx;

    const card = document.createElement('div');
    card.className = 'clock-card' + (isActive ? ' active' : '');
    card.innerHTML = `
      <div class="clock-flag">${z.flag}</div>
      <div class="clock-city">${z.label}</div>
      <div class="clock-tz">${z.abbr}</div>
      <div class="clock-time">${time}<span class="clock-period">${period}</span></div>
      <div class="clock-date">${formatDate(t)}</div>
      ${isActive ? '<div class="active-badge">Editing ✏️</div>' : ''}
    `;

    card.onclick = () => {
      const converted = getConvertedTime(baseDate, activeZone.tz, z.tz);
      sliderMinutes = converted.getHours() * 60 + converted.getMinutes();
      const dp = document.getElementById('datePicker');
      dp.value = `${converted.getFullYear()}-${String(converted.getMonth() + 1).padStart(2, '0')}-${String(converted.getDate()).padStart(2, '0')}`;
      document.getElementById('slider').value = sliderMinutes;
      activeIdx = i;
      render();
    };

    grid.appendChild(card);
  });
}

function setNow() {
  const now = new Date();
  document.getElementById('datePicker').value = todayString();
  sliderMinutes = now.getHours() * 60 + now.getMinutes();
  document.getElementById('slider').value = sliderMinutes;
  render();
}

document.getElementById('slider').addEventListener('input', e => {
  sliderMinutes = parseInt(e.target.value);
  render();
});

document.getElementById('datePicker').addEventListener('change', render);

document.getElementById('datePicker').value = todayString();
setNow();
