
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://carlos:carlos123@dragonball.p5bc8.mongodb.net/?retryWrites=true&w=majority&appName=dragonball";


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function dbUser() {
  try {
    await client.connect(); 
    const db = client.db('usuarios');
    //const user = await db.collection("usuario").find().toArray();
    return db
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  } 
  
}
module.exports = dbUser

