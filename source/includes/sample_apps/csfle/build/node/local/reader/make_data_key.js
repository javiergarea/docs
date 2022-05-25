const mongodb = require("mongodb");
const { ClientEncryption } = require("mongodb-client-encryption");
const { MongoClient, Binary } = mongodb;

const fs = require("fs");
const crypto = require("crypto");
try {
  fs.writeFileSync("master-key.txt", crypto.randomBytes(96));
} catch (err) {
  console.error(err);
}

// start-kmsproviders
const provider = "local";
const path = "./master-key.txt";
const localMasterKey = fs.readFileSync(path);
const kmsProviders = {
  local: {
    key: localMasterKey,
  },
};
// end-kmsproviders

// start-datakeyopts
// end-datakeyopts

// start-create-dek
const base64 = require("base64-js");
const connectionString = "<Your Connection String>";
const keyVaultNamespace = "encryption.__keyVault";
const client = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function main() {
  try {
    await client.connect();
    const encryption = new ClientEncryption(client, {
      keyVaultNamespace,
      kmsProviders,
    });
    const key = await encryption.createDataKey(provider);
    const base64DataKeyId = key.toString("base64");
    const uuidDataKeyId = base64.fromByteArray(base64DataKeyId);
    console.log("DataKeyId [base64]: ", base64DataKeyId);
  } finally {
    await client.close();
  }
}
main();
// end-create-dek