AppendDownloadIcons();

function AppendDownloadIcons() {
    var tds = document.getElementsByClassName("tx12");
    var pageType = downloadButtonsLocation.GostInnerPage;
    var iconDownloadUrl = chrome.extension.getURL("img/download.png");
    var iconLoaderUrl = chrome.extension.getURL("img/loader.gif");
    var pageUrl = document.location.href;
    if (contains(pageUrl.toLowerCase(), consts.PgSubStrGostPage.toLowerCase()) ||
        contains(pageUrl.toLowerCase(), consts.PgSubStrGostPageInner.toLowerCase())
        ) {
        pageType = downloadButtonsLocation.GostInnerPage; // we are on the inner gost page
    }
    else {
        pageType = downloadButtonsLocation.MonthlyTOC; // we are on the gost list page (table)
    }
    switch (pageType) {
        case downloadButtonsLocation.GostInnerPage:
            console.log('inner page');
            var pdfIconsImages = findImagesBySrc('icon-ext-pdf.gif');
            if (!pdfIconsImages) return;
            var pdfIcon = pdfIconsImages[0];
            var docLnkNode = pdfIcon.parentNode.parentNode.childNodes[3].childNodes[1];
                    var linkStr = consts.StrGostDownloadLnk0 + getQueryVar(docLnkNode.href, "month") + "&year=" + getQueryVar(docLnkNode.href, "year") + "&search=&RegNum=1&DocOnPageCount=15&id=" + getQueryVar(docLnkNode.href, "id");
                    var tocGostInfo = document.getElementsByClassName(consts.PgCssGostTableClass);
                    if (tocGostInfo.length > 0) {
                        var docTitleP1 = tocGostInfo[0].rows[0].cells[1].childNodes[0].nodeValue;
                        var docTitleP2 = tocGostInfo[0].rows[1].cells[1].childNodes[0].nodeValue;
                    }
                    var btnDownloadGost = addDownloadButton(
                        linkStr,
                        "margin-left: 5px;",
                        k,
                        iconDownloadUrl,
                        iconLoaderUrl,
                        docTitleP1,
                        docTitleP2
                    );
                    pdfIcon.parentNode.appendChild(btnDownloadGost);
            break;
        case downloadButtonsLocation.MonthlyTOC:
        default:
            console.log('toc page');
            var tocElement = document.getElementsByClassName("typetable");
            if (tocElement.length > 0) {
                tocElement[0].childNodes[1].childNodes[1].childNodes[1].setAttribute("style", "width: 16%;"); // extend first column to make room for a download button
                tocElement[0].childNodes[1].childNodes[1].childNodes[5].setAttribute("width", "auto"); // make 3rd column resizable

                for (var k = 0; k < tds.length; ++k) {
                    //tds[k].childNodes[1].setAttribute("style", "float: left; margin-right: 6px;");
                    var docLnkNode = tds[k].childNodes[1].firstChild;
                    var linkStr = docLnkNode.href;
                    var docTitleP1 = tocElement[0].rows[k + 1].cells[0].getElementsByTagName("a")[0].innerText;
                    var docTitleP2 = "";
                    if (tocElement[0].rows[k + 1].cells[1].childNodes[1].childNodes.length > 0) {
                        docTitleP2 = tocElement[0].rows[k + 1].cells[1].childNodes[1].childNodes[0].nodeValue;
                    }
                    var btnDownloadGost = addDownloadButton(
                        linkStr,
                        "display: block; float: left; margin-right: 6px;",
                        k,
                        iconDownloadUrl,
                        iconLoaderUrl,
                        docTitleP1,
                        docTitleP2
                    );                    
                    tds[k].insertBefore(btnDownloadGost, tds[k].firstChild);
                }
            }
            break;
    }
}

