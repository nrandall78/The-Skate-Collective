// Receives an event submission from the website and creates a NEW row in
// Airtable — left UNAPPROVED so nothing goes public until you tick the box.
// The secret token comes from the AIRTABLE_TOKEN environment variable.

const BASE_ID = 'appA6SRJcFtRTzJ7j';
const TABLE = 'Table 1';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ success: false, error: 'Method not allowed' }) };
  }
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: 'Missing AIRTABLE_TOKEN' }) };
  }

  let d;
  try { d = JSON.parse(event.body || '{}'); }
  catch (e) { return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Bad request' }) }; }

  const fields = {
    'Event name': d.event_name || '',
    'Types': d.types || '',
    'City / Location': d.loc || '',
    'Description': d.description || '',
    'Organizer': d.organizer || '',
    'Email': d.email || '',
    'Link': d.link || '',
    'Submitted': new Date().toISOString().slice(0, 10)
  };
  if (d.start_date) fields['Date'] = d.start_date;

  try {
    const res = await fetch('https://api.airtable.com/v0/' + BASE_ID + '/' + encodeURIComponent(TABLE), {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: fields, typecast: true })
    });
    if (!res.ok) {
      const detail = await res.text();
      return { statusCode: 502, body: JSON.stringify({ success: false, error: detail }) };
    }
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: String(e) }) };
  }
};
