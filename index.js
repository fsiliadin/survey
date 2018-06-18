var https = require('http')
var fs = require('fs')

var whiteList = ['focus.js', 'focus.css', 'index.html', 'survey_script.js', 'survey.css']

https.createServer(function(request, response) {
	console.log('METHOD', request.method)
	response.setHeader('Access-Control-Allow-Origin', 'https://clubfinderformpro.pw')
	
	request.url += request.url === '/' ? 'index.html' : ''
	
	if (isAuthorized(request.url)) {		
		fs.readFile('.'+request.url, function(err, file) {
			response.writeHead(200, {
				'Content-Type': getType(request.url)
	      	})
			response.end(file)
		})
	} else {
		console.log('UNAUTHORIZED REQUEST')
		response.writeHead(404, {
      	})
      	response.end('Page not found')
	}
	
}).listen(process.env.PORT || 8086)

function getType (url) {
	return 'text/'+url.split('.').pop()
} 

function isAuthorized (url) {
	return whiteList.some(function(folder){
		return url.indexOf(folder) === 1
	})
}

console.log('ui server running ' + new Date())