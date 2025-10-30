export const STREAM_URL: string = "https://centova2.ipstm.net/proxy/bmjceqts/stream";

export const FONT_DEFAULT = {
    Michroma: require('../../assets/fonts/Michroma-Regular.ttf')
};

export type LocalArtworkKey = 'logo' | 'locucao';


export const LOCAL_NETWORK: Record<LocalArtworkKey, any> = {
    locucao: require('../../assets/images/locucao.png'),
    logo: require('../../assets/images/logo.png'),
}

export const IMAGES = {
    background: require('../../assets/images/background.png'),
}