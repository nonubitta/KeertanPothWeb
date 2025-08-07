export class Queries {
  static searchByFirstLetter(searchText: string, anywhere: boolean): string {
	if (anywhere) {
		return `
		select vr.ID VerseID, sh.ShabadID, vr.Gurmukhi, GurmukhiUni, vr.English, vr.WriterID, vr.RaagID, wr.WriterEnglish, wr.WriterGurmukhi, rg.RaagEnglish, vr.PageNo
					from shabad sh 
					inner join verse vr on sh.verseID = vr.ID 
					left join Raag rg on vr.raagID = rg.RaagID 
					left join Writer wr on vr.WriterID = wr.writerID 
					where vr.FirstLetterStr like '%${searchText}%'
					order by vr.id limit 100
		`;
	}
	else {
		return `
		select vr.ID VerseID, sh.ShabadID, vr.Gurmukhi, GurmukhiUni, vr.English, vr.WriterID, vr.RaagID, wr.WriterEnglish, wr.WriterGurmukhi, rg.RaagEnglish, vr.PageNo
					from shabad sh 
					inner join verse vr on sh.verseID = vr.ID 
					left join Raag rg on vr.raagID = rg.RaagID 
					left join Writer wr on vr.WriterID = wr.writerID 
					where vr.FirstLetterStr like ',${searchText}%'
					order by vr.id limit 100
		`;
	}
  }

  static getShabadById(shabadId: number): string {
	return `
	  SELECT * FROM sggsvw 
	  WHERE ShabadId = ${shabadId}
	`;
  }
}
