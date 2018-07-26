//объявим 
var express = require('express');
var bodyParser = require("body-parser");
var app = express();
var cors = require('cors');
const redis= require('redis'), 
redisClient= redis.createClient()
var fs = require('fs'); 
const http = require('http');
const https = require('https');

var options = {
	key: fs.readFileSync('/etc/letsencrypt/live/maicorp.org/privkey.pem'),
	cert: fs.readFileSync('/etc/letsencrypt/live/maicorp.org/fullchain.pem')
};
http.createServer(app).listen(80);
https.createServer(options, app).listen(443);


// создаем парсер для данных application/x-www-form-urlencoded
var urlencodedParser = bodyParser.urlencoded({extended: false});

var connection_status = 0;
redisClient.on('error', (err) => {
	connection_status = 0;
    console.log('Error! ' + err)
})

redisClient.on('connect', function(){
	connection_status = 1;
    console.log('Connected to Redis');
});

app.use(cors())

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/api/v1/ping',cors(), function (req, res) {
	console.log(redisClient.on)
	console.log("ping <---")
	if(connection_status == 0) {
		var cli_err = "ERR! Redis offline! ";
		console.log("ping ---X "+ cli_err)
					res.json({
				result: cli_err ,
				req_err: "561"
			});	
		return ;
	}
	    var result; 
		var req_err;
		redisClient.ping((err, value) => {
				console.log("ping ---> "+value)
				res.json({
					result: value ,
					req_err: "0"
				});
				
			
	})
})

//Стандартные
app.post('/api/v1/del', urlencodedParser, function (req, res) {
	if(!req.body) return res.sendStatus(400);
	console.log("del <---" + req.body.key);
	cors()	
	//Обработка ошибок
   	if(connection_status == 0) {
		var cli_err = "ERR! Redis offline! ";
		console.log("del ---X "+ cli_err)
					res.json({
				result: cli_err ,
				req_err: "561"
			});	
		return ;
	}
	if(req.body.key===undefined){
		var cli_err = "ERR! Bad body! ";
		cli_err += "empty key! "
		console.log("del ---X "+ cli_err)
			res.json({
				result: cli_err ,
				req_err: "460"
			});	
	}
	else{
	//Работа с Redis
		redisClient.del(req.body.key, (err, value) => {
			if(err) {
				console.log("del---X "+err.message)
				res.json({
					result: err.message ,
					req_err: "562"
					});	}
			else{
				console.log("del---> "+value)
				res.json({
					result: value ,
					req_err: "0"
				});
			}
	})
}});

app.post('/api/v1/set', urlencodedParser, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    console.log("set <---" + req.body.key + " " + req.body.value );
	cors()	
	//Обработка ошибок
		if(connection_status == 0) {
		var cli_err = "ERR! Redis offline! ";
		console.log("set ---X "+ cli_err)
					res.json({
				result: cli_err ,
				req_err: "561"
			});	
		return ;
	}
	if(req.body.key===undefined || req.body.value===undefined){
		var cli_err = "ERR! Bad body! ";
		if(req.body.key===undefined){ cli_err += "empty key! "}
		if(req.body.value===undefined){ cli_err += "empty value! "}
		console.log("set ---X "+ cli_err)
			res.json({
				result: cli_err ,
				req_err: "460"
			});	
	}
	else{
	//Работа с Redis
		redisClient.set(req.body.key, req.body.value,(err, value) => {
			if(err) {
				console.log("set---X "+err.message)
				res.json({
					result: err.message ,
					req_err: "562"
					});	}
			else{
				console.log("set ---> "+value)
				res.json({
					result: value ,
					req_err: "0"
				});
			}
	})
}});

app.post('/api/v1/get', urlencodedParser, function (req, res) {
    if(!req.body) return res.sendStatus(400);
	
    console.log("get <---" + req.body.key);
	cors()	
	//Обработка ошибок
	if(connection_status == 0) {
		var cli_err = "ERR! Redis offline! ";
		console.log("del ---X "+ cli_err)
					res.json({
				result: cli_err ,
				req_err: "561"
			});	
		return ;
	}
	if(req.body.key===undefined){
		var cli_err = "ERR! Bad body! ";
		if(req.body.key===undefined){ cli_err += "empty key! "}
		console.log("get ---X "+ cli_err)
			res.json({
				result: cli_err ,
				req_err: "460"
			});	
	}
	else{
	//Работа с Redis
		redisClient.get(req.body.key, (err, value) => {
			if(err) {
				console.log("get---X "+err.message)
				res.json({
					result: err.message ,
					req_err: "562"
					});	}
			else{
				console.log("get ---> "+value)
				res.json({
					result: value ,
					req_err: "0"
				});
			}
	})
}});


