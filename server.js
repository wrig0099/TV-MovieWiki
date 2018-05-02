//built-in NodeJS modules
var fs = require('fs');
var path = require('path');
var http = require('http');
var url = require('url');
var posterImageGetter = require('./imdb_poster.js');

//external NodeJS modules
var multiparty = require('multiparty');

//local NodeJS module
var mime = require('./src/mime.js');

//sqlite3
const sqlite3 = require('sqlite3').verbose();

var port = 8024;
console.log('Now listening on port: ' + port);

var public_dir = path.join(__dirname, 'public');

var server = http.createServer((req, res) => {
	var req_url = url.parse(req.url);
	var filename = req_url.pathname.substring(1);
	if (filename === '') filename = 'index.html';

	if (req.method === 'GET'){
		fs.readFile(path.join(public_dir, filename), (err, data) => {
			if (err){
				res.writeHead(404, {'Content-Type': 'text/plain'});
				res.write('Oh no! Couldn\'t find that page!');
				res.end();
			}
			else{
				console.log('FILENAME: ' + filename);
				var ext = path.extname(filename).substring(1); 
				if(filename !== 'singlePerson.html' && filename !== 'singleTitle.html'){
					console.log('FILE IS NOT SINGLE PERSON OR TITLE');
					console.log('serving file ' + filename + ' (type = ' + mime.mime_types[ext] + ')');
					console.log(' used version: ' +  mime.version);
					res.writeHead(200, {'Content-Type': mime.mime_types[ext] || 'text/html'});
					res.write(data);
					res.end();
				}else{
					constSplit = req_url.query.split('=');
					var primConst = constSplit[1];
					var htmlRowsG = '';
					var html_codeG = '';
					var sqlG = '';
					if(filename === 'singlePerson.html'){
						console.log('FILE IS SINGLE PERSON');
						var db = new sqlite3.Database('imdb.sqlite3');
						var promise3 = new Promise(function(resolve){
							sqlG = 'SELECT * FROM Names WHERE nconst = \'' + primConst + '\'';
							resolve(sqlG);
						});
						var arr;//for known for
						promise3.then(function(){
							console.log('IN PROMISE 3');
							var promise4 =  new  Promise(function(resolve){
								console.log('IN PROMISE 4');
								
								db.all(sqlG, [], (err, rows) => {
									//console.log('logging rows', rows);
									html_codeG = data.toString('utf8');
									if(err) {
										throw err;
									}
									rows.forEach((row) => {
										html_codeG = html_codeG.replace('***NAME***', row.primary_name);
										html_codeG = html_codeG.replace('***BIRTHYEAR***', row.birth_year);
										if(row.death_year === null){
											html_codeG = html_codeG.replace('***DEATHYEAR***', 'present');
										}else{
											html_codeG = html_codeG.replace('***DEATHYEAR***', row.death_year);
										}
										html_codeG = html_codeG.replace('***PROFESSIONS***', row.primary_profession);
										arr = row.known_for_titles.toString().split(',');
										//known for titles
										
									});
									resolve(html_codeG);
									});	
							});
							var newLine = '';
							var imageStr2;
							promise4.then( function() {
								
								db.close();
								//
var promise9 = new Promise(function(resolve){
		imageStr2 = posterImageGetter.GetPosterFromNameId(primConst, function(err,data){
			console.log('in image function');
			if(err)
			{
				throw err;
			}
			imageStr2 = '<img src=\'http://' + data.host + data.path + '\' alt=\'poster image\'></img>';
			//console.log('imageStr2' + imageStr2);
			resolve(imageStr2);
		});
		//console.log('resolving promise 8');
		//resolve(html_codeG);
	});
promise9.then(function(){

console.log('POSTER IMAGE STRING outside: ' + imageStr2);
html_codeG = html_codeG.replace('***IMAGE***', imageStr2);
								//
								var result;
								var promise5 = new Promise (function(resolve){
									console.log('IN PROMISE 5');
									result = "<ul>";
											
									//arr.forEach((elem)=>{
									//console.log('ARRAY: ' + arr.length);

									var i;
									var sqlG2 = '';
									var db = new sqlite3.Database('imdb.sqlite3');
									//var newLine;

									var promiseArr = new Array();
									var html_result;
									for(i = 0; i < arr.length; i++)
									{
										//console.log('For loop: ' + i);
										promiseArr.push( new Promise(function(resolve, reject){
											//console.log('In the for loop ' + i); 
											//
											
											sqlG2 = 'SELECT * FROM Titles WHERE tconst = \'' + arr[i] + '\'\;';
											db.all(sqlG2, [], (err, rows) => {
												if(err) {
													throw err;
												}
												//console.log('____________________________prim title inside of the rows: ' +  rows[0].primary_title );
												//console.log('____________________________arr[i] inside of the rows: ' +  arr[i] );
												html_result = '<li><a href="singleTitle.html?tconst=' + rows[0].tconst + '">' + rows[0].primary_title + '</a></li>';
												//console.log('result : ' + html_result);
												resolve(html_result);
											});				
											//console.log('____________________________arr[i] outside of the rows: ' +  arr[i] );
										}));//promise push
										//console.log('out of promise');
									}

									Promise.all(promiseArr).then(function(results){
										result += results.join('') + '</ul>';
										db.close();
										resolve(result);
									});
									
								});	
								promise5.then(function(){
									console.log('IN PROMISE 5 THEN');
									html_codeG = html_codeG.replace('***KNOWNFOR***', result);

									//console.log('html_codeG: ' + html_codeG);
									res.writeHead(200, {'Content-Type': mime.mime_types[ext] || 'text/html'});
									res.write(html_codeG);
									res.end();
								});	
							});
						});
						});//9 then

					}else{ //SINGLE TITLE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
						console.log('FILE IS SINGLE TITLE');
						var arr;//for top billed
						var db = new sqlite3.Database('imdb.sqlite3');
						var promise3 = new Promise(function(resolve){
							sqlG = 'SELECT * FROM Titles WHERE tconst = \'' + primConst + '\'';
							resolve(sqlG);
						});
						promise3.then(function(){
							console.log('IN PROMISE 3');
							//console.log('sqlG: ' + sqlG);
							var promise4 =  new  Promise(function(resolve){
								console.log('IN PROMISE 4');
								
								db.all(sqlG, [], (err, rows) => {
									//console.log('logging rows', rows);
									html_codeG = data.toString('utf8');
									if(err) {
										throw err;
									}
									rows.forEach((row) => {
										html_codeG = html_codeG.replace('***TITLE***', row.primary_title);
										//console.log('html_codeG: ' + html_codeG);
										html_codeG = html_codeG.replace('***TYPE***', row.title_type);
										html_codeG = html_codeG.replace('***STARTYEAR***', row.start_year);
										if(row.end_year === null){
											html_codeG = html_codeG.replace('***ENDYEAR***', 'none');
										}else{
											html_codeG = html_codeG.replace('***ENDYEAR***', row.end_year);
										}
										html_codeG = html_codeG.replace('***RUNTIME***', row.runtime_minutes);
										html_codeG = html_codeG.replace('***GENRE***', row.genres);
									//
										

									});
									resolve(html_codeG);
								});	
							});
							var newLine = '';
							var imageStr;
							promise4.then( function() {
								
								
								db.close();
								var promise8 = new Promise(function(resolve){
										imageStr = posterImageGetter.GetPosterFromTitleId(primConst, function(err,data){
											console.log('in image function');
											if(err)
											{
												throw err;
											}
											imageStr = '<img src=\'http://' + data.host + data.path + '\' alt=\'poster image\'></img>';
											resolve(imageStr);
										});
										//console.log('resolving promise 8');
										//resolve(html_codeG);
									});
								promise8.then(function(){

								console.log('POSTER IMAGE STRING outside: ' + imageStr);
								html_codeG = html_codeG.replace('***IMAGE***', imageStr);

								 db = new sqlite3.Database('imdb.sqlite3');
								var promise6 = new Promise(function(resolve){
									sqlG = 'SELECT * FROM Ratings WHERE tconst = \'' + primConst + '\'';

									db.all(sqlG, [], (err, rows) => {
										//console.log('logging rows', rows);
										//html_codeG = data.toString('utf8');
										if(err) {
											throw err;
										}
										rows.forEach((row) => {
									
											html_codeG = html_codeG.replace('***RATING***', row.average_rating);
											html_codeG = html_codeG.replace('***VOTES***', row.num_votes);
										});
										resolve(html_codeG);
									});	
								});
								promise6.then( function(){
									db.close();
								/*	db = new sqlite3.Database('imdb.sqlite3');
									var sqlG3 = 'SELECT * FROM Principals WHERE tconst = \'' + primConst + '\'';
									db.all(sqlG3, [], (err, rows) => {
										//console.log('logging rows', rows);
										html_codeG = data.toString('utf8');
										if(err) {
											throw err;
										}
										rows.forEach((row) => {
											//arr.push({"name" : row.nconst, "ordering" : row.ordering});
											console.log('array inside db: ' + arr);
											console.log('nconst: ' + row.nconst);
											console.log('ordering: ' + row.ordering);
										});
									});
									//bubblesort the arr<--do this later
									db.close();
									console.log('array outside db: ' + arr);
									*/
									/*

									//
									//arr = row.known_for_titles.toString().split(',');
									var result;
									var promise5 = new Promise (function(resolve){
										console.log('IN PROMISE 5');
										result = "<ul>";
												
										//arr.forEach((elem)=>{
										console.log('ARRAY: ' + arr.length);

										var i;
										var sqlG4 = '';
										var db = new sqlite3.Database('imdb.sqlite3');
										//var newLine;

										var promiseArr = new Array();

										for(i = 0; i < arr.length; i++)
										{
											console.log('For loop: ' + i);
											promiseArr.push( new Promise(function(resolve, reject){
												console.log('In the for loop ' + i); 
												//
												console.log('____________________________arr[i] outside of the rows: ' +  arr[i] );
												sqlG4 = 'SELECT * FROM Names WHERE nconst = \'' + arr[i].name + '\'\;';
												db.all(sqlG4, [], (err, rows) => {
													if(err) {
														throw err;
													}
												//	console.log('____________________________prim title inside of the rows: ' +  rows[0].primary_title );
													var html_result = '<li><a href="singlePerson.html?nconst=' + arr[i].name + '">' + rows[0].primary_name + '</a></li>';
													console.log('result : ' + html_result);
													resolve(html_result);
												});											
											}));//promise append
											console.log('out of promise');
										}

										Promise.all(promiseArr).then(function(results){
											result += results.join('') + '</ul>';
											db.close();
											resolve(result);
										});
										
									});	

									*/

									//promise5.then(function(){
										console.log('IN PROMISE 6 THEN');
										//html_codeG = html_codeG.replace('***TOPBILLED***', result);

										//console.log('html_codeG: ' + html_codeG);
										res.writeHead(200, {'Content-Type': mime.mime_types[ext] || 'text/html'});
										res.write(html_codeG);
										res.end();
									//});	
								});//6 then
							});
							});//8then?
						});
					}
				}
			}	
		});
	}
	else if (req.method === 'POST') {
		if (filename === 'subscribe') {
			var form = new multiparty.Form();
			form.parse(req, (err, fields, files) => {
				console.log(err,fields,files);

				if(fields.titlesOrPeople == 'people') {
					console.log('Field: ' + fields.titlesOrPeople);
					var serveFile = 'people.html'
					fs.readFile(path.join(public_dir, serveFile), (err, data) => {
						if (err){
							res.writeHead(404, {'Content-Type': 'text/plain'});
							res.write('Oh no! Couldn\'t find that page!');
							res.end();
						}
						else{
							var ext = path.extname(serveFile).substring(1);
							//console.log('serving file ' + serveFile + ' (type = ' + mime.mime_types[ext] + ')');
							//console.log(' used version: ' +  mime.version);
							var htmlRows = '';
							var html_code = '';
							var sql= '';
							//open database
							var db = new sqlite3.Database('imdb.sqlite3');
							var promise2 = new Promise(function(resolve){
								var searchFor = fields.search;
								searchFor = searchFor.toString().replace(/;/g, "");
								searchFor = searchFor.replace(/\(/g, "");
								searchFor = searchFor.replace(/\)/g, "");
								searchFor = searchFor.replace(/\*/g, "%");
								if(searchFor.includes("%")){
									sql = 'SELECT * FROM Names WHERE primary_name LIKE \'' + searchFor + '\'';
									resolve(sql);
								}else{
									sql = 'SELECT * FROM Names WHERE primary_name = \'' + searchFor + '\'';
									resolve(sql);
								}
							});
							promise2.then(function(){
								//console.log('trying to log rows');
								var promise1 =  new  Promise(function(resolve){
									db.all(sql, [], (err, rows) => {
										console.log('logging rows', rows);
										if(err) {
											throw err;
										}
										rows.forEach((row) => {
											if(row.death_year == null){
												htmlRows += '<tr><td><a href="singlePerson.html?nconst=' + row.nconst + '">' + row.primary_name + '</a></td><td>' + row.birth_year + '</td><td>' + 'present' + '</td><td>' + row.primary_profession + '</td></tr>';
											}else{
												htmlRows += '<tr><td><a href="singlePerson.html?nconst=' + row.nconst + '">' + row.primary_name + '</a></td><td>' + row.birth_year + '</td><td>' + row.death_year + '</td><td>' + row.primary_profession + '</td></tr>';
											}
										});
										html_code = data.toString('utf8');
										html_code = html_code.replace('***PEOPLE***', htmlRows);
									resolve(html_code);
									});	
								});
								promise1.then( function() {
									//console.log('htmlRows: ' + htmlRows);
									//console.log('html_code: ' + html_code);
									res.writeHead(200, {'Content-Type': mime.mime_types[ext] || 'text/html'});
									res.write(html_code);
									res.end();
									db.close();
								});
							});//end sql.then
						}
					});
				}
				else if(fields.titlesOrPeople == 'titles') {
					//console.log('Field: ' + fields.titlesOrPeople);
					var serveFile = 'titles.html'
					fs.readFile(path.join(public_dir, serveFile), (err, data) => {
						if (err){
							res.writeHead(404, {'Content-Type': 'text/plain'});
							res.write('Oh no! Couldn\'t find that page!');
							res.end();
						}
						else{
							var ext = path.extname(serveFile).substring(1);
							//console.log('serving file ' + serveFile + ' (type = ' + mime.mime_types[ext] + ')');
							//console.log(' used version: ' +  mime.version);
							var htmlRows = '';
							var html_code = '';
							var sql= '';
							//open database
							var db = new sqlite3.Database('imdb.sqlite3');
							var promise2 = new Promise(function(resolve){
								var searchFor = fields.search;
								searchFor = searchFor.toString().replace(/;/g, "");
								searchFor = searchFor.replace(/\(/g, "");
								searchFor = searchFor.replace(/\)/g, "");
								searchFor = searchFor.replace(/\*/g, "%");
								if(searchFor.includes("%")){
									sql = 'SELECT * FROM Titles WHERE primary_title LIKE \'' + searchFor + '\'';
									resolve(sql);
								}else{
									sql = 'SELECT * FROM Titles WHERE primary_title = \'' + searchFor + '\'';
									resolve(sql);
								}
							});
							promise2.then(function(){
								//console.log('trying to log rows');
								var promise1 =  new  Promise(function(resolve){
									db.all(sql, [], (err, rows) => {
										//console.log('logging rows', rows);
										if(err) {
											throw err;
										}
										rows.forEach((row) => {
											if(row.end_year == null){
												htmlRows += '<tr><td><a href="singleTitle.html?tconst=' + row.tconst + '">' + row.primary_title + '</a></td><td>' + row.title_type + '</td><td>' + row.start_year + '</td><td>' + 'None' + '</td></tr>';

											}else{
												htmlRows += '<tr><td><a href="singleTitle.html?tconst=' + row.tconst + '">' + row.primary_title + '</a></td><td>' + row.title_type + '</td><td>' + row.start_year + '</td><td>' + row.end_year + '</td></tr>';
											}
										});
										html_code = data.toString('utf8');
										html_code = html_code.replace('***TITLES***', htmlRows);
									resolve(html_code);
									});	
								});
								promise1.then( function() {
									//console.log('htmlRows: ' + htmlRows);
									//console.log('html_code: ' + html_code);
									res.writeHead(200, {'Content-Type': mime.mime_types[ext] || 'text/html'});
									res.write(html_code);
									res.end();
									db.close();
								});
							});//end sql.then
						}
					});
				}
			});
		}
	}
});

server.listen(port, '0.0.0.0');
