export const getPageTitle = (title: string): string => `MTG Drawer - ${title}`;

export const bufferToImageString = (buffer: Uint8Array<ArrayBuffer>) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return `data:image/png;base64,${btoa(binary)}`;
};

export const manaHexColors = {
  White: '#d0c39c',
  Black: '#2f2a1f',
  Red: '#9f1d16',
  Blue: '#2486c1',
  Green: '#366e45'
  // Artifact: '#b3cad1'
};

export const typeHexColors = {
  Land: '#572e0a',
  Creature: '#4aa637',
  Spell: '#1732bb',
  Artifact: '#4487b9',
  Enchantment: '#ffff00'
};

export const typeMatches = {
  Land: ['Land'],
  Creature: ['Creature'],
  Spell: ['Sorcery', 'Instant'],
  Artifact: ['Artifact'],
  Enchantment: ['Enchant Creature', 'Enchantment']
};
