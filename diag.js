const MongoClient = require("mongodb").MongoClient;
const url = "mongodb+srv://admin:admin_123@data.fg12n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const language = require('@google-cloud/language')
const client = new language.LanguageServiceClient();


async function GetDiagnostic(Tag, Word, callback ) {

MongoClient.connect(url, {useUnifiedTopology: true }, async function (err, db) {
    if(err) {console.log(err);}
    let dbo = db.db("Twitter");
    let collection = dbo.collection("information")
    let tag_val = Tag;
    console.log(tag_val);
    
    let Query = {tag: tag_val};
    let to_Search = Word.toLowerCase();
    console.log(to_Search);
    let items = await collection.find(Query).toArray();
    let temp = await get_answer(items, to_Search);

    let length = 0;
    length =  items.length;
    let result = 0.00;

    //console.log(temp);
    console.log("result");
    let num = temp.length;

    result = (num/length)*100
    result =  result.toFixed(2)

    db.close();
    return callback(result, temp);
});

}

async function get_answer(items, to_Search)
{
    let words = [];
    
    for(i = 0; i < items.length; i++)
    {
        //console.log(i + ": " + items[i].text + "tag" +  items[i].tag);
        let text = items[i].text.toLowerCase();
        if(text.search(to_Search) > -1)
        {
                words.push(text);
        }
    }

    return words;
}



async function DoAnalysis(array, callback ) {
    let pos = 0;
    let neg = 0;
    let neutral = 0;
    let all_text = "";
    for(i = 0; i < array.length; i++)
    {
        let text = array[i];
        all_text = all_text + " " + array[i];
        let document = {
        content: text,
        type: 'PLAIN_TEXT',
        };
        let arr = await get_answer_sentimental(document);
        if(arr[0] >= 0.3 && arr[1] >= 1.0)
        {
            pos = pos + 1;
            console.log(pos + "POS");
        }
        else if(arr[0] <= -0.1 && arr[1] >= 1.0)
        {
            neg = neg + 1;
            console.log(neg + "NEG");
        }
        else
        {
            neutral = neutral + 1;
            console.log(neutral + "NEUT");
        }
        
    }
    let array_temp_nums = [];

    let document2 = {
        content: all_text,
        type: 'PLAIN_TEXT',
        };
    
        let  array_temp_categories = await get_answer_categories(document2);
    

    array_temp_nums.push(pos);
    array_temp_nums.push(neg);
    array_temp_nums.push(neutral);
    return callback(array_temp_nums,array_temp_categories );
}

async function get_answer_sentimental(document)
{
    const [result] = await client.analyzeSentiment({document: document});
    const sentiment = result.documentSentiment;
    
    let array = [];
    array.push(sentiment.score);
    array.push(sentiment.magnitude);

    return array;
}

async function get_answer_categories(document)
{
    const [classification] = await client.classifyText({document});
    let arr_temp = [];
    classification.categories.forEach(category => {
        arr_temp.push(category.name);
        console.log(`Name: ${category.name}, Confidence: ${category.confidence}`);
      });

    return arr_temp;
}
module.exports = { GetDiagnostic, DoAnalysis};