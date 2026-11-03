const q = new URLSearchParams(location.search);
if (q.has('table') || q.has('queue')) {
  location.replace('/demo' + location.search + location.hash);
}
