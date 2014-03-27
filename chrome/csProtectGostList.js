AppendIcons();

function AppendIcons()
{
var divs = document.getElementsByTagName("img");
var tds = document.getElementsByClassName("tx12");
var PageType=-1;
var IconDownloadUrl = chrome.extension.getURL("images/download.png");
var PageUrl = document.location.href;
			if(contains(PageUrl.toLowerCase(), consts.PgSubStrGostPage.toLowerCase())) 
			{
				PageType = 0; // страница госта
			}
			else 
			{
				PageType = 1; // список гостов (таблица)
			}    

	switch(PageType)
	 {
		case 0: // если мы находимся на подстранице госта
			for (var i = 0; i < divs.length; ++i)
			{
				if (divs[i].src === "http://protect.gost.ru/i/ext/icon-ext-pdf.gif") 
				{
					var pickImage = document.createElement("img");
					var pickLink = document.createElement("a");
					var docLnkNode = divs[i].parentNode.parentNode.childNodes[3].childNodes[1]; // получаем элемент ссылку на гост
					pickLink.setAttribute("style", "margin-left: 5px;");
					pickLink.setAttribute("title", StrsRuRu.StrBtnDownloadAlt);
					var LinkStr = consts.StrGostDownloadLnk0+getQueryVar(docLnkNode.href, "month")+"&year="+getQueryVar(docLnkNode.href, "year")+"&search=&RegNum=1&DocOnPageCount=15&id="+getQueryVar(docLnkNode.href, "id");
					
					var TocGostInfo = document.getElementsByClassName(consts.PgCssGostTableClass);
					if (TocGostInfo.length > 0) 
					{ // если нашли таблицу с информацией о госте
						var DocTitleP1 = TocGostInfo[0].rows[0].cells[1].childNodes[0].nodeValue;
						var DocTitleP2 = TocGostInfo[0].rows[1].cells[1].childNodes[0].nodeValue;
						var DocTitle = DocTitleP1 + " " + DocTitleP2;			
					}
					pickLink.onclick = (function(LinkStrA) { return function() { window.SelDocTitle = DocTitle; loadXMLDoc(LinkStrA); }; })(LinkStr);
					pickImage.setAttribute("src", IconDownloadUrl);
					pickImage.setAttribute("align", "absmiddle");
					pickImage.setAttribute("alt", StrsRuRu.StrBtnDownloadAlt);
					pickLink.appendChild(pickImage);
					pickLink.setAttribute("href", "#");
					divs[i].parentNode.appendChild(pickLink);
				}
			}			
			break
		case 1: // если мы находимся на главной странице
		default: // если мы находимся на главной странице
		   var TocElement = document.getElementsByClassName("typetable");
		   if (TocElement.length > 0) 
		   { // если нашли таблицу со списком гостов
			   TocElement[0].childNodes[1].childNodes[1].childNodes[1].setAttribute("style", "width: 16%;"); // расширяем первую колонку, чтобы кнопка влезла
			   TocElement[0].childNodes[1].childNodes[1].childNodes[5].setAttribute("width", "auto"); // убираем фиксированную ширину третьей колонки
			   
			   for (var k = 0; k < tds.length; ++k) 
				{   
						//tds[k].childNodes[1].setAttribute("style", "float: left; margin-right: 6px;");
						var docLnkNode = tds[k].childNodes[1].firstChild; // получаем элемент ссылку на гост					
						var pickImage = document.createElement("img");
						var pickLink = document.createElement("a");              
						pickLink.setAttribute("style", "display: block; float: left; margin-right: 6px;");
						//var LinkStr = consts.StrGostDownloadLnk0+getQueryVar(docLnkNode.href, "month")+"&year="+getQueryVar(docLnkNode.href, "year")+"&search=&RegNum=1&DocOnPageCount=15&id="+((getQueryVar(docLnkNode.href, "id")-IdOffset));
						var LinkStr = docLnkNode.href;
						// получаем наименование госта
						var DocTitleP1 = TocElement[0].rows[k+1].cells[0].getElementsByTagName("a")[0].innerText;
						var DocTitleP2 = TocElement[0].rows[k+1].cells[1].childNodes[1].childNodes[0].nodeValue;
						var DocTitle = DocTitleP1 + " " + DocTitleP2;
						DocTitle = DocTitle.replace(/[^\w\s]/gi, '_'); // replace all characters that are not allowed in a file-system path
						pickLink.setAttribute("title", StrsRuRu.StrBtnDownloadAlt);
						pickLink.onclick = (function(LinkStrA, DocTitleA) { return function() { window.SelDocTitle = DocTitleA; loadXMLDoc(LinkStrA, getGostDownloadURL); }; })(LinkStr, DocTitle);
						pickImage.setAttribute("src", IconDownloadUrl);
						pickImage.setAttribute("align", "absmiddle");
						pickImage.setAttribute("alt", StrsRuRu.StrBtnDownloadAlt);
						pickLink.appendChild(pickImage);
						pickLink.setAttribute("href", "#");
						tds[k].insertBefore(pickLink, tds[k].firstChild);
				}
			}			
			break;
	 }

	   

}

