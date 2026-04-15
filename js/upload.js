// 图片上传管理 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 初始化变量
    let selectedFiles = [];
    let uploadedImages = loadUploadedImages();

    // 初始化组件
    initUploadArea();
    initPreview();
    initUploadButton();
    initClearButton();
    initSearch();
    initFilterTabs();
    initExportButton();
    initClearAllButton();
    renderImageGallery();

    // 初始化模态框事件
    initModalEvents();
});

/**
 * 从localStorage加载已上传的图片
 */
function loadUploadedImages() {
    try {
        const images = localStorage.getItem('uploadedImages');
        return images ? JSON.parse(images) : [];
    } catch (error) {
        console.error('加载图片数据失败:', error);
        return [];
    }
}

/**
 * 保存图片数据到localStorage
 */
function saveUploadedImages(images) {
    try {
        localStorage.setItem('uploadedImages', JSON.stringify(images));
        return true;
    } catch (error) {
        console.error('保存图片数据失败:', error);
        alert('保存图片数据失败，可能是存储空间不足。');
        return false;
    }
}

/**
 * 初始化上传区域（拖放和文件选择）
 */
function initUploadArea() {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');

    // 点击上传区域触发文件选择
    dropArea.addEventListener('click', function(e) {
        if (e.target !== fileInput && e.target.className !== 'browse-btn') {
            fileInput.click();
        }
    });

    // 文件选择变化
    fileInput.addEventListener('change', function(e) {
        handleFiles(e.target.files);
    });

    // 拖放事件
    dropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });

    dropArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
    });

    dropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });
}

/**
 * 处理选择的文件
 */
function handleFiles(files) {
    const validFiles = Array.from(files).filter(file => {
        // 检查文件类型
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert(`文件 "${file.name}" 不是支持的图片格式。\n支持格式: JPG, PNG, GIF, WebP`);
            return false;
        }

        // 检查文件大小（2MB限制）
        if (file.size > 2 * 1024 * 1024) {
            alert(`文件 "${file.name}" 超过2MB大小限制。`);
            return false;
        }

        return true;
    });

    if (validFiles.length === 0) return;

    // 添加到选中的文件列表
    selectedFiles.push(...validFiles);
    updatePreview();
    updateUploadButton();
}

/**
 * 更新预览区域
 */
function updatePreview() {
    const previewGrid = document.getElementById('preview-grid');

    // 清空现有预览
    previewGrid.innerHTML = '';

    if (selectedFiles.length === 0) {
        previewGrid.innerHTML = `
            <div class="empty-preview">
                <i class="fas fa-image"></i>
                <p>暂无图片</p>
            </div>
        `;
        return;
    }

    // 为每个文件创建预览
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = function(e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" class="preview-img" alt="${file.name}">
                <div class="preview-info">
                    <div class="preview-name">${file.name}</div>
                    <div class="preview-size">${formatFileSize(file.size)}</div>
                </div>
                <button class="remove-preview" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;

            previewGrid.appendChild(previewItem);

            // 添加移除按钮事件
            const removeBtn = previewItem.querySelector('.remove-preview');
            removeBtn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                selectedFiles.splice(idx, 1);
                updatePreview();
                updateUploadButton();
            });
        };

        reader.readAsDataURL(file);
    });
}

/**
 * 更新上传按钮状态
 */
function updateUploadButton() {
    const uploadBtn = document.getElementById('upload-btn');
    uploadBtn.disabled = selectedFiles.length === 0;
}

/**
 * 初始化上传按钮事件
 */
function initUploadButton() {
    const uploadBtn = document.getElementById('upload-btn');

    uploadBtn.addEventListener('click', async function() {
        if (selectedFiles.length === 0) return;

        // 显示进度模态框
        showProgressModal(selectedFiles.length);

        let uploadedCount = 0;
        const category = document.getElementById('category-select').value;
        const compress = document.getElementById('compress-checkbox').checked;
        const watermark = document.getElementById('watermark-checkbox').checked;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            await processAndUploadFile(file, category, compress, watermark, i);
            uploadedCount++;

            // 更新进度
            updateProgress(uploadedCount, selectedFiles.length, file.name);
        }

        // 完成上传
        setTimeout(() => {
            hideProgressModal();
            alert(`成功上传 ${uploadedCount} 张图片！`);

            // 清空选中的文件
            selectedFiles = [];
            updatePreview();
            updateUploadButton();

            // 重新加载和渲染图片库
            uploadedImages = loadUploadedImages();
            renderImageGallery();
        }, 1000);
    });
}

/**
 * 处理并上传单个文件
 */
