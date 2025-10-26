document.addEventListener('DOMContentLoaded', function() {
    function copyText(id) {
        var textArea = document.getElementById(id);
        textArea.select();
        document.execCommand('copy');
        alert('テキストをコピーしました');
    }

    window.copyText = copyText;

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
    

    function convertToLatex(idx) {
        // AJAXリクエストを送信
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/convert_to_latex');
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.onload = function() {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                var latexArea = document.getElementById('latex-' + idx);
                latexArea.value = response.latex;
                showNotification('LaTeXコードの変換が成功しました！');
                // レンダリングエリアに表示
                var renderDiv = document.getElementById('render-' + idx);
                renderDiv.innerHTML = '\\( ' + response.latex + ' \\)';
                MathJax.typesetPromise([renderDiv]);
            } else {
                showNotification('LaTeXへの変換に失敗しました。', 5000);
            }            
        };
        xhr.send(JSON.stringify({ id: idx }));
    }

    window.convertToLatex = convertToLatex;
});
