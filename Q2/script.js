// Clock (updates every second)
function startTime() {
  const today = new Date();
  const el = document.getElementById('txt');
  if (el) el.innerText = today.toLocaleString();
  setTimeout(startTime, 1000);
}

// Write last-modified safely when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  try {
    const lastModified = new Date(document.lastModified);
    const formattedDate = lastModified.toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const el = document.getElementById('lastUpdated');
    if (el) el.innerText = formattedDate;
  } catch (e) {
    // ignore
  }

  // start clock
  startTime();

  // smooth scrolling for same-page links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const href = a.getAttribute('href');
      if (href && href.length > 1) {
        e.preventDefault();
        const dest = document.querySelector(href);
        if (dest) dest.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
