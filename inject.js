(function() {
'use strict';

const run = (title) => {
  const parent_wrapper = setup_wrapper()
  const wrapper = document.getElementById('presens-wrapper')

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
            get_sentiments()
          })
          
      // No exact match 
      } else {
          render(body.stories, title, "These articles might be related")
          get_sentiments()
      }
    })
}

const get_sentiments = () => {
  var wrapper = document.getElementById('presens-wrapper')
  var request = new Request('http://www.sentiment140.com/api/bulkClassifyJson', {
    method: 'POST', 
    body: JSON.stringify({"data": [{"text": "I love Titanic."}, 
      {"text": "I Titanic."}, 
      {"text": "I love Titanic."}, 
      {"text": "I feel Titanic."}, 
      {"text": "I do Titanic."}, 
      {"text": " Titanic?"}, 
      {"text": "Titanic."},
      {"text": "I hate Titanic."}]})
  });

  fetch(request)
    .then(res => res.json())
    .then(body => {
      var sentiments = count_sentiment(body.data)
      var amount = 8
      wrapper.innerHTML = `${wrapper.innerHTML} 

      <h2 class="presens-h2" id="presens-twitter-text"> The opinions regarding this subject on Twitter </h2>
      <div class="presens-bar">
        <div class="presens-smile">🙂</div>
        <div id="presens-positive"></div>
      </div>

      <div class="presens-bar">
        <div class="presens-smile">😐</div>
        <div id="presens-neutral"></div> 
      </div>

      <div class="presens-bar">
        <div class="presens-smile">🙁</div>
        <div id="presens-negative"></div>  
      </div>

      `

      const negative = document.getElementById('presens-negative')
      negative.style.width= `${(sentiments['0']/amount)*100}%`;

      const positive = document.getElementById('presens-neutral')
      positive.style.width= `${(sentiments['2']/amount)*100}%`;

      const neutral = document.getElementById('presens-positive')
      neutral.style.width= `${(sentiments['4']/amount)*100}%`;
    })
}

const count_sentiment = (arr) => {
  var res = {
    "0":0,
    "2":0,
    "4":0
  }
  
  arr.map(x => res[x.polarity.toString()] = res[x.polarity.toString()]+1)
  return res
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

const { app_id, app_key, ngrok_id } = decode_query(window.location.search)
const PROXY_URL = `https://${ngrok_id}.ngrok.io/proxy/`
const BASE_URL = PROXY_URL + 'https://api.newsapi.aylien.com/api/v1'
var headers = new Headers({
  'X-AYLIEN-NewsAPI-Application-ID': app_id,
  'X-AYLIEN-NewsAPI-Application-Key': app_key
})

const render = (stories, title, description_text) => {
  const wrapper = document.getElementById('presens-wrapper')
  const parent_wrapper = document.getElementById('parent-wrapper')

  wrapper.innerHTML = `
  <div id="presens-close"></div>
  <h2 id="presens-description" class="presens-h2"></h2>
  <div id="sources"></div>
  <div id="presens-explanation"></div>
  `
  const sources = document.getElementById('sources')
  const explanation = document.getElementById('presens-explanation')
  const close = document.getElementById('presens-close')
  const description = document.getElementById('presens-description')
  
  description.innerHTML = description_text
  close.innerHTML = "&times"
  render_stories(sources, stories.slice(0,3))
  render_explanation(explanation, title)

  close.addEventListener('click', () => {
    parent_wrapper.remove()
  });
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
          <span> ${emoji_map[story.sentiment.body.polarity]} </span>
          <a class="presens-a" href="${story.links.permalink}">
            ${story.title}        
          </a>
        </h3>
        <p class="source presens-p">${story.source.name}</p>
      </article>
    `
  }).join('')
}

const render_explanation = (element, title) => {
  element.innerHTML = `
    <p class="presens-faded presens-p">Additional sources found by searching for: "${title}"</p>
  `
}

const setup_wrapper = () => {
  const parent_wrapper = document.createElement('div')
  parent_wrapper.id = 'parent-wrapper'
  document.body.append(parent_wrapper)

  parent_wrapper.innerHTML = '<div id="presens-wrapper"></div>'

  return parent_wrapper
}

// Input from extension.
console.log(current_title)
run(current_title)

})()
