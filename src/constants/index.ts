// export const STREAM_URL: string =
//   'https://usa13.fastcast4u.com/proxy/parqueverde?mp=/1';
export const STREAM_URL: string =
  'https://centova2.ipstm.net/proxy/bmjceqts/stream';

export const FONT_DEFAULT = {
  Michroma: require('../../assets/fonts/Michroma-Regular.ttf'),
};

export type LocalArtworkKey = 'logo' | 'locucao';

export const CLOUDINARY_IMAGE: Record<LocalArtworkKey, any> = {
  locucao:
    'https://res.cloudinary.com/dymccetsg/image/upload/w_600,h_600,c_fill/v1762127201/locucao_puf2c9.png',
  logo: 'https://res.cloudinary.com/dymccetsg/image/upload/w_600,h_600,c_fill/v1762127704/logo_WR_hnnjvc.png',
};

export const IMAGES = {
  background: require('../../assets/images/background.png'),
};
