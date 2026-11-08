export const SERVER = process.env.REACT_APP_SERVER_URL !== undefined ?
    process.env.REACT_APP_SERVER_URL : ''
export const ENVIROMENT = "development";
export const REACT_APP_GOOGLE_CLIENT_ID =
    process.env.REACT_APP_GOOGLE_CLIENT_ID?.trim() ||
    "118076620789-oj2slv89vd4j650cdpf0keo7574c8nr2.apps.googleusercontent.com";
