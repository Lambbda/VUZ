# VUZ
Практическая работа: пародия на сайты типа "Найди ВУЗ по результатам ЕГЭ". HTTP/JS (+ node.js), MySQL. Затрудняюсь оформить релиз, поэтому просто выложу здесь исходные файлы:  
  
site.html - макет сайта. Минимум дизайна, выпадающие списки с выбором города, дисциплин ЕГЭ и желаемого направления учёбы, кнопки пользователського интерфейса.  
  
kurs_create, kurs_insert, kurs_test - скрипты для локальной БД MySQL "kurs". "create" создаёт шаблон БД, "insert" заполняет его значениями. Сама БД состоит из трёх сущностей: первая содержит название ВУЗа и города; вторая (связана 1:N с первой) направление, проходной балл и теги (например, "Мэнэджмент" или "IT"); третья (связана 1:N со второй) содержит список дисциплин ЕГЭ, необходимый для направления.  
  
app.js - приложение (сервер) node.js, javascript. Осуществляет связь между сайтом и БД, отправляя и обрабатывая входящие запросы.  
  
screenshot.png - вид сайта.  
  
server.png - вид сервера (командная строка).