function addDownloadButton(linkURL, linkStyle, btnId, iconUrl, iconLoadUrl, documentTitleP1, documentTitleP2) {
    var pickImage = document.createElement("img");
    var pickLink = document.createElement("a");
    pickLink.setAttribute("style", linkStyle);
    pickLink.setAttribute("title", strsRuRu.StrBtnDownloadAlt);
    pickLink.setAttribute("id", "gostlink" + btnId);
    pickLink.onclick = (function (linkStrA, docTitlePart1, docTitlePart2, linkBtnIndex) {
        return function () {
            var gostImage = document.getElementById("gostimg" + linkBtnIndex);
            gostImage.setAttribute("src", iconLoadUrl);
            loadXMLDoc(linkStrA)
                .then(function (gostPageData) {
                    return getGostDownloadURL(gostPageData);
                })
                .then(function (gostURL) {
                    return loadXMLDoc(gostURL);
                })
                .then(function (gostPageWithImageLinks) {
                    return LoadGostImages(gostPageWithImageLinks);
                })
                .then(function (docData) {
                    return constructDocTitle(docTitlePart1, docTitlePart2)
                        .then(function (docGostTitle) {
                            return printPages(docData, docGostTitle, window);
                        });
                })
                .then(function () {
                    return restoreDownloadButtonState(linkBtnIndex);
                })
                .catch(function (err) {
                    console.error(strsRuRu.errorGostSaveGeneral, err.statusText);
                });
        };
    })(linkURL, documentTitleP1, documentTitleP2, btnId);
    pickImage.setAttribute("src", iconUrl);
    pickImage.setAttribute("id", "gostimg" + btnId);
    pickImage.setAttribute("align", "absmiddle");
    pickImage.setAttribute("alt", strsRuRu.StrBtnDownloadAlt);
    pickLink.setAttribute("href", "javascript:void(0);");
    pickLink.appendChild(pickImage);
    return pickLink;
}

function getGostDownloadURL(gostPg) {
    return new Promise(function (resolve, reject) {
        var pageContainer = document.createElement("div");
        pageContainer.innerHTML = gostPg.replace("/<script(.|\s)*?\/script>/g", "");
        var pTables = pageContainer.getElementsByTagName("table");
        if (!pTables) {
            reject({
                statusText: strsRuRu.errorCannotGetGostURL
            });
        }
        else {
            resolve(pTables[6].rows[0].cells[1].childNodes[1].href);
        }
    });
}

function LoadGostImages(gostPage) {
    return new Promise(function (resolve, reject) {
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = gostPage.replace("/<script(.|\s)*?\/script>/g", "");
        var links = tempDiv.getElementsByTagName("a");
        var PagesK = [];
        var k = 0;
        var PagesLoadedC = 0;
        for (var i = 0; i < links.length; i++) {
            if ((links[i].href.indexOf("pageK") > -1) && (links[i].href.indexOf("_") == -1)) {
                var PageCode = getQueryVar(links[i].href, "pageK");
                if (PagesK.indexOf(PageCode) == -1) {
                    PagesK[k] = PageCode;
                    k = k + 1;
                }
            }
        }
        var DataImgs = new Array();
        for (var b = 0; b < PagesK.length; b++) {
            var ImgPage = document.createElement("img");
            ImgPage.onload = function () {
                if (PagesLoadedC >= PagesK.length - 1) {
                    resolve(DataImgs);
                }
                PagesLoadedC++;
            }
            ImgPage.setAttribute("src", consts.PgSubStrImgPage + PagesK[b]);
            DataImgs.push(ImgPage);
        }
    });
}

function printPages(srcPages, docTitle, wndDoc) {
    return new Promise(function (resolve, reject) {
        var canvas = wndDoc.document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var pdf = new jsPDF('p', 'mm', 'a4');
        canvas.width = 661;
        canvas.height = 936;
        pdf.setFontSize(12);
        var addPageLimit = srcPages.length - 1;
        for (var i = 0; i < srcPages.length; i++) {
            var currentImage = srcPages[i];
            ctx.drawImage(currentImage, 0, 0);
            var imgData = canvas.toDataURL('image/jpeg', 1.0);
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
            if (i < addPageLimit) {
                pdf.addPage();
            }
        }
        var gostFileName = (docTitle.length < consts.FileNameMaxLength) ? docTitle : docTitle.substring(0, consts.FileNameMaxLength);
        gostFileName = gostFileName + ".pdf";
        pdf.save(gostFileName);
        resolve("success");
    });
}

function restoreDownloadButtonState(buttonIndex) {
    return new Promise(function (resolve, reject) {
        var gostImage = document.getElementById("gostimg" + buttonIndex);
        if (!gostImage) {
            reject({
                statusText: strsRuRu.errorCannotRestoreButtonIcon + buttonIndex
            });
        }
        var IconDownloadUrl = chrome.extension.getURL("img/download.png");
        gostImage.setAttribute("src", IconDownloadUrl);
        resolve();
    });
}

function loadXMLDoc(srcURL) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', srcURL);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.responseText);
            }
            else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}