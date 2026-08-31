import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type JSX,
  type ReactNode,
} from "react";

import {
  BookPlus,
  ScrollText,
} from "lucide-react";

import {
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";

import bseven from "../../public/assets/images/bseven-white.png"

import {
  MessageSquarePlus,
  Crown,
  History,
  Info,
} from "lucide-react";



import Aurora from "../components/Aurora";
import Strands from "../components/Strands";
import Chat from "../components/shared/Chat";
import Logotu from "../../public/assets/images/sheng-trs.png";
import Logo from "../../public/assets/images/sheng-trs.png";
import { useSearch } from "../hooks/useSearch";
import ShinyText from "../components/ShinyText";
import Shuffle from "../components/Shuffle";

import {
  getWordsByCategory,
  subscribeToShengDrops,
  createShengSuggestion,
} from "../appwrite/api";
import StaggeredMenu from "../components/StaggeredMenu";
import SEO from "../components/SEO";


const MAX_REVEAL = 230;


const clamp = (
  value: number,
  min: number,
  max: number
): number => {
  return Math.max(min, Math.min(max, value));
};

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: any;
  loading?: boolean;
};

type ChatHistory = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

interface TileProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
}

function Tile({
  icon,
  label,
  active,
}: TileProps): JSX.Element {
  return (
    <div
      className={`quick-settings-tile ${
        active ? "quick-settings-tile-active" : ""
      }`}
    >
      {icon}

      <span className="quick-settings-tile-label">
        {label}
      </span>
    </div>
  );
}

