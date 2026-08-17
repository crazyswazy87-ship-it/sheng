import { useEffect, useState } from "react";
import Aurora from "../components/Aurora";
import StaggeredMenu from "../components/StaggeredMenu";
import Strands from "../components/Strands";
import Chat from "../components/shared/Chat";
import Logo from "../../public/assets/images/sheng.png";
import Logotu from "../../public/assets/images/sheng-trs.png"
import { useSearch } from "../hooks/useSearch";
import ShinyText from "../components/ShinyText";
import Shuffle from "../components/Shuffle";
import { getWordsByCategory } from "../appwrite/api";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: any;
  loading?: boolean;
};

const Home = () => {
  const { search } = useSearch();
  const newChat = () => {
    setMessages([]);
    setQuery("");
  };

  const [shengWords, setShengWords] = useState<string[]>([]);
  const [placeholder, setPlaceholder] = useState("");


  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const loadCategoryWords = async (category: string) => {
  try {
    const docs = await getWordsByCategory(category);

    const words = docs.map((doc) => doc.word);

    setShengWords(words);

    if (words.length) {
      setPlaceholder(
        words[Math.floor(Math.random() * words.length)]
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
      shengWords[Math.floor(Math.random() * shengWords.length)]
    );
  }, 2500);

  return () => clearInterval(interval);
  }, [shengWords]);

  useEffect(() => {
    loadCategoryWords("all");
  }, []);

  const menuItems = [
    {
      label: "New Chat",
      ariaLabel: "Start a new conversation",
      onClick: newChat,
    },
    { label: "History",  target: "history" },
    { label: "About",  target: "about" },
    { label: "Subscribe", target : "subscribers" },
    { label: "Contact",  target: "socials" },
    { label: "Terms of use ",  target: "terms" },
    { label: "Credits",  target: "terms" },
  ];

  const socialItems = [
    { label: "Memeflix", link: "#" },
    { label: "Instagram", link: "#" },
    { label: "X", link: "#" },
    { label: "Whatsapp", link: "#"},
    { label: "TikTok", link: "#" },
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;

    const userId = Date.now();
    const aiId = userId + 1;

    const userMessage: ChatMessage = {
      id: userId,
      role: "user",
      content: query,
    };

    const loadingMessage: ChatMessage = {
      id: aiId,
      role: "assistant",
      content: null,
      loading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);

    try {
      const response = await search(query);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiId
            ? {
                ...msg,
                loading: false,
                content: response,
              }
            : msg
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiId
            ? {
                ...msg,
                loading: false,
                content: null,
              }
            : msg
        )
      );
    }

    setQuery("");
  };
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

const [activeCategory, setActiveCategory] = useState("all");


  return (
    <div className="hero">
      <Aurora
        colorStops={["#ff2727", "#f3f6f8", "#7cff67"]}
        blend={0.5}
        amplitude={1}
        speed={1}
      />

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
          colors={["#7cff67", "#ff2727"]}
          logoUrl={Logo}
          accentColor="#06bb28"
        />
      </div>

      {messages.length === 0 ? (
        <div className="landing">
          <img src={Logotu} className="hero-log" />

          
          <Shuffle
            text="Meet"
            className="tit"
            shuffleDirection="right"
            duration={0.25}
          />

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
      <div className="georgia">
      {/* Helper text */}
       {activeCategory === "all" && (
          <ShinyText
            text=" Tap a category to get suggested Sheng words"
            className="category-hint"
            speed={1}
            shineColor="#fff"
          />
        )}

      {/* Categories */}
      <div className="category-carousel">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-card ${
              activeCategory === category.id ? "active" : ""
            }`}
            onClick={() => {
            setActiveCategory(category.id);
            loadCategoryWords(category.id);
          }}
          >
            <span className="emoji">{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>


      {/* Search */}
      <div className="search-container">
        <input
          className="shengtezo"
          value={query}
          placeholder={`Search "${placeholder}"`}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />

        <button
          type="button"
          className="search-btn"
          onClick={handleSearch}
          disabled={!query.trim()}
        >
          <Strands
            colors={["#7cff67", "#ff2727", "#5798f4"]}
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
  );
};

export default Home;