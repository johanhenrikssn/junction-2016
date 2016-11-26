(function() {
'use strict';

const run = (title) => {
  const parent_wrapper = setup_wrapper()
  const wrapper = document.getElementById('wrapper')

  wrapper.innerHTML = '<p class="presens-p">Loading...</p>'


  const encoded_title = window.encodeURIComponent(title)

  fetch(
    `${BASE_URL}/stories?title=${encoded_title}&published_at.start=NOW-7DAYS&published_at.end=NOW&language=en&sort_by=relevance`,
    { headers })
    .then(res => res.json())
    .then(body => {  
      const index = body.stories.findIndex(story => story.title === title)
      // Exact match
      if (-1 !== index) { 
        const related_stories_url = body.stories[index].links.related_stories
        return fetch(PROXY_URL + related_stories_url, { headers })
          .then(res => res.json())
          .then(body => {
            render(body.related_stories, body.story_title, "Related articles")
          })
      // No exact match 
      } else {
          render(body.stories, title, "These articles might be related")
      }
    })
}

const decode_query = (raw) => {
  if (raw.trim() === '') return {}
  const query = raw.substr(1)
  const vars = query.split('&')
  const result = {}
  for (var i = 0; i < vars.length; ++i) {
    const pair = vars[i].split('=')
    result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || null)
  }
  return result
}

const { app_id, app_key } = decode_query(window.location.search)
const PROXY_URL = 'http://localhost:8888/proxy/'
const BASE_URL = PROXY_URL + 'https://api.newsapi.aylien.com/api/v1'
var headers = new Headers({
  'X-AYLIEN-NewsAPI-Application-ID': app_id,
  'X-AYLIEN-NewsAPI-Application-Key': app_key
})

const render = (stories, title, description_text) => {
  wrapper.innerHTML = `
  <div id="close"></div>
  <h2 id="description" class="presens-h2"></h2>
  <div id="sources"></div>
  <div id="explanation"></div>
  `
  const sources = document.getElementById('sources')
  const explanation = document.getElementById('explanation')
  const close = document.getElementById('close')
  const description = document.getElementById('description')
  
  document.getElementById('close').addEventListener('click', () => {
    parent_wrapper.remove()
  });
  
  description.innerHTML = description_text
  close.innerHTML = "&times"
  render_stories(sources, stories)
  render_explanation(explanation, title)
}

const render_stories = (element, stories) => {
  const emoji_map = {
    positive: '🙂',
    negative: '🙁',
    neutral: '😐' 
  }

  element.innerHTML = stories.map(story => {
    return `
      <article class="presens-article">
        <h3 class="presens-h3">
          <a href="${story.links.permalink}">
            ${emoji_map[story.sentiment.body.polarity]}  ${story.title}        
          </a>
        </h3>
        <p class="source presens-p">${story.source.name}</p>
      </article>
    `
  }).join('')
}

const render_explanation = (element, title) => {
  element.innerHTML = `
    <p class="faded presens-p">Additional sources found by searching for: "${title}"</p>
  `
}

const setup_wrapper = () => {
  const parent_wrapper = document.createElement('div')
  parent_wrapper.id = 'parent-wrapper'
  document.body.append(parent_wrapper)

  parent_wrapper.innerHTML = '<div id="wrapper"></div>'

  return parent_wrapper
}

// Input from extension.
console.log(current_title)
run(current_title)

})()
