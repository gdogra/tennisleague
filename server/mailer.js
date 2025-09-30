import fetch from 'node-fetch';

export async function sendEmail({ to, subject, html, ics }) {
  if (process.env.POSTMARK_TOKEN) {
    return sendPostmark({ to, subject, html, ics });
  } else if (process.env.SENDGRID_API_KEY) {
    return sendSendgrid({ to, subject, html, ics });
  } else {
    console.log('[EmailStub]', { to, subject });
    return { ok: true };
  }
}

async function sendPostmark({ to, subject, html, ics }) {
  const body = {
    From: process.env.MAIL_FROM || 'noreply@tennisleague.com',
    To: to,
    Subject: subject,
    HtmlBody: html,
  };
  if (ics) {
    body.Attachments = [
      {
        Name: 'match.ics',
        Content: Buffer.from(ics).toString('base64'),
        ContentType: 'text/calendar; method=PUBLISH; charset=utf-8'
      }
    ];
  }
  const res = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'X-Postmark-Server-Token': process.env.POSTMARK_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return { ok: res.ok };
}

async function sendSendgrid({ to, subject, html, ics }) {
  const body = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: process.env.MAIL_FROM || 'noreply@tennisleague.com' },
    subject,
    content: [{ type: 'text/html', value: html }],
  };
  if (ics) {
    (body.attachments = body.attachments || []).push({
      content: Buffer.from(ics).toString('base64'),
      type: 'text/calendar; method=PUBLISH; charset=utf-8',
      filename: 'match.ics'
    });
  }
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return { ok: res.ok };
}

