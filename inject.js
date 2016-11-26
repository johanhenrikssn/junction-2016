(function() {
'use strict';

const run = (title) => {
  const wrapper = setup_wrapper()
  wrapper.innerHTML = 'Loading...'
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
            
            var request = new Request('http://www.sentiment140.com/api/bulkClassifyJson', {
              method: 'POST', 
              body: JSON.stringify({"data": [{"text": "I love Titanic."}, 
                    {"text": "I hate Titanic."}]})
            });

            fetch(request)
              .then(res => res.json())
              .then(body => {
                var sentiments = count_sentiment(body.data)
                console.log(sentiments)
                var amount = 2
                wrapper.innerHTML = `${wrapper.innerHTML} 
                <p> The opinions regarding this subject on Twitter: </p>
                negative: ${(sentiments['0']/amount)*100}%, neutral: ${(sentiments['2']/amount)*100}%,  positive: ${(sentiments['4']/amount)*100}%`
                
              })
          })
          
      // No exact match 
      } else {
          render(body.stories, title, "These articles might be related")
      }
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
  wrapper.innerHTML = `
  <div id="close"></div>
  <h2 id="description"></h2>
  <div id="sources"></div>
  <div id="explanation"></div>
  `
  const sources = document.getElementById('sources')
  const explanation = document.getElementById('explanation')
  const close = document.getElementById('close')
  const description = document.getElementById('description')
  
  document.getElementById('close').addEventListener('click', () => {
    wrapper.remove()
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
      <article>
        <h3>
          <a href="${story.links.permalink}">${story.title} 
            ${emoji_map[story.sentiment.body.polarity]}
          </a>
        </h3>
        <p class="source">${story.source.name}</p>
      </article>
    `
  }).join('')
}

const render_explanation = (element, title) => {
  element.innerHTML = `
    <p class="faded">Additional sources found by searching for: "${title}"</p>
  `
}

const setup_wrapper = () => {
  const wrapper = document.createElement('div')
  wrapper.id = 'wrapper'
  document.body.append(wrapper)
  return wrapper
}

// Input from extension.
console.log(current_title)
run(current_title)

})()
