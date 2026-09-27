document.addEventListener('DOMContentLoaded', () => {
    console.log('✨ Halaman Contact SZF - Soft Aesthetic Theme Loaded ✨');

    // ===== Form Submission Handler =====
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Ambil nilai dari input
            const nama = document.getElementById('nama').value.trim();
            const email = document.getElementById('email').value.trim();
            const pesan = document.getElementById('pesan').value.trim();

            // Validasi sederhana
            if (!nama || !email || !pesan) {
                alert('⚠️ Mohon isi semua kolom terlebih dahulu!');
                return;
            }

            // Validasi format email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('⚠️ Format email tidak valid!');
                return;
            }

            // Simulasi pengiriman pesan
            const btn = contactForm.querySelector('.btn-kirim');
            const originalText = btn.textContent;
            btn.textContent = 'Mengirim...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            setTimeout(() => {
                console.log('📩 Pesan Terkirim:');
                console.log(`   Nama  : ${nama}`);
                console.log(`   Email : ${email}`);
                console.log(`   Pesan : ${pesan}`);

                alert(`💕 Terima kasih, ${nama}!\n\nPesan Anda telah terkirim.\nSaya akan segera membalas ke email: ${email}`);

                // Reset form
                contactForm.reset();
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.opacity = '1';
            }, 1500);
        });
    }

    // ===== Animasi Fade-in untuk Section =====
    const sections = document.querySelectorAll('.form-container, .info-container');

    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = `opacity 0.7s ease ${index * 0.2}s, transform 0.7s ease ${index * 0.2}s`;

        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 100);
    });

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

    // ===== Efek Hover Interaktif pada Info List =====
    const infoItems = document.querySelectorAll('.info-list li');
    infoItems.forEach(item => {
        item.addEventListener('click', function () {
            const text = this.textContent.trim();
            console.log(`📌 Info diklik: ${text}`);
        });
    });
});