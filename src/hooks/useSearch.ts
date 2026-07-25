import { useState } from "react";
import { searchWord } from "../appwrite/api";

export const useSearch = () => {
  const [loading, setLoading] = useState(false);

  const search = async (word: string) => {
    if (!word.trim()) return null;

    setLoading(true);

    try {
      const response = await searchWord(word);

      if (response.documents.length > 0) {
        return response.documents[0];
      }

      return null;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    search,
  };
};