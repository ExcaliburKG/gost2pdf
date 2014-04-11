String.prototype.trim = function() {  return this.replace("/^\s+|\s+$/g", "");  }
var consts = {
   'StrGostDownloadLnk0': 'http://protect.gost.ru/v.aspx?control=8&baseC=6&page=0&month=',
   'PgSubStrGostTable': 'default.aspx?control=6',
   'PgSubStrGostPage': 'document.aspx?control=7',
   'PgCssGostTableClass': 'typetable',
   'GostIdOffset': 7896,
   'GostIdOldOffset': 7897
};

var StrsRuRu = {
    'StrBtnDownloadAlt': 'Скачать ГОСТ на диск',
	'StrProgressWait': 'ГОСТ формируется, пожалуйста, подождите...',
	'StrFrom': ' из ',
	'StrVarNotFound': 'Не найдена переменная %s'
};

var GostDoc;
var xmlhttp;

function init()
{
  if (!(document.documentElement instanceof HTMLElement))
    return;
  //console.log('GOST2PDF is loaded');
}

/*
	Developed by Robert Nyman, http://www.robertnyman.com
	Code/licensing: http://code.google.com/p/getelementsbyclassname/
*/	
var getElementsByClassName = function (className, tag, elm){
	if (document.getElementsByClassName) {
		getElementsByClassName = function (className, tag, elm) {
			elm = elm || document;
			var elements = elm.getElementsByClassName(className),
				nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
				returnElements = [],
				current;
			for(var i=0, il=elements.length; i<il; i+=1){
				current = elements[i];
				if(!nodeName || nodeName.test(current.nodeName)) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	else if (document.evaluate) {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = "",
				xhtmlNamespace = "http://www.w3.org/1999/xhtml",
				namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
				returnElements = [],
				elements,
				node;
			for(var j=0, jl=classes.length; j<jl; j+=1){
				classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
			}
			try	{
				elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
			}
			catch (e) {
				elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
			}
			while ((node = elements.iterateNext())) {
				returnElements.push(node);
			}
			return returnElements;
		};
	}
	else {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = [],
				elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
				current,
				returnElements = [],
				match;
			for(var k=0, kl=classes.length; k<kl; k+=1){
				classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
			}
			for(var l=0, ll=elements.length; l<ll; l+=1){
				current = elements[l];
				match = false;
				for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
					match = classesToCheck[m].test(current.className);
					if (!match) {
						break;
					}
				}
				if (match) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	return getElementsByClassName(className, tag, elm);
};

/*
function getQueryVar(urlSrc, variable) 
{
    //var query = window.location.search.substring(1);
    var vars = urlSrc.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Не найдена переменная %s', variable);
}
*/

function showProgressSplash(ShowIt, doc)
{
	var bodyElement = doc.getElementsByTagName("body")[0];
	if(typeof (bodyElement) == "undefined")
	  {
		return -1;
	  }
	if (ShowIt)
	{
	var CatPic = chrome.extension.getURL("images/cat.gif");
	var splashDiv = doc.createElement("div");
	  splashDiv.id = "Splash_containter";
	  splashDiv.style.cssText = "margin: 10px auto; position: fixed; padding:0; width: 100%; overflow: hidden; min-height:100%; height:100%; left: 0px; top: 0px; z-index: 9998; background: #FFFFFF; text-align: center;";
	  splashDiv.innerHTML = "<img id='cat' style=\"position: absolute; z-index: 9999; right: -20%;\" src=\""+CatPic+"\" alt=\"\" /> <div style=\"position: relative; top: 50%; margin-top: -100px; font-size: 24px; font-weight: bold; font-family: Arial;\">"+StrsRuRu.StrProgressWait+"<span id=\"StatusLabel\">.</span></div>"
	  bodyElement.setAttribute("style", "overflow: hidden;");
	  bodyElement.appendChild(splashDiv);
	  var elem = doc.getElementById("cat");
	  var pos = -20;


	  window.SplashTimer = setInterval(function () 
	  {
		pos++;

		elem.style.right = (pos / 3) + "%";
		if (pos == 300) {
			pos = -25;
		}

	   }, 40);
    }
	else
	{
	 clearInterval(SplashTimer);
	 var splashDiv = doc.getElementById("Splash_containter");
	 if (typeof (splashDiv) === "undefined")  { return;}	 
	 splashDiv.parentNode.removeChild(splashDiv);
	}
}
 
 
function getQueryVar(urlSrc, variable) 
{
    //var query = window.location.search.substring(1);
    var vars = urlSrc.split(/[\\?|&]/);
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log(StrsRuRu.StrVarNotFound, variable);
}

function contains(search, find) 
{
    return search.indexOf(find) !== -1;
}

function getGostDoc()
{
 return GostDoc;
}

// для Chrome 18
if (document.documentElement)
  init();
else
  window.setTimeout(init, 0);