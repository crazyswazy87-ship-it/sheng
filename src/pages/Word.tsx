import { useEffect, useState } from "react";
import {
Link,
Navigate,
useParams,
} from "react-router-dom";

import SEO from "../components/SEO";
import { getWordByName } from "../appwrite/api";

interface ShengWord {
word: string;
english: string;
swahili: string;
englishMeaning: string;
swahiliMeaning: string;
category: string;
aliases: string[];
popularity: number;
}

const Word = () => {
const { word } = useParams<{ word: string }>();

const [shengWord, setShengWord] =
useState<ShengWord | null>(null);

const [loading, setLoading] =
useState(true);

/*

* ==========================================
* LOAD WORD
* ==========================================
  */

useEffect(() => {
const loadWord = async () => {
if (!word) {
setLoading(false);
setShengWord(null);
return;
}


  try {
    const decodedWord =
      decodeURIComponent(word)
        .trim()
        .toLowerCase();

    const result =
      await getWordByName(decodedWord);

    setShengWord(
      result as ShengWord | null
    );
  } catch (error) {
    console.error(
      "Failed to load Sheng word:",
      error
    );

    setShengWord(null);
  } finally {
    setLoading(false);
  }
};

setLoading(true);
loadWord();


}, [word]);

/*

* ==========================================
* LOADING
* ==========================================
  */

if (loading) {
return ( <main className="sheng-word-page"> <p>Loading Sheng word...</p> </main>
);
}

/*

* ==========================================
* WORD NOT FOUND
* ==========================================
  */

if (!shengWord) {
return (
<>
<SEO
title="Sheng Word Not Found | Sheng.buzz"
description="This Sheng word could not be found in the Sheng.buzz Kenyan Sheng dictionary."
path={`/word/${encodeURIComponent(
            word ?? ""
          )}`}
/>


    <main className="sheng-word-page">

      <nav aria-label="Breadcrumb">
        <Link to="/">
          Sheng.buzz
        </Link>

        {" / "}

        <Link to="/catalogue">
          Dictionary
        </Link>
      </nav>

      <section>
        <h1>
          Sheng word not found
        </h1>

        <p>
          We couldn't find this word in
          the Sheng.buzz dictionary.
        </p>

        <Link to="/catalogue">
          Browse the Sheng dictionary
        </Link>
      </section>

    </main>
  </>
);


}

/*

* ==========================================
* CANONICAL WORD
* ==========================================
  */

const displayWord =
shengWord.word.trim();

const requestedWord =
decodeURIComponent(word || "")
.trim()
.toLowerCase();

const canonicalWord =
displayWord.toLowerCase();

const isAlias =
requestedWord !== canonicalWord;

/*

* ==========================================
* ALIAS → CANONICAL REDIRECT
*
* Example:
*
* /word/njege
* 
* /word/masanse
* ==========================================
  */

if (isAlias) {
return (
<Navigate
to={`/word/${encodeURIComponent(
          displayWord
        )}`}
replace
/>
);
}

/*

* ==========================================
* SEO
* ==========================================
  */

const canonicalPath =
`/word/${encodeURIComponent(
      displayWord
    )}`;

const title =
`${displayWord} Meaning in Sheng | Sheng.buzz`;

const description =
`${displayWord} means "${shengWord.english}" in Sheng. ` +
`Learn the meaning of ${displayWord}, its English ` +
`and Swahili translations, aliases and related ` +
`Sheng vocabulary on Sheng.buzz.`;

/*

* ==========================================
* STRUCTURED DATA
* ==========================================
  */

const structuredData = {
"@context": "https://schema.org",


"@type": "DefinedTerm",

name: displayWord,

description:
  shengWord.englishMeaning,

url:
  `https://sheng.buzz${canonicalPath}`,

inLanguage: "en-KE",

alternateName:
  shengWord.aliases || [],

inDefinedTermSet: {
  "@type": "DefinedTermSet",

  name: "Sheng Dictionary",

  description:
    "A growing dictionary of Kenyan Sheng words, meanings, translations and slang.",

  url:
    "https://sheng.buzz/catalogue",
},


};

/*

* ==========================================
* PAGE
* ==========================================
  */

return (
<>
<SEO
title={title}
description={description}
path={canonicalPath}
type="article"
keywords={[
`${displayWord} meaning`,
`${displayWord} meaning in Sheng`,
`${displayWord} Sheng meaning`,
`${displayWord} Kenya`,
`what does ${displayWord} mean`,
`Sheng word ${displayWord}`,


      shengWord.english,
      shengWord.swahili,

      ...(shengWord.aliases || []),
    ]}
    structuredData={structuredData}
  />


  <main className="sheng-word-page">

    {/* =====================================
        BREADCRUMB
        ===================================== */}

    <nav
      aria-label="Breadcrumb"
    >

      <Link to="/">
        Sheng.buzz
      </Link>

      {" / "}

      <Link to="/catalogue">
        Sheng Dictionary
      </Link>

      {" / "}

      <span>
        {displayWord}
      </span>

    </nav>


    {/* =====================================
        DICTIONARY ENTRY
        ===================================== */}

    <article>

      <header>

        <p>
          Sheng Dictionary
        </p>

        <h1>
          {displayWord}
        </h1>

        <p>
          <strong>
            English:
          </strong>{" "}
          {shengWord.english}
        </p>

        <p>
          <strong>
            Swahili:
          </strong>{" "}
          {shengWord.swahili}
        </p>

      </header>


      {/* ===================================
          ENGLISH MEANING
          =================================== */}

      <section>

        <h2>
          What does {displayWord} mean?
        </h2>

        <p>
          {shengWord.englishMeaning}
        </p>

      </section>


      {/* ===================================
          SWAHILI MEANING
          =================================== */}

      <section>

        <h2>
          {displayWord} meaning in Swahili
        </h2>

        <p>
          {shengWord.swahiliMeaning}
        </p>

      </section>


      {/* ===================================
          CATEGORY
          =================================== */}

      <section>

        <h2>
          Sheng category
        </h2>

        <p>
          {shengWord.category}
        </p>

      </section>


      {/* ===================================
          ALIASES
          =================================== */}

      {shengWord.aliases?.length > 0 && (

        <section>

          <h2>
            Other Sheng words for{" "}
            {shengWord.english}
          </h2>

          <ul>

            {shengWord.aliases.map(
              (alias) => (

                <li key={alias}>

                  <Link
                    to={`/word/${encodeURIComponent(
                      alias
                    )}`}
                  >
                    {alias}
                  </Link>

                </li>

              )
            )}

          </ul>

        </section>

      )}


      {/* ===================================
          ABOUT
          =================================== */}

      <section>

        <h2>
          About this Sheng definition
        </h2>

        <p>
          Sheng is constantly evolving
          across Kenya. Meanings can vary
          depending on location, context,
          generation and everyday usage.
        </p>

        <p>
          Sheng.buzz documents Sheng
          vocabulary to help people
          understand and keep up with
          Kenya's changing language.
        </p>

      </section>

    </article>

  </main>
</>


);
};

export default Word;
