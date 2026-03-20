// ✅ 1. عرّف المتغيرات أولاً
const API_URL = "https://shopping-production-48b2.up.railway.app/api";
const token = localStorage.getItem("token");
const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
};

// ✅ 2. باقي المتغيرات
const paymentOptions = document.querySelectorAll('input[name="payment"]');
const submitButton = document.getElementById("submitOrder");
const qrModal = document.getElementById("qrModal");
const qrImage = document.getElementById("qrImage");
const closeModal = document.getElementById("closeModal");
const doneButton = document.getElementById("donePayment");
let qrImages = {};

async function loadQRImages() {
    try {
        const res = await fetch(`${API_URL}/qr-images`);
        const data = await res.json();
        qrImages = data;
        console.log("QR Loaded:", qrImages);
    } catch (error) {
        console.error("فشل تحميل صور QR", error);
    }
}

paymentOptions.forEach(option => {
    option.addEventListener("change", function () {
        if (this.value === "cash") {
            submitButton.classList.remove("hidden");
            qrModal.style.display = "none";
        } else {
            submitButton.classList.add("hidden");
            qrModal.style.display = "flex";
            if (this.value === "shamcash") qrImage.src = qrImages.shamcash_qr;
            if (this.value === "usdt") qrImage.src = qrImages.usdt_qr;
        }
    });
});

closeModal.addEventListener("click", function () {
    qrModal.style.display = "none";
});

// ✅ 3. doneButton بعد تعريف API_URL و headers
doneButton.addEventListener("click", async function () {
    const address = localStorage.getItem("checkout_address");

    if (!address || !address.trim()) {
        alert("لم يتم العثور على العنوان، يرجى العودة للسلة");
        window.location.href = "/Cart/cart.html";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                shipping_address: address,
                is_paid: true
            })
        });

        if (!res.ok) throw new Error("فشل إنشاء الطلب");

        alert("تم الدفع وإنشاء الطلب بنجاح");
        localStorage.removeItem("checkout_address");
        window.location.href = "/Home/client_dashboard.html";

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء تأكيد الدفع");
    }
});

submitButton.addEventListener("click", createOrder);

async function createOrder() {
    const address = localStorage.getItem("checkout_address");

    if (!address || !address.trim()) {
        alert("لم يتم العثور على العنوان، يرجى العودة للسلة");
        window.location.href = "/Cart/cart.html";
        return;
    }

    const selectedPayment = document.querySelector('input[name="payment"]:checked');

    if (!selectedPayment) {
        alert("يرجى اختيار طريقة الدفع");
        return;
    }

    if (selectedPayment.value !== "cash") {
        alert("يرجى إتمام الدفع الإلكتروني أولاً");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                shipping_address: address,
                is_paid: false
            })
        });

        if (!res.ok) throw new Error("فشل إنشاء الطلب");

        alert("تم إنشاء الطلب بنجاح");
        localStorage.removeItem("checkout_address");
        window.location.href = "/Home/client_dashboard.html";

    } catch (error) {
        console.error(error);
        alert("حدث خطأ");
    }
}

loadQRImages();