var express = require('express')
var app = express()

var Twit = require('twit')

var T = new Twit({
  consumer_key:         'xGZpDZfFjTfDd6qlPNqICypot',
  consumer_secret:      'LKKybFgDvgnnZnOuzhRF21yp7B9xpF6pvwOioMk8mwVSxUwGx9',
  access_token:         '383247590-ma2NmkoKPjXmp53XtAB9JsHPlhmpyAGABBWyPNb9',
  access_token_secret:  '99SnCm18dZlUpvBwF0arc9x7z2zgD8hKvFjk9cTgVUtD2',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})

app.get('/:query/:timestamp', function (req, res) {
  T.get('search/tweets', { q: req.params.query + ' since:' + req.params.timestamp, count: 1000 }, function(err, data, response) {
    res.send(data)
  })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