//Хеш
app.post('/api/v1/hset', urlencodedParser, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    console.log("hset<---" + req.body.key + " " + req.body.field+ " " + req.body.value );
	cors()	
	//Обработка ошибок
	if(connection_status == 0) {
		var cli_err = "ERR! Redis offline! ";
		console.log("hset ---X "+ cli_err)
					res.json({
				result: cli_err ,
				req_err: "561"
			});	
		return ;
	}
	if(req.body.key===undefined || req.body.field===undefined || req.body.value===undefined){
		var cli_err = "ERR! Bad body! ";
		if(req.body.key===undefined){ cli_err += "empty key! "}
		if(req.body.field===undefined){ cli_err += "empty field! "}
		if(req.body.value===undefined){ cli_err += "empty value! "}
		console.log("hset ---X "+ cli_err)
			res.json({
				result: cli_err ,
				req_err: "460"
			});	
	}
	else{
	//Работа с Redis
		redisClient.hset(req.body.key, req.body.field , req.body.value,(err, value) => {
			if(err) {
				console.log("hset---X "+err.message)
				res.json({
					result: err.message ,
					req_err: "562"
					});	}
			else{
				console.log("hset---> "+value)
				res.json({
					result: value ,
					req_err: "0"
				});
			}
	})
}});

app.post('/api/v1/hdel', urlencodedParser, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    console.log("hdel<---" + req.body.key + " " + req.body.hash);
	cors()	
		//Обработка ошибок
		if(connection_status == 0) {
		var cli_err = "ERR! Redis offline! ";
		console.log("hdel ---X "+ cli_err)
					res.json({
				result: cli_err ,
				req_err: "561"
			});	
		return ;
	}
	if(req.body.key===undefined || req.body.field===undefined){
		var cli_err = "ERR! Bad body! ";
		if(req.body.key===undefined){ cli_err += "empty key! "}
		if(req.body.field===undefined){ cli_err += "empty field! "}
		console.log("hdel ---X "+ cli_err)
			res.json({
				result: cli_err ,
				req_err: "460"
			});	
	}
	else{
	redisClient.hdel(req.body.key, req.body.hash, (err, value) => {
		if(err) {
			console.log("hdel---X "+err.message)
			res.json({
				result: err.message ,
				req_err: "562"
			});	}
		else{
			console.log("hdel---> "+value)
			res.json({
				result: value ,
				req_err: "0"
				});
		}
	})
}});

app.post('/api/v1/hget', urlencodedParser, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    console.log("hget<---" + req.body.key + " " + req.body.field);
	cors()	
		//Обработка ошибок
	if(connection_status == 0) {
		var cli_err = "ERR! Redis offline! ";
		console.log("hget ---X "+ cli_err)
					res.json({
				result: cli_err ,
				req_err: "561"
			});	
		return ;
	}
	if(req.body.key===undefined || req.body.field===undefined){
		var cli_err = "ERR! Bad body! ";
		if(req.body.key===undefined){ cli_err += "empty key! "}
		if(req.body.field===undefined){ cli_err += "empty field! "}
		console.log("hget ---X "+ cli_err)
			res.json({
				result: cli_err ,
				req_err: "460"
			});	
	}
	else{
		redisClient.hget(req.body.key, req.body.field, (err, value) => {
			if(err) {
				console.log("hget---X "+err.message)
				res.json({
					result: err.message ,
					req_err: "562"
					});	}
			else{
				console.log("hget---> "+value)
				res.json({
					result: value ,
					req_err: "0"
				});
			}
	})
	}
});

