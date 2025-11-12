document.addEventListener('DOMContentLoaded', function() {
    function copyText(id) {
        var textArea = document.getElementById(id);
        textArea.select();
        document.execCommand('copy');
        alert('LaTeXコードをコピーしました');
    }

    window.copyText = copyText;
});
