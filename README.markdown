# Junction 2016

Baller hacks in Helsinki.

## Running

To be able to query the news API client side, proxy the request. Here is an
example with the Corsa [https://pypi.python.org/pypi/corsa]():

```
$ corsa --app-dir ./ --allow-proxy ALL --allow-origin ALL
```

To be able to query on TLS enabled websites, the request to the API needs to be
from a TLS enabled service, so we need an additional proxy, for this you can use
ngrok.

```
# Install ngrok
$ brew cask install ngrok

# Run ngrok
$ ngrok http 8888
```

For now, keys and stuffs are provided in query parameters, so make sure to set:

```
?app_id=<app_id>&app_key=<app_key>&ngrok_id=<ngrok_id>
```
