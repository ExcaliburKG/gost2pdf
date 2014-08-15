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