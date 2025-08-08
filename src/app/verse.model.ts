export interface Verse {
  ID: number;
  VerseID?: number; 
  ShabadID: number;
  English: string;
  Gurmukhi: string;
  GurmukhiBisram: string;
  GurmukhiUni: string;
  WriterID: number;
  Punjabi: string;
  RaagID: number;
  PageNo: number;
  LineNo: number;
  SourceID: string;
  FirstLetterStr: string;
  MainLetters: string;
  Bisram: string;
  Visraam: string;
  FirstLetterEng: string;
  Transliteration: string;
  WriterEnglish: string;
  RaagEnglish: string;
  SourceEnglish: string;
  VishramArray: Vishram[] | null; // Array of Vishram objects or null if not applicable
}

export interface Vishram{
  p: number | null;
  t: string;
}


export interface VerseSearchResult {
  ID: number;
  VerseID?: number; 
  ShabadID: number;
  Gurmukhi: string;
  GurmukhiUni: string;
  WriterID: number;
  Punjabi: string;
  RaagID: number;
  PageNo: number;
  SourceID: string;
  WriterEnglish: string;
  RaagEnglish: string;
  SourceEnglish: string;
}