async function processAndUploadFile(file, category, compress, watermark, index) {
    return new Promise((resolve) => {
        // 模拟处理时间
        setTimeout(async () => {
            try {
                // 读取文件为DataURL
                const dataUrl = await readFileAsDataURL(file);

                // 压缩图片（如果启用）
                let processedDataUrl = dataUrl;
                if (compress) {
                    processedDataUrl = await compressImage(dataUrl, 1200);
                }

                // 添加水印（如果启用）
                if (watermark) {
                    processedDataUrl = await addWatermark(processedDataUrl);
                }

                // 生成文件名
                const filenameInput = document.getElementById('filename-input');
                let filename = filenameInput.value.trim();
                if (!filename) {
                    filename = file.name.replace(/\.[^/.]+$/, ""); // 移除扩展名
                }

                // 确保文件名唯一
                let finalFilename = `${filename}.jpg`;
                let counter = 1;
                while (uploadedImages.some(img => img.filename === finalFilename && img.category === category)) {
                    finalFilename = `${filename}_${counter}.jpg`;
                    counter++;
                }

                // 创建图片对象
                const imageData = {
                    id: Date.now() + index,
                    filename: finalFilename,
                    category: category,
                    dataUrl: processedDataUrl,
                    size: processedDataUrl.length * 3 / 4, // 近似估计
                    uploadedAt: new Date().toISOString(),
                    originalName: file.name
                };

                // 保存到localStorage
                uploadedImages.push(imageData);
                saveUploadedImages(uploadedImages);

                resolve();
            } catch (error) {
                console.error('处理文件失败:', error);
                resolve(); // 继续处理下一个文件
            }
        }, 500);
    });
}

/**
 * 将文件读取为DataURL
 */
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * 压缩图片
 */
function compressImage(dataUrl, maxWidth) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round(height * maxWidth / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = dataUrl;
    });
}

/**
 * 添加水印
 */
function addWatermark(dataUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // 添加水印文本
            ctx.font = '20px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.textAlign = 'center';
            ctx.fillText('智算竞赛', canvas.width / 2, canvas.height - 30);

            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = dataUrl;
    });
}

/**
 * 初始化清除预览按钮
 */
function initClearButton() {
    const clearBtn = document.getElementById('clear-btn');

    clearBtn.addEventListener('click', function() {
        if (selectedFiles.length > 0) {
            if (confirm('确定要清空所有预览图片吗？')) {
                selectedFiles = [];
                updatePreview();
                updateUploadButton();
            }
        }
    });
}

/**
 * 渲染图片库
 */
function renderImageGallery(filter = 'all', searchQuery = '') {
    const imagesGrid = document.getElementById('images-grid');

    // 过滤图片
    let filteredImages = uploadedImages;

    if (filter !== 'all') {
        filteredImages = filteredImages.filter(img => img.category === filter);
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredImages = filteredImages.filter(img =>
            img.filename.toLowerCase().includes(query) ||
            img.originalName.toLowerCase().includes(query) ||
            img.category.toLowerCase().includes(query)
        );
    }

    // 清空网格
    imagesGrid.innerHTML = '';

    if (filteredImages.length === 0) {
        imagesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h4>暂无图片</h4>
                <p>${searchQuery ? '未找到匹配的图片' : '请先上传一些图片'}</p>
            </div>
        `;
        return;
    }

    // 按上传时间倒序排序
    filteredImages.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    // 添加图片项
    filteredImages.forEach(image => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <img src="${image.dataUrl}" class="image-thumb" alt="${image.filename}">
            <div class="image-info">
                <div class="image-name">${image.filename}</div>
                <div class="image-meta">
                    <span class="image-category">${image.category}</span>
                    <span class="image-size">${formatFileSize(image.size)}</span>
                </div>
            </div>
            <div class="image-actions">
                <button class="image-btn view" data-id="${image.id}">
                    <i class="fas fa-eye"></i> 查看
                </button>
                <button class="image-btn download" data-id="${image.id}">
                    <i class="fas fa-download"></i> 下载
                </button>
                <button class="image-btn delete" data-id="${image.id}">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
        `;

        imagesGrid.appendChild(imageItem);
    });

    // 添加按钮事件
    document.querySelectorAll('.image-btn.view').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            viewImage(id);
        });
    });

    document.querySelectorAll('.image-btn.download').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            downloadImage(id);
        });
    });

    document.querySelectorAll('.image-btn.delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteImage(id);
        });
    });
}

/**
 * 查看图片
 */
