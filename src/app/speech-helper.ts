export class SpeechHelper {
  // instead of const
  static readonly gurmukhiToEnglish: { [key: string]: string } = {
    'ਅ': 'A', 'ਆ': 'A', 'ਇ': 'e', 'ਈ': 'e', 
    'ਉ': 'a', 'ਊ': 'a', 'ਏ': 'e', 'ਐ': 'A', 
    'ਓ': 'a', 'ਔ': 'A',
    'ਕ': 'k', 'ਖ': 'K', 'ਗ': 'g', 'ਘ': 'G', 'ਙ': '|',
    'ਚ': 'c', 'ਛ': 'C', 'ਜ': 'j', 'ਝ': 'J', 'ਞ': '\\',
    'ਟ': 't', 'ਠ': 'T', 'ਡ': 'f', 'ਢ': 'F', 'ਣ': 'x',
    'ਤ': 'q', 'ਥ': 'Q', 'ਦ': 'd', 'ਧ': 'D', 'ਨ': 'n',
    'ਪ': 'p', 'ਫ': 'P', 'ਬ': 'b', 'ਭ': 'B', 'ਮ': 'm',
    'ਯ': 'X', 'ਰ': 'r', 'ਲ': 'l', 'ਵ': 'v', 'ਸ਼': 'S',
    'ਸ': 's', 'ਹ': 'h', 'ੜ': 'V', 'ਲ਼': 'L', 'ਖ਼': '^',
    'ਗ਼': 'Z', 'ਜ਼': 'z', 'ਫ਼': '&', 'ੲ': 'e', 'ੴ': '1',
  };

  static transliterateWord(word: string): string {
    return word
      .split('')
      .map(char => this.gurmukhiToEnglish[char] ?? char)
      .join('');
  }

  static getInitialsFromGurmukhi(text: string): string {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const initials = words.map(word => {
      const roman = this.transliterateWord(word);
      return roman[0] || '';
    });
    return initials.join('');
  }
}