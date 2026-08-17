import { Client, Databases } from "appwrite";

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);

export const DATABASE_ID = '696c7dc0000d7998f391'
  

export const SHENG_COLLECTION_ID = 'sheng' 
  