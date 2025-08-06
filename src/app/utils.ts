import { Verse, VerseSearchResult } from './verse.model';

export function mapResultsToVerseSearchResults(results: any[]): VerseSearchResult[] {
  return results.map(row => ({
    ID: row.ID,
    ShabadID: row.ShabadID,
    Gurmukhi: row.Gurmukhi,
    GurmukhiUni: row.GurmukhiUni,
    WriterID: row.WriterID,
    Punjabi: row.Punjabi,
    RaagID: row.RaagID,
    PageNo: row.PageNo,
    SourceID: row.SourceID
  }));
}

export function mapResultsToVerse(results: any[]): Verse[] {
  return results.map(row => ({
    ID: row.ID,
    ShabadID: row.ShabadID,
    English: row.English,
    Gurmukhi: row.Gurmukhi,
    GurmukhiBisram: row.GurmukhiBisram,
    GurmukhiUni: row.GurmukhiUni,
    WriterID: row.WriterID,
    Punjabi: row.Punjabi,
    RaagID: row.RaagID,
    PageNo: row.PageNo,
    LineNo: row.LineNo,
    SourceID: row.SourceID,
    FirstLetterStr: row.FirstLetterStr,
    MainLetters: row.MainLetters,
    Bisram: row.Bisram,
    Visraam: row.Visraam,
    FirstLetterEng: row.FirstLetterEng,
    Transliteration: row.Transliteration
  }));
}