function viewImage(id) {
    const image = uploadedImages.find(img => img.id === id);
    if (!image) return;

    // 创建查看模态框
    const modalHtml = `
        <div class="modal" id="view-modal">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class="fas fa-image"></i> ${image.filename}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body" style="text-align: center;">
                    <img src="${image.dataUrl}" style="max-width: 100%; max-height: 400px; border-radius: 8px;">
                    <div style="margin-top: 20px; text-align: left;">
                        <p><strong>文件名：</strong> ${image.filename}</p>
                        <p><strong>原始名：</strong> ${image.originalName}</p>
                        <p><strong>分类：</strong> ${image.category}</p>
                        <p><strong>大小：</strong> ${formatFileSize(image.size)}</p>
                        <p><strong>上传时间：</strong> ${new Date(image.uploadedAt).toLocaleString()}</p>
                        <p><strong>使用路径：</strong> <code>images/${image.category}/${image.filename}</code></p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 添加关闭事件
    const modal = document.getElementById('view-modal');
    const closeBtn = modal.querySelector('.modal-close');

    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

/**
 * 下载图片
 */
function downloadImage(id) {
    const image = uploadedImages.find(img => img.id === id);
    if (!image) return;

    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = image.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * 删除图片
 */
function deleteImage(id) {
    if (!confirm('确定要删除这张图片吗？此操作不可撤销。')) {
        return;
    }

    const index = uploadedImages.findIndex(img => img.id === id);
    if (index !== -1) {
        uploadedImages.splice(index, 1);
        saveUploadedImages(uploadedImages);
        renderImageGallery();
    }
}

/**
 * 初始化搜索功能
 */
function initSearch() {
    const searchInput = document.getElementById('search-input');
    let searchTimeout;

    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
            renderImageGallery(activeFilter, this.value);
        }, 300);
    });
}

/**
 * 初始化筛选标签
 */
function initFilterTabs() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 更新按钮状态
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 应用筛选
            const filter = this.getAttribute('data-filter');
            const searchQuery = document.getElementById('search-input').value;
            renderImageGallery(filter, searchQuery);
        });
    });
}

/**
 * 初始化导出按钮
 */
function initExportButton() {
    const exportBtn = document.getElementById('export-btn');

    exportBtn.addEventListener('click', function() {
        if (uploadedImages.length === 0) {
            alert('暂无图片可导出。');
            return;
        }

        // 创建导出数据
        const exportData = {
            exportedAt: new Date().toISOString(),
            imageCount: uploadedImages.length,
            images: uploadedImages.map(img => ({
                filename: img.filename,
                category: img.category,
                originalName: img.originalName,
                size: img.size,
                uploadedAt: img.uploadedAt
                // 注意：不包含dataUrl以减小文件大小
            }))
        };

        // 创建下载链接
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `uploaded-images-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 100);
    });
}

/**
 * 初始化清空所有按钮
 */
function initClearAllButton() {
    const clearAllBtn = document.getElementById('clear-all-btn');

    clearAllBtn.addEventListener('click', function() {
        if (uploadedImages.length === 0) {
            alert('暂无图片可清空。');
            return;
        }

        if (confirm('确定要清空所有上传的图片吗？此操作不可撤销！')) {
            uploadedImages = [];
            saveUploadedImages(uploadedImages);
            renderImageGallery();
            alert('所有图片已清空。');
        }
    });
}

/**
 * 进度模态框相关函数
 */
function showProgressModal(totalFiles) {
    const modal = document.getElementById('progress-modal');
    modal.style.display = 'flex';

    // 初始化文件列表
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';
}

function updateProgress(current, total, filename) {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const fileList = document.getElementById('file-list');

    // 更新进度条
    const percentage = Math.round((current / total) * 100);
    progressFill.style.width = `${percentage}%`;

    // 更新文本
    progressText.textContent = `正在处理图片 ${current}/${total}: ${filename}`;

    // 添加文件项到列表
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
        <span class="file-name">${filename}</span>
        <span class="file-status ${current === total ? 'success' : 'processing'}">
            ${current === total ? '完成' : '处理中...'}
        </span>
    `;

    fileList.appendChild(fileItem);

    // 滚动到底部
    fileList.scrollTop = fileList.scrollHeight;
}

function hideProgressModal() {
    const modal = document.getElementById('progress-modal');
    modal.style.display = 'none';
}

/**
 * 初始化模态框事件
 */
function initModalEvents() {
    // 点击模态框外部关闭（如果需要）
    const modal = document.getElementById('progress-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                // 可以添加确认逻辑
            }
        });
    }
}

/**
 * 工具函数：格式化文件大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 工具函数：生成唯一ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}