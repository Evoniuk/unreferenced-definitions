const fs = require('fs');

function main() {
    if (process.argv.length != 3) {
        console.log('USAGE: node unref-defs.js <JSON file>');
        return;
    }

    const filename = process.argv[2];

    if (!fs.existsSync(filename)) {
        console.log(filename + " doesn't seem to exist. Try checking the path and current directory.");
        return;
    }

    if (!filename.endsWith('.json')) {
        console.log('You must supply a JSON file.');
        return;
    }

    const jsonText = fs.readFileSync(filename, "utf8");
    jsonParsed = JSON.parse(jsonText);

    // compile list of all definitions
    let definitions = [];
    for (const definition in jsonParsed.definitions)
        definitions.push(definition);

    // compile list of all referenced defintions
    let referencedDefinitions = [];
    addReferencedDefinitions(jsonParsed, referencedDefinitions);

    // print out all definitions that are not referenced
    console.log(definitions.filter(definition => !referencedDefinitions.includes(definition)));
}

function addReferencedDefinitions(jsonParsed, referencedDefinitions) {
    // add directly referenced definitions
    for (const path in jsonParsed.paths)
        searchRefs(jsonParsed.paths[path], referencedDefinitions);

    // recursively add indirectly referenced defintions
    addNestedDefinitions(jsonParsed, referencedDefinitions);

}

function addNestedDefinitions(jsonParsed, referencedDefinitions, startIndex = 0) {
    const referencedDefinitionsCount = referencedDefinitions.length;

    for (let i = startIndex; i < referencedDefinitionsCount; i++)
        searchRefs(jsonParsed.definitions[referencedDefinitions[i]], referencedDefinitions);

    // if there are new refs, look through them
    if (referencedDefinitionsCount !== referencedDefinitions.length)
        addNestedDefinitions(jsonParsed, referencedDefinitions, referencedDefinitionsCount);
}

function searchRefs(object, referencedDefinitions) {
    for (const property in object) {
        if (property === '$ref')
            addRef(object[property], referencedDefinitions);
        else if (typeof object[property] === 'object')
            searchRefs(object[property], referencedDefinitions);
    }

}

function addRef(ref, referencedDefinitions) {
    ref = ref.replace('#/definitions/', '');
  
    if (!referencedDefinitions.includes(ref))
        referencedDefinitions.push(ref);
}

main();