function getGostDownloadURL(GostPg)
{
	var pageContainer = document.createElement('div');
	pageContainer.innerHTML = GostPg.replace(/<script(.|\s)*?\/script>/g, '');
	var pTables = pageContainer.getElementsByTagName("table");
	//var yearGost = pTables[1].rows[0].cells[0].childNodes[3].firstChild.nodeValue.trim().substr(0, 4);
	loadXMLDoc(pTables[6].rows[0].cells[1].childNodes[1].href, LoadGostImages);
}

function LoadGostImages(GostPage)
{
 var tempDiv = document.createElement('div');
 tempDiv.innerHTML = GostPage.replace(/<script(.|\s)*?\/script>/g, '');
 var links = tempDiv.getElementsByTagName("a");
 var PagesK = [];
 var k = 0;
 var PagesLoadedC = 0;
  
    for(var i=0; i<links.length; i++)
    {
        if((links[i].href.indexOf("pageK") > -1) && (links[i].href.indexOf("_") == -1))
        {
            var PageCode = getQueryVar(links[i].href, "pageK");
			if (PagesK.indexOf(PageCode) == -1)
			 {
			  PagesK[k] = PageCode;
			  k = k+1;
			 }								
        }
    } 

	var DataImgs = new Array(PagesK.length);
	//var pgcont = '<html><head><title>'+window.SelDocTitle+'</title></head><body>';
/*	var pgcont = document.createElement('div');
	for (var b=0; b < PagesK.length; b++)
	{
     var ImgPage = document.createElement('img');
	 ImgPage.setAttribute("src", );
	 //pgcont += '<img src="http://protect.gost.ru/image.ashx?page='+PagesK[b]+'" style="margin-bottom: 30px;" />'
	 
	 if (StatusSpan != undefined)  
	 { 
		StatusSpan.innerText = b + " из " + PagesK.length;
	 }	
	}
*/
	//pgcont += "</body></html>";
	
	var docwindow = window.open();
	docwindow.document.open();
	docwindow.document.title = window.SelDocTitle; // prevent title > windows MAX_PATH
	var docHtml = docwindow.document.createElement("html");
	var docHead = docwindow.document.createElement("head");
	var docBody = docwindow.document.createElement("body");
	docHtml.appendChild(docHead);
	docHtml.appendChild(docBody);
	docwindow.document.appendChild(docHtml);
	showProgressSplash(true, docwindow.document);
	var StatusSpan = docwindow.document.getElementById('StatusLabel');
	//TODO: Rewrite this part properly
	docBody = docwindow.document.getElementsByTagName("body")[0];
	for (var b=0; b < PagesK.length; b++)
	 {
		 var ImgPage = document.createElement('img');
		 ImgPage.onload = function()
		 {
			if(PagesLoadedC >= PagesK.length-1)
			 {
			  showProgressSplash(false, docwindow.document);
			  docwindow.print({bUI: true, bSilent: false, bShrinkToFit: true}); 
			  docwindow.document.close();
			  return;
			 }
			PagesLoadedC++;
		 }
		 ImgPage.setAttribute("src", 'http://protect.gost.ru/image.ashx?page='+PagesK[b]);
		 docBody.appendChild(ImgPage);
		 if (StatusSpan != undefined)  
			 { 
				StatusSpan.innerText = b + " из " + PagesK.length;
			 }	
	 }
}

function loadXMLDoc(srcURL, CallBackFunc)
{ 
		//window.DocTitle = "ГОСТ ТЕСТ";
		if (window.XMLHttpRequest)
        {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        }
        else
        {// code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function()
        {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
            {
                if (CallBackFunc == undefined)
					{
						return xmlhttp.responseText;
					}
				CallBackFunc(xmlhttp.responseText);
            }
        }
        xmlhttp.open("GET", srcURL, true);
		//xmlhttp.responseType = "document";
        xmlhttp.send();		
}