chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getLocalStorage") {
		sendResponse({data: localStorage[request.key]});
	}
    if (request.method == "setLocalStorage") {
		localStorage[request.key] = request.val;	
	}
	else
      sendResponse({});
});

chrome.runtime.onInstalled.addListener(function (object) {
    var viewTabUrl = chrome.extension.getURL('updates.html');
    chrome.tabs.create({ url: viewTabUrl }, function (tab) {
        
    });
});