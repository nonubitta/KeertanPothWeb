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
    SourceID: row.SourceID,
    WriterEnglish: row.WriterEnglish,
    RaagEnglish: row.RaagEnglish,
    SourceEnglish: row.SourceEnglish
  }));
}

export function mapResultsToVerse(results: any[], showVishraam: boolean = false): Verse[] {
  return results.map(row => {
    // Parse Visraam column for sttm data into VishramArray
    let VishramArray: any = undefined;
    let gurmukhiHtml: string | undefined = undefined;
    if (row.Visraam && showVishraam) {
      try {
        const visraamObj = typeof row.Visraam === 'string' ? JSON.parse(row.Visraam) : row.Visraam;
        VishramArray = visraamObj?.sttm ?? [];
      } catch {
        VishramArray = [];
      }
      gurmukhiHtml = GetHtmlWithVishraam(row.Gurmukhi, VishramArray);
    }
    else{
      gurmukhiHtml = row.Gurmukhi;
    }
    return {
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
      Transliteration: row.Transliteration,
      WriterEnglish: row.WriterEnglish,
      RaagEnglish: row.RaagEnglish,
      SourceEnglish: row.SourceEnglish,
      VishramArray: VishramArray,
      GurmukhiHtml: gurmukhiHtml
    };
  });
}

export function GetHtmlWithVishraam (gurmukhi: string, vishramArray: any[]): string {
  // Split Gurmukhi into words
  debugger;
  if (!gurmukhi) return '';
  const words = gurmukhi.split(' ');
  let html = '';
  for (let i = 0; i < vishramArray.length; i++) {
    const vishraam = vishramArray[i];
    if (vishraam && vishraam.p !== null && vishraam.t !== null) {
      words[vishraam.p] = `<span class="${vishraam.t}">${words[vishraam.p]}</span>`;
    } 
  }
  html = words.join(' ');
  return html;
}
/**
 * For a selectedShabad array, parses each row's Visraam and updates its VishramArray property.
 * Modifies the array in-place and also returns it.
 */
export function visraamToVishraamArray(selectedShabad: Verse[] | null): any[] {
  if (selectedShabad === null || !Array.isArray(selectedShabad)) {
    return selectedShabad || [];
  }
  for (const row of selectedShabad) {
    try {
      const visraam = row.Visraam;
      if (visraam) {
        const obj = typeof visraam === 'string' ? JSON.parse(visraam) : visraam;
        row.VishramArray = Array.isArray(obj?.sttm) ? obj.sttm : [];
      } else {
        row.VishramArray = [];
      }
    } catch {
      row.VishramArray = [];
    }
  }
  return selectedShabad;
}
