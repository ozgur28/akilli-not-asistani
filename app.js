// C# Backend API Adresimiz
const API_URL = "http://localhost:5099/api/notes";

// HTML Elemanlarını Seçiyoruz
const noteTitleInput = document.getElementById("noteTitle");
const noteContentInput = document.getElementById("noteContent");
const btnSubmit = document.getElementById("btnSubmit");
const loadingSpinner = document.getElementById("loading");
const resultSection = document.getElementById("resultSection");
const summaryOutput = document.getElementById("summaryOutput");
const quizOutput = document.getElementById("quizOutput");
const notesList = document.getElementById("notesList");

// Sayfa ilk açıldığında veritabanındaki eski notları çek ve listele
document.addEventListener("DOMContentLoaded", fetchNotes);

// BUTONA TIKLANDIĞINDA ÇALIŞACAK FONKSİYON
btnSubmit.addEventListener("click", async () => {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();

    // Boşluk kontrolü
    if (!title || !content) {
        alert("Lütfen başlık ve not içeriğini doldurun!");
        return;
    }

    // Arayüzü "Yükleniyor" durumuna getiriyoruz
    btnSubmit.disabled = true;
    loadingSpinner.classList.remove("hidden");
    resultSection.classList.add("hidden");

    try {
        // C# API'sine POST isteği gönderiyoruz
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        });

        if (!response.ok) {
            throw new Error("Sunucu hatası oluştu!");
        }

        const data = await response.json();

        // Gelen verileri ekrana yazdırıyoruz
        summaryOutput.innerText = data.summary;
        quizOutput.innerText = data.quiz;

        // Sonuç alanını görünür yapıyoruz
        resultSection.classList.remove("hidden");

        // Formu temizliyoruz
        noteTitleInput.value = "";
        noteContentInput.value = "";

        // Geçmiş listesini güncelliyoruz (Yeni eklenen notu görsün diye)
        fetchNotes();

    } catch (error) {
        console.error("Hata:", error);
        alert("Backend sunucusuna bağlanılamadı. Lütfen C# projesinin (dotnet run) çalıştığından emin olun!");
    } finally {
        // Yükleniyor ekranını kapatıyoruz
        btnSubmit.disabled = false;
        loadingSpinner.classList.add("hidden");
    }
});

// VERİTABANINDAN NOTLARI ÇEKİP LİSTELEYEN FONKSİYON
async function fetchNotes() {
    try {
        const response = await fetch(API_URL);
        const notes = await response.json();

        if (notes.length === 0) {
            notesList.innerHTML = '<p class="empty-text">Henüz kaydedilmiş bir not bulunmuyor.</p>';
            return;
        }

        // Listeyi temizle ve veritabanından gelenleri içine bas
        notesList.innerHTML = "";
        notes.forEach(note => {
            const date = new Date(note.createdAt).toLocaleString("tr-TR");
            
            // --- DEĞİŞİKLİK TAM OLARAK BURADA YAPILDI ---
            // p etiketlerini details ve summary içine alarak açılır-kapanır yaptık.
            const noteHtml = `
                <div class="note-item">
                    <h4>📌 ${note.title}</h4>
                    <p style="font-size:12px; color:#80868b; margin-bottom:10px;">Tarih: ${date}</p>
                    
                    <details class="analysis-accordion">
                        <summary>🤖 Yapay Zeka Analiz Raporunu Göster 🔎</summary>
                        <div class="accordion-content">
                            <p>${note.summary}</p>
                            <hr>
                            <p>${note.quiz}</p>
                        </div>
                    </details>
                </div>
            `;
            // --- DEĞİŞİKLİK BİTTİ ---
            
            notesList.innerHTML += noteHtml;
        });

    } catch (error) {
        console.error("Notlar çekilirken hata oluştu:", error);
    }
}