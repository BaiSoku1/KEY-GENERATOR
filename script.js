class KeyGenerator {
    constructor() {
        this.currentKey = null;
        this.expiryDate = null;
        this.selectedDays = null;
        this.currentLinkType = 'linkvertise';
        this.customUrl = '';
        
        this.init();
    }
    
    init() {
        // DOM Elements
        this.generateBtn = document.getElementById('generateKeyBtn');
        this.resetBtn = document.getElementById('resetKeyBtn');
        this.copyBtn = document.getElementById('copyKeyBtn');
        this.keyDisplay = document.getElementById('generatedKey');
        this.expiryInfo = document.getElementById('expiryInfo');
        this.expiryDateSpan = document.getElementById('expiryDate');
        this.durationText = document.getElementById('durationText');
        this.visitTargetBtn = document.getElementById('visitTargetBtn');
        this.targetLinkText = document.getElementById('targetLinkText');
        this.customLinkInput = document.getElementById('customLinkInput');
        this.customUrlInput = document.getElementById('customUrl');
        
        // Link options
        this.linkOptions = document.querySelectorAll('.link-option');
        
        // Duration buttons
        this.durationBtns = document.querySelectorAll('.duration-btn');
        
        // Event listeners
        this.generateBtn.addEventListener('click', () => this.generateKey());
        this.resetBtn.addEventListener('click', () => this.resetKey());
        this.copyBtn.addEventListener('click', () => this.copyKey());
        this.visitTargetBtn.addEventListener('click', () => this.visitTarget());
        
        this.durationBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectDuration(e));
        });
        
        this.linkOptions.forEach(option => {
            option.addEventListener('click', (e) => this.selectLinkType(e));
        });
        
        this.customUrlInput.addEventListener('input', (e) => {
            this.customUrl = e.target.value;
            this.updateTargetLink();
        });
        
        // Load saved data if any
        this.loadSavedKey();
    }
    
    generateKey() {
        if (!this.selectedDays && this.selectedDays !== 0) {
            this.showToast('Please select a validity duration first!', 'error');
            return;
        }
        
        // Generate random key (format: XXXX-XXXX-XXXX-XXXX)
        const key = this.generateRandomKey();
        this.currentKey = key;
        
        // Set expiry date
        if (this.selectedDays === 0) {
            this.expiryDate = null;
            this.durationText.textContent = 'Permanent (Never expires)';
        } else {
            this.expiryDate = new Date();
            this.expiryDate.setDate(this.expiryDate.getDate() + this.selectedDays);
            this.durationText.textContent = `${this.selectedDays} day(s)`;
        }
        
        this.updateKeyDisplay();
        this.updateExpiryInfo();
        this.saveKeyToLocalStorage();
        this.enableCopyButton();
        this.enableVisitButton();
        
        this.showToast('Key generated successfully!', 'success');
    }
    
    generateRandomKey() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
        const segments = [];
        
        for (let i = 0; i < 4; i++) {
            let segment = '';
            for (let j = 0; j < 4; j++) {
                segment += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            segments.push(segment);
        }
        
        return segments.join('-');
    }
    
    resetKey() {
        this.currentKey = null;
        this.expiryDate = null;
        this.selectedDays = null;
        
        // Reset duration buttons
        this.durationBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        this.durationText.textContent = 'No duration selected';
        this.updateKeyDisplay(true);
        this.expiryInfo.style.display = 'none';
        this.disableCopyButton();
        this.disableVisitButton();
        
        localStorage.removeItem('generatedKey');
        localStorage.removeItem('expiryDate');
        localStorage.removeItem('selectedDays');
        
        this.showToast('Key has been reset', 'info');
    }
    
    copyKey() {
        if (!this.currentKey) return;
        
        navigator.clipboard.writeText(this.currentKey).then(() => {
            this.showToast('Key copied to clipboard!', 'success');
        }).catch(() => {
            this.showToast('Failed to copy key', 'error');
        });
    }
    
    selectDuration(event) {
        const btn = event.currentTarget;
        const days = parseInt(btn.dataset.days);
        
        this.durationBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        this.selectedDays = days;
        
        if (this.currentKey) {
            // Regenerate key with new duration if key exists
            this.generateKey();
        }
    }
    
    selectLinkType(event) {
        const option = event.currentTarget;
        const type = option.dataset.type;
        
        this.linkOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        this.currentLinkType = type;
        
        if (type === 'custom') {
            this.customLinkInput.style.display = 'block';
        } else {
            this.customLinkInput.style.display = 'none';
        }
        
        this.updateTargetLink();
    }
    
    updateTargetLink() {
        let linkText = '';
        
        switch(this.currentLinkType) {
            case 'linkvertise':
                linkText = 'Linkvertise Gateway';
                break;
            case 'shorte':
                linkText = 'Shorte.st Gateway';
                break;
            case 'custom':
                linkText = this.customUrl || 'Custom URL (not set)';
                break;
        }
        
        this.targetLinkText.textContent = linkText;
    }
    
    visitTarget() {
        if (!this.currentKey) {
            this.showToast('Please generate a key first!', 'error');
            return;
        }
        
        // Check if key is expired
        if (this.expiryDate && new Date() > new Date(this.expiryDate)) {
            this.showToast('Your key has expired! Please generate a new key.', 'error');
            return;
        }
        
        let targetUrl = '';
        
        switch(this.currentLinkType) {
            case 'linkvertise':
                targetUrl = 'https://linkvertise.com/';
                break;
            case 'shorte':
                targetUrl = 'https://shorte.st/';
                break;
            case 'custom':
                if (this.customUrl && this.customUrl.trim()) {
                    targetUrl = this.customUrl;
                } else {
                    this.showToast('Please enter a custom URL', 'error');
                    return;
                }
                break;
        }
        
        // Add key as parameter
        if (targetUrl.includes('?')) {
            targetUrl += `&key=${this.currentKey}`;
        } else {
            targetUrl += `?key=${this.currentKey}`;
        }
        
        window.open(targetUrl, '_blank');
        this.showToast('Redirecting to target link...', 'success');
    }
    
    updateKeyDisplay(reset = false) {
        if (reset || !this.currentKey) {
            this.keyDisplay.innerHTML = '<span class="placeholder">Click Generate to create key</span>';
        } else {
            this.keyDisplay.innerHTML = `<span style="font-family: monospace;">${this.currentKey}</span>`;
        }
    }
    
    updateExpiryInfo() {
        if (this.expiryDate) {
            this.expiryInfo.style.display = 'block';
            const formattedDate = this.expiryDate.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            this.expiryDateSpan.textContent = formattedDate;
        } else if (this.selectedDays === 0) {
            this.expiryInfo.style.display = 'block';
            this.expiryDateSpan.textContent = 'Permanent - Never expires';
        } else {
            this.expiryInfo.style.display = 'none';
        }
    }
    
    enableCopyButton() {
        this.copyBtn.disabled = false;
    }
    
    disableCopyButton() {
        this.copyBtn.disabled = true;
    }
    
    enableVisitButton() {
        this.visitTargetBtn.disabled = false;
    }
    
    disableVisitButton() {
        this.visitTargetBtn.disabled = true;
    }
    
    saveKeyToLocalStorage() {
        if (this.currentKey) {
            localStorage.setItem('generatedKey', this.currentKey);
            if (this.expiryDate) {
                localStorage.setItem('expiryDate', this.expiryDate.toISOString());
            } else {
                localStorage.removeItem('expiryDate');
            }
            localStorage.setItem('selectedDays', this.selectedDays);
        }
    }
    
    loadSavedKey() {
        const savedKey = localStorage.getItem('generatedKey');
        const savedExpiry = localStorage.getItem('expiryDate');
        const savedDays = localStorage.getItem('selectedDays');
        
        if (savedKey && savedExpiry) {
            const expiry = new Date(savedExpiry);
            if (expiry > new Date()) {
                this.currentKey = savedKey;
                this.expiryDate = expiry;
                this.selectedDays = parseInt(savedDays);
                
                this.updateKeyDisplay();
                this.updateExpiryInfo();
                this.enableCopyButton();
                this.enableVisitButton();
                
                // Set active duration button
                this.durationBtns.forEach(btn => {
                    if (parseInt(btn.dataset.days) === this.selectedDays) {
                        btn.classList.add('active');
                    }
                });
                
                if (this.selectedDays === 0) {
                    this.durationText.textContent = 'Permanent (Never expires)';
                } else {
                    this.durationText.textContent = `${this.selectedDays} day(s)`;
                }
            } else {
                localStorage.removeItem('generatedKey');
                localStorage.removeItem('expiryDate');
                localStorage.removeItem('selectedDays');
            }
        }
    }
    
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        const icon = toast.querySelector('i');
        
        toastMessage.textContent = message;
        
        // Change icon based on type
        icon.className = '';
        if (type === 'success') {
            icon.className = 'fas fa-check-circle';
            toast.style.background = '#28a745';
        } else if (type === 'error') {
            icon.className = 'fas fa-exclamation-circle';
            toast.style.background = '#dc3545';
        } else if (type === 'info') {
            icon.className = 'fas fa-info-circle';
            toast.style.background = '#17a2b8';
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new KeyGenerator();
});
