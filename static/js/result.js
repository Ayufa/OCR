document.addEventListener('DOMContentLoaded', function () {
    setupEditListeners();
});

// オーバーレイを設定する関数
window.setupOverlays = function (imgElement, wordData, containerId) {
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
            overlay.style.position = 'absolute';
            overlay.style.left = `${x * scaleX}px`;
            overlay.style.top = `${y * scaleY}px`;
            overlay.style.width = `${w * scaleX}px`;
            overlay.style.height = `${h * scaleY}px`;
            overlay.style.cursor = 'pointer';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // 透明

            // クリックイベント
            overlay.addEventListener('click', function (e) {
                e.stopPropagation(); // 親要素への伝播を防ぐ
                const textContainer = document.getElementById(containerId);
                const span = textContainer.querySelector(`.ocr-word[data-id="${word.id}"]`);
                if (span) {
                    span.click(); // 対応するテキストスパンのクリックイベントを発火
                }
            });

            // ホバー効果
            overlay.addEventListener('mouseenter', function () {
                overlay.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
            });
            overlay.addEventListener('mouseleave', function () {
                overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
            });

            container.appendChild(overlay);
        }
    });

    // ウィンドウリサイズ時に再計算するためのリスナーを追加（簡易実装）
    window.addEventListener('resize', () => {
        // リサイズ時の再計算ロジックはここに追加可能
    });
};

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

    if (saveButton) {
        saveButton.addEventListener('click', function () {
            if (currentSpan && editInput.value) {
                const newText = editInput.value;
                currentSpan.innerText = newText;

                currentSpan.classList.remove('conf-low', 'conf-mid');
                currentSpan.classList.add('conf-high');

                updateHiddenTextarea(currentContainerId);
                saveToServer(currentContainerId);

                modal.style.display = 'none';
            }
        });
    }

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
