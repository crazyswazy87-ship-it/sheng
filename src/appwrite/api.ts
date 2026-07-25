import { databases, DATABASE_ID, SHENG_COLLECTION_ID } from "./config";

import { Query } from "appwrite";

export const searchWord = async (search: string) => {

    const query = search.trim().toLowerCase();

    return databases.listDocuments(
        DATABASE_ID,
        SHENG_COLLECTION_ID,
        [
            Query.or([
                Query.equal("word", query),

                Query.equal("english", query),

                Query.equal("swahili", query),

                Query.contains("aliases", [query]),

                Query.search("englishMeaning", query),

                Query.search("swahiliMeaning", query)
            ])
        ]
    );

};



export const getWordsByCategory = async (category: string) => {
  const queries =
    category === "all"
      ? [Query.limit(500)]
      : [
          Query.equal("category", category),
          Query.limit(500),
        ];

  const response = await databases.listDocuments(
    DATABASE_ID,
    SHENG_COLLECTION_ID,
    queries
  );

  return response.documents;
};