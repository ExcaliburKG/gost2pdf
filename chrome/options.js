// Saves options to localStorage.
function saveOptions() {
  localStorage["gostFNameTpl"] = document.getElementById("gostFileNameTpl").value;

  // Update status to let user know options were saved.
  var status = document.getElementById("optionsStatus");
  status.innerHTML = "Настройки сохранены";
 // setTimeout(function() {
 //   status.innerHTML = "";
 // }, 2000);
}

// Restores select box state to saved value from localStorage.
function loadOptions() {
  var gostFNameTpl = localStorage["gostFNameTpl"];
  if (!gostFNameTpl) {
    return;
  }
  var gostFNameTplInput = document.getElementById("gostFileNameTpl");
  if (!gostFNameTplInput) {
    return;
  }  
  gostFNameTplInput.value = gostFNameTpl;
}

function resetOptions() {
  localStorage["gostFNameTpl"] = "ГОСТ %номер_год - %имя";

  // Update status to let user know options were saved.
  var status = document.getElementById("optionsStatus");
  status.innerHTML = "Настройки сброшены";
 // setTimeout(function() {
 //   status.innerHTML = "";
 // }, 2000);
}

document.addEventListener('DOMContentLoaded', function () {
	document.querySelector('#btnSaveOpts').addEventListener('click', saveOptions);
	document.querySelector('#btnResetOpts').addEventListener('click', resetOptions);
	loadOptions();
});