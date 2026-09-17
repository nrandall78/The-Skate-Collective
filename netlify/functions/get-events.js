// Reads APPROVED events from your Airtable and hands them to the website.
// The secret token is NOT in this file — it lives in a Netlify environment
// variable called AIRTABLE_TOKEN, where visitors can never see it.

const BASE_ID = 'appA6SRJcFtRTzJ7j';
const TABLE = 'Table 1';

exports.handler = async () => {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing AIRTABLE_TOKEN' }) };
  }
  try {
    // Only APPROVED events whose date is today or later (past events drop off).
    // Events with no date set are still shown.
    const formula = "AND({Approved}=TRUE(), OR({Date}=BLANK(), IS_AFTER({Date}, DATEADD(TODAY(),-1,'days'))))";
    const url = 'https://api.airtable.com/v0/' + BASE_ID + '/' + encodeURIComponent(TABLE)
      + '?filterByFormula=' + encodeURIComponent(formula)
      + '&sort%5B0%5D%5Bfield%5D=Date&sort%5B0%5D%5Bdirection%5D=asc';

    const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    if (!res.ok) {
      const detail = await res.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'Airtable error', detail: detail }) };
    }
    const data = await res.json();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const events = (data.records || []).map(function (r) {
      const f = r.fields || {};
      let day = '', month = '';
      if (f['Date']) {
        const d = new Date(f['Date'] + 'T00:00:00');
        if (!isNaN(d)) {
          day = String(d.getDate()).padStart(2, '0');
          month = months[d.getMonth()] + ' ' + d.getFullYear();
        }
      }
      const types = (f['Types'] || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      return {
        day: day,
        month: month,
        name: f['Event name'] || '',
        loc: f['City / Location'] || '',
        types: types,
        free: false
      };
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify(events)
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: String(e) }) };
  }
};
