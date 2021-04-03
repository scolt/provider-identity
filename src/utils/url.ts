export const DEFAULT_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36';

export const generateQueryParamsByObj = (obj: any, prefix = '?'): string => {
    return Object.keys(obj).reduce((result, key, index, array) => {
        let queries = result;
        if (index === 0) queries += '?';
        queries += `${key}=${obj[key]}`;
        if (index < array.length - 1) queries += '&';
        return queries;
    }, '');
}