//Список
app.post('/api/v1/lpush', urlencodedParser, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    console.log("lpush<---" + req.body.key + " " + req.body.value );
	cors()	
	if(connection_status == 0) {
		var cli_err = "ERR! Redis offline! ";
		console.log("lpush ---X "+ cli_err)
					res.json({
				result: cli_err ,
				req_err: "561"
			});	
		return ;
	}
	if(req.body.key===undefined	|| req.body.value===undefined){
		var cli_err = "ERR! Bad body! ";
		if(req.body.key===undefined){ cli_err += "empty key! "}
		if(req.body.value===undefined){ cli_err += "empty value! "}
		console.log("lpush---X "+ cli_err)
			res.json({
				result: cli_err ,
				req_err: "460"
			});	
	}
	else{
		redisClient.lpush(req.body.key , req.body.value,(err, value) => {
			if(err) {
				console.log("lpush---X "+err.message)
				res.json({
					result: err.message ,
					req_err: "562"
					});	}
			else{
				console.log("lpush---> "+value)
				res.json({
					result: value ,
					req_err: "0"
				});
			}
	})
}});

app.post('/api/v1/rpush', urlencodedParser, function (req, res) {	
    if(!req.body) return res.sendStatus(400);
    console.log("rpush<---" + req.body.key + " " + req.body.value );					
	cors()	;
	if(connection_status == 0) {
		var cli_err = "ERR! Redis offline! ";
		console.log("rpush ---X "+ cli_err)
					roush.json({
				result: cli_err ,
				req_err: "561"
			});	
		return ;
	}
	if(req.body.key===undefined	|| req.body.value===undefined){
		var cli_err = "ERR! Bad body! ";
		if(req.body.key===undefined){ cli_err += "empty key! "}
		if(req.body.value===undefined){ cli_err += "empty value! "}
		console.log("rpush---X "+ cli_err)
			res.json({
				result: cli_err ,
				req_err: "460"
			});	
	}
	else{	
		redisClient.rpush(req.body.key, req.body.value,(err, value) => {
			if(err) {
				console.log("rpush---X "+err.message)
				console.log(err.message)
				res.json({
					result: err.message ,
					req_err: "562"
					});	}
			else{
				console.log("rpush---> "+value)
				res.json({
					result: value ,
					req_err: "0"
				});
			}
	})
}});

app.post('/api/v1/lpop', urlencodedParser, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    console.log("lpop<---" + req.body.key );
	cors()	
	if(connection_status == 0) {
		var cli_err = "ERR! Redis offline! ";
		console.log("del ---X "+ cli_err)
					res.json({
				result: cli_err ,
				req_err: "561"
			});	
		return ;
	}
	if(req.body.key===undefined){
		var cli_err = "ERR! Bad body! ";
		cli_err += "empty key! "
		console.log("lpop---X "+ cli_err)
			res.json({
				result: cli_err ,
				req_err: "460"
			});	
	}
	else{
		redisClient.lpop(req.body.key,(err, value) => {
			if(err) {
				console.log("lpop---X "+err.message)
				res.json({
					result: err.message ,
					req_err: "562"
					});	}
			else{
				console.log("lpop---> "+value)
				res.json({
					result: value ,
					req_err: "0"
				});
			}
	})
}});

app.post('/api/v1/rpop', urlencodedParser, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    console.log("rpop<---" + req.body.key );
	cors()	
	if(connection_status == 0) {
		var cli_err = "ERR! Redis offline! ";
		console.log("del ---X "+ cli_err)
					res.json({
				result: cli_err ,
				req_err: "561"
			});	
		return ;
	}
	if(req.body.key===undefined){
		var cli_err = "ERR! Bad body! ";
		cli_err += "empty key! "
		console.log("rpop---X "+ cli_err)
			res.json({
				result: cli_err ,
				req_err: "460"
			});	
	}
	else{	
		redisClient.rpop(req.body.key,(err, value) => {
			if(err) {
				console.log("rpop---X "+err.message)
				res.json({
					result: err.message ,
					req_err: "562"
					});	}
			else{
				console.log("rpop---> "+value)
				res.json({
					result: value ,
					req_err: "0"
				});
			}
	})
}});


//Use
app.use((req, res, next) => {
    console.log(req.headers)
    next()
})

const PORT= 8000
app.listen(PORT	, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

        console.log(`server is listening on ${PORT}`)
})
