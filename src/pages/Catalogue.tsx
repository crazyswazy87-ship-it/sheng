import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { getWordsByCategory } from "../appwrite/api";

interface ShengWord {
$id: string;
word: string;
english: string;
swahili: string;
englishMeaning: string;
swahiliMeaning: string;
category: string;
aliases: string[];
}

const categories = [
{ id: "all", label: "All Sheng Words" },
{ id: "nature", label: "Nature" },
{ id: "actions", label: "Actions" },
{ id: "emotions", label: "Emotions" },
{ id: "numbers", label: "Numbers" },
{ id: "places", label: "Places" },
{ id: "people", label: "People" },
{ id: "foods", label: "Foods" },
{ id: "general", label: "General" },
{ id: "languages", label: "Languages" },
{ id: "objects", label: "Objects" },
{ id: "movements", label: "Movements" },
{ id: "education", label: "Education" },
{ id: "transport", label: "Transport" },
{ id: "communication", label: "Communication" },
{ id: "clothing", label: "Clothing" },
{ id: "health", label: "Health" },
{ id: "currencies", label: "Currencies" },
{ id: "body", label: "Body" },
{ id: "beauty", label: "Beauty" },
{ id: "relationships", label: "Relationships" },
{ id: "music", label: "Music" },
{ id: "housing", label: "Housing" },
{ id: "entertainment", label: "Entertainment" },
{ id: "sounds", label: "Sounds" },
{ id: "time", label: "Time" },
{ id: "media", label: "Media" },
{ id: "appearance", label: "Appearance" },
{ id: "work", label: "Work" },
{ id: "animals", label: "Animals" },
{ id: "materials", label: "Materials" },
{ id: "household", label: "Household" },
{ id: "environment", label: "Environment" },
{ id: "accessories", label: "Accessories" },
{ id: "electronics", label: "Electronics" },
{ id: "sports", label: "Sports" },
{ id: "life", label: "Life" },
{ id: "insults", label: "Insults" },
{ id: "greetings", label: "Greetings" },
{ id: "compliments", label: "Compliments" },
];

const Catalogue = () => {
const [activeCategory, setActiveCategory] = useState("all");
const [words, setWords] = useState<ShengWord[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
const loadWords = async () => {
setLoading(true);


  try {
    const result = await getWordsByCategory(activeCategory);

    setWords(result as unknown as ShengWord[]);
  } catch (error) {
    console.error("Failed to load Sheng words:", error);
    setWords([]);
  } finally {
    setLoading(false);
  }
};

loadWords();


}, [activeCategory]);

return (
<> <SEO
     title="Sheng Dictionary — Kenyan Sheng Words & Meanings | Sheng.buzz"
     description="Explore the Sheng.buzz dictionary of Kenyan Sheng words, slang, meanings, translations, aliases and categories."
     path="/catalogue"
   />


  <main className="catalogue-page">

    <header className="catalogue-header">

      <p>SHENG.BUZZ DICTIONARY</p>

      <h1>
        The Sheng Dictionary
      </h1>

      <p>
        Explore Kenya's evolving Sheng language.
        Discover words, meanings, translations and
        slang used across different communities.
      </p>

    </header>


    <nav
      className="catalogue-categories"
      aria-label="Sheng dictionary categories"
    >

      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={
            activeCategory === category.id
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveCategory(category.id)
          }
        >
          {category.label}
        </button>
      ))}

    </nav>


    <section
      className="catalogue-results"
      aria-label="Sheng words"
    >

      {loading ? (
        <p>Loading Sheng words...</p>
      ) : words.length === 0 ? (
        <div>
          <h2>No Sheng words found</h2>

          <p>
            This category doesn't have any words yet.
          </p>
        </div>
      ) : (
        <div className="catalogue-grid">

          {words.map((item) => (

            <article
              key={item.$id}
              className="catalogue-word-card"
            >

              <Link
                to={`/word/${encodeURIComponent(item.word)}`}
              >

                <h2>
                  {item.word}
                </h2>

                <p>
                  {item.english}
                </p>

                <p>
                  {item.englishMeaning}
                </p>

              </Link>

            </article>

          ))}

        </div>
      )}

    </section>


    <section className="catalogue-introduction">

      <h2>
        What is Sheng?
      </h2>

      <p>
        Sheng is a constantly evolving language variety
        associated with Kenya, particularly urban youth
        culture. It draws vocabulary and influence from
        Swahili, English and many languages spoken across
        Kenya.
      </p>

      <p>
        New words appear, old words change meaning, and
        different communities can use the same word in
        different ways. Sheng.buzz documents this evolving
        vocabulary and helps people understand the language
        through definitions, translations and examples.
      </p>

    </section>

  </main>
</>


);
};

export default Catalogue;
