export const formatName = (str: string) => {
    let splitStr = str.split(" ");
    let formattedStrArray = [];

    for(let word of splitStr){
        const formattedWord = word.slice(0,1).toUpperCase() + word.slice(1);
        formattedStrArray.push(formattedWord);
    };

    return formattedStrArray.join(" ");
};

// export const formatName = (str: string) => {
//     str.toLowerCase();
//     return str.slice(0,1).toUpperCase() + str.slice(1);
// }