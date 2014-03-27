﻿AppendIcons();

function AppendIcons()
{
 var IconDownloadUrl = chrome.extension.getURL("images/download.png");
 var divs = document.getElementsByTagName("img");
 var anchors = document.getElementsByTagName('a');
 var hrefs = [];
  for (var i=0; i < anchors.length; i++)
  {
    if ((anchors[i].href.indexOf("MaterialID=") > -1) && (anchors[i].href.indexOf("lpage=") > -1))
    hrefs.push(anchors[i]);
  }
  var LegendElement = document.getElementsByTagName("legend");
  if  ((LegendElement.length > 0) && (LegendElement[0].innerText != 'Поиск:'))// we are on the first page of selected gost, we'll make a single link insertion
	{
	  var TitleElement = document.getElementsByTagName("h2");
	  if (TitleElement.length > 0)
	    {
		 if (TitleElement[0].innerText.indexOf("ГОСТ") > -1) 
		  {
			 var pickImage = document.createElement("img");
			 var pickLink = document.createElement("a");
			 var DocTitle = TitleElement[0].innerText;
			 window.LinkStr = "http://www.gostinfo.ru/PRI/Page/GetPage?MaterialID="+getQueryVar(hrefs[0].href, "MaterialID")+"&lpage=2&page=1";
			 pickImage.setAttribute("src", IconDownloadUrl);		
			 pickImage.setAttribute("align", "absmiddle");
			 pickImage.setAttribute("alt", "Скачать ГОСТ"); 
			 pickLink.setAttribute("style", "display: block; float: left; margin-right: 6px;");
			 pickLink.setAttribute("title", "Скачать ГОСТ на диск");
			 pickLink.setAttribute("href", "#");		 
			 pickLink.onclick = (function(LinkStrA) { return function() { showProgressSplash(true, GostDoc); window.SelDocTitle = DocTitle; window.PagesTotal=0; window.CurrentPage=0; loadXMLDoc(LinkStrA, LoadGostImages); }; })(LinkStr);
			 pickLink.appendChild(pickImage);
			 TitleElement[0].insertBefore(pickLink, TitleElement[0].firstChild);
		  }
		}
	}
	else // we are on the gost list
       {	
		   for (var k = 0; k < hrefs.length; ++k) 
			{   
					//tds[k].childNodes[1].setAttribute("style", "float: left; margin-right: 6px;");
					//var docLnkNode = hrefs[k]; // получаем элемент ссылку на гост
					var pickImage = document.createElement("img");
					var pickLink = document.createElement("a");              
					pickLink.setAttribute("style", "display: block; float: left; margin-right: 6px;");
					window.LinkStr = "http://www.gostinfo.ru/PRI/Page/GetPage?MaterialID="+getQueryVar(hrefs[k].href, "MaterialID")+"&lpage=2&page=1";
					//var LinkStr = anchors[k];
					// получаем наименование госта
					var TocGostInfo = document.getElementsByTagName("table");
					if (TocGostInfo.length > 0) { // если нашли таблицу с информацией о госте
					var DocTitleP1 = TocGostInfo[1].rows[k+1].cells[1].childNodes[1].innerText.trim();
					var DocTitleP2 = TocGostInfo[1].rows[k+1].cells[2].childNodes[0].nodeValue.trim();}
					var DocTitle = DocTitleP1 + " " + DocTitleP2;	
					pickLink.setAttribute("title", "Скачать ГОСТ на диск");
					pickLink.onclick = (function(LinkStrA, DocTitleA) { return function() { showProgressSplash(true, GostDoc); window.SelDocTitle = DocTitleA; console.log(DocTitleA); window.PagesTotal=0; window.CurrentPage=0; loadXMLDoc(LinkStrA, LoadGostImages); }; })(LinkStr, DocTitle);
					pickImage.setAttribute("src", IconDownloadUrl);
					pickImage.setAttribute("align", "absmiddle");
					pickImage.setAttribute("alt", "Скачать ГОСТ");
					pickLink.appendChild(pickImage);
					pickLink.setAttribute("href", "#");
					hrefs[k].insertBefore(pickLink, hrefs[k].firstChild);
			}
	   }
}

function LoadGostImages(UrlSrc, GostPage)
{
 var tempDiv = document.createElement('div');
 tempDiv.innerHTML = GostPage.replace(/<script(.|\s)*?\/script>/g, '');
 if (CurrentPage < 1) // first run, get total pages
  {
	var PagesTotalTag = tempDiv.getElementsByTagName("legend");
	PagesTotal = parseInt(PagesTotalTag[0].innerText.substring(PagesTotalTag[0].innerText.length, PagesTotalTag[0].innerText.length-3).trim());
	window.DataImgs = new Array(PagesTotal);
  }
  if (CurrentPage >= PagesTotal)
  {
	showProgressSplash(false, GostDoc);
	var pgcont = '<html><head><title>'+window.SelDocTitle+'</title></head><body>';
	for (var b=0; b < PagesTotal; b++)
	{
     pgcont += '<img src="'+window.DataImgs[b]+'" style="margin-bottom: 30px;" />'
	}
	pgcont += "</body></html>";
	
	var docwindow = window.open();
	docwindow.document.open();
	docwindow.document.write(pgcont);
	docwindow.print({bUI: true, bSilent: false, bShrinkToFit: true});
	docwindow.document.close();
	CurrentPage = 0;
	PagesTotal = 0;
	return 0;
  }
 var CssEntries = tempDiv.getElementsByTagName("link");
 if ((CssEntries == undefined) && (CssEntries.length <= 0)) { return 1;}
 window.DataImgs[CurrentPage] = CssEntries[0].href.replace("GetPageCSS", "GetPageContent");
 CurrentPage++;
 var StatusSpan = document.getElementById('StatusLabel');
 if (StatusSpan != undefined)  
 { 
	  StatusSpan.innerText = CurrentPage + " из " + PagesTotal;
 }	  
 loadXMLDoc( UrlSrc.substring(0, UrlSrc.lastIndexOf('=')+1) + (CurrentPage+1), LoadGostImages);
}

function loadXMLDoc(srcURL, CallbackFunc)
{ 
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
                CallbackFunc(srcURL, xmlhttp.responseText);
            }
        }
        xmlhttp.open("GET", srcURL, true);
		//xmlhttp.responseType = "document";
        xmlhttp.send();		
}

function GetBgImageURLFromEntity(imgObject)
{
	var style = imgObject.currentStyle || window.getComputedStyle(imgObject, false);
	return style.backgroundImage.slice(4, -1);
}