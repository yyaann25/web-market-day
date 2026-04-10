// Animasi scroll halus untuk link navigasi
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Pesan sambutan di konsol (Opsional)
console.log("Selamat datang di Website Stand Magic - Nine Foosion Expo!");
