class ImageToPDFConverter {
    constructor() {
        this.uploadedImages = [];
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.iosFileInput = document.getElementById('iosFileInput');
        this.androidFileInput = document.getElementById('androidFileInput');
        this.previewSection = document.getElementById('previewSection');
        this.imageGrid = document.getElementById('imageGrid');
        this.clearBtn = document.getElementById('clearBtn');
        this.convertBtn = document.getElementById('convertBtn');
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
    }

    bindEvents() {
        this.uploadArea.addEventListener('click', () => this.handleUploadClick());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.iosFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.androidFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.clearBtn.addEventListener('click', () => this.clearImages());
        this.convertBtn.addEventListener('click', () => this.convertToPDF());

        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            this.handleFileSelect(e);
        });

        if (this.isMobile()) {
            const mobileTip = document.querySelector('.mobile-tip');
            if (mobileTip) {
                mobileTip.style.display = 'block';
            }
        }
    }

    handleUploadClick() {
        if (this.isIOS()) {
            // iOS特殊处理：移除并重新创建input以确保多选生效
            this.setupIOSFileInput();
            this.iosFileInput.click();
        } else if (this.isAndroid()) {
            this.androidFileInput.click();
        } else {
            this.fileInput.click();
        }
    }

    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }

    isAndroid() {
        return /Android/.test(navigator.userAgent);
    }

    isMobile() {
        return this.isIOS() || this.isAndroid();
    }

    setupIOSFileInput() {
        // 重新创建iOS文件输入器确保多选功能
        if (this.iosFileInput) {
            const newInput = document.createElement('input');
            newInput.type = 'file';
            newInput.accept = 'image/*';
            newInput.multiple = true;
            newInput.id = 'iosFileInput';
            newInput.style.display = 'none';
            
            this.iosFileInput.parentNode.replaceChild(newInput, this.iosFileInput);
            this.iosFileInput = newInput;
            
            this.iosFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
    }

    handleFileSelect(event) {
        const files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                this.processImage(file);
            }
        });
    }

    processImage(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const imageData = {
                file: file,
                url: e.target.result,
                name: file.name
            };
            
            this.uploadedImages.push(imageData);
            this.renderImages();
        };
        
        reader.readAsDataURL(file);
    }

    renderImages() {
        this.imageGrid.innerHTML = '';
        
        this.uploadedImages.forEach((image, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            imageItem.innerHTML = `
                <img src="${image.url}" alt="${image.name}">
                <button class="remove-btn" data-index="${index}">×</button>
            `;
            
            const removeBtn = imageItem.querySelector('.remove-btn');
            removeBtn.addEventListener('click', () => this.removeImage(index));
            
            this.imageGrid.appendChild(imageItem);
        });
        
        if (this.uploadedImages.length > 0) {
            this.previewSection.style.display = 'block';
        } else {
            this.previewSection.style.display = 'none';
        }
    }

    removeImage(index) {
        this.uploadedImages.splice(index, 1);
        this.renderImages();
    }

    clearImages() {
        this.uploadedImages = [];
        this.renderImages();
        this.fileInput.value = '';
        if (this.iosFileInput) this.iosFileInput.value = '';
        if (this.androidFileInput) this.androidFileInput.value = '';
    }

    async convertToPDF() {
        if (this.uploadedImages.length === 0) {
            alert('请先上传图片');
            return;
        }

        this.showProgress();
        
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            
            for (let i = 0; i < this.uploadedImages.length; i++) {
                const image = this.uploadedImages[i];
                
                if (i > 0) {
                    pdf.addPage();
                }
                
                await this.addImageToPDF(pdf, image.url);
                
                this.updateProgress((i + 1) / this.uploadedImages.length * 100);
            }
            
            pdf.save('converted.pdf');
            this.hideProgress();
            
        } catch (error) {
            console.error('PDF转换失败:', error);
            alert('PDF转换失败，请重试');
            this.hideProgress();
        }
    }

    async addImageToPDF(pdf, imageUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                const imgWidth = img.width;
                const imgHeight = img.height;
                
                const widthRatio = pdfWidth / imgWidth;
                const heightRatio = pdfHeight / imgHeight;
                const ratio = Math.min(widthRatio, heightRatio);
                
                const scaledWidth = imgWidth * ratio;
                const scaledHeight = imgHeight * ratio;
                
                const x = (pdfWidth - scaledWidth) / 2;
                const y = (pdfHeight - scaledHeight) / 2;
                
                pdf.addImage(imageUrl, 'JPEG', x, y, scaledWidth, scaledHeight);
                resolve();
            };
            img.src = imageUrl;
        });
    }

    showProgress() {
        this.progressSection.style.display = 'block';
        this.progressFill.style.width = '0%';
    }

    hideProgress() {
        this.progressSection.style.display = 'none';
    }

    updateProgress(percentage) {
        this.progressFill.style.width = percentage + '%';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageToPDFConverter();
});