Update Shabad Set shabadId = 5364 where shabadid = 555363;
INSERT INTO Writer (WriterID,WriterEnglish,WriterGurmukhi) 	select 55, '', '' where not EXISTS (SELECT 1 from Writer WHERE writerid = 55); 
INSERT INTO BaniName (Id,PunjabiName,EnglishName,IsVisible,Bookmark) 	Select '30', 'Ardws', 'Ardaas', 1, 0 WHERE Not EXISTS (SELECT 1 from BaniName where id = 30); 
update DbVersion set version = 15;
