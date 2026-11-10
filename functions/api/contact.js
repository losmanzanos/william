/**
 * Contact form handler (Cloudflare Pages Function), POST /api/contact
 *
 * Environment variables (Cloudflare Pages > Settings > Variables and Secrets):
 *   RESEND_API_KEY   secret, Resend API key
 *   TO_EMAIL         where inquiries go (will@denverforwardtherapy.com)
 *   FROM_EMAIL       verified Resend sender, e.g. website@notify.denverforwardtherapy.com
 *   HEALTH_TOKEN     secret, lets a health check run without emailing the practice
 *   HEALTH_TO        where health checks go
 */

const PRACTICE = {
  name: 'Denver Forward Therapy',
  replyTo: 'will@denverforwardtherapy.com',
  phone: '(720) 495-3924',
  tel: '+17204953924',
  address: '1325 S. Colorado Blvd, Suite B108, Denver, CO 80222',
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());

const shell = (inner, foot) => `<!doctype html><html><body style="margin:0;padding:0;background:#F6F4EF">
<div style="margin:0;padding:32px 16px;background:#F6F4EF;font-family:'Libre Franklin',Helvetica,Arial,sans-serif;color:#23392D">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto">
    <tr><td style="padding:0 0 18px;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#5B665F">Denver Forward Therapy</td></tr>
    <tr><td style="background:#FFFFFF;border-top:3px solid #23392D;padding:32px 32px 28px">${inner}</td></tr>
    <tr><td style="padding:18px 8px 0;font-size:13px;line-height:1.5;color:#5B665F">${foot}</td></tr>
  </table>
</div></body></html>`;

function notifyHtml(d) {
  const row = (label, value, last) => `<tr><td style="padding:10px 0;border-top:1px solid #E3E4E0;${last ? 'border-bottom:1px solid #E3E4E0;' : ''}width:38%;color:#5B665F">${label}</td><td style="padding:10px 0;border-top:1px solid #E3E4E0;${last ? 'border-bottom:1px solid #E3E4E0;' : ''}">${value}</td></tr>`;
  const inner = `
      <h1 style="margin:0 0 6px;font:400 28px/1.15 Georgia,'Times New Roman',serif;color:#23392D">New inquiry from ${esc(d.name)}</h1>
      <p style="margin:0 0 26px;font-size:15px;color:#5B665F">Sent from the contact form on denverforwardtherapy.com, ${esc(d.when)}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:16px;line-height:1.45">
        ${row('Reaching out as', esc(d.who))}
        ${row('Age', esc(d.age))}
        ${row('Interested in', esc(d.interest))}
        ${row('Email', `<a href="mailto:${esc(d.email)}" style="color:#23392D">${esc(d.email)}</a>`)}
        ${row('Phone', d.phone ? `<a href="tel:${esc(d.phone)}" style="color:#23392D">${esc(d.phone)}</a>` : 'Not given', true)}
      </table>
      <p style="margin:24px 0 8px;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#5B665F">Message</p>
      <p style="margin:0;font-size:16px;line-height:1.5;white-space:pre-line">${esc(d.message) || '(No message)'}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:30px"><tr><td style="background:#23392D;border-radius:2px"><a href="mailto:${esc(d.email)}?subject=Re:%20Your%20message%20to%20Denver%20Forward%20Therapy" style="display:inline-block;padding:13px 20px;color:#FFFFFF;font-weight:600;font-size:15px;text-decoration:none">Reply to ${esc(d.name)}</a></td></tr></table>`;
  return shell(inner, 'This message came through the website contact form. The sender agreed not to include private health details. Hitting reply goes straight back to them.');
}

