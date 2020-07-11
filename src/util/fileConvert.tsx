export const csvConvert = (fileContents: string, separator: string): object[] => {
    var lines = (fileContents + "").split("\n");
    var result = [];
    var headers = lines[0].split(separator);

    for (var i = 1; i < lines.length - 1; i++) {
        var obj: any = {};
        var currentline = lines[i].split(separator);
        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }
        result.push(obj);
    }

    return result;
};

export const jsonConvert = (fileContents: string): object[] => {
    return JSON.parse(fileContents);
};
