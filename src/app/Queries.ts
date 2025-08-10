export class Queries {

  //#region Search Queries
  static searchByFirstLetter(searchText: string, searchMode: string): string {
	switch(searchMode){
		case 'anywhere':
			return this.searchByFirstLetterAnywhere(searchText);
		case 'start':
			return this.searchByFirstLetterStart(searchText);
		case 'mainletters':
			return this.searchByMainletters(searchText);
		case 'exact':
			return this.searchByExactletters(searchText);
		default:
			return this.searchByFirstLetterAnywhere(searchText);
	}

  }

  static searchByFirstLetterAnywhere(searchText: string): string {
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

  static searchByFirstLetterStart(searchText: string): string {
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

  static searchByMainletters(searchText: string): string {
	return `
				select vr.ID VerseID, trim(vr.Gurmukhi, 15) Gurmukhi, vr.English, vr.WriterID, vr.RaagID, wr.WriterEnglish, wr.WriterGurmukhi, rg.RaagEnglish, vr.PageNo
				from shabad sh 
				inner join verse vr on sh.verseID = vr.ID 
				left join Raag rg on vr.raagID = rg.RaagID 
				left join Writer wr on vr.WriterID = wr.writerID 
				where vr.MainLetters like '%${searchText}%'
				 order by vr.id
		`;
  }

  static searchByExactletters(searchText: string): string {
	return `
				select vr.ID VerseID, trim(vr.Gurmukhi, 15) Gurmukhi, vr.English, vr.WriterID, vr.RaagID, wr.WriterEnglish, wr.WriterGurmukhi, rg.RaagEnglish, vr.PageNo
				from shabad sh 
				inner join verse vr on sh.verseID = vr.ID 
				left join Raag rg on vr.raagID = rg.RaagID 
				left join Writer wr on vr.WriterID = wr.writerID 
				where vr.Gurmukhi like '%${searchText}%'
				 order by vr.id
		`;
  }

  //#endregion

  static getShabadById(shabadId: number): string {
	return `
	  SELECT * FROM sggsvw 
	  WHERE ShabadId = ${shabadId}
	`;
  }
}