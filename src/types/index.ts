export type DeckEntry = {
  id: string;
  name: string;
  set: string;
  image: string;
  color: string;
};

export type CardInfoResponse = {
  id: string;
  name: string;
  highres_image: boolean;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  color_identity: string[];
  mana_cost: string;
  cmc: number;
  type_line: string;
};

export enum ManaColors {
  White = 'W',
  Black = 'B',
  Red = 'R',
  Blue = 'U',
  Green = 'G'
}

export enum DisplayModes {
  Images,
  List
}
