import { Client, Databases } from "appwrite";

const client = new Client();

client
  .setEndpoint('https://sgp.cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

export const SUBSCRIBERS_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_SUBSCRIBERS_COLLECTION_ID;

export const SHENG_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_SHENG_COLLECTION_ID;

export const SHENGTEZO_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_SHENGTEZO_COLLECTION_ID;