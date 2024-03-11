const { MongoClient } = require("mongodb");
const { writeFileSync } = require("fs");

const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri);

let data = [];

async function run() {
    try {
        await client.connect();
    
        const database = client.db("Agaval");
        const collection = database.collection("CategoriasLevel");
    
        const query = {};
        const result = await collection.find(query).toArray();
        data = result.filter((item) => item.level === 1).map(x=>{return {id: x.id, name: x.name, parent_id: x.parent_id, has_children: x.has_children, level: x.level, child: []}});
        let level1 = getChilds(result, data);
        
        //await writeFileSync("./data.json", JSON.stringify(level1));

        let onlyNames = parseData(level1);
        await writeFileSync("./data2.json", JSON.stringify(onlyNames));
        console.log(level1.length);
        console.log(result.length);
    } finally {
        await client.close();
    }
}
run().catch(console.dir);


function getChilds(results, data) {
    data.forEach((item) => {
        item.child = [];
        let children = results.filter((child) => child.parent_id === item.id).map(x=>{return {id: x.id, name: x.name, parent_id: x.parent_id, has_children: x.has_children, level: x.level, child: []}});
        if(children.some((child) => child.has_children === true)) {
            item.child = [...item.child, ...getChilds(results, children)];
        }else{
            item.child = [...item.child, ...children];
        }
    });
    return data;
}
function parseData(data) {
    let result = {};
    data.forEach((item) => {
        if(item.has_children === true) {
            result[item.id+' - '+item.name] = parseData(item.child);
        }else{
            result[item.id+' - '+item.name] = null;
        }
    });
    return result;
}