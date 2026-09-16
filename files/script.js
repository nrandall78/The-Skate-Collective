
  // Back to top
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  });

  const obs = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(r => obs.observe(r));

  let currentTab = 'skater';
  function setTab(btn, tab) {
    currentTab = tab;
    document.querySelectorAll('.wtab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const ph = { skater: 'Enter your email address', trainer: 'Enter your trainer email', organizer: 'Enter your organizer email' };
    document.getElementById('emailInput').placeholder = ph[tab];
  }

  async function handleSignup() {
    const email = document.getElementById('emailInput').value;
    if (!email || !email.includes('@')) {
      document.getElementById('emailInput').style.borderColor = 'rgba(255,92,26,0.6)';
      return;
    }
    document.getElementById('emailInput').style.borderColor = '';
    try {
      const existing = await window.storage.get('signups').catch(() => null);
      const list = existing ? JSON.parse(existing.value) : [];
      list.push({ email, type: currentTab, date: new Date().toISOString() });
      await window.storage.set('signups', JSON.stringify(list));
    } catch(e) {}
    document.querySelector('.waitlist-form').style.display = 'none';
    document.getElementById('successMsg').classList.add('show');
  }
