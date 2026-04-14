require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || process.env.Database_URL || process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected to MongoDB.");
    const User_Account = require('./modal/user.schema');

    try {
      console.log("Attempting to drop problematic index 'profileName_1'...");
      await User_Account.collection.dropIndex('profileName_1');
      console.log("Successfully dropped 'profileName_1' index.");
    } catch (err) {
      if (err.codeName === 'IndexNotFound') {
        console.log("Index 'profileName_1' not found, nothing to drop.");
      } else {
        console.error("Error dropping index:", err.message);
      }
    }

    try {
      console.log("Syncing remaining indexes according to schema...");
      await User_Account.syncIndexes();
      console.log("Database indexes successfully synced with new schema settings (sparse: true).");
    } catch (err) {
      console.error("Error syncing indexes:", err.message);
    }

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
  });
