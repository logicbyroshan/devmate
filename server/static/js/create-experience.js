document.addEventListener('DOMContentLoaded', function() {

    // Initialize TinyMCE
    if (typeof tinymce !== 'undefined') {
        tinymce.init({
            selector: '.tinymce-editor',
            height: 400,
            menubar: false,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | formatselect | bold italic underline strikethrough | ' +
                'alignleft aligncenter alignright alignjustify | ' +
                'bullist numlist outdent indent | link image | ' +
                'forecolor backcolor | code fullscreen | help',
            content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px; }'
        });
    }

    /**
     * Automatic Client-Side Image Compression using HTML5 Canvas.
     */
    async function compressImageFile(file, maxDimension = 1920, quality = 0.85) {
        if (!file || !file.type || !file.type.startsWith('image/')) {
            return file;
        }
        if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
            return file;
        }
        if (file.size < 350 * 1024) {
            return file;
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

    // Currently Working Checkbox
    const currentlyWorkingCheckbox = document.querySelector('input[name="currently_working"]');
    const endDateInput = document.querySelector('input[name="end_date"]');

    if (currentlyWorkingCheckbox && endDateInput) {
        currentlyWorkingCheckbox.addEventListener('change', function() {
            if (this.checked) {
                endDateInput.value = '';
                endDateInput.disabled = true;
                endDateInput.style.opacity = '0.5';
            } else {
                endDateInput.disabled = false;
                endDateInput.style.opacity = '1';
            }
        });
    }

    // Company Logo Upload
    const logoUpload = document.getElementById('logo-upload');
    const logoInput = document.querySelector('input[name="company_logo"]');
    const logoPreview = document.getElementById('logo-preview');

    if (logoUpload && logoInput) {
        logoUpload.addEventListener('click', () => logoInput.click());
        
        logoUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            logoUpload.style.borderColor = 'var(--accent-blue)';
        });

        logoUpload.addEventListener('dragleave', () => {
            logoUpload.style.borderColor = '';
        });

        logoUpload.addEventListener('drop', async (e) => {
            e.preventDefault();
            logoUpload.style.borderColor = '';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                const optimizedFile = await compressImageFile(file);
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(optimizedFile);
                logoInput.files = dataTransfer.files;
                handleLogoUpload(optimizedFile);
            }
        });

        logoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const optimizedFile = await compressImageFile(file);
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(optimizedFile);
                logoInput.files = dataTransfer.files;
                handleLogoUpload(optimizedFile);
            }
        });

        function handleLogoUpload(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                logoPreview.innerHTML = `
                    <div class="preview-image">
                        <img src="${e.target.result}" alt="Company Logo">
                        <button type="button" class="preview-remove" onclick="removeLogo()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                logoPreview.classList.add('active');
            };
            reader.readAsDataURL(file);
        }

        window.removeLogo = function() {
            logoPreview.innerHTML = '';
            logoPreview.classList.remove('active');
            logoInput.value = '';
        };
    }

    // Workplace Images Upload (Max 5)
    const workplaceUpload = document.getElementById('workplace-upload');
    const workplaceInput = document.getElementById('workplace-input');
    const workplacePreview = document.getElementById('workplace-preview');
    let workplaceFiles = [];
    const MAX_WORKPLACE_IMAGES = 5;

    if (workplaceUpload && workplaceInput) {
        workplaceUpload.addEventListener('click', () => {
            if (workplaceFiles.length < MAX_WORKPLACE_IMAGES) {
                workplaceInput.click();
            } else {
                alert(`Maximum ${MAX_WORKPLACE_IMAGES} workplace images allowed.`);
            }
        });

        workplaceUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (workplaceFiles.length < MAX_WORKPLACE_IMAGES) {
                workplaceUpload.style.borderColor = 'var(--accent-blue)';
            }
        });

        workplaceUpload.addEventListener('dragleave', () => {
            workplaceUpload.style.borderColor = '';
        });

        workplaceUpload.addEventListener('drop', async (e) => {
            e.preventDefault();
            workplaceUpload.style.borderColor = '';
            if (workplaceFiles.length >= MAX_WORKPLACE_IMAGES) {
                alert(`Maximum ${MAX_WORKPLACE_IMAGES} workplace images allowed.`);
                return;
            }
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            await handleWorkplaceUpload(files);
        });

        workplaceInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            await handleWorkplaceUpload(files);
            workplaceInput.value = '';
        });

        async function handleWorkplaceUpload(files) {
            const remainingSlots = MAX_WORKPLACE_IMAGES - workplaceFiles.length;
            const filesToAdd = files.slice(0, remainingSlots);
            
            if (files.length > remainingSlots) {
                alert(`Only ${remainingSlots} more image(s) can be added. Maximum ${MAX_WORKPLACE_IMAGES} images allowed.`);
            }

            for (const file of filesToAdd) {
                const optimizedFile = await compressImageFile(file);
                workplaceFiles.push(optimizedFile);
            }
            
            renderWorkplaceImages();
        }

        window.removeWorkplaceImage = function(index) {
            workplaceFiles.splice(index, 1);
            renderWorkplaceImages();
        };

        function renderWorkplaceImages() {
            workplacePreview.innerHTML = '';
            if (workplaceFiles.length === 0) {
                workplacePreview.classList.remove('active');
                return;
            }
            workplaceFiles.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    previewItem.innerHTML = `
                        <img src="${e.target.result}" alt="Workplace">
                        <button type="button" class="preview-remove" onclick="removeWorkplaceImage(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    workplacePreview.appendChild(previewItem);
                };
                reader.readAsDataURL(file);
            });
            workplacePreview.classList.add('active');
        }
    }

    // Form Submission
    const form = document.getElementById('create-experience-form');
    
    // Handle draft and publish buttons
    const draftBtn = form ? form.querySelector('button[name="save_draft"]') : null;
    const publishBtn = form ? form.querySelector('button[name="publish"]') : null;
    
    // Form validation function
    function validateForm() {
        const errors = [];
        
        // Check required fields
        const position = form.querySelector('input[name="position"]');
        const employmentType = form.querySelector('select[name="employment_type"]');
        const employmentStatus = form.querySelector('select[name="employment_status"]');
        const companyName = form.querySelector('input[name="company_name"]');
        const startDate = form.querySelector('input[name="start_date"]');
        const shortDescription = form.querySelector('textarea[name="short_description"]');
        
        if (!position || !position.value.trim()) {
            errors.push('Position/Role is required');
        }
        if (!employmentType || !employmentType.value) {
            errors.push('Employment Type is required');
        }
        if (!employmentStatus || !employmentStatus.value) {
            errors.push('Employment Status is required');
        }
        if (!companyName || !companyName.value.trim()) {
            errors.push('Company Name is required');
        }
        if (!startDate || !startDate.value) {
            errors.push('Start Date is required');
        }
        if (!shortDescription || !shortDescription.value.trim()) {
            errors.push('Short Description is required');
        }
        
        if (errors.length > 0) {
            alert('Please fill in all required fields:\n\n' + errors.join('\n'));
            return false;
        }
        
        return true;
    }
    
    async function submitExperienceForm(isDraft) {
        if (!isDraft && !validateForm()) {
            return;
        }

        // Trigger TinyMCE save
        if (typeof tinymce !== 'undefined') {
            tinymce.triggerSave();
        }

        const buttons = form.querySelectorAll('button[type="submit"], button[type="button"]');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.dataset.originalHtml = btn.innerHTML;
        });
        if (publishBtn && !isDraft) publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        if (draftBtn && isDraft) draftBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            const formData = new FormData(form);
            formData.set('is_draft', isDraft ? 'true' : 'false');

            // Append optimized workplace images
            formData.delete('workplace_images');
            for (let i = 0; i < workplaceFiles.length; i++) {
                const opt = await compressImageFile(workplaceFiles[i]);
                formData.append('workplace_images', opt);
            }

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
                    alert('Error 413 (Payload Too Large):\nThe uploaded images exceed the server upload limit. Please use smaller images.');
                    return;
                }

                let errorMsg = 'Error saving experience:\n';
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
                alert(payload.message || 'Experience saved successfully!');
                if (payload.redirect_url) {
                    window.location.href = payload.redirect_url;
                }
            } else {
                let errorMsg = 'Error saving experience:\n';
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
            alert('A network error occurred while saving the experience. Please try again.');
        } finally {
            buttons.forEach(btn => {
                btn.disabled = false;
                if (btn.dataset.originalHtml) {
                    btn.innerHTML = btn.dataset.originalHtml;
                }
            });
        }
    }

    if (draftBtn) {
        draftBtn.addEventListener('click', (e) => {
            e.preventDefault();
            submitExperienceForm(true);
        });
    }
    
    if (publishBtn) {
        publishBtn.addEventListener('click', (e) => {
            e.preventDefault();
            submitExperienceForm(false);
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            submitExperienceForm(false);
        });
    }
});