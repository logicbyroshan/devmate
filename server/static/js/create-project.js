document.addEventListener('DOMContentLoaded', function() {
    // Initialize TinyMCE for documentation field only
    if (typeof tinymce !== 'undefined') {
        tinymce.init({
            selector: '#id_documentation',
            height: 400,
            menubar: false,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | formatselect | bold italic underline strikethrough | ' +
                'alignleft aligncenter alignright alignjustify | ' +
                'bullist numlist outdent indent | link image | ' +
                'forecolor backcolor | code fullscreen | help',
            content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px; color: #e0e0e0; background-color: #1a1a1a; }',
            skin: 'oxide-dark',
            content_css: 'dark'
        });
    }

    /**
     * Automatic Client-Side Image Compression using HTML5 Canvas.
     * Prevents HTTP 413 Entity Too Large by optimizing high-res images
     * to crisp WebP/JPEG under ~500KB while preserving aspect ratio.
     */
    async function compressImageFile(file, maxDimension = 1920, quality = 0.85) {
        if (!file || !file.type || !file.type.startsWith('image/')) {
            return file;
        }
        if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
            return file; // Do not compress SVGs or animated GIFs
        }
        if (file.size < 350 * 1024) {
            return file; // Already lightweight (<350 KB)
        }

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;

                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = Math.round((height * maxDimension) / width);
                            width = maxDimension;
                        } else {
                            width = Math.round((width * maxDimension) / height);
                            height = maxDimension;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const outputMime = 'image/jpeg';
                    canvas.toBlob((blob) => {
                        if (!blob || blob.size >= file.size) {
                            resolve(file);
                            return;
                        }
                        const cleanName = (file.name || 'image').replace(/\.[^/.]+$/, '') + '.jpg';
                        const compressedFile = new File([blob], cleanName, {
                            type: outputMime,
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    }, outputMime, quality);
                };
                img.onerror = () => resolve(file);
                img.src = e.target.result;
            };
            reader.onerror = () => resolve(file);
            reader.readAsDataURL(file);
        });
    }

    // Global function to clear thumbnail
    window.clearThumbnail = function() {
        const thumbnailPreview = document.getElementById('thumbnail-preview');
        const thumbnailInput = document.getElementById('id_thumbnail');
        if (thumbnailPreview) {
            thumbnailPreview.innerHTML = '';
            thumbnailPreview.classList.remove('active');
        }
        if (thumbnailInput) {
            thumbnailInput.value = '';
        }
    };

    // Thumbnail Upload
    const thumbnailUploadArea = document.getElementById('thumbnail-upload-area');
    const thumbnailInput = document.getElementById('id_thumbnail');
    const thumbnailPreview = document.getElementById('thumbnail-preview');

    if (thumbnailUploadArea && thumbnailInput) {
        thumbnailUploadArea.addEventListener('click', () => thumbnailInput.click());
        
        thumbnailUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            thumbnailUploadArea.style.borderColor = 'var(--accent-blue)';
        });

        thumbnailUploadArea.addEventListener('dragleave', () => {
            thumbnailUploadArea.style.borderColor = '';
        });

        thumbnailUploadArea.addEventListener('drop', async (e) => {
            e.preventDefault();
            thumbnailUploadArea.style.borderColor = '';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                const optimizedFile = await compressImageFile(file);
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(optimizedFile);
                thumbnailInput.files = dataTransfer.files;
                handleThumbnailUpload(optimizedFile);
            }
        });

        thumbnailInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const optimizedFile = await compressImageFile(file);
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(optimizedFile);
                thumbnailInput.files = dataTransfer.files;
                handleThumbnailUpload(optimizedFile);
            }
        });
    }

    function handleThumbnailUpload(file) {
        if (thumbnailPreview) {
            const reader = new FileReader();
            reader.onload = (e) => {
                thumbnailPreview.innerHTML = `
                    <div class="preview-image">
                        <img src="${e.target.result}" alt="Thumbnail">
                        <button type="button" class="preview-remove" onclick="clearThumbnail()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                thumbnailPreview.classList.add('active');
            };
            reader.readAsDataURL(file);
        }
    }

    // Screenshots Upload
    const screenshotsUploadArea = document.getElementById('screenshots-upload-area');
    const screenshotsInput = document.getElementById('screenshots-input');
    const screenshotsPreview = document.getElementById('screenshots-preview');
    let screenshotFiles = [];

    if (screenshotsUploadArea && screenshotsInput) {
        screenshotsUploadArea.addEventListener('click', () => screenshotsInput.click());

        screenshotsUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            screenshotsUploadArea.style.borderColor = 'var(--accent-blue)';
        });

        screenshotsUploadArea.addEventListener('dragleave', () => {
            screenshotsUploadArea.style.borderColor = '';
        });

        screenshotsUploadArea.addEventListener('drop', async (e) => {
            e.preventDefault();
            screenshotsUploadArea.style.borderColor = '';
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            await handleScreenshotsUpload(files);
        });

        screenshotsInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            await handleScreenshotsUpload(files);
            screenshotsInput.value = ''; // Reset input to allow re-selecting same files
        });
    }

    async function handleScreenshotsUpload(files) {
        for (const file of files) {
            const optimizedFile = await compressImageFile(file);
            screenshotFiles.push(optimizedFile);
        }
        renderScreenshots();
    }

    function removeScreenshot(index) {
        screenshotFiles.splice(index, 1);
        renderScreenshots();
    }

    function renderScreenshots() {
        if (!screenshotsPreview) return;
        
        screenshotsPreview.innerHTML = '';
        if (screenshotFiles.length === 0) {
            return;
        }
        screenshotFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.dataset.index = index;
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Screenshot">
                    <button type="button" class="preview-remove">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                // Add remove functionality
                previewItem.querySelector('.preview-remove').addEventListener('click', function() {
                    removeScreenshot(index);
                });
                
                screenshotsPreview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        });
    }

    const form = document.getElementById('create-project-form');

    // Draft and Publish Button Handlers
    const saveDraftBtn = document.getElementById('save-draft-btn');
    const publishBtn = document.getElementById('publish-btn');
    const statusInput = document.getElementById('id_status');

    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!form) return;
            // Set status to draft
            if (statusInput) {
                statusInput.value = 'draft';
            }
            // Trigger form submission
            form.requestSubmit();
        });
    }

    if (publishBtn) {
        publishBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!form) return;
            // Set status to active (or keep current status if editing)
            if (statusInput) {
                const currentStatus = statusInput.value;
                // Only change to 'active' if it's currently 'draft' or empty
                if (!currentStatus || currentStatus === 'draft') {
                    statusInput.value = 'active';
                }
            }
            // Trigger form submission
            form.requestSubmit();
        });
    }

    // Form Submission
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Sync TinyMCE rich text editor content back to textareas
            if (typeof tinymce !== 'undefined') {
                tinymce.triggerSave();
            }

            // Set loading state on submit buttons
            const buttons = form.querySelectorAll('button[type="submit"], button[type="button"]');
            buttons.forEach(btn => {
                btn.disabled = true;
                btn.dataset.originalHtml = btn.innerHTML;
            });
            if (publishBtn) publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            if (saveDraftBtn) saveDraftBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            
            try {
                // Create FormData object to handle file uploads
                const formData = new FormData(form);
                
                // Add optimized screenshot files to FormData
                for (let i = 0; i < screenshotFiles.length; i++) {
                    const optimized = await compressImageFile(screenshotFiles[i]);
                    formData.append('screenshots', optimized);
                }
                
                // Submit form via AJAX
                const response = await fetch(form.action || window.location.href, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': formData.get('csrfmiddlewaretoken')
                    }
                });

                const contentType = response.headers.get('content-type') || '';
                const isJson = contentType.includes('application/json');
                let payload = {};

                if (isJson) {
                    try {
                        payload = await response.json();
                    } catch (parseErr) {
                        payload = {};
                    }
                }

                if (!response.ok) {
                    if (response.status === 413) {
                        alert('Error 413 (Payload Too Large):\nThe total size of the uploaded files exceeds the server upload limit. Please upload smaller images or fewer screenshots at once.');
                        return;
                    }

                    let errorMsg = 'Error saving project:\n';
                    if (payload.errors) {
                        for (let field in payload.errors) {
                            const errs = Array.isArray(payload.errors[field]) ? payload.errors[field].join(', ') : payload.errors[field];
                            errorMsg += `\n• ${field}: ${errs}`;
                        }
                    } else {
                        errorMsg += payload.message || `Server returned error (${response.status})`;
                    }
                    alert(errorMsg);
                    return;
                }

                if (payload.success) {
                    const isDraft = formData.get('status') === 'draft';
                    const message = isDraft ? 'Project saved as draft!' : (payload.message || 'Project saved successfully!');
                    alert(message);
                    if (payload.redirect_url) {
                        window.location.href = payload.redirect_url;
                    }
                } else {
                    let errorMsg = 'Error saving project:\n';
                    if (payload.errors) {
                        for (let field in payload.errors) {
                            const errs = Array.isArray(payload.errors[field]) ? payload.errors[field].join(', ') : payload.errors[field];
                            errorMsg += `\n• ${field}: ${errs}`;
                        }
                    }
                    alert(errorMsg);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('A network or server error occurred while saving the project. Please verify your connection and try again.');
            } finally {
                buttons.forEach(btn => {
                    btn.disabled = false;
                    if (btn.dataset.originalHtml) {
                        btn.innerHTML = btn.dataset.originalHtml;
                    }
                });
            }
        });
    }
});