const Home = () => {
  const { search } = useSearch();

  /* =========================================================
     QUICK SETTINGS STATE
     ========================================================= */

  const [reveal, setReveal] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);


  const toggleQuickSettings = () => {
    setReveal((current) =>
      current > 0 ? 0 : MAX_REVEAL
    );
  };

  const progress = reveal / MAX_REVEAL;

  const scale = 1 - progress * 0.06;
  const radius = 8 + progress * 26;

  /* =========================================================
     HOME STATE
     ========================================================= */

  const newChat = () => {
  // Save the current conversation before starting a new one
  if (messages.length > 0) {
    const firstUserMessage = messages.find(
      (message) => message.role === "user"
    );

    const conversation: ChatHistory = {
      id: conversationId || crypto.randomUUID(),
      title:
        typeof firstUserMessage?.content === "string"
          ? firstUserMessage.content.slice(0, 50)
          : "New Conversation",
      messages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    saveHistory(conversation);
  }

  setMessages([]);
  setQuery("");
  setConversationId(null);
  setShowHistory(false);
  setReveal(0);
};

  const [shengWords, setShengWords] = useState<string[]>([]);
  const [placeholder, setPlaceholder] = useState("");

  const [query, setQuery] = useState("");


  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showTermsOfUse, setShowTermsOfUse] = useState(false);


  const [showSuggestSheng, setShowSuggestSheng] = useState(false);

  const [suggestionWord, setSuggestionWord] = useState("");
  const [suggestionMeaning, setSuggestionMeaning] = useState("");
  const [suggestionExample, setSuggestionExample] = useState("");

  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
  const [suggestionMessage, setSuggestionMessage] = useState("");

  /* =========================================================
    LOAD HISTORY FROM LOCAL STORAGE
    ========================================================= */

  useEffect(() => {
    try {
      const saved = localStorage.getItem("shengai_history");

      if (!saved) return;

      const parsed: ChatHistory[] = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setHistory(parsed);
      }
    } catch (error) {
      console.error("Failed to load ShengAI history:", error);

      localStorage.removeItem("shengai_history");
    }
  }, []);

  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 7000);

      return () => clearTimeout(timer);
    }, []);


  /* =========================================================
    SAVE HISTORY
    ========================================================= */

  const saveHistory = useCallback((conversation: ChatHistory) => {
    setHistory((prev) => {
      const updated = [
        conversation,
        ...prev.filter((item) => item.id !== conversation.id),
      ];

      localStorage.setItem(
        "shengai_history",
        JSON.stringify(updated)
      );

      return updated;
    });
  }, []);

  const [activeCategory, setActiveCategory] =
  useState("all");

  const categoryCarouselRef =
    useRef<HTMLDivElement>(null);

  const [carouselPaused, setCarouselPaused] =
    useState(false);

  const resumeCarouselTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);
    

  const loadCategoryWords = async (
    category: string
  ) => {
    try {
      const docs = await getWordsByCategory(category);

      const words = docs.map(
        (doc) => doc.word
      );

      setShengWords(words);

      if (words.length) {
        setPlaceholder(
          words[
            Math.floor(
              Math.random() * words.length
            )
          ]
        );
      } else {
        setPlaceholder("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================================================
   CATEGORY CAROUSEL AUTO SLIDE
   ========================================================= */

useEffect(() => {
  if (carouselPaused) return;

  const carousel = categoryCarouselRef.current;

  if (!carousel) return;

  const slideInterval = setInterval(() => {
    const cards =
      carousel.querySelectorAll<HTMLElement>(
        ".category-card"
      );

    if (!cards.length) return;

    const currentScroll = carousel.scrollLeft;

    // Find the next card after the current scroll position
    let nextCard: HTMLElement | null = null;

    for (const card of cards) {
      if (
        card.offsetLeft >
        currentScroll + 5
      ) {
        nextCard = card;
        break;
      }
    }

    // If we're at the end, smoothly return to the beginning
    if (!nextCard) {
      carousel.scrollTo({
        left: 0,
        behavior: "smooth",
      });

      return;
    }

    carousel.scrollTo({
      left:
        nextCard.offsetLeft -
        5,
      behavior: "smooth",
    });
  }, 3500);

  return () => {
    clearInterval(slideInterval);
  };
}, [carouselPaused]);

  useEffect(() => {
    if (!shengWords.length) return;

    const interval = setInterval(() => {
      setPlaceholder(
        shengWords[
          Math.floor(
            Math.random() * shengWords.length
          )
        ]
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [shengWords]);

  useEffect(() => {
    loadCategoryWords("all");
  }, []);


  const handleSearch = async (input?: string) => {
  const currentQuery = (input ?? query).trim();

  if (!currentQuery) return;

  // Remove focus from the input.
  // This closes the mobile keyboard after submitting.
  searchInputRef.current?.blur();

  // Also hide the virtual keyboard on mobile browsers
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const userId = Date.now();
  const aiId = userId + 1;

  const userMessage: ChatMessage = {
    id: userId,
    role: "user",
    content: currentQuery,
  };
  
  const loadingMessage: ChatMessage = {
    id: aiId,
    role: "assistant",
    content: null,
    loading: true,
    searchedWord: currentQuery,
  };

  const updatedMessages = [
    ...messages,
    userMessage,
    loadingMessage,
  ];

  setMessages(updatedMessages);

  const activeConversationId =
    conversationId || crypto.randomUUID();

  setConversationId(activeConversationId);

  try {
    const response = await search(currentQuery);

    const finalMessages: ChatMessage[] = [
      ...messages,
      userMessage,
      {
        id: aiId,
        role: "assistant",
        content: response,
        loading: false,
        searchedWord: currentQuery,
      },
    ];

    setMessages(finalMessages);

    const conversation: ChatHistory = {
      id: activeConversationId,
      title: currentQuery.slice(0, 50),
      messages: finalMessages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    saveHistory(conversation);
  } catch (error) {
    console.error("Search failed:", error);

    const finalMessages: ChatMessage[] = [
      ...messages,
      userMessage,
      {
        id: aiId,
        role: "assistant",
        content: null,
        loading: false,
        searchedWord: currentQuery,
      },
    ];

    setMessages(finalMessages);

    const conversation: ChatHistory = {
      id: activeConversationId,
      title: currentQuery.slice(0, 50),
      messages: finalMessages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    saveHistory(conversation);
  }

  setQuery("");
};

  const handleDeepSearch = async (word: string) => {
  const cleanWord = word.trim();

  if (!cleanWord) return;

  try {
    const response = await search(cleanWord, true);

    // -----------------------------------------
    // DEEP SEARCH FOUND SOMETHING
    // -----------------------------------------

    if (response) {
      const aiId = Date.now();

      const deepMessage: ChatMessage = {
        id: aiId,
        role: "assistant",
        content: response,
        loading: false,
        searchedWord: cleanWord,
      };

      setMessages((prev) => [
        ...prev,
        deepMessage,
      ]);

      return;
    }

    // -----------------------------------------
    // NOTHING FOUND
    // OPEN SHENTEZO
    // -----------------------------------------

    setSuggestionWord(cleanWord);
    setSuggestionMeaning("");
    setSuggestionExample("");
    setSuggestionMessage("");

    setShowSuggestSheng(true);

  } catch (error) {

    console.error(
      "Deep search failed:",
      error
    );

    // If deep search itself fails,
    // still allow the user to suggest it.

    setSuggestionWord(cleanWord);
    setSuggestionMeaning("");
    setSuggestionExample("");
    setSuggestionMessage("");

    setShowSuggestSheng(true);
  }
};

  const openHistory = () => {
    setReveal(0);
    setShowHistory(true);
  };

  const loadHistory = (conversation: ChatHistory) => {
    setMessages(conversation.messages);
    setConversationId(conversation.id);
    setQuery("");
    setShowHistory(false);
    setReveal(0);
  };

  const deleteHistory = (
    e: React.MouseEvent,
    id: string
  ) => {
    e.stopPropagation();

    setHistory((prev) => {
      const updated = prev.filter(
        (conversation) => conversation.id !== id
      );

      localStorage.setItem(
        "shengai_history",
        JSON.stringify(updated)
      );

      return updated;
    });

    if (conversationId === id) {
      setMessages([]);
      setConversationId(null);
    }
  };

  /**=========================
   * Subscribe
   *  ============================= */
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState("");




  const categories = [
    { id: "all", icon: "🌐", label: "All" },
    { id: "nature", icon: "🌿", label: "Nature" },
    { id: "actions", icon: "🏃", label: "Actions" },
    { id: "emotions", icon: "😊", label: "Emotions" },
    { id: "numbers", icon: "🔢", label: "Numbers" },
    { id: "places", icon: "📍", label: "Places" },
    { id: "people", icon: "👥", label: "People" },
    { id: "foods", icon: "🍔", label: "Foods" },
    { id: "general", icon: "📖", label: "General" },
    { id: "languages", icon: "🗣️", label: "Languages" },
    { id: "objects", icon: "📦", label: "Objects" },
    { id: "movements", icon: "🚶", label: "Movements" },
    { id: "education", icon: "🎓", label: "Education" },
    { id: "transport", icon: "🚌", label: "Transport" },
    { id: "drugs", icon: "💊", label: "Drugs" },
    { id: "communication", icon: "💬", label: "Communication" },
    { id: "clothing", icon: "👕", label: "Clothing" },
    { id: "health", icon: "🩺", label: "Health" },
    { id: "currencies", icon: "💰", label: "Currencies" },
    { id: "body", icon: "🦴", label: "Body" },
    { id: "beauty", icon: "💄", label: "Beauty" },
    { id: "relationships", icon: "❤️", label: "Relationships" },
    { id: "music", icon: "🎵", label: "Music" },
    { id: "decriptive", icon: "🏷️", label: "Descriptive" },
    { id: "housing", icon: "🏠", label: "Housing" },
    { id: "entertainment", icon: "🎭", label: "Entertainment" },
    { id: "sounds", icon: "🔊", label: "Sounds" },
    { id: "order", icon: "📋", label: "Order" },
    { id: "time", icon: "⏰", label: "Time" },
    { id: "media", icon: "📺", label: "Media" },
    { id: "appearance", icon: "🪞", label: "Appearance" },
    { id: "work", icon: "💼", label: "Work" },
    { id: "animals", icon: "🐾", label: "Animals" },
    { id: "materials", icon: "🧱", label: "Materials" },
    { id: "utitlities", icon: "🛠️", label: "Utilities" },
    { id: "household", icon: "🛋️", label: "Household" },
    { id: "enviroment", icon: "🌍", label: "Environment" },
    { id: "accessories", icon: "👜", label: "Accessories" },
    { id: "electronics", icon: "💻", label: "Electronics" },
    { id: "sports", icon: "⚽", label: "Sports" },
    { id: "life", icon: "🌱", label: "Life" },
    { id: "insults", icon: "😤", label: "Insults" },
    { id: "greetings", icon: "👋", label: "Greetings" },
    { id: "compliments", icon: "🌟", label: "Compliments" },
  ];


  const pauseCarousel = () => {
  setCarouselPaused(true);

  if (resumeCarouselTimer.current) {
    clearTimeout(resumeCarouselTimer.current);
  }

  resumeCarouselTimer.current =
    setTimeout(() => {
      setCarouselPaused(false);
    }, 4000);
};

  return (
    <>
    <SEO
      title="Sheng.buzz — Kenya's AI-Powered Sheng Dictionary"
      description="Sheng.buzz is an AI-powered Sheng dictionary and language companion for understanding Kenya's evolving Sheng, slang, meanings, translations and expressions."
      path="/"
    />

      {isLoading && (
      <div className="sheng-loader">
        <div className="sheng-loader-content">

          <img
            src={Logotu}
            alt="ShengAI"
            className="sheng-loader-logo"
          />

          <div className="sheng-loader-text">
             <span className="comp-name">
              <span className="d1fnn">S</span>
              <span className="d2fnn">H</span>
              <span className="d3fnn">ENG</span>
           
            </span>

            <div className="top-defn">
              <span className="d1fn">Swahili</span>
              <hr className="hr"/>
              <span className="d2fn">Hoodslang</span>
              <hr className="hr"/>
              <span className="d3fn">ENGlish</span>
            </div>
          </div>

          <div className="sheng-loader-bar">
            <div className="sheng-loader-progress" />
          </div>

        </div>
      </div>
    )}
    <div className="quick-settings-page">

      {showHistory && (
        <div className="history-overlay">

          <div className="history-panel">

            <div className="history-header">
              <div>
                <h2>History</h2>
                <span>
                  {history.length} conversation
                  {history.length !== 1 ? "s" : ""}
                </span>
              </div>

              <button
                type="button"
                className="history-close"
                onClick={() => setShowHistory(false)}
              >
                ×
              </button>
            </div>


            {history.length === 0 ? (
              <div className="history-empty">
                <History size={38} />

                <h3>No conversations yet</h3>

                <p>
                  Your ShengAI searches will appear here.
                </p>
              </div>
            ) : (
              <div className="history-list">

            {history.map((conversation) => (
              <div
                key={conversation.id}
                className="history-item"
                onClick={() => loadHistory(conversation)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    loadHistory(conversation);
                  }
                }}
              >

                <div className="history-item-icon">
                  <History size={18} />
                </div>

                <div className="history-item-content">
                  <strong>
                    {conversation.title}
                  </strong>

                  <span>
                    {conversation.messages.length} messages
                  </span>
                </div>

                <button
                  type="button"
                  className="history-delete"
                  onClick={(e) =>
                    deleteHistory(e, conversation.id)
                  }
                  aria-label="Delete conversation"
                >
                  ×
                </button>

              </div>
            ))}

          </div>
              )}

            </div>

          </div>
        )}

        {showSubscribe && (
        <div className="history-overlay">

          <div className="history-panel">

            {/* HEADER */}
            <div className="history-header">
              <div>
                <h2>Subscribe</h2>
                <span>Stay in the Sheng loop</span>
              </div>

              <button
                type="button"
                className="history-close"
                onClick={() => setShowSubscribe(false)}
              >
                ×
              </button>
            </div>

            {/* CONTENT */}
            <div className="subscribe-content">

              <Crown size={38} />

              <h3>Never miss a Sheng drop.</h3>

              <p>
                Sunda email yako, tutakushow new sheng words ziki donjo!
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  if (!email.trim()) return;

                  try {
                    setSubscribing(true);
                    setSubscribeMessage("");

                    await subscribeToShengDrops(
                      email.trim().toLowerCase()
                    );

                    setSubscribeMessage(
                      "Rada safi, We'll let you know when something new drops."
                    );

                    setEmail("");

                  } catch (error: any) {
                    console.error(error);

                    if (error?.code === 409) {
                      setSubscribeMessage(
                        "Nakungam! You're already on the list 👀"
                      );
                    } else {
                      setSubscribeMessage(
                        "Something went wrong. Please try again."
                      );
                    }

                  } finally {
                    setSubscribing(false);
                  }
                }}
              >

                <div className="sheng-drop-georgia">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <button type="submit" disabled={subscribing}>
                  {subscribing ? "Joining..." : "Keep me posted"}
                </button>
              </div>

              </form>

              {subscribeMessage && (
                <p className="subscribe-message">
                  {subscribeMessage}
                </p>
              )}

              <small>
                No spam. Just fresh Sheng drops and important updates.
              </small>

            </div>

          </div>

        </div>
      )}

      {showAbout && (
      <div className="history-overlay">

        <div className="history-panel">

          {/* HEADER */}
          <div className="history-header">
            <div>
              <h2>About Sheng</h2>
              <span>Learn more about Sheng</span>
            </div>

            <button
              type="button"
              className="history-close"
              onClick={() => setShowAbout(false)}
            >
              ×
            </button>
          </div>

          {/* ABOUT CONTENT */}
          <div className="about-content">

            <h1>Sheng ni ya hood.</h1>

            <p>
              Sheng is always moving. New words drop, meanings switch,
              and every hood has its own lingos.
            </p>

            <p>
              <strong>Sheng AI</strong> is an AI powered Sheng translator
              that helps turn English and Swahili into Sheng, so you can
              understand the lingo without looking lost in the conversation.
            </p>

            <div className="about-warning">
              <strong>But don't get too comfortable si unangam AI si wasee wa mtaa 😅</strong>

              <p>
                Sheng AI can make mistakes. Context matters, locations matter,
                and sometimes the streets simply know better. Always
                double-check important translations.
              </p>
            </div>

            {/* TAGLINE */}
            <div className="about-tagline">

              <h3>
                We don't teach the streets Sheng.
              </h3>

              <strong>
                WE HELP YOU CATCH UP.
              </strong>
            </div>

            {/* BLOCKSEVEN */}
            <div className="about-footer">

              <div className="blockseven-logo " >
                <img 
                  src={bseven}
                  alt="b7"
                  height={30}
                                    className="iiindaaa"
                />
              </div>

             <h2>
              <a
                href="https://blockseven.vercel.app"
                className="belo"
                target="_blank"
                rel="noopener noreferrer"
              >
                BLOCK SEVEN
              </a>
            </h2>

              <span>ECOSYSTEMS</span>

              <p>
                Built with AI. Inspired by the streets.
              </p>

              <div className="copyright">
                © 2026 BLOCKSEVEN ECOSYSTEMS. All rights reserved.
              </div>

            </div>

          </div>

        </div>

      </div>
    )}

    {showTermsOfUse && (
      <div className="history-overlay">

        <div className="history-panel terms-panel">

          {/* HEADER */}
          <div className="history-header">

            <div>
              <h2>Terms of Use</h2>

              <span>
                Sheng
              </span>
            </div>

            <button
              type="button"
              className="history-close"
              onClick={() => setShowTermsOfUse(false)}
            >
              ×
            </button>

          </div>


          {/* TERMS CONTENT */}
          <div className="terms-content">

            <span className="terms-updated">
              Last updated: August 2026
            </span>


            <h3>Welcome to ShengAI</h3>

            <p>
              ShengAI is a platform created to help people
              discover, understand, and explore Sheng and
              its evolving vocabulary.
            </p>

            <p>
              By using ShengAI, you agree to these Terms of
              Use. If you do not agree with these terms,
              please do not use the service.
            </p>


            <h3>1. About ShengAI</h3>

            <p>
              ShengAI provides information about Sheng words,
              phrases, meanings, translations, and usage.
            </p>

            <p>
              Our platform uses a dedicated Sheng language
              database and an educated language module
              developed to process and provide Sheng-related
              information.
            </p>

            <p>
              Because Sheng is constantly evolving, meanings,
              pronunciations, and usage may differ between
              communities, locations, and generations.
            </p>


            <h3>2. Accuracy of Information</h3>

            <p>
              We aim to provide accurate and useful Sheng
              information. However, we cannot guarantee that
              every definition, translation, example, or
              explanation will always be completely accurate
              or current.
            </p>

            <p>
              Sheng changes with culture, location, trends,
              and everyday usage. Users should consider
              context when interpreting words and expressions.
            </p>


            <h3>3. User Contributions</h3>

            <p>
              ShengAI may allow users to suggest new Sheng
              words, phrases, meanings, or examples.
            </p>

            <p>
              By submitting a contribution, you confirm that
              the information is submitted in good faith and
              that you have the right to submit the content.
            </p>

            <p>
              Submitted contributions may be reviewed before
              being added to our database.
            </p>

            <p>
              We reserve the right to accept, modify, reject,
              or remove any contribution.
            </p>


            <h3>4. Respect for Sheng and Its Communities</h3>

            <p>
              Sheng belongs to the communities and speakers
              who create, use, and evolve it.
            </p>

            <p>
              ShengAI does not claim ownership of Sheng as a
              language. Our database, software, organization
              of information, and platform remain the property
              of ShengAI or their respective owners.
            </p>


            <h3>5. Acceptable Use</h3>

            <p>
              You agree not to use ShengAI to:
            </p>

            <ul>
              <li>Break applicable laws.</li>
              <li>Harass, threaten, or harm others.</li>
              <li>
                Submit malicious or intentionally misleading
                information.
              </li>
              <li>
                Attempt to disrupt the platform.
              </li>
              <li>
                Gain unauthorized access to our systems or
                database.
              </li>
              <li>
                Copy or reproduce our database or platform
                without permission.
              </li>
            </ul>


            <h3>6. Our Database and Content</h3>

            <p>
              The ShengAI database is a core part of the
              platform.
            </p>

            <p>
              You may use information provided through ShengAI
              for personal, educational, and general
              informational purposes.
            </p>

            <p>
              You may not systematically copy, scrape,
              reproduce, redistribute, or commercially exploit
              our database or a substantial portion of its
              contents without written permission.
            </p>


            <h3>7. Service Availability</h3>

            <p>
              We work to keep ShengAI available and reliable,
              but we do not guarantee that the platform will
              always be available or free from errors.
            </p>

            <p>
              We may update, improve, modify, suspend, or
              discontinue features when necessary.
            </p>


            <h3>8. Intellectual Property</h3>

            <p>
              The ShengAI name, branding, interface, software,
              database structure, original content, designs,
              and other platform materials are protected by
              applicable intellectual property laws.
            </p>

            <p>
              Nothing in these Terms gives you ownership of
              those materials.
            </p>


            <h3>9. Privacy</h3>

            <p>
              Your use of ShengAI may involve the collection
              of information necessary to operate and improve
              the service.
            </p>

            <p>
              Our handling of personal information is governed
              by our Privacy Policy.
            </p>


            <h3>10. Changes to These Terms</h3>

            <p>
              We may update these Terms of Use when necessary.
              When changes are made, the updated version will
              be made available through ShengAI.
            </p>

            <p>
              Your continued use of the platform after changes
              are published means you accept the updated Terms.
            </p>


            <h3>11. Contact</h3>

            <p>
              If you have questions, suggestions, or concerns
              regarding these Terms or ShengAI, please contact
              the ShengAI team through the contact information
              provided on the platform.
            </p>


            <div className="terms-footer">

              <strong>
                By using ShengAI, you acknowledge that you
                have read, understood, and agreed to these
                Terms of Use.
              </strong>

              <span>
                Sheng is always moving. We help you catch up.
              </span>
              <div className="copyright">
                © 2026 BLOCKSEVEN ECOSYSTEMS. All rights reserved.
              </div>

            </div>
      
          </div>

        </div>

      </div>
    )}

    {showSuggestSheng && (
    <div className="history-overlay">

      <div className="history-panel suggest-sheng-panel">

        {/* HEADER */}
        <div className="history-header">

          <div>
            <h2>Suggest New Sheng</h2>

            <span>
              Help grow the Sheng dictionary
            </span>
          </div>

          <button
            type="button"
            className="history-close"
            onClick={() => {
              setShowSuggestSheng(false);
              setSuggestionMessage("");
            }}
          >
            ×
          </button>

        </div>


        {/* CONTENT */}
        <form
          className="suggest-sheng-content"
          onSubmit={async (e) => {
            e.preventDefault();

            const word = suggestionWord.trim();
            const meaning = suggestionMeaning.trim();
            const example = suggestionExample.trim();

            if (!word) {
              setSuggestionMessage(
                "Enter the Sheng word first."
              );
              return;
            }

            if (!meaning) {
              setSuggestionMessage(
                "Tell us what the word means."
              );
              return;
            }

            try {

              setSubmittingSuggestion(true);
              setSuggestionMessage("");

              await createShengSuggestion({
                word,
                meaning,
                example,
              });

              // Clear form
              setSuggestionWord("");
              setSuggestionMeaning("");
              setSuggestionExample("");

              setSuggestionMessage(
                "Rada safi! The streets just got a little smarter ! "
              );

            } catch (error) {

              console.error(
                "Sheng suggestion error:",
                error
              );

              setSuggestionMessage(
                "Something went wrong. Please try again."
              );

            } finally {

              setSubmittingSuggestion(false);

            }
          }}
        >

          {/* WORD */}
          <div className="suggest-field">

            <label>
              Sheng word
            </label>

            <input
              type="text"
              value={suggestionWord}
              onChange={(e) =>
                setSuggestionWord(e.target.value)
              }
              placeholder="Enter a Sheng word"
              autoComplete="off"
              autoCapitalize="none"
            />

          </div>


          {/* MEANING */}
          <div className="suggest-field">
          <label>
            related word
          </label>

          <textarea
            value={suggestionMeaning}
            onChange={(e) =>
              setSuggestionMeaning(e.target.value)
            }
            placeholder="Enter a word in English, Swahili or Sheng"
            rows={3}
          />

          </div>


          {/* EXAMPLE */}
          <div className="suggest-field">

            <label>
              Example
              <span>Optional</span>
            </label>

            <textarea
              value={suggestionExample}
              onChange={(e) =>
                setSuggestionExample(e.target.value)
              }
              placeholder="Show us how the word is used..."
              rows={3}
            />

          </div>


          {/* MESSAGE */}
          {suggestionMessage && (
            <div className="suggestion-message">
              {suggestionMessage}
            </div>
          )}


          {/* SUBMIT */}
          <button
            type="submit"
            className="suggest-submit-btn"
            disabled={
              submittingSuggestion ||
              !suggestionWord.trim() ||
              !suggestionMeaning.trim()
            }
          >
            {submittingSuggestion
              ? "Submitting..."
              : "Add to the Streets"}
          </button>


          <small className="suggestion-note">
            Your suggestion will be reviewed before
            being added to the Sheng dictionary.
          </small>

        </form>

      </div>

    </div>
  )}
                              
      {/* =====================================================
          QUICK SETTINGS BACKGROUND
          ===================================================== */}

      <div className="quick-settings-background">


        {/* ROW 1 */}
        <div
          className="quick-settings-tiles-row"
          style={{
            opacity: clamp(progress * 2.4, 0, 1),
          }}
        >

          <button
            type="button"
            className="quick-settings-action quick-settings-action-active row-one"
            onClick={newChat}
          >
            <MessageSquarePlus size={18} />
            <span>New Chat</span>
          </button>

          <button
            type="button"
            className="quick-settings-action row-one"
            onClick={() => {
              setReveal(0);
              setShowSubscribe(true);
              setSubscribeMessage("");
            }}
          >
            <Crown size={18} />
            <span>Kaa Rada</span>
          </button>

        </div>

         
        {/* ROW 2 */}
        <div
          className="quick-settings-tiles-row"
          style={{
            opacity: clamp(
              progress * 2.4 - 0.15,
              0,
              1
            ),
          }}
        >

          <button
            type="button"
            className="quick-settings-action row-two"
            onClick={openHistory}
          >
            <History size={18} />
            <span>History</span>
          </button>

          <button
          type="button"
          className="quick-settings-action row-two"
          onClick={() => {
            setReveal(0);
            setShowAbout(true);
          }}
        >
          <Info size={18} />
          <span>About</span>
        </button>

        </div>
        
        {/* ROW 3 */}
        <div
          className="quick-settings-tiles-row"
          style={{
            opacity: clamp(
              progress * 2.4 - 0.15,
              0,
              1
            ),
          }}
        >

          <button
          type="button"
          className="quick-settings-action row-three"
          onClick={() => {
            setReveal(0);
            setShowSuggestSheng(true);
            setSuggestionMessage("");
          }}
        >
          <BookPlus size={18} />
          <span>Suggest New Sheng</span>
        </button>

          <button
          type="button"
          className="quick-settings-action row-three"
          onClick={() => {
            setReveal(0);
            setShowTermsOfUse(true);
          }}
        >
          <ScrollText size={18} />
          <span>Terms Of Use</span>
        </button>

        </div>

        <p>
          
          <ShinyText
            text="A Block Seven Creation"
            className="ans"
            speed={2}
            shineColor="#fff"
          />



        </p>

        <div className="social-links">

          <a
            href="https://www.instagram.com/block.seven_?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram size={20} />
          </a>

          <a
            href="https://x.com/memflixcto?utm_source=chatgpt.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <FaTwitter size={20} />
          </a>

          <a
            href="https://wa.me/254703983973?utm_source=chatgpt.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
          >
            <FaWhatsapp size={20} />
          </a>

        </div>
        
      </div>


      {/* =====================================================
          YOUR ACTUAL HOME PAGE
          ===================================================== */}

      <div
        className={`quick-settings-home `}
        style={{
          transform: `
            translateY(${reveal}px)
            scale(${scale})
          `,
          borderRadius: `
            ${radius}px
            ${radius}px
            0
            0
          `,
          boxShadow:
            progress > 0.02
              ? "0 -14px 30px rgba(0,0,0,0.45)"
              : "none",
        }}
      >

        {/* Drag handle
        <div
          className="quick-settings-drag-handle"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={
            reveal === 0 ||
            reveal === MAX_REVEAL
              ? toggleQuickSettings
              : undefined
          }
        >
          <div className="quick-settings-grip" />
        </div>
         */}


        {/* ===================================================
            ORIGINAL HOME PAGE
            =================================================== */}

        <div className="home-page-content">

          <div className="hero">

            <Aurora
              colorStops={[
                "#ff2727",
                "#f3f6f8",
                "#7cff67",
              ]}
              blend={0.5}
              amplitude={1}
              speed={1}
            />

            
         <div className="topbar">
           <StaggeredMenu 
            position="right" 
            logoUrl={Logo} 
            menuButtonColor="#fff" 
            openMenuButtonColor="#fff" 
            accentColor="#06bb28" 
            changeMenuColorOnOpen
            colors={[ 
              "#7cff67", 
              "#ff2727", 
            ]}

            // MENU BUTTON → QUICK SETTINGS
            onClick={toggleQuickSettings}

            // LOGO → SUBSCRIBE
            onLogoClick={() => { 
              setReveal(0);
              setShowSubscribe(true);
              setSubscribeMessage("");
            }}
          />
          </div>

            

            

            {messages.length === 0 ? (
              <div className="landing">

                <img
                  src={Logotu}
                  className="hero-log"
                />

                <Shuffle
                  text="Meet"
                  className="tit"
                  shuffleDirection="right"
                  duration={0.25}
                />

                {/** 

                <button className="b1x">
                  <div className="angel">
                    <div className="io">S</div>
                    <div className="oi">H</div>
                    <div className="oo">E</div>
                    <div className="ii">N</div>
                    <div className="ioi">G</div>
                    <div className="smm">AI</div>
                  </div>
                </button>
                */}

                <ShinyText
                  text="Your AI companion for decoding Kenya's fastest changing language"
                  className="ans"
                  speed={1.5}
                  shineColor="#fff"
                />


                <div
                  ref={categoryCarouselRef}
                  className={`category-carousel ${
                    carouselPaused
                      ? "category-carousel-paused"
                      : ""
                  }`}
                  onMouseEnter={() => {
                    setCarouselPaused(true);
                  }}
                  onMouseLeave={() => {
                    setCarouselPaused(false);
                  }}
                  onPointerDown={() => {
                    setCarouselPaused(true);
                  }}
                  onPointerUp={() => {
                    pauseCarousel();
                  }}
                  onPointerCancel={() => {
                    pauseCarousel();
                  }}
                  onWheel={() => {
                    pauseCarousel();
                  }}
                >
                  {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`category-card ${
                      activeCategory === category.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      pauseCarousel();

                      setActiveCategory(category.id);

                      loadCategoryWords(category.id);
                    }}
                  >
                    <span className="emoji">
                      {category.icon}
                    </span>

                    <span>
                      {category.label}
                    </span>
                  </button>
                ))}

                </div>

                </div>

            ) : (
              <Chat 
                messages={messages} 
                search={search}
                deepSearch={handleDeepSearch}
              />
              )}


            <div
            className={`b2x ${
              messages.length === 0
                ? "b2x-centered"
                : "b2x-bottom"
            } ${
              query.trim().length > 0
                ? "b2x-active"
                : ""
            }`}
          >
            <div className="b2x-inner">
            
              {/* =====================================================
                  INPUT / SEARCH ROW
                  ===================================================== */}

              <div className="b2x-search-container">

                <input
                ref={searchInputRef}
                className="b2x-input"
                value={query}
                placeholder={`Search "${placeholder}"`}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();

                    if (!query.trim()) return;

                    // Immediately close mobile keyboard
                    searchInputRef.current?.blur();

                    handleSearch(query);
                  }
                }}
              />

                <button
            type="button"
            className={`b2x-search-btn ${
              query.trim()
                ? "b2x-search-btn-active"
                : ""
            }`}
            onClick={() => {
              if (!query.trim()) return;

              searchInputRef.current?.blur();
              handleSearch(query);
            }}
            disabled={!query.trim()}
            aria-label="Search"
          >
            <Strands
              colors={[
                "#7cff67",
                "#ff2727",
                "#5798f4",
              ]}
              count={3}
              speed={0.5}
              amplitude={1.6}
              waviness={1}
              thickness={1.4}
              glow={2.6}
              taper={4}
              spread={1}
              intensity={0.6}
              saturation={3}
              opacity={1}
              scale={1.4}
              glass
              refraction={1}
              dispersion={1}
              glassSize={0.95}
              hueShift={0}
            />
          </button>

              </div>

            </div>
          </div>
             

            

          
            

          </div>

        </div>

      </div>


    </div>
    </>
  );
};

export default Home;