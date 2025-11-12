// main.js
document.addEventListener('DOMContentLoaded', function() {
    let cropper;
    const fileInput = document.querySelector('input[name="original_image"]');
    const langSelect = document.getElementById('lang-select');
    const uploadButton = document.getElementById('upload-button');
    const imageContainer = document.getElementById('image-container');
    const imagePreview = document.getElementById('image-preview');
    const cropInstructions = document.getElementById('crop-instructions');

    // プログレスバーと進行状況テキストの要素を取得
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    // ドラッグ＆ドロップ関連の要素を取得
    const dropArea = document.getElementById('drop-area');

    // ドラッグ＆ドロップのイベントを防止
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // ドラッグオーバー時のハイライト
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropArea.classList.add('highlight');
    }

    function unhighlight(e) {
        dropArea.classList.remove('highlight');
    }

    // ドロップ時の処理
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files && files.length > 0) {
            fileInput.files = files;
            toggleCropper();
        }
    }

    // 言語選択が変更されたときの処理
    langSelect.addEventListener('change', function() {
        toggleCropper();
    });

    // ファイルが選択されたときの処理
    fileInput.addEventListener('change', function() {
        toggleCropper();
    });

    // アップロードボタンがクリックされたときの処理
    uploadButton.addEventListener('click', function() {
        onFormSubmit();
    });

    // ズームボタンのイベントリスナーを追加
    document.getElementById('zoom-in').addEventListener('click', function() {
        if (cropper) {
            cropper.zoom(0.1);
        }
    });

    document.getElementById('zoom-out').addEventListener('click', function() {
        if (cropper) {
            cropper.zoom(-0.1);
        }
    });

    function toggleCropper() {
        const lang = langSelect.value;

        if (fileInput.files && fileInput.files[0]) {
            uploadButton.disabled = false;
        } else {
            uploadButton.disabled = true;
        }

        if (lang === 'math') {
            cropInstructions.style.display = 'block';
            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imageContainer.style.display = 'block';
                    document.getElementById('zoom-controls').style.display = 'block';

                    // 既存のCropperを破棄
                    if (cropper) {
                        cropper.destroy();
                    }

                    // 新しいCropperを作成
                    cropper = new Cropper(imagePreview, {
                        aspectRatio: NaN,
                        viewMode: 1,
                        responsive: true,
                        guides: true,
                        center: true,
                        highlight: true,
                        background: true,
                        autoCropArea: 1.0,
                        movable: true,
                        zoomable: true,
                        rotatable: false,
                        scalable: false,
                        cropBoxResizable: true,
                        cropBoxMovable: true,
                        toggleDragModeOnDblclick: false,
                        zoomOnTouch: true,
                        zoomOnWheel: true,
                    });
                };
                reader.readAsDataURL(fileInput.files[0]);
            }
        } else {
            cropInstructions.style.display = 'none';
            imageContainer.style.display = 'none';
            document.getElementById('zoom-controls').style.display = 'none';
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
        }
    }

    function onFormSubmit() {
        showLoading();
        const lang = langSelect.value;
        const formData = new FormData();
        formData.append('lang', lang);

        if (fileInput.files && fileInput.files[0]) {
            formData.append('original_image', fileInput.files[0]);
        } else {
            alert('画像ファイルを選択してください。');
            hideLoading();
            return;
        }

        if (lang === 'math' && cropper) {
            // クロップ情報を取得
            const cropData = cropper.getData(true); // 小数点以下を四捨五入
            formData.append('crop_x', cropData.x);
            formData.append('crop_y', cropData.y);
            formData.append('crop_width', cropData.width);
            formData.append('crop_height', cropData.height);
        }

        sendFormData(formData);
    }

    function showNotification(message, duration = 3000) {
        const notificationBar = document.getElementById('notification-bar');
        const notificationMessage = document.getElementById('notification-message');
    
        notificationMessage.textContent = message;
        notificationBar.style.display = 'block';
    
        // 指定時間後に非表示
        setTimeout(() => {
            hideNotification();
        }, duration);
    }
    
    function hideNotification() {
        const notificationBar = document.getElementById('notification-bar');
        notificationBar.style.display = 'none';
    }
    

    function sendFormData(formData) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/');
        xhr.onload = function() {
            if (xhr.status === 200) {
                showNotification('ファイルが正常にアップロードされました！');
                document.open();
                document.write(xhr.responseText);
                document.close();
            } else {
                showNotification('エラーが発生しました。', 5000);
                location.reload();
            }
        };
        

        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                progressBar.value = percentComplete;
                progressText.innerText = `アップロード中... ${percentComplete}%`;
            }
        };

        xhr.send(formData);
    }

    function showLoading() {
        document.getElementById('upload-form').style.display = 'none';
        document.getElementById('loading').style.display = 'block';
        // プログレスバーを初期化
        progressBar.value = 0;
        progressText.innerText = '処理中です。お待ちください...';
    }

    function hideLoading() {
        document.getElementById('upload-form').style.display = 'block';
        document.getElementById('loading').style.display = 'none';
    }
    
    // ダークモード切り替えボタンの機能追加
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
        });
    }
});