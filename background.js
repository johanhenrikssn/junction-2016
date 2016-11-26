'use strict'

function searchNews(tab, event) {
  chrome.tabs.executeScript(tab.ib, {
    file: 'inject.js'
  });
}

chrome.contextMenus.create({
  title: 'Similar news',
  contexts: ['all'],
  onclick: searchNews
});
