const paymentOptions = document.querySelectorAll('input[name="payment"]');
const submitButton = document.getElementById("submitOrder");
const qrModal = document.getElementById("qrModal");
const qrImage = document.getElementById("qrImage");
const closeModal = document.getElementById("closeModal");
const doneButton = document.getElementById("donePayment");
let qrImages = {};
async function loadQRImages() {
    try {
        const res = await fetch("https://shopping-production-48b2.up.railway.app/api/qr-images");
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

            // الحل الصحيح: لا تضف رابط السيرفر يدوياً لأن qrImages تحتوي عليه بالفعل
            if (this.value === "shamcash") {
                qrImage.src = qrImages.shamcash_qr; // الرابط كامل جاهز
            }

            if (this.value === "usdt") {
                qrImage.src = qrImages.usdt_qr; // الرابط كامل جاهز
            }
        }
    });
});

closeModal.addEventListener("click", function () {
    qrModal.style.display = "none";
});
doneButton.addEventListener("click", async function () {

    const address = localStorage.getItem("checkout_address");

    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                shipping_address: address,
                is_paid: true   // هنا نجعلها 1
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

/////create 
const API_URL = "https://shopping-production-48b2.up.railway.app/api";
const token = localStorage.getItem("token");

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
};

submitButton.addEventListener("click", createOrder);

async function createOrder() {
    const address = localStorage.getItem("checkout_address");
    const selectedPayment = document.querySelector('input[name="payment"]:checked');

    if (!selectedPayment) {
        alert("يرجى اختيار طريقة الدفع");
        return;
    }

    try {
        // 1. جلب السلة أولاً للتأكد من وجود منتجات
        const cartRes = await fetch(`${API_URL}/cart`, { method: "GET", headers });
        const cartData = await cartRes.json();

        if (!cartData.cart_item || cartData.cart_item.length === 0) {
            alert("السلة فارغة!");
            return;
        }

        // 2. إرسال الطلب مع تفاصيل المنتجات والسعر الإجمالي
        const res = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                shipping_address: address,
                is_paid: selectedPayment.value !== "cash", // true إذا كان دفع إلكتروني
                payment_method: selectedPayment.value,
                total_price: cartData.total_price, // إرسال السعر الإجمالي
                items: cartData.cart_item         // إرسال المنتجات
            })
        });

        if (!res.ok) {
            const errorMsg = await res.json();
            console.error("فشل السيرفر:", errorMsg);
            throw new Error();
        }

        alert("تم إنشاء الطلب بنجاح");
        localStorage.removeItem("checkout_address");
        window.location.href = "/Home/client_dashboard.html";

    } catch (error) {
        console.error(error);
        alert("حدث خطأ، تأكد من أن جميع بيانات المنتج مكتملة في الباك إند");
    }
}
loadQRImages();