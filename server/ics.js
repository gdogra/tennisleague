export function buildIcs({ uid, startISO, endISO, title, location, organizer, attendees = [], method = 'REQUEST' }) {
  const fmt = (iso) => iso.replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dtStart = fmt(startISO);
  const dtEnd = fmt(endISO);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `METHOD:${method}`,
    'PRODID:-//TLSD//Matches//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStart}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeText(title)}`,
    `LOCATION:${escapeText(location || 'TBD')}`,
    ...(organizer ? [`ORGANIZER:mailto:${organizer}`] : []),
    ...attendees.map(a => `ATTENDEE:mailto:${a}`),
    'END:VEVENT',
    'END:VCALENDAR'
  ];
  return lines.join('\r\n');
}

function escapeText(t) { return String(t).replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
