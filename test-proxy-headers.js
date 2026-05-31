const httpProxy = require('http-proxy');
const http = require('http');
const proxy = httpProxy.createProxyServer({
  target: 'https://www.youtube.com',
  changeOrigin: true,
  secure: false
});

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  proxyReq.removeHeader('Origin');
  proxyReq.removeHeader('Referer');
});

http.createServer(function (req, res) {
  proxy.web(req, res);
}).listen(8000);
console.log('Proxy listening on 8000');
