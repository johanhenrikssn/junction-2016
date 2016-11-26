function searchNews(tab) {
    chrome.tabs.executeScript(tab.ib, {
        file: 'inject.js'
    });
}

chrome.contextMenus.create({
 title: "Similar news",
 contexts:["selection"],  
 onclick: searchUrbanDict  
});

