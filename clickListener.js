var current_title;

(function() {
'use strict'

document.addEventListener('mousedown', (elem) => {
  current_title = elem.target.innerHTML
})

})()
