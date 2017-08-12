// Saves options to storage
function saveOptions() {
    var gostFileNameTplInput = document.getElementById("gostFileNameTpl");
    if (!gostFileNameTplInput) {
        console.error("�� ������� ���� ����� ������� ����� �����");
    }
    else {
        chrome.storage.sync.set({ 'gostFNameTpl': gostFileNameTplInput.value }, function () {
            var statusPlaceholder = document.getElementById("optionsStatus");
            if (statusPlaceholder) {
                statusPlaceholder.innerHTML = "��������� ���������";
            }
        });
    }
}

// Restores select box state to saved value from localStorage
function loadOptions() {
    chrome.storage.sync.get({ "gostFNameTpl": "%������������" }, function (e) {
        var gostFNameTplInput = document.getElementById("gostFileNameTpl");
        if (!gostFNameTplInput) {
            console.error("�� ������� ���� ����� ������� ����� �����");
        }
        else {
            gostFNameTplInput.value = e.gostFNameTpl;
        }
    });
}

// Resets options to default values
function resetOptions() {
    chrome.storage.sync.set({ 'gostFNameTpl': "%������������" }, function () {
        var statusPlaceholder = document.getElementById("optionsStatus");
        if (statusPlaceholder) {
            statusPlaceholder.innerHTML = "��������� ��������";
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#btnSaveOpts').addEventListener('click', saveOptions);
    document.querySelector('#btnResetOpts').addEventListener('click', resetOptions);
    loadOptions();
});