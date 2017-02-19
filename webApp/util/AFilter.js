const fs = require('fs')
const useragent = require('useragent')
//const isj = require('is_js')

useragent(true)

// ###################### middle filter
const ROOT = './www'
const SPA = 'spa.html'
const AMP = 'amp.html'
const INDEX = 'index.html'

function endsWithSlash(str ) {
	let suffix = '/'
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function setNone(res) {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
}
function setQuick(res) {//3hr, 10 minutes
	res.header('Cache-Control', 'public, s-maxage=10800, max-age=600, proxy-revalidate')
}
function setLong(res) {//23 hours, 1hr
	res.header('Cache-Control', 'public, s-maxage=82800, max-age=3600')
}


function ifError(err, msg, res) {
	if(err)  {
		console.log(msg+': ' + err)
		res.redirect('/index.html')// error - go home
		return true
	} else return false
}
function getPath(req) {
	let path = req.path
	path = path.replace('undefined/','')
	path = path.replace('undefined','')
	return path
}
function isW(req) { // should we serve SPA or mobile/AMP?
	if(req.path.startsWith('/w/')) return true
	if(req.subdomains.indexOf('www') > -1)  return true
	if(req.socket.localPort == 8082) return true
	if (req.query.w == '1') return true
	return false
}

exports.filter = function (req, res, next) {
	setLong(res) // default is long, later we set to quick if needed
	//console.log('->')
	//console.log(req.originalUrl)
	//console.log(req.path)
	
	if (req.path.indexOf('.') >0 ) { // hasDot?
		next() // it is a static asset, ex: .jpg, .css
	} else { // no dot, it is a path:
		try {
			var agent = useragent.lookup(req.headers['user-agent'])
			console.log(agent.toAgent())
			res.header('Content-Type', 'text/html')

			const path = getPath(getPath(req))
			const pgPath = ROOT + path
			const isWWW = isW(req) 
			console.log(pgPath + ' ^ ' + isWWWW)

			if(!endsWithSlash(path)) {
				res.redirect(path + '/')
			} else if (fs.existsSync(pgPath + INDEX)) {// this is not compliant to SPA|AMP
				fs.readFile(pgPath + INDEX, 'utf8', function(err, data) {
					ifError(err, 'index', res)
					res.send(data)
				})				
			} else if(isWWWW) {//is it SPA/www? 
				fs.readFile(pgPath + SPA, 'utf8', function(err, data) {
					ifError(err, 'spa', res)
					res.send(data)
				})
			} else { //AMP is default
				setQuick(res)
				fs.readFile(pgPath + AMP, 'utf8', function(err, data) {
					ifError(err, 'amp', res)
					res.send(data)
				})// readfile
			} //else AMP
		} catch(err) {
			ifError(err, 'catch', res)
		}
		//console.log('<-')
	} // else it is a path

}//()