function autoReplyHtml(d) {
  const inner = `
      <h1 style="margin:0 0 18px;font:400 28px/1.15 Georgia,'Times New Roman',serif;color:#23392D">Thanks for reaching out, ${esc(d.name)}.</h1>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.5">I got your message and will get back to you within one business day, usually sooner. If it&rsquo;s easier to talk, you can also call or text me at <a href="tel:${PRACTICE.tel}" style="color:#23392D">${PRACTICE.phone}</a>.</p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.5">The first step is a free 15-minute call. No pressure and no commitment. We&rsquo;ll talk about what&rsquo;s going on and whether working together makes sense.</p>
      <p style="margin:0;font-size:16px;line-height:1.5">Talk soon,<br>Will</p>
      <p style="margin:22px 0 0;font-size:14px;line-height:1.5;color:#5B665F">William Flug, LCSW<br>${PRACTICE.name}<br>${PRACTICE.address}</p>`;
  return shell(inner, 'If this is an emergency, call 911. If you&rsquo;re in crisis, call or text 988, or reach Colorado Crisis Services at 1-844-493-8255. Please don&rsquo;t send private health details by email.');
}

async function send(env, msg) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify(msg),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text().catch(() => '')).slice(0, 300)}`);
  return res.json().catch(() => ({}));
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    const ct = request.headers.get('content-type') || '';
    data = ct.includes('application/json') ? await request.json() : Object.fromEntries(await request.formData());
  } catch {
    return json({ ok: false, error: 'Could not read that submission.' }, 400);
  }

  if (data.website) return json({ ok: true }); // honeypot

  const d = {
    who: String(data.who || '').slice(0, 80),
    age: String(data.age || '').slice(0, 40),
    interest: String(data.interest || '').slice(0, 80),
    name: String(data.name || '').trim().slice(0, 120),
    email: String(data.email || '').trim().slice(0, 200),
    phone: String(data.phone || '').trim().slice(0, 60),
    message: String(data.message || '').trim().slice(0, 5000),
    when: new Date().toLocaleString('en-US', { timeZone: 'America/Denver', dateStyle: 'full', timeStyle: 'short' }) + ' MT',
  };

  if (!d.name || !validEmail(d.email)) {
    return json({ ok: false, error: 'Please add your name and a valid email.' }, 400);
  }

  if (!env.RESEND_API_KEY || !env.TO_EMAIL || !env.FROM_EMAIL) {
    return json({ ok: false, error: 'not_configured' }, 503);
  }

  const health = env.HEALTH_TOKEN && request.headers.get('x-health-token') === env.HEALTH_TOKEN;
  if (request.headers.get('x-health-token') && !health) return json({ ok: false, error: 'bad_token' }, 403);

  const from = /</.test(env.FROM_EMAIL) ? env.FROM_EMAIL : `${PRACTICE.name} <${env.FROM_EMAIL}>`;
  const to = health ? (env.HEALTH_TO || env.TO_EMAIL) : env.TO_EMAIL;
  const tag = health ? '[Health check] ' : '';

  try {
    await send(env, {
      from, to: [to], reply_to: d.email,
      subject: `${tag}New inquiry from ${d.name} via denverforwardtherapy.com`,
      html: notifyHtml(d),
      text: `New inquiry from ${d.name}\n\nReaching out as: ${d.who}\nAge: ${d.age}\nInterested in: ${d.interest}\nEmail: ${d.email}\nPhone: ${d.phone || 'Not given'}\n\n${d.message || '(No message)'}\n\nSent ${d.when}`,
    });
  } catch (err) {
    console.error('notify failed', err.message);
    return json({ ok: false, error: 'send_failed' }, 502);
  }

  // Auto-reply to the visitor. A failure here never blocks the inquiry.
  try {
    await send(env, {
      from: `Will Flug, ${PRACTICE.name} <${env.FROM_EMAIL.replace(/^.*</, '').replace(/>$/, '')}>`,
      to: [health ? to : d.email], reply_to: PRACTICE.replyTo,
      subject: `${tag}Thanks for reaching out, ${d.name}`,
      html: autoReplyHtml(d),
      text: `Thanks for reaching out, ${d.name}.\n\nI got your message and will get back to you within one business day, usually sooner. If it's easier to talk, call or text me at ${PRACTICE.phone}.\n\nTalk soon,\nWill\n\nWilliam Flug, LCSW\n${PRACTICE.name}\n${PRACTICE.address}`,
    });
  } catch (err) {
    console.error('auto-reply failed', err.message);
  }

  return json({ ok: true, health: !!health });
}

export const onRequest = () => json({ ok: false, error: 'Method not allowed.' }, 405);
