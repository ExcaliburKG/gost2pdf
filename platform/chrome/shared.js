var downloadButtonsLocation = {
    GostInnerPage: 0, // any inner page of selected gost document
    MonthlyTOC: 1 // start page with year/month menu
}

String.prototype.trim = function () { return this.replace("/^\s+|\s+$/g", ""); }

var consts = {
    'StrGostDownloadLnk0': 'http://protect.gost.ru/v.aspx?control=8&baseC=6&page=0&month=',
    'PgSubStrGostTable': 'default.aspx?control=6',
    'PgSubStrGostPage': 'document1.aspx?control=31',
    'PgSubStrGostPageInner': 'v.aspx?control=8&baseC=6',
    'PgSubStrImgPage': 'http://protect.gost.ru/image.ashx?page=',
    'PgCssGostTableClass': 'typetable',
    'GostIdOffset': 7896,
    'GostIdOldOffset': 7897,
    'FileNameMaxLength': 200
};

var strsRuRu = {
    'StrBtnDownloadAlt': 'Скачать ГОСТ',
    'StrVarNotFound': 'Не найдена переменная %s',
    'nameTplNumber': '%номер',
    'nameTplYearAndNumber': '%номер_год',
    'nameTplDocType': '%тип_документа',
    'nameTplName': '%имя',
    'nameTplAutoName': '%автоназвание',
    'errorCannotGetGostName': 'Ошибка получения имени ГОСТа',
    'errorGostSaveGeneral': 'Ошибка при сохранении ГОСТа',
    'errorCannotGetGostURL': 'Ошибка получения URL ГОСТа',
    'errorCannotRestoreButtonIcon': 'Невозможно восстановить иконку кнопки '
};

var gostDoc;
var xmlhttp;

function init() {
    if (!(document.documentElement instanceof HTMLElement))
        return;
}

/*	Developed by Robert Nyman, http://www.robertnyman.com
	Code/licensing: http://code.google.com/p/getelementsbyclassname/ */
var getElementsByClassName = function (className, tag, elm) {
    if (document.getElementsByClassName) {
        getElementsByClassName = function (className, tag, elm) {
            elm = elm || document;
            var elements = elm.getElementsByClassName(className),
                nodeName = (tag) ? new RegExp("\\b" + tag + "\\b", "i") : null,
                returnElements = [],
                current;
            for (var i = 0, il = elements.length; i < il; i += 1) {
                current = elements[i];
                if (!nodeName || nodeName.test(current.nodeName)) {
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
                namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace) ? xhtmlNamespace : null,
                returnElements = [],
                elements,
                node;
            for (var j = 0, jl = classes.length; j < jl; j += 1) {
                classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
            }
            try {
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
                elements = (tag === "*" && elm.all) ? elm.all : elm.getElementsByTagName(tag),
                current,
                returnElements = [],
                match;
            for (var k = 0, kl = classes.length; k < kl; k += 1) {
                classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
            }
            for (var l = 0, ll = elements.length; l < ll; l += 1) {
                current = elements[l];
                match = false;
                for (var m = 0, ml = classesToCheck.length; m < ml; m += 1) {
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

function getQueryVar(urlSrc, variable) {
    var vars = urlSrc.split(/[\\?|&]/);
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log(strsRuRu.StrVarNotFound, variable);
}

function findImagesBySrc(stringToSearch, parentNode) {
    var images = Array.prototype.slice.call((parentNode || document).getElementsByTagName('img'));
    var length = images.length;
    var result = [];
    for (var i = 0; i < length; ++i) {
        if (images[i].src.indexOf(stringToSearch) != -1) {
            result.push(images[i]);
        }
    }
    return result;
}

function contains(search, find) {
    return search.indexOf(find) !== -1;
}

function getGostDoc() {
    return gostDoc;
}

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

// для Chrome 18
if (document.documentElement)
    init();
else
    window.setTimeout(init, 0);

function constructDocTitle(titlePart1, titlePart2) {
    return new Promise(function (resolve, reject) {
        chrome.storage.sync.get({ "gostFNameTpl": strsRuRu.nameTplAutoName }, function (e) {
            var result = e.gostFNameTpl;
            var titleCombined = (titlePart2.length > 0) ? titlePart1 + '. ' + titlePart2 : titlePart1;
            var yearDelimeterPos = titlePart1.lastIndexOf('-');
            var numberDelimeterPos = titlePart1.lastIndexOf(' ');
            if ((yearDelimeterPos < 0) || (numberDelimeterPos < 0)) {
                reject({
                    statusText: strsRuRu.errorCannotGetGostName
                });
            }
            var gostYearAndNumber = titlePart1.substr(numberDelimeterPos+1, titlePart1.length - numberDelimeterPos);
            var gostYear = titlePart1.substr(yearDelimeterPos+1, titlePart1.length - numberDelimeterPos - 1);
            var gostNumber = titlePart1.substr(numberDelimeterPos + 1, yearDelimeterPos - numberDelimeterPos - 1);
            var gostDocType = titlePart1.substr(0, numberDelimeterPos);
            result = result.replace(strsRuRu.nameTplYearAndNumber, gostYearAndNumber);
            result = result.replace(strsRuRu.nameTplName, titlePart2);
            result = result.replace(strsRuRu.nameTplNumber, gostNumber);
            result = result.replace(strsRuRu.nameTplDocType, gostDocType);
            result = result.replace(strsRuRu.nameTplAutoName, titleCombined);
            result = result.replace("[^\\w|\\s]", "_"); // replace all characters that are not allowed in a file-system path
            resolve(result);
        });
    });
}