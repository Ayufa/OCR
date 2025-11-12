document.addEventListener('DOMContentLoaded', function() {
    function copyText(id) {
        const textArea = document.getElementById(id);
        if (!textArea) {
            alert('対象のテキストが見つかりませんでした。');
            return;
        }
        textArea.select();
        document.execCommand('copy');
        alert('テキストをコピーしました');
    }

    window.copyText = copyText;
});
