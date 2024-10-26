require('dotenv').config();
const axios = require('axios');
const { NlpManager } = require('node-nlp');
const express = require('express')
const app = express()
const manager = new NlpManager({ languages: ['en'], forceNER: true });
// Adds the utterances and intents for the NLP
manager.addDocument('en', 'goodbye for now', 'greetings.bye');
manager.addDocument('en', 'bye bye take care', 'greetings.bye');
manager.addDocument('en', 'okay see you later', 'greetings.bye');
manager.addDocument('en', 'bye for now', 'greetings.bye');
manager.addDocument('en', 'i must go', 'greetings.bye');
manager.addDocument('en', 'hello', 'greetings.hello');
manager.addDocument('en', 'hi', 'greetings.hello');
manager.addDocument('en', 'howdy', 'greetings.hello');

// Train also the NLG
manager.addAnswer('en', 'greetings.bye', 'Till next time');
manager.addAnswer('en', 'greetings.bye', 'see you soon!');
manager.addAnswer('en', 'greetings.hello', 'Hey there!');
manager.addAnswer('en', 'greetings.hello', 'Greetings!');

async function sendTextMessage(aiRes){
    const response = await axios({
        url:'https://graph.facebook.com/v20.0/436001352936040/messages',
        method:'post',
        headers:{
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
            'Content-Type':'application/json'
        },
        data:JSON.stringify({
            messaging_product: 'whatsapp',
            to:'919979193449',
            type:'text',
            text:{
                // name:'Hello_world',
                // language:{
                //     code: 'en_US'
                // }
                body:`${aiRes}`
            }
        })
    });
    console.log(response.data)
}


// Train and save the model.
app.get('/bot',async (req, res)=>{
    const response = await manager.process('en', req.query.message);
    const whatsapp_res = await sendTextMessage(response);
    res.send(response.answer || "Please rephrase")
})


(async() => {
    await manager.train();
    manager.save();    
    app.listen(3000)   
   
})();