(function() {
'use strict';

const render_stories_list = (stories) => {
  return stories.map(story => `
    <li>
      <a href="${story.links.permalink}">${story.title}</a>
    </li>`).join('')
}

const run = (title) => {
  const parent_wrapper = setup_wrapper()
  const wrapper = document.getElementById('wrapper')

  wrapper.innerHTML = '<p class="presens-p">Loading...</p>'

  const encoded_title = window.encodeURIComponent(title)
  console.log(encoded_title)

  fetch(
    `${BASE_URL}/stories?title=${encoded_title}&published_at.start=NOW-7DAYS&published_at.end=NOW&language=en&sort_by=relevance`,
    { headers })
    .then(res => res.json())
    .then(body => {
      wrapper.innerHTML = `
        <div id="close">&times;</div>
        <h2 class="presens-h2">Related articles</h2>
        <div id="sources"></div>
        <div id="explanation"></div>
      `

      const stories = document.getElementById('sources')
      const explanation = document.getElementById('explanation')

      render_explanation(explanation, body)
      document.getElementById('close').addEventListener('click', () => {
        parent_wrapper.remove()
      });

      const index = body.stories.findIndex(story => story.title === title)
      if (-1 !== index) { 
        const related_stories_url = body.stories[index].links.related_stories
        return fetch(PROXY_URL + related_stories_url, { headers })
          .then(res => res.json())
          .then(body => {
            // explanation.innerHTML = 'Showing related stories'
            // wrapper.innerHTML = render_stories_list(body.related_stories)
            render_stories(stories, body.related_stories)
          })
      } else {
        // explanation.innerHTML = 'These stories might be interesting'
        // wrapper.innerHTML = render_stories_list(body.stories)
        render_stories(stories, body.stories)
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

const explanation = document.getElementById('explanation')
const wrapper = document.getElementById('wrapper')

/*
const add_wrapper = (list) => {
  const wrapper = document.createElement('p');
  wrapper.style.position = 'fixed';
  wrapper.style.top = 0;
  wrapper.style.right = 0;
  wrapper.style.backgroundColor = 'blue';
  wrapper.style.zIndex = 2;
  wrapper.innerHTML = list;
  document.body.appendChild(wrapper);
}
*/

const render_stories = (element, stories) => {
  element.innerHTML = stories.map(story => {
    return `
      <article class="presens-article">
        <h3 class="presens-h3"><a href="${story.links.permalink}">${story.title}</a></h3>
        <p class="source presens-p">${story.source.name}</p>
      </article>
    `
  }).join('')
}

const render_explanation = (element, payload) => {
  console.log('render_explanation', payload)
  element.innerHTML = `
    <p class="faded presens-p">Additional sources found by searching for: "${payload.story_title}"</p>
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
