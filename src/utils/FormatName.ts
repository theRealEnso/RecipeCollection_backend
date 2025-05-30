export const formatName = (str: string) => {
    str.toLowerCase();
    return str.slice(0,1).toUpperCase() + str.slice(1);
};