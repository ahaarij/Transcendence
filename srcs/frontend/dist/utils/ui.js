export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `
        flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 border-l-4 
        ${type === 'success' ? 'border-green-500' : 'border-red-500'}
        transform transition-all duration-300 translate-x-full opacity-0
    `;
    const icon = type === 'success'
        ? `<div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
            </svg>
           </div>`
        : `<div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200">
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
            </svg>
           </div>`;
    toast.innerHTML = `
        ${icon}
        <div class="ml-3 text-sm font-normal">${message}</div>
        <button type="button" class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Close">
            <span class="sr-only">Close</span>
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
        </button>
    `;
    // Close button logic
    toast.querySelector('button')?.addEventListener('click', () => {
        removeToast(toast);
    });
    container.appendChild(toast);
    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    });
    // Auto remove
    setTimeout(() => {
        removeToast(toast);
    }, 3000);
}
function removeToast(toast) {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
        toast.remove();
    }, 300);
}
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-5 right-5 z-50 flex flex-col gap-2';
    document.body.appendChild(container);
    return container;
}
export function showInputModal(title, placeholder, onConfirm) {
    const modalId = 'input-modal';
    const existingModal = document.getElementById(modalId);
    if (existingModal)
        existingModal.remove();
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 transition-opacity duration-300';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm transform scale-95 transition-transform duration-300">
            <h3 class="text-xl font-bold mb-4 text-gray-800">${title}</h3>
            <input type="text" id="modalInput" class="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="${placeholder}" />
            <div class="flex justify-end gap-2">
                <button id="modalCancel" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button id="modalConfirm" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Confirm</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    // Animate in
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div')?.classList.remove('scale-95');
        modal.querySelector('div')?.classList.add('scale-100');
    });
    const input = modal.querySelector('#modalInput');
    const cancelBtn = modal.querySelector('#modalCancel');
    const confirmBtn = modal.querySelector('#modalConfirm');
    const closeModal = () => {
        modal.classList.add('opacity-0');
        modal.querySelector('div')?.classList.remove('scale-100');
        modal.querySelector('div')?.classList.add('scale-95');
        setTimeout(() => modal.remove(), 300);
    };
    cancelBtn?.addEventListener('click', closeModal);
    confirmBtn?.addEventListener('click', () => {
        const value = input.value.trim();
        if (value) {
            onConfirm(value);
            closeModal();
        }
        else {
            input.classList.add('border-red-500');
            input.focus();
        }
    });
    input.focus();
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter')
            confirmBtn?.dispatchEvent(new Event('click'));
    });
}
