use kurs;

drop table if exists userdata;
create table userdata(
    ege          VARCHAR(8) NOT NULL,
    ball         INTEGER NOT NULL
);
insert into userdata values ("mat",86);
insert into userdata values ("rus",76);
insert into userdata values ("obs",55);

set @CITY = '%msk%';
set @TAGS = 'IT|man';

/*Выдать направления*/
select napravl.napr_name as 'Направление', vuz.vuz_name as 'ВУЗ',napravl.ball as 'Проходной балл в прошлом году', sum(userdata.ball) as 'Ваш балл'
from vuz
inner join napravl on vuz.vuz_id = napravl.vuz_vuz_id
inner join ege on ege.napravl_napr_id = napravl.napr_id
/*С нужным ЕГЭ->									*/
inner join userdata on userdata.ege=ege.ege
/*Только в указанном городе							*/
where (vuz.vuz_cities like @CITY)
group by napravl.napr_id
/*При указанных баллах:								*/
having napravl.ball < sum(userdata.ball)
/*С выбранными тегами в первую очередь				*/
order by napravl.tags regexp @TAGS desc, napravl.ball desc;