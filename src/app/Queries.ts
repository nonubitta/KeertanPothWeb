export class Queries {

  //#region Search Queries
  static searchByFirstLetter(searchText: string, searchMode: string, extraFilters: string): string {
	switch(searchMode){
		case 'anywhere':
			return this.searchByFirstLetterAnywhere(searchText, extraFilters);
		case 'starts':
			return this.searchByFirstLetterStart(searchText, extraFilters);
		case 'mainletters':
			return this.searchByMainletters(searchText, extraFilters);
		case 'exact':
			return this.searchByExactletters(searchText, extraFilters);
		default:
			return this.searchByFirstLetterAnywhere(searchText, extraFilters);
	}

  }

  static searchByFirstLetterAnywhere(searchText: string, extraFilters: string): string {
	return `
		select vr.ID VerseID, sh.ShabadID, vr.Gurmukhi, GurmukhiUni, vr.English, vr.WriterID, vr.RaagID, wr.WriterEnglish, wr.WriterGurmukhi, rg.RaagEnglish, vr.PageNo
					from shabad sh 
					inner join verse vr on sh.verseID = vr.ID 
					left join Raag rg on vr.raagID = rg.RaagID 
					left join Writer wr on vr.WriterID = wr.writerID 
					where vr.FirstLetterStr like '%${searchText}%'
					${extraFilters}
					order by vr.id limit 100
		`;
  }

  static searchByFirstLetterStart(searchText: string, extraFilters: string): string {
	return `
		select vr.ID VerseID, sh.ShabadID, vr.Gurmukhi, GurmukhiUni, vr.English, vr.WriterID, vr.RaagID, wr.WriterEnglish, wr.WriterGurmukhi, rg.RaagEnglish, vr.PageNo
					from shabad sh 
					inner join verse vr on sh.verseID = vr.ID 
					left join Raag rg on vr.raagID = rg.RaagID 
					left join Writer wr on vr.WriterID = wr.writerID 
					where vr.FirstLetterStr like ',${searchText}%'
					${extraFilters}
					order by vr.id limit 100
		`;
  }

  static searchByMainletters(searchText: string, extraFilters: string): string {
	return `
				select vr.ID VerseID, sh.ShabadID, vr.Gurmukhi, GurmukhiUni, vr.English, vr.WriterID, vr.RaagID, wr.WriterEnglish, wr.WriterGurmukhi, rg.RaagEnglish, vr.PageNo
				from shabad sh 
				inner join verse vr on sh.verseID = vr.ID 
				left join Raag rg on vr.raagID = rg.RaagID 
				left join Writer wr on vr.WriterID = wr.writerID 
				where vr.MainLetters like '%${searchText}%'
					${extraFilters}
				 order by vr.id limit 100
		`;
  }

  static searchByExactletters(searchText: string, extraFilters: string): string {
	return `
				select vr.ID VerseID, sh.ShabadID, vr.Gurmukhi, GurmukhiUni, vr.English, vr.WriterID, vr.RaagID, wr.WriterEnglish, wr.WriterGurmukhi, rg.RaagEnglish, vr.PageNo
				from shabad sh 
				inner join verse vr on sh.verseID = vr.ID 
				left join Raag rg on vr.raagID = rg.RaagID 
				left join Writer wr on vr.WriterID = wr.writerID 
				where vr.Gurmukhi like '%${searchText}%'
					${extraFilters}
				 order by vr.id  limit 100
		`;
  }

  //#endregion

  static getShabadById(shabadId?: number): string {
	return `
	  SELECT * FROM sggsvw 
	  WHERE ShabadId = ${shabadId}
	`;
  }

  static getWriters(): string{
	return 'SELECT WriterID, WriterEnglish FROM Writer Where WriterId > 0';
  }

  static getSources(): string {
	return 'SELECT SourceID, SourceEnglish FROM Source WHERE UniqueID > 0';
  }

  static getAllBanis(): string {
	return ` select * from BaniName `;
  }
}