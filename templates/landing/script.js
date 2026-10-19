document.querySelectorAll('a[href="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Link clicado:', a.textContent.trim());
  });
});