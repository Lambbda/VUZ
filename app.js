var http = require('http'),					
	fs = require('fs'),
	url = require('url'),
	mysql = require('mysql'),
	qs = require('query-string');

var con = mysql.createConnection({				//Вход в БД
	multipleStatements: true,					//Позволяет клиенту отправлять множественные запросы к БД в одном сообщении.
	host: "localhost",
	user: "root",
	password: "root",
	database: "kurs"
});

con.connect(function (err) {					//Запрос в БД, переделка оригинала из Workbench под js
	if (err) throw err;
	console.log('\x1b[32m', "Baza dannih podkluchena!");
});

fs.readFile('./site.html', 'utf8', function (err, html) {	//Node использует наш html как готовый шаблон для сервера
    if (err) {
        throw err; 
    }       
    http.createServer(function(req, res) {  

	var path = url.parse(req.url).pathname;			//Анализ URL. Т.К. наша форма использует метод POST, пользователям в браузере эта часть не видна
	var userData = "";

	switch (path) {									//По окончанию анализированного URL решаем, что делать:

		case '/poisk':								//Считать данные с формы
			fs.readFile(__dirname + '/site.html', 'utf8', function (err, data) {
				if (err) throw err;
				res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
				res.write(data, 'utf8');

				var n;

				req.addListener("data", function (form) {
					userData += form;
					console.log('\x1b[32m', "Dannie s formi: ’" + form);

					var city = userData.match(/(?<=city=).{3}(?=&)/)[0];	//Как найти город: ищем 3 символa (.) между city= и &, исключая последнее с помощью ?<= и ?=
					console.log("city = ", city);
						
					var tags = userData.match(/&tag=.*/)[0].replace(/&tag=/g, "|").slice(1);	//Как найти тэги: 1. Берём последнюю часть URL, где начинаются теги, т.к. теги всегда в конце;
					console.log("tags = ", tags);												// 2. Делаем связку в виде "|" для MySQLa; 3. Убираем лишнюю первую "|".

					var ege = userData.match(/(?<=&ege=).../g);				//Массив с ЕГЭ для таблицы пользователя (берём по три символа (...) после каждого (g) фрагмента "&ege=", исключая сам фрагмент (?<).)
					console.log("massiv ege = ", ege);

					var ball = userData.match(/(?<=&ball=).{1,3}(?=&)/g);	//Массив с баллами для таблицы пользователя (берём от 1 до 3 символов (.) между &ball= и &, исключая последнее.)
					console.log("massiv ballov = ", ball);

					console.log("debug: n ege = ", userData.match(/ege/g).length);

					var user = [											//Превращаем данные пользователя в таблицу в БД, чтобы сравнивать её внутри БД
						"drop table if exists userdata; ",					//Эти скрипты уже закамменчены в MySQL (kurs_test.sql), откуда скопипасчены
						"create table userdata(",
						"ege          VARCHAR(8) NOT NULL, ",
						"ball         INTEGER NOT NULL ",
						"); "].join('');
					

					for (var i = 0; i < userData.match(/ege/g).length; i++) {					//Заполняем таблицу пользовательскими данными
						user+="insert into userdata values ('"+ege[i]+"', "+ball[i]+"); "
					};

					var getuser = "select * from userdata;";

					var sql = [																	//Скрипт для БД
						"select napravl.napr_name, vuz.vuz_name,napravl.ball, sum(userdata.ball) as 'userball'",
						"from vuz ",
						"inner join napravl on vuz.vuz_id = napravl.vuz_vuz_id ",
						"inner join ege on ege.napravl_napr_id = napravl.napr_id ",
						"inner join userdata on userdata.ege = ege.ege ",
						"where (vuz.vuz_cities like '%", city, "%') ",							//city берём из URL
						"group by napravl.napr_id ",
						"having napravl.ball < sum(userdata.ball) ",
						"order by napravl.tags regexp '", tags, "' desc, napravl.ball desc;"	//tags берём из URL
					].join('');

					con.query(user, function (err, result, fields) {							//Непосредственно генерируем таблицу пользователя
						if (err) throw err;
					});

					con.query(getuser, function (err, result, fields) {							//Для дебага шлём таблицу с БД обратно на сервер
						if (err) throw err;
						console.log('\x1b[33m', "Sgenerirovannaya tablitsa polzovatelya: ");
						console.log(result);
					});

					con.query(sql, function (err, result, fields) {								//Самая важная функция этого сервера (запрос к БД)
						if (err) throw err;
						console.log('\x1b[33m', "Dannie s BD: ");
						console.log(result);


						var Title = ['Направление', 'ВУЗ', 'Проходной балл', 'Ваш балл'];
						var goodres = [																		//Скрипт вывода полученных результатов. Создаёт в нужном диве таблицу, где
							"<script>",																		//i - число столбцов td (всегда 4, см. var Title), а j - число строк tr, т.е. найденных направлений
								"document.getElementById('result').innerHTML='<h2>Ваши результаты:<h2><br>';",		//Стираем предыдущие надписи;
								"var body = document.getElementById('result');",
								"var tbl = document.createElement('table');",
								"tbl.setAttribute('id','restable');",
							"var tbdy = document.createElement('tbody'); "
						].join('');
						for (var i = 0; i < 4; i++) {									//Цикл столбцов
							goodres += "var td = document.createElement('td'); ";
							goodres += "td.appendChild(document.createTextNode('" + Title[i] + "')); ";
							for (var j = 0; j < result.length; j++) {					//Цикл строк
								goodres += "var tr = document.createElement('tr'); ";
								switch (i) {											//Причиной создания этого убожества является не менее убогий формат Row Data Packet, используемый node-mysql.
									case 0: goodres += "tr.appendChild(document.createTextNode('" + result[j].napr_name + "'));";	//В строках первого столбца пишем названия напралений
										break;
									case 1: goodres += "tr.appendChild(document.createTextNode('" + result[j].vuz_name + "'));";	//Во втором ВУЗы... и тд
										break;
									case 2: goodres += "tr.appendChild(document.createTextNode('" + result[j].ball + "'));";
										break;
									case 3: goodres += "tr.appendChild(document.createTextNode('" + result[j].userball + "'));";
										break;
								}
								goodres += "td.appendChild(tr); ";
							};

							goodres += "tbdy.appendChild(td); ";
						};
							goodres+=[
								"tbl.appendChild(tbdy); ",
								"body.appendChild(tbl);",
								"</script>"
							].join('');


						var badres = ["<script>",			//Сообщение, выводимое на сайт при неудачном поиске
							"document.getElementById('result').innerHTML = '<h1><b>О нет.</b></h1> <br><i>Поиск не дал результатов...</i>';",
							"</script>"].join('');

						if (result.length>0)				//Выбираем, что вывести в область результатов, по длине ответа из БД (при фейле длина = 0)
							res.write(goodres, 'utf8')
						else
							res.write(badres, 'utf8')
						
					});


					userData = "";		//Стираем данные для будущих запросов.
				});
			});

			break;

		default:									//Или показать исходное состояние документа
			fs.readFile(__dirname + '/site.html', function (err, data) {
				if (err) throw err;
				res.writeHead(200, {
					'Content-Encoding': 'utf8',
					'Content-Type': 'text/html;charset=utf8'
				});
				res.write(data, 'utf8');
				defaultres = ["<script>",
					"document.getElementById('result').innerHTML = '<i>Здесь отобразятся результаты поиска</i>';",	
					"</script>"].join('');
				res.write(defaultres, 'utf8');
				res.end(null, 'utf8');
			});
	}
	}).listen(9000);
	console.log('\x1b[35m', ":9000 aktiven.");
});