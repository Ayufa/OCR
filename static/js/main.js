// main.js
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.querySelector('input[name="original_image"]');
    const langSelect = document.getElementById('lang-select');
    const uploadButton = document.getElementById('upload-button');
    const dropArea = document.getElementById('drop-area');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    const uploadForm = document.getElementById('upload-form');
    const loadingDiv = document.getElementById('loading');
    const container = document.querySelector('.container');

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
            // ★ 追加: ファイルがドロップされたらファイル名を表示（任意）
            if (fileInput.files.length > 0) {
                dropArea.querySelector('p').textContent = `${fileInput.files[0].name} が選択されました`;
            }
            updateButtonState();
        }
    });

    fileInput.addEventListener('change', function() {
        // ★ 追加: ファイルが選択されたらファイル名を表示（任意）
         if (fileInput.files.length > 0) {
            dropArea.querySelector('p').textContent = `${fileInput.files[0].name} が選択されました`;
        }
        updateButtonState();
    });

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
            hideLoading(); 

            if (xhr.status === 200) {
                showNotification('ファイルが正常にアップロードされました！');
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (data.results) {
                        displayResults(data.results);
                    } else {
                        showNotification('受信データが不正です。', 5000);
                        uploadForm.style.display = 'block'; 
                    }
                } catch (e) {
                    console.error("JSONのパースに失敗しました:", e, xhr.responseText);
                    showNotification('結果の表示に失敗しました。', 5000);
                    uploadForm.style.display = 'block';
                }
            } else {
                showNotification('エラーが発生しました。', 5000);
                uploadForm.style.display = 'block';
            }
        };

        xhr.onerror = function() {
            hideLoading();
            uploadForm.style.display = 'block';
            showNotification('通信エラーが発生しました。', 5000);
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

    // ★★★ 変更: displayResults 関数 ★★★
    function displayResults(results) {
        const oldResults = document.getElementById('results-container');
        if (oldResults) {
            oldResults.remove();
        }

        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'results-container';

        // ★ 変更: フォームとローディングを非表示（結果表示のため）
        uploadForm.style.display = 'none';
        loadingDiv.style.display = 'none';

        let resultsHTML = '<a href="/">新しくスキャンする</a><h1>OCR結果</h1>';
        
        results.forEach(result => {
            const textId = `text-${result.id}`;
            
            let imageHTML = '';
            if (result.annotated_image) {
                imageHTML = `<img src="/uploads/${result.annotated_image}" alt="${result.filename}" style="max-width:100%;">`;
            } else if (result.filename.match(/\.(png|jpg|jpeg|gif|bmp)$/i)) {
                imageHTML = `<img src="/uploads/${result.filename}" alt="${result.filename}" style="max-width:100%;">`;
            }

            const escapedText = document.createElement('textarea');
            escapedText.textContent = result.text;

            resultsHTML += `
                <div class="result-card">
                    <h2>${result.filename}</h2>
                    ${imageHTML}
                    <textarea id="${textId}" rows="10">${escapedText.innerHTML}</textarea><br>
                    <button onclick="copyText('${textId}')">テキストをコピー</button>
                    <a href="/download/${result.filename}.txt">テキストをダウンロード</a>
                </div>
            `;
        });

        // ★ 変更: 戻るボタンをカードの外、最後に配置
        resultsHTML += '<a href="/">新しくスキャンする</a>';
        
        resultsContainer.innerHTML = resultsHTML;
        container.appendChild(resultsContainer);

        // ★ 追加: 結果表示後にコンテナが長くなるため、コンテナの先頭にスクロール
        container.scrollIntoView({ behavior: 'smooth' });
    }

    // ★ result.js からコピーした関数
    function copyText(id) {
        const textArea = document.getElementById(id);
        if (!textArea) {
            alert('対象のテキストが見つかりませんでした。');
            return;
        }
        textArea.select();
        document.execCommand('copy');
        
        showNotification('テキストをコピーしました', 2000);
    }
    window.copyText = copyText;

    function showLoading() {
        uploadForm.style.display = 'none'; 
        loadingDiv.style.display = 'block'; 
        progressBar.value = 0;
        progressText.innerText = '処理中です。お待ちください...';
    }

    function hideLoading() {
        loadingDiv.style.display = 'none';
    }

    // ★ 前回変更した通知関数
    function showNotification(message, duration = 3000) {
        const notificationBar = document.getElementById('notification-bar');
        const notificationMessage = document.getElementById('notification-message');

        notificationMessage.textContent = message;
        notificationBar.classList.add('show');
        notificationBar.classList.remove('hide');

        setTimeout(() => {
            hideNotification();
        }, duration);
    }

    function hideNotification() {
        const notificationBar = document.getElementById('notification-bar');
        notificationBar.classList.remove('show');
        notificationBar.classList.add('hide');
    }

    window.hideNotification = hideNotification;

// ★ 変更: ダークモードトグルのロジック
    // CSS側でアイコンを切り替えるため、JSはクラスのトグルのみ行う
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
        });
    }
});