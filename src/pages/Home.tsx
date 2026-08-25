import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type JSX,
  type ReactNode,
} from "react";

import {
  ChevronDown,
} from "lucide-react";

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
import { useSearch } from "../hooks/useSearch";
import ShinyText from "../components/ShinyText";
import Shuffle from "../components/Shuffle";

import {
  getWordsByCategory,
  subscribeToShengDrops,
} from "../appwrite/api";


const MAX_REVEAL = 230;
const OPEN_THRESHOLD = 0.38;

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
  const [dragging, setDragging] = useState(false);

  const startY = useRef(0);
  const startReveal = useRef(0);
  const pointerId = useRef<number | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      pointerId.current = e.pointerId;
      startY.current = e.clientY;
      startReveal.current = reveal;

      setDragging(true);

      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [reveal]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (
        !dragging ||
        e.pointerId !== pointerId.current
      ) {
        return;
      }

      const delta = e.clientY - startY.current;

      setReveal(
        clamp(
          startReveal.current + delta,
          0,
          MAX_REVEAL
        )
      );
    },
    [dragging]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging) return;

      setDragging(false);

      const progress = reveal / MAX_REVEAL;

      setReveal(
        progress > OPEN_THRESHOLD
          ? MAX_REVEAL
          : 0
      );

      if (
        e.currentTarget.hasPointerCapture(
          e.pointerId
        )
      ) {
        e.currentTarget.releasePointerCapture(
          e.pointerId
        );
      }
    },
    [dragging, reveal]
  );

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

  return (
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
            className="quick-settings-action quick-settings-action-active"
            onClick={newChat}
          >
            <MessageSquarePlus size={18} />
            <span>New Chat</span>
          </button>

          <button
            type="button"
            className="quick-settings-action"
            onClick={() => {
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
            className="quick-settings-action"
            onClick={openHistory}
          >
            <History size={18} />
            <span>History</span>
          </button>

          <button
          type="button"
          className="quick-settings-action"
          onClick={() => {
            setReveal(0);
            setShowAbout(true);
          }}
        >
          <Info size={18} />
          <span>About</span>
        </button>

        </div>

      

        
        <div
          className="quick-settings-notification"
          style={{
            opacity: clamp(
              progress * 2.4 - 0.3,
              0,
              1
            ),
          }}
        >
       


        <div className="category-carousel">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-card ${
                activeCategory ===
                category.id
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveCategory(
                  category.id
                );

                loadCategoryWords(
                  category.id
                );
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

         {activeCategory === "all" && (
          <ShinyText
            text=" Select a category above to get suggested Sheng words on your keypad"
            className="category-hint"
            speed={1}
            shineColor="#fff"
          />
        )}



      </div>


      {/* =====================================================
          YOUR ACTUAL HOME PAGE
          ===================================================== */}

      <div
        className={`quick-settings-home ${
          dragging
            ? "quick-settings-home-dragging"
            : ""
        }`}
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

        {/* Drag handle */}
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

        <button
          className="quick-settings-toggle"
          onClick={toggleQuickSettings}
          aria-label="Toggle quick settings"
        >
          <ChevronDown
            size={16}
            className={
              reveal > 0
                ? "quick-settings-chevron-open"
                : ""
            }
          />
        </button>


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

            {/** 
            <div className="topbar">
              <StaggeredMenu
                position="right"
                items={menuItems}
                socialItems={socialItems}
                displaySocials
                displayItemNumbering={false}
                menuButtonColor="#ffffff"
                openMenuButtonColor="#ffffff"
                changeMenuColorOnOpen
                colors={[
                  "#7cff67",
                  "#ff2727",
                ]}
                logoUrl={Logo}
                accentColor="#06bb28"
              />
            </div>

            */}

            {/*hhshshhshs*/}


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

               

              </div>
            ) : (
              <Chat
                messages={messages}
                search={search}
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
  );
};

export default Home;