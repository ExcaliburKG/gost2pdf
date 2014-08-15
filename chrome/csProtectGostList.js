AppendIcons();

function AppendIcons()
{
window.SelDocTitle = new Array(3);
var divs = document.getElementsByTagName("img");
var tds = document.getElementsByClassName("tx12");
var PageType=-1;
var IconDownloadUrl = chrome.extension.getURL("images/download.png");
var PageUrl = document.location.href;
			if(contains(PageUrl.toLowerCase(), consts.PgSubStrGostPage.toLowerCase())) 
			{
				PageType = 0; // we are on the inner gost page
			}
			else 
			{
				PageType = 1; // we are on the gost list page (table)
			}    

	switch(PageType)
	 {
		case 0:
			for (var i = 0; i < divs.length; ++i)
			{
				if (divs[i].src === "http://protect.gost.ru/i/ext/icon-ext-pdf.gif") 
				{
					var pickImage = document.createElement("img");
					var pickLink = document.createElement("a");
					var docLnkNode = divs[i].parentNode.parentNode.childNodes[3].childNodes[1];
					pickLink.setAttribute("style", "margin-left: 5px;");
					pickLink.setAttribute("title", StrsRuRu.StrBtnDownloadAlt);
					var LinkStr = consts.StrGostDownloadLnk0+getQueryVar(docLnkNode.href, "month")+"&year="+getQueryVar(docLnkNode.href, "year")+"&search=&RegNum=1&DocOnPageCount=15&id="+getQueryVar(docLnkNode.href, "id");
					
					var TocGostInfo = document.getElementsByClassName(consts.PgCssGostTableClass);
					if (TocGostInfo.length > 0) 
					{
						var DocTitleP1 = TocGostInfo[0].rows[0].cells[1].childNodes[0].nodeValue;
						var DocTitleP2 = TocGostInfo[0].rows[1].cells[1].childNodes[0].nodeValue;
						var DocTitle = new Array(3); //DocTitleP1 + " " + DocTitleP2;
						DocTitle[0] = DocTitleP1.replace("ГОСТ ", "");
						DocTitle[1] = DocTitleP2;
						DocTitle[2] = DocTitle[0].substring(0, DocTitle[0].indexOf("-"));						
						
					}
					pickLink.onclick = (function(LinkStrA, DocTitleA) { return function() { window.SelDocTitle = DocTitleA; loadXMLDoc(LinkStrA, getGostDownloadURL); }; })(LinkStr, DocTitle);
					pickImage.setAttribute("src", IconDownloadUrl);
					pickImage.setAttribute("align", "absmiddle");
					pickImage.setAttribute("alt", StrsRuRu.StrBtnDownloadAlt);
					pickLink.appendChild(pickImage);
					pickLink.setAttribute("href", "#");
					divs[i].parentNode.appendChild(pickLink);
				}
			}			
			break
		case 1:
		default: 
		   var TocElement = document.getElementsByClassName("typetable");
		   if (TocElement.length > 0) 
		   {
			   TocElement[0].childNodes[1].childNodes[1].childNodes[1].setAttribute("style", "width: 16%;"); // extend first column to make room for a download button
			   TocElement[0].childNodes[1].childNodes[1].childNodes[5].setAttribute("width", "auto"); // make 3rd column resizable
			   
			   for (var k = 0; k < tds.length; ++k) 
				{   
						//tds[k].childNodes[1].setAttribute("style", "float: left; margin-right: 6px;");
						var docLnkNode = tds[k].childNodes[1].firstChild;					
						var pickImage = document.createElement("img");
						var pickLink = document.createElement("a");              
						pickLink.setAttribute("style", "display: block; float: left; margin-right: 6px;");
						//var LinkStr = consts.StrGostDownloadLnk0+getQueryVar(docLnkNode.href, "month")+"&year="+getQueryVar(docLnkNode.href, "year")+"&search=&RegNum=1&DocOnPageCount=15&id="+((getQueryVar(docLnkNode.href, "id")-IdOffset));
						var LinkStr = docLnkNode.href;
						var DocTitleP1 = TocElement[0].rows[k+1].cells[0].getElementsByTagName("a")[0].innerText;
						var DocTitleP2 = TocElement[0].rows[k+1].cells[1].childNodes[1].childNodes[0].nodeValue;
						var DocTitle = new Array(3); //DocTitleP1 + " " + DocTitleP2;
						DocTitle[0] = DocTitleP1.replace("ГОСТ ", "");
						DocTitle[1] = DocTitleP2;
						DocTitle[2] = DocTitle[0].substring(0, DocTitle[0].indexOf("-"));
						pickLink.setAttribute("title", StrsRuRu.StrBtnDownloadAlt);
						pickLink.onclick = (function(LinkStrA, DocTitleA) { 
							return function() { 
									window.SelDocTitle = DocTitleA; 
									loadXMLDoc(LinkStrA, getGostDownloadURL); 
							}; 
						})(LinkStr, DocTitle);
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
	var pageContainer = document.createElement("div");
	pageContainer.innerHTML = GostPg.replace("/<script(.|\s)*?\/script>/g", "");
	var pTables = pageContainer.getElementsByTagName("table");
	//var yearGost = pTables[1].rows[0].cells[0].childNodes[3].firstChild.nodeValue.trim().substr(0, 4);
	loadXMLDoc(pTables[6].rows[0].cells[1].childNodes[1].href, LoadGostImages);
}

function LoadGostImages(GostPage)
{
 var tempDiv = document.createElement("div");
 tempDiv.innerHTML = GostPage.replace("/<script(.|\s)*?\/script>/g", "");
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
	docwindow.onbeforeunload = function () 
	{
		xmlhttp.abort();
		GostDoc = null;
		window.SelDocTitle = "";
		showProgressSplash(false, docwindow.document);
	};
	docwindow.document.open();
	// TODO: prevent title > windows MAX_PATH
	ConstructDocTitle(window.SelDocTitle, docwindow);
	var docHtml = docwindow.document.createElement("html");
	var docHead = docwindow.document.createElement("head");
	var docBody = docwindow.document.createElement("body");
	docHtml.appendChild(docHead);
	docHtml.appendChild(docBody);
	docwindow.document.appendChild(docHtml);
	showProgressSplash(true, docwindow.document);
	var StatusSpan = docwindow.document.getElementById("StatusLabel");
	//TODO: Rewrite this part properly
	docBody = docwindow.document.getElementsByTagName("body")[0];
	for (var b=0; b < PagesK.length; b++)
	 {
		 var ImgPage = document.createElement("img");
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
		 ImgPage.setAttribute("src", consts.PgSubStrImgPage+PagesK[b]);
		 docBody.appendChild(ImgPage);
		 if (typeof (StatusSpan) != "undefined")  
			 { 
				StatusSpan.innerText = b + StrsRuRu.StrFrom + PagesK.length;
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
                if (typeof (CallBackFunc) === "undefined")
					{
						return xmlhttp.responseText;
					}
				CallBackFunc(xmlhttp.responseText);
            }
        }
        xmlhttp.open("GET", srcURL, true);
		//xmlhttp.responseType = "document";
        xmlhttp.send(null);		
}