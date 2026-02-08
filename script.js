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
        this.mobileButtons = document.getElementById('mobileButtons');
        this.androidBatchBtn = document.getElementById('androidBatchBtn');
        this.iosBatchBtn = document.getElementById('iosBatchBtn');
        this.previewSection = document.getElementById('previewSection');
        this.imageGrid = document.getElementById('imageGrid');
        this.countElement = document.querySelector('.count');
        this.clearBtn = document.getElementById('clearBtn');
        this.convertBtn = document.getElementById('convertBtn');
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
    }

    bindEvents() {
        this.uploadArea.addEventListener('click', () => this.handleUploadClick());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.iosFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.androidFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 移动端专用按钮
        this.androidBatchBtn.addEventListener('click', () => this.handleAndroidBatch());
        this.iosBatchBtn.addEventListener('click', () => this.handleIOSBatch());
        
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
            this.mobileButtons.style.display = 'block';
        }
    }

    handleUploadClick() {
        if (this.isIOS()) {
            // iOS特殊处理：移除并重新创建input以确保多选生效
            this.setupIOSFileInput();
            this.iosFileInput.click();
        } else if (this.isAndroid()) {
            // 安卓特殊处理：确保多选属性正确设置
            this.setupAndroidFileInput();
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

    tryMultipleApproaches() {
        // 方法1：标准文件输入器
        const input1 = document.createElement('input');
        input1.type = 'file';
        input1.accept = 'image/*';
        input1.multiple = true;
        input1.style.display = 'none';
        document.body.appendChild(input1);
        
        input1.addEventListener('change', (e) => {
            this.handleFileSelect(e);
            document.body.removeChild(input1);
        });
        
        input1.addEventListener('click', () => {
            console.log('尝试方法1：标准文件输入器');
        });
        
        // 方法2：带capture属性的输入器
        const input2 = document.createElement('input');
        input2.type = 'file';
        input2.accept = 'image/*';
        input2.multiple = true;
        input2.capture = 'environment';
        input2.style.display = 'none';
        
        input2.addEventListener('change', (e) => {
            this.handleFileSelect(e);
            document.body.removeChild(input2);
        });
        
        // 方法3：只设置accept和multiple
        const input3 = document.createElement('input');
        input3.type = 'file';
        input3.accept = 'image/jpeg,image/png,image/gif';
        input3.multiple = true;
        input3.style.display = 'none';
        
        input3.addEventListener('change', (e) => {
            this.handleFileSelect(e);
            document.body.removeChild(input3);
        });
        
        // 显示用户选择对话框
        this.showFileChooserOptions([
            { label: '方法1：标准文件选择器', action: () => input1.click() },
            { label: '方法2：相机+相册选择器', action: () => input2.click() },
            { label: '方法3：仅图片格式选择器', action: () => input3.click() }
        ]);
    }

    showFileChooserOptions(options) {
        // 创建选择对话框
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            width: 90%;
        `;
        
        dialog.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #333;">选择上传方式</h3>
            ${options.map((opt, index) => `
                <button style="
                    display: block;
                    width: 100%;
                    padding: 12px;
                    margin: 5px 0;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                " data-index="${index}">${opt.label}</button>
            `).join('')}
            <button style="
                display: block;
                width: 100%;
                padding: 12px;
                margin: 10px 0 0 0;
                background: #f5f5f5;
                color: #666;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            " onclick="this.parentElement.remove()">取消</button>
        `;
        
        document.body.appendChild(dialog);
        
        // 绑定事件
        dialog.querySelectorAll('[data-index]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                options[index].action();
                dialog.remove();
            });
        });
        
        // 点击外部关闭
        setTimeout(() => {
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    dialog.remove();
                }
            });
        }, 100);
    }

    handleAndroidBatch() {
        // 尝试多种方法
        this.tryMultipleApproaches();
    }

    handleIOSBatch() {
        this.setupIOSFileInput();
        this.iosFileInput.click();
    }

    handleFileSelect(event) {
        const files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
        
        console.log('选择的文件数量:', files.length); // 调试信息
        
        Array.from(files).forEach((file, index) => {
            console.log(`文件 ${index + 1}:`, file.name); // 调试信息
            if (file.type.startsWith('image/')) {
                this.processImage(file);
            }
        });
        
        // 清空input以便可以重复选择相同文件
        if (event.target) {
            event.target.value = '';
        }
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
        
        // 更新计数
        if (this.countElement) {
            this.countElement.textContent = `(${this.uploadedImages.length})`;
        }
        
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
        if (this.progressText) {
            this.progressText.textContent = Math.round(percentage) + '%';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageToPDFConverter();
});