// main.js
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.querySelector('input[name="original_image"]');
    const langSelect = document.getElementById('lang-select');
    const uploadButton = document.getElementById('upload-button');
    const dropArea = document.getElementById('drop-area');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
    });

    dropArea.addEventListener('drop', function(e) {
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length > 0) {
            fileInput.files = dt.files;
            updateButtonState();
        }
    });

    fileInput.addEventListener('change', updateButtonState);
    updateButtonState();

    uploadButton.addEventListener('click', function() {
        if (!(fileInput.files && fileInput.files[0])) {
            alert('画像ファイルを選択してください。');
            return;
        }
        onFormSubmit();
    });

    function updateButtonState() {
        uploadButton.disabled = !(fileInput.files && fileInput.files.length);
    }

    function onFormSubmit() {
        showLoading();
        const formData = new FormData();
        formData.append('lang', langSelect.value || 'jpn');
        formData.append('original_image', fileInput.files[0]);
        sendFormData(formData);
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
                hideLoading();
            }
        };

        xhr.onerror = function() {
            showNotification('通信エラーが発生しました。', 5000);
            hideLoading();
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
        progressBar.value = 0;
        progressText.innerText = '処理中です。お待ちください...';
    }

    function hideLoading() {
        document.getElementById('upload-form').style.display = 'block';
        document.getElementById('loading').style.display = 'none';
    }

    function showNotification(message, duration = 3000) {
        const notificationBar = document.getElementById('notification-bar');
        const notificationMessage = document.getElementById('notification-message');

        notificationMessage.textContent = message;
        notificationBar.style.display = 'block';

        setTimeout(() => {
            hideNotification();
        }, duration);
    }

    function hideNotification() {
        const notificationBar = document.getElementById('notification-bar');
        notificationBar.style.display = 'none';
    }

    window.hideNotification = hideNotification;

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
        });
    }
});
