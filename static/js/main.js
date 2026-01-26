// main.js
document.addEventListener('DOMContentLoaded', function () {
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

    dropArea.addEventListener('drop', function (e) {
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length > 0) {
            fileInput.files = dt.files;
            if (fileInput.files.length > 0) {
                dropArea.querySelector('p').textContent = `${fileInput.files[0].name} が選択されました`;
            }
            updateButtonState();
        }
    });

    fileInput.addEventListener('change', function () {
        if (fileInput.files.length > 0) {
            dropArea.querySelector('p').textContent = `${fileInput.files[0].name} が選択されました`;
        }
        updateButtonState();
    });

    updateButtonState();

    uploadButton.addEventListener('click', function () {
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

        xhr.onload = function () {
            hideLoading();

            if (xhr.status === 200) {
                alert('ファイルが正常にアップロードされました！');
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (data.results) {
                        displayResults(data.results);
                    } else {
                        alert('受信データが不正です。', 5000);
                        uploadForm.style.display = 'block';
                    }
                } catch (e) {
                    console.error("JSONのパースに失敗しました:", e, xhr.responseText);
                    alert('結果の表示に失敗しました。', 5000);
                    uploadForm.style.display = 'block';
                }
            } else {
                alert('エラーが発生しました。', 5000);
                uploadForm.style.display = 'block';
            }
        };

        xhr.onerror = function () {
            hideLoading();
            uploadForm.style.display = 'block';
            alert('通信エラーが発生しました。', 5000);
        };

        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                progressBar.value = percentComplete;
                progressText.innerText = `アップロード中... ${percentComplete}%`;
            }
        };

        xhr.send(formData);
    }

    function displayResults(results) {
        const oldResults = document.getElementById('results-container');
        if (oldResults) {
            oldResults.remove();
        }

        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'results-container';

        let resultsHTML = '';

        results.forEach(result => {
            const containerId = `container-${result.id}`;
            const imgContainerId = `img-container-${result.id}`;
            const imageSrc = result.annotated_image ? `/uploads/${result.annotated_image}` : `/uploads/${result.filename}`;

            let textHTML = '';
            if (result.word_data && result.word_data.length > 0) {
                textHTML = `<div class="ocr-text-container" id="${containerId}" data-filename="${result.filename}">`;
                result.word_data.forEach(word => {
                    let colorClass = 'conf-high';
                    if (word.conf < 50) colorClass = 'conf-low';
                    else if (word.conf < 80) colorClass = 'conf-mid';
                    textHTML += `<span class="ocr-word ${colorClass}" data-id="${word.id}" data-conf="${word.conf}">${word.text}</span>`;
                });
                textHTML += '</div>';
            } else {
                textHTML = `<div class="ocr-text-container" id="${containerId}" data-filename="${result.filename}">${result.text.replace(/\n/g, '<br>')}</div>`;
            }

            resultsHTML += `
            <div class="result-card">
                <div class="result-header">
                    <h2>${result.filename}</h2>
                    <div class="result-actions">
                        <button onclick="copyText('text-${result.id}')" class="btn">テキストをコピー</button>
                        <a href="/download/${result.filename}.txt" class="btn">テキストをダウンロード</a>
                    </div>
                </div>
                <div class="result-content">
                    <div class="result-image">
                        <div class="image-overlay-container" id="${imgContainerId}" style="position: relative; display: inline-block;">
                             <img src="${imageSrc}" alt="${result.filename}" style="max-width:100%; display: block;" class="ocr-result-image" data-id="${result.id}">
                        </div>
                    </div>
                    <div class="result-text">
                        ${textHTML}
                    </div>
                </div>
                <textarea id="text-${result.id}" class="raw-text-area" rows="10">${result.text}</textarea>
            </div>
            `;
        });

        // 編集用モーダルを追加
        resultsHTML += `
        <div id="edit-modal" class="modal" style="display:none;">
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h3>テキストの修正</h3>
                <input type="text" id="edit-input" class="edit-input">
                <br><br>
                <button id="save-edit-button">保存</button>
            </div>
        </div>
        <div style="text-align:center; margin-top:20px;"><a href="/" class="btn">戻る</a></div>
        `;

        resultsContainer.innerHTML = resultsHTML;
        container.appendChild(resultsContainer);

        // 画像の読み込みを待ってオーバーレイを設定
        results.forEach(result => {
            if (result.word_data) {
                const img = document.querySelector(`.ocr-result-image[data-id="${result.id}"]`);
                if (img) {
                    if (img.complete) {
                        setupOverlays(img, result.word_data, `container-${result.id}`);
                    } else {
                        img.onload = function () {
                            setupOverlays(img, result.word_data, `container-${result.id}`);
                        };
                    }
                }
            }
        });

        setupEditListeners();
    }

    // static/js/main.js (および result.js) 内の setupOverlays 関数を置き換え

    function setupOverlays(imgElement, wordData, containerId) {
        const container = imgElement.parentElement;
        // 既存のオーバーレイを削除
        container.querySelectorAll('.word-overlay').forEach(el => el.remove());

        const naturalWidth = imgElement.naturalWidth;
        const naturalHeight = imgElement.naturalHeight;
        const displayWidth = imgElement.width;
        const displayHeight = imgElement.height;

        const scaleX = displayWidth / naturalWidth;
        const scaleY = displayHeight / naturalHeight;

        wordData.forEach(word => {
            if (word.box) {
                const [x, y, w, h] = word.box;
                const overlay = document.createElement('div');
                overlay.className = 'word-overlay';
                // IDによる紐付けのため data-id を追加
                overlay.dataset.id = word.id;

                overlay.style.position = 'absolute';
                overlay.style.left = `${x * scaleX}px`;
                overlay.style.top = `${y * scaleY}px`;
                overlay.style.width = `${w * scaleX}px`;
                overlay.style.height = `${h * scaleY}px`;
                overlay.style.cursor = 'pointer';
                overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // 透明
                overlay.style.transition = 'background-color 0.2s, border 0.2s'; // アニメーション追加

                // クリックイベント
                overlay.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const textContainer = document.getElementById(containerId);
                    const span = textContainer.querySelector(`.ocr-word[data-id="${word.id}"]`);
                    if (span) {
                        span.click();
                    }
                });

                // 画像オーバーレイ -> テキストのハイライト (既存機能の強化)
                overlay.addEventListener('mouseenter', function () {
                    overlay.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
                    // 対応するテキストもハイライト
                    const textContainer = document.getElementById(containerId);
                    const span = textContainer.querySelector(`.ocr-word[data-id="${word.id}"]`);
                    if (span) span.classList.add('active');
                });
                overlay.addEventListener('mouseleave', function () {
                    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                    // テキストのハイライト解除
                    const textContainer = document.getElementById(containerId);
                    const span = textContainer.querySelector(`.ocr-word[data-id="${word.id}"]`);
                    if (span) span.classList.remove('active');
                });

                container.appendChild(overlay);
            }
        });

        // テキスト -> 画像オーバーレイのハイライト機能 (新規追加: 論文課題 )
        setupTextHoverEffects(containerId, container);
    };

    // 新規追加関数: テキストホバー時のイベント設定
    function setupTextHoverEffects(textContainerId, imageOverlayContainer) {
        const textContainer = document.getElementById(textContainerId);
        if (!textContainer) return;

        const spans = textContainer.querySelectorAll('.ocr-word');
        spans.forEach(span => {
            span.addEventListener('mouseenter', function () {
                const id = this.dataset.id;
                const overlay = imageOverlayContainer.querySelector(`.word-overlay[data-id="${id}"]`);
                if (overlay) overlay.classList.add('active');
            });

            span.addEventListener('mouseleave', function () {
                const id = this.dataset.id;
                const overlay = imageOverlayContainer.querySelector(`.word-overlay[data-id="${id}"]`);
                if (overlay) overlay.classList.remove('active');
            });
        });
    }

    function setupEditListeners() {
        const modal = document.getElementById('edit-modal');
        const closeButton = document.querySelector('.close-button');
        const editInput = document.getElementById('edit-input');
        const saveButton = document.getElementById('save-edit-button');
        let currentSpan = null;
        let currentContainerId = null;

        document.querySelectorAll('.ocr-word').forEach(span => {
            span.addEventListener('click', function () {
                currentSpan = this;
                currentContainerId = this.closest('.ocr-text-container').id;
                editInput.value = this.innerText;
                modal.style.display = 'block';
                editInput.focus();
            });
        });

        if (closeButton) {
            closeButton.addEventListener('click', function () {
                modal.style.display = 'none';
            });
        }

        window.addEventListener('click', function (event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });

        // static/js/main.js (および result.js) 内の saveButton.addEventListener 部分を修正

        saveButton.addEventListener('click', function () {
            if (currentSpan && editInput.value) {
                const newText = editInput.value;
                currentSpan.innerText = newText;

                // 信頼度クラスを削除
                currentSpan.classList.remove('conf-low', 'conf-mid', 'conf-high');
                // 修正済みクラスを追加 (論文課題 )
                currentSpan.classList.add('corrected');

                updateHiddenTextarea(currentContainerId);
                saveToServer(currentContainerId);

                modal.style.display = 'none';
            }
        });

        if (editInput) {
            editInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    saveButton.click();
                }
            });
        }
    }

    function updateHiddenTextarea(containerId) {
        const container = document.getElementById(containerId);
        const resultId = containerId.split('-')[1];
        const textarea = document.getElementById(`text-${resultId}`);

        let fullText = '';
        container.querySelectorAll('.ocr-word').forEach(span => {
            fullText += span.innerText + ' ';
        });

        textarea.value = fullText.trim();
    }

    function saveToServer(containerId) {
        const container = document.getElementById(containerId);
        const filename = container.dataset.filename;
        const resultId = containerId.split('-')[1];
        const textarea = document.getElementById(`text-${resultId}`);
        const text = textarea.value;

        fetch('/update_text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: filename,
                text: text
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log('Text updated successfully');
                } else {
                    console.error('Error updating text:', data.message);
                    alert('保存に失敗しました: ' + data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('通信エラーが発生しました');
            });
    }

    function copyText(id) {
        const textArea = document.getElementById(id);
        if (!textArea) {
            alert('対象のテキストが見つかりませんでした。');
            return;
        }
        textArea.select();
        document.execCommand('copy');

        alert('テキストをコピーしました', 2000);
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

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
        });
    }
});