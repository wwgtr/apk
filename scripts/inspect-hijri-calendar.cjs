const fs = require('fs');

const calendar = JSON.parse(fs.readFileSync('/home/ubuntu/upload/hijri_calendar_1448_complete.json', 'utf8'));
const months = Array.isArray(calendar.months) ? calendar.months : [];
const days = months.flatMap((month) => month.days || []);
const eventDays = days.filter((day) => Array.isArray(day.events) && day.events.length > 0);
const errors = [];

if (calendar.year_hijri !== 1448) errors.push('سنة التقويم ليست 1448 هـ');
if (months.length !== 12) errors.push(`عدد الأشهر المتوقع 12، الفعلي ${months.length}`);
months.forEach((month, index) => {
  if (month.month_order !== index + 1) errors.push(`ترتيب غير متسلسل في الشهر ${month.name}`);
  if (!Array.isArray(month.days) || month.days.length !== month.total_days) {
    errors.push(`عدد أيام غير متطابق في ${month.name}`);
  }
});
days.forEach((day) => {
  if (!day.iso_date || !/^\d{4}-\d{2}-\d{2}$/.test(day.iso_date)) errors.push(`تاريخ ISO غير صالح: ${day.iso_date}`);
});

console.log(JSON.stringify({
  title: calendar.title,
  source: calendar.source,
  yearHijri: calendar.year_hijri,
  monthCount: months.length,
  totalDays: days.length,
  eventDays: eventDays.length,
  totalEvents: eventDays.reduce((sum, day) => sum + day.events.length, 0),
  months: months.map((month) => ({ name: month.name, totalDays: month.total_days, eventDays: (month.days || []).filter((day) => day.events?.length).length })),
  qiblaDates: calendar.general_info?.qibla_determination?.dates?.length ?? 0,
  equinoxes: calendar.general_info?.astronomical_equinoxes?.length ?? 0,
  errors,
}, null, 2));

if (errors.length) process.exit(1);
