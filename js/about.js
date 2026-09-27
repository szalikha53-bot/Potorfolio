document.addEventListener('DOMContentLoaded', () => {
    console.log('✨ Halaman About SZF - Soft Aesthetic Theme Loaded ✨');

    // ===== Animasi Fade-in untuk Setiap Section =====
    const sections = document.querySelectorAll(
        '.about-section, .skills-section, .education-section'
    );

    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = `opacity 0.7s ease ${index * 0.2}s, transform 0.7s ease ${index * 0.2}s`;

        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 100);
    });

    // ===== Animasi Fade-in untuk Skill Cards =====
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ease ${index * 0.1 + 0.5}s, transform 0.5s ease ${index * 0.1 + 0.5}s`;

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    });

    // ===== Efek Klik pada Skill Card =====
    skillCards.forEach(card => {
        card.addEventListener('click', function () {
            const skillName = this.querySelector('h3')?.textContent;
            if (skillName) {
                console.log(`🎯 Skill dipilih: ${skillName}`);
            }
        });
    });

    // ===== Deteksi Foto Profil =====
    const profileImg = document.getElementById('profileImage');
    if (profileImg) {
        profileImg.addEventListener('error', () => {
            console.warn('⚠️ Foto profil belum tersedia. Silakan tambahkan file "profil.jpeg".');
        });

        profileImg.addEventListener('load', () => {
            console.log('✅ Foto profil berhasil dimuat.');
        });
    }

    // ===== Smooth Scrolling untuk Link Anchor =====
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // ===== Efek Klik pada Bio Data =====
    const rows = document.querySelectorAll('.row');
    rows.forEach(row => {
        row.addEventListener('click', function () {
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
        item.addEventListener('click', function () {
            const tahun = this.querySelector('.tahun')?.textContent;
            const detail = this.querySelector('.detail')?.textContent;
            if (tahun && detail) {
                console.log(`🎓 ${tahun} → ${detail}`);
            }
        });
    });
});