(function() {
'use strict';

const render_stories_list = (stories) => {
  return stories.map(story => `
    <li>
      <a href="${story.links.permalink}">${story.title}</a>
    </li>`).join('')
}

const run = (title) => {
  const encoded_title = window.encodeURIComponent(title)
  fetch(
    `${BASE_URL}/stories?title=${encoded_title}&published_at.start=NOW-7DAYS&published_at.end=NOW&language=en`,
    { headers })
    .then(res => res.json())
    .then(body => {
      const index = body.stories.findIndex(story => story.title === title)
      if (-1 !== index) { 
        const related_stories_url = body.stories[index].links.related_stories
        return fetch(PROXY_URL + related_stories_url, { headers })
          .then(res => res.json())
          .then(body => {
            // explanation.innerHTML = 'Showing related stories'
            // wrapper.innerHTML = render_stories_list(body.related_stories)
            add_wrapper(render_stories_list(body.related_stories))
          })
      } else {
        // explanation.innerHTML = 'These stories might be interesting'
        // wrapper.innerHTML = render_stories_list(body.stories)
        add_wrapper(render_stories_list(body.stories))
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

// Input from extension.
// const title = 'Duterte and Trump will dramatically recast U.S.-Philippine ties. But how?'
console.log(h);
const title = 'Takings in service industry slip in Q3'
run(h)

})();