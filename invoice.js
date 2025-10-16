import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDAi6YT-xtoNx7chLmcRWxZeS21aSz_3aY",
    authDomain: "sandali-201ca.firebaseapp.com",
    databaseURL: "https://sandali-201ca-default-rtdb.firebaseio.com",
    projectId: "sandali-201ca",
    storageBucket: "sandali-201ca.firebasestorage.app",
    messagingSenderId: "922702431327",
    appId: "1:922702431327:web:53a5a2c59f646c555907ea",
    measurementId: "G-7WFSHYD0NL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const customersRef = ref(database, 'customers');
const logoUrlRef = ref(database, 'companyInfo/logoUrl');


// --- DOM Element Selection ---
const fromNameInput = document.getElementById('from-name');
const fromAddressInput = document.getElementById('from-address');
const fromPhoneInput = document.getElementById('from-phone');
const fromEmailInput = document.getElementById('from-email');
const fromWebsiteInput = document.getElementById('from-website');
const logoUploadInput = document.getElementById('logo-upload');
const issueDateInput = document.getElementById('issue-date');
const dueDateInput = document.getElementById('due-date');
const customerSelect = document.getElementById('customer-select');
const customerNameInput = document.getElementById('customer-name');
const customerAddressInput = document.getElementById('customer-address');
const itemsEditor = document.getElementById('items-editor');
const addItemBtn = document.getElementById('add-item-btn');
const taxRateInput = document.getElementById('tax-rate');
const termsInput = document.getElementById('terms');
const downloadPdfBtn = document.getElementById('download-pdf-btn');
const downloadPngBtn = document.getElementById('download-png-btn');
const bankNameInput = document.getElementById('bank-name'); 
const accountNumberInput = document.getElementById('account-number'); 

// Preview Elements
const previewLogo = document.getElementById('preview-logo');
const previewFromName = document.querySelector('.invoice-title');
const previewFromAddress = document.getElementById('preview-from-address');
const previewFromPhone = document.getElementById('preview-from-phone');
const previewToName = document.getElementById('preview-to-name');
const previewToAddress = document.getElementById('preview-to-address');
const previewInvoiceNumber = document.getElementById('preview-invoice-number');
const previewIssueDate = document.getElementById('preview-issue-date');
const previewDueDate = document.getElementById('preview-due-date');
const previewItemsBody = document.getElementById('preview-items-body');
const previewSubtotal = document.getElementById('preview-subtotal');
const previewTaxRate = document.getElementById('preview-tax-rate');
const previewTaxAmount = document.getElementById('preview-tax-amount');
const previewTotal = document.getElementById('preview-total');
const previewTerms = document.getElementById('preview-terms');
const previewCompanyEmail = document.getElementById('preview-company-email');
const previewCompanyWebsite = document.getElementById('preview-company-website');
const previewCompanyPhone = document.getElementById('preview-company-phone');
const previewBankName = document.getElementById('preview-bank-name'); 
const previewAccountNumber = document.getElementById('preview-account-number'); 

// --- State Management ---
let items = [];
let customerList = {};

// --- Functions ---
function updatePreview() {
    previewFromName.textContent = fromNameInput.value || "Walk in - style";
    previewFromAddress.textContent = fromAddressInput.value || "123 Main St, City, Country";
    previewFromPhone.textContent = fromPhoneInput.value || "(+94) 77-123-4567";
    previewInvoiceNumber.textContent = generateInvoiceNumber();
    previewIssueDate.textContent = issueDateInput.value || "YYYY-MM-DD";
    previewDueDate.textContent = dueDateInput.value || "YYYY-MM-DD";
    previewToName.textContent = customerNameInput.value || "Client Name";
    previewToAddress.textContent = customerAddressInput.value || "Client Address, City, Country";
    renderItems();
    calculateTotals();
    previewTaxRate.textContent = taxRateInput.value || "0";
    previewTerms.textContent = termsInput.value || "Payment is due within 30 days.";
    previewCompanyEmail.textContent = fromEmailInput.value || "info@walkinstyle.com";
    previewCompanyWebsite.textContent = fromWebsiteInput.value || "www.walkinstyle.com";
    previewCompanyPhone.textContent = fromPhoneInput.value || "(+94) 77-123-4567";
    previewBankName.textContent = bankNameInput.value || "Not specified";
    previewAccountNumber.textContent = accountNumberInput.value || "Not specified";
}

