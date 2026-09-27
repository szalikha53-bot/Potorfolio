document.addEventListener('DOMContentLoaded', () => {
    console.log('✨ Halaman Portofolio SZF - Soft Aesthetic Theme Loaded ✨');

    // ===== Smooth Scrolling untuk Navbar =====
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Hanya smooth scroll untuk link anchor (#)
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // ===== Animasi Fade-in untuk Project Cards =====
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    });

    // ===== Efek Klik pada Project Card =====
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent;
            console.log(`Membuka project: ${title}`);
            // Bisa diarahkan ke halaman detail project
            // window.location.href = 'detail-project.html';
        });
    });

    // ===== Deteksi Gambar yang Gagal Dimuat =====
    const images = document.querySelectorAll('.project-image img');
    images.forEach(img => {
        img.addEventListener('error', () => {
            console.warn(`Gambar "${img.alt}" belum tersedia. Silakan tambahkan file di folder project.`);
            // Sembunyikan img yang error, biarkan placeholder silang X terlihat
            img.style.display = 'none';
        });
    });
});