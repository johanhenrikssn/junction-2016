var current_title;

(function() {
'use strict'

document.addEventListener('mousedown', (elem) => {
  console.log(elem, elem.target, elem.sourceElement)
  current_title = elem.target.innerHTML
  console.log({current_title})
})

})()
