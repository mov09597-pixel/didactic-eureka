<script src="https://unpkg.com/scrollreveal"></script>
<script>
    // تغيير شكل الـ Navbar عند السكرول
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) {
            nav.classList.add('bg-black', 'py-4');
            nav.classList.remove('bg-transparent', 'py-6');
        } else {
            nav.classList.add('bg-transparent', 'py-6');
            nav.classList.remove('bg-black', 'py-4');
        }
    });

    // تأثير ظهور العناصر تدريجياً
    ScrollReveal().reveal('.group', { 
        delay: 200, 
        distance: '50px',
        origin: 'bottom',
        interval: 100 
    });
</script>
