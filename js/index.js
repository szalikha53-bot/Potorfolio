document.addEventListener('DOMContentLoaded', () => {
    console.log('✨ Website Portofolio SZF - Soft Aesthetic Theme Loaded ✨');

    // ===== Smooth Scrolling untuk Link Anchor (#) =====
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Hanya smooth scroll untuk link anchor (#contact)
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // ===== Animasi Fade-in Saat Halaman Dibuka =====
    const sections = document.querySelectorAll('.about-section, .education-section');

    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 200 * (index + 1));
    });

    // ===== Efek Hover Lembut pada Foto Profil =====
    const profileImg = document.getElementById('profileImage');
    if (profileImg) {
        profileImg.addEventListener('error', () => {
            console.warn('⚠️ Foto profil belum tersedia. Silakan tambahkan file "profil.jpeg" di folder utama.');
        });

        profileImg.addEventListener('load', () => {
            console.log('✅ Foto profil berhasil dimuat.');
        });
    }

    // ===== Efek Klik pada Baris Bio Data =====
    const rows = document.querySelectorAll('.row');
    rows.forEach(row => {
        row.addEventListener('click', function() {
            const label = this.querySelector('.label')?.textContent;
            const value = this.querySelector('.value')?.textContent;
            if (label && value) {
                console.log(`📋 ${label}: ${value}`);
            }
        });
    });

    // ===== Efek Klik pada Item Pendidikan =====
    const eduItems = document.querySelectorAll('.edu-list li');
    eduItems.forEach(item => {
        item.addEventListener('click', function() {
            const tahun = this.querySelector('.tahun')?.textContent;
            const detail = this.querySelector('.detail')?.textContent;
            if (tahun && detail) {
                console.log(`🎓 ${tahun} → ${detail}`);
            }
        });
    });
});