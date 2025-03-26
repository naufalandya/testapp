import admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config();

const serviceAccount = require("../../key/andyax-33db9-firebase-adminsdk-fbsvc-c7731d9c30.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;