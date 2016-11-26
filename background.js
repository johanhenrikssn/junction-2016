function searchNews(tab, event) {
    console.log(event)
    chrome.tabs.executeScript(tab.ib, {
        file: 'inject.js'
    });
}

chrome.contextMenus.create({
 title: "Similar news",
 contexts:["link"],  
 onclick: searchNews 
});