function renderItems() {
    previewItemsBody.innerHTML = '';
    if (items.length === 0) {
        previewItemsBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-400">No items added.</td></tr>`;
        return;
    }
    items.forEach(item => {
        const total = (item.qty || 0) * (item.price || 0);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.description || 'Item Description'}</td>
            <td class="text-right">${item.qty || 0}</td>
            <td class="text-right">Rs ${Number(item.price || 0).toFixed(2)}</td>
            <td class="text-right">Rs ${total.toFixed(2)}</td>
        `;
        previewItemsBody.appendChild(row);
    });
}

function calculateTotals() {
    const subtotal = items.reduce((sum, item) => sum + (item.qty || 0) * (item.price || 0), 0);
    const taxRate = parseFloat(taxRateInput.value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    previewSubtotal.textContent = `Rs ${subtotal.toFixed(2)}`;
    previewTaxAmount.textContent = `Rs ${taxAmount.toFixed(2)}`;
    previewTotal.textContent = `Rs ${total.toFixed(2)}`;
}

function createItemRow(initialItem = { description: '', qty: 1, price: 0.00 }) {
    const itemIndex = items.length;
    items.push({ ...initialItem });
    const itemDiv = document.createElement('div');
    itemDiv.className = 'grid grid-cols-[1fr_80px_100px_auto] gap-2 items-center';
    itemDiv.innerHTML = `
        <input type="text" placeholder="Description" value="${initialItem.description}" class="item-input item-description">
        <input type="number" placeholder="Qty" value="${initialItem.qty}" min="1" class="item-input text-right item-qty">
        <input type="number" placeholder="Price" value="${initialItem.price.toFixed(2)}" min="0" step="0.01" class="item-input text-right item-price">
        <button class="remove-item-btn text-red-500 hover:text-red-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 transition">
            <i class="fas fa-times"></i>
        </button>
    `;
    itemsEditor.appendChild(itemDiv);
    itemDiv.addEventListener('input', () => {
        const desc = itemDiv.querySelector('.item-description').value;
        const qty = parseInt(itemDiv.querySelector('.item-qty').value, 10);
        const price = parseFloat(itemDiv.querySelector('.item-price').value);
        items[itemIndex] = { description: desc, qty: qty, price: price };
        updatePreview();
    });
    itemDiv.querySelector('.remove-item-btn').addEventListener('click', () => {
        items.splice(itemIndex, 1);
        itemDiv.remove();
        rebuildItemEditor();
        updatePreview();
    });
}

function rebuildItemEditor() {
    const currentItems = [...items];
    itemsEditor.innerHTML = '';
    items = [];
    currentItems.forEach(item => createItemRow(item));
}

function generateInvoiceNumber() {
    const today = new Date();
    const year = today.getFullYear().toString().slice(2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    return `INV-${year}${month}-${Math.floor(Math.random() * 9000) + 1000}`;
}

// --- Event Listeners ---
document.getElementById('invoice-controls').addEventListener('input', updatePreview);

logoUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        previewLogo.src = event.target.result;
        previewLogo.style.display = 'block';
    };
    reader.readAsDataURL(file);
    const apiKey = '6761af38c759aab4d8e7fc9c38d65e30';
    const formData = new FormData();
    formData.append('image', file);
    fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            const imageUrl = result.data.url;
            previewLogo.src = imageUrl;
            set(logoUrlRef, imageUrl).catch(error => console.error('Error saving URL to Firebase:', error));
        } else {
            console.error('ImgBB upload failed:', result);
        }
    })
    .catch(error => console.error('Error uploading image:', error));
});

addItemBtn.addEventListener('click', () => {
    createItemRow();
    updatePreview();
});

downloadPdfBtn.addEventListener('click', () => {
    const invoiceElement = document.getElementById('invoice-preview');
    if (typeof html2pdf === 'undefined') {
        alert("Error: PDF generation library is not loaded.");
        return;
    }

    const originalShadow = invoiceElement.style.boxShadow;
    invoiceElement.style.boxShadow = 'none';

    const options = {
        margin: 0,
        filename: `invoice-${generateInvoiceNumber()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    const worker = html2pdf().set(options).from(invoiceElement);
    
    worker.save().then(() => {
        invoiceElement.style.boxShadow = originalShadow;
    }).catch(err => {
        invoiceElement.style.boxShadow = originalShadow;
        console.error("Error during PDF generation:", err);
        alert("Sorry, an error occurred while generating the PDF.");
    });
});


downloadPngBtn.addEventListener('click', () => {
    const invoiceElement = document.getElementById('invoice-preview');
    if (typeof html2canvas === 'undefined') {
        alert("Error: Image generation library is not loaded.");
        return;
    }
    
    const originalShadow = invoiceElement.style.boxShadow;
    invoiceElement.style.boxShadow = 'none';

    html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true
    }).then(canvas => {
        invoiceElement.style.boxShadow = originalShadow; 
        canvas.toBlob(function(blob) {
            if (blob) {
                const filename = `invoice-${generateInvoiceNumber()}.png`;
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                 alert('Could not generate the invoice image. Please try again.');
            }
        }, 'image/png');
    }).catch(err => {
        invoiceElement.style.boxShadow = originalShadow;
        console.error('Error generating image with html2canvas:', err);
        alert('An error occurred while creating the invoice image.');
    });
});

customerSelect.addEventListener('change', (e) => {
    const selectedKey = e.target.value;
    if (selectedKey && customerList[selectedKey]) {
        const customer = customerList[selectedKey];
        customerNameInput.value = customer.name;
        customerAddressInput.value = customer.address;
        updatePreview();
    }
});

onValue(customersRef, (snapshot) => {
    customerSelect.innerHTML = '<option value="">-- Select Customer --</option>';
    const data = snapshot.val();
    if (data) {
        customerList = data;
        Object.keys(data).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = data[key].name;
            customerSelect.appendChild(option);
        });
    }
});

function setupPage() {
    onValue(logoUrlRef, (snapshot) => {
        if (snapshot.exists()) {
            const savedLogoUrl = snapshot.val();
            previewLogo.src = savedLogoUrl;
            previewLogo.style.display = 'block';
        } else {
            previewLogo.style.display = 'none';
        }
    });

    issueDateInput.valueAsDate = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    dueDateInput.valueAsDate = tomorrow;

    fromNameInput.value = 'Walk in - style';
    fromEmailInput.value = 'info@walkinstyle.com';
    fromWebsiteInput.value = 'www.walkinstyle.com';
    fromPhoneInput.value = '(+94) 77-123-4567';
    fromAddressInput.value = '123 Fashion Ave, Colombo';

    createItemRow({ description: 'Elegant Evening Gown', qty: 1, price: 15000.00 });
    updatePreview();
}

setupPage();