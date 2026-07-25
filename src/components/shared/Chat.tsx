import ClickSpark from "../ClickSpark";
import shengai from "../../../public/assets/icons/botsheng.png";
import save from "../../../public/assets/icons/shared.svg";
import ShinyText from "../ShinyText";
import Shuffle from "../Shuffle";
import { useEffect, useRef, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import Strands from "../Strands";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: any;
  loading?: boolean;
};

type ChatProps = {
  messages: ChatMessage[];
  search: (word: string) => void;
};

const Chat = ({ messages, search }: ChatProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState<Record<number, {
    english: boolean;
    swahili: boolean;
  }>>({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="maasai">
      <ClickSpark
        sparkColor="#ffffff"
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <div className="chat-window">

          {messages.map((message) => (
            <div key={message.id}
              className="message-row">

              {/* USER */}
              
              {message.role === "user" && (
                <div className="sender-msg">
                  {message.content}
                </div>
              )}

              {/* ASSISTANT */}

              {message.role === "assistant" && (

                <div className="reply-msg">

                  {message.loading ? (

                    <div className="loader">
                       <Strands
                          colors={["#7cff67", "#ff2727", "#5798f4"]}
                          count={3}
                          speed={1.7}
                          amplitude={1.9}
                          waviness={1}
                          thickness={1.0}
                          glow={2.6}
                          taper={4}
                          spread={1}
                          intensity={0.6}
                          saturation={3}
                          opacity={1}
                          scale={0.9}
                          glass
                          refraction={1}
                          dispersion={1}
                          glassSize={0.55}
                          hueShift={0}
                        />

                      <ShinyText
                        text=" Reading the Streets"
                        className="ans"
                        speed={1}
                        shineColor="#fff"
                      />
                    </div>

                  ) : message.content ? (

                    <>
                      <img
                        src={shengai}
                        alt=""
                        className="molio"
                      />

                      

                      <div className="trns">

                        {/* English */}

                        <div className="english-trans">

                          <div
                            className="lang-header"
                            onClick={() =>
                              setExpanded((prev) => ({
                                ...prev,
                                [message.id]: {
                                  ...prev[message.id],
                                  english:
                                    !prev[message.id]?.english,
                                },
                              }))
                            }
                          >

                            <span className="eng">
                              English
                            </span>

                            <GoChevronDown
                              className={
                                expanded[message.id]?.english
                                  ? "arrow rotate"
                                  : "arrow"
                              }
                            />

                          </div>

                          <div className="mattopa">

                          <Shuffle
                            text={message.content.english}
                            className="descript"
                            shuffleDirection="right"
                            duration={0.25}
                          />

                          {expanded[message.id]?.english && (

                            <p className="meaning">
                              {message.content.englishMeaning}
                            </p>

                          )}

                        </div>

                        </div>

                        {/* Swahili */}

                        <div className="swahili-trans">

                          <div
                            className="lang-header"
                            onClick={() =>
                              setExpanded((prev) => ({
                                ...prev,
                                [message.id]: {
                                  ...prev[message.id],
                                  swahili:
                                    !prev[message.id]?.swahili,
                                },
                              }))
                            }
                          >

                            <span className="swa">
                              Swahili
                            </span>

                            <GoChevronDown
                              className={
                                expanded[message.id]?.swahili
                                  ? "arrow rotate"
                                  : "arrow"
                              }
                            />

                          </div>
                          <div className="mattopa">

                          <Shuffle
                            text={message.content.swahili}
                            className="descript"
                            shuffleDirection="right"
                            duration={0.25}
                          />

                          {expanded[message.id]?.swahili && (

                            <p className="meaning">
                              {message.content.swahiliMeaning}
                            </p>

                          )}

                          </div>

                        </div>

                        {/* Aliases */}

                        <div className="sheng-trans">

                          <span className="slang">
                            Also in 
                            <div className="angel">
                            <div className="io">S</div>
                            <div className="oi">H</div>
                            <div className="oo">E</div>
                            <div className="ii">N</div>
                            <div className="ioi">G</div>
                            </div>
                          </span>

                          <div className="shengz">

                            {message.content.aliases?.map(
                              (word: string) => (

                                <ShinyText
                                  key={word}
                                  text={`${word}`}
                                  onClick={() => search(word)}
                                  className="ans"
                                  speed={1}
                                  shineColor="#fff"
                                />

                              )
                            )}

                          </div>

                        </div>

                      </div>
                      
                      {/**actions 
                      <div className="trns">

                      <button
                        className="reply-action"
                        onClick={() => copyTranslation(message.content)}
                      >
                        <img 
                          src={save}
                          alt=""
                          className=""
                        />
                        <span>Copy</span>
                      </button>

                      <button
                        className="reply-action"
                        onClick={() => saveTranslation(message.content)}
                      >
                         <img 
                          src={save}
                          alt=""
                          className=""
                        />
                        <span>Save</span>
                      </button>

                      <button
                        className="reply-action"
                        onClick={() => shareTranslation(message.content)}
                      >
                         <img 
                          src={save}
                          alt=""
                          className=""
                        />
                        <span>Share</span>
                      </button>

                    </div>
                    */}
                    </>

                  ) : (

                    <div className="no-result">

                      <img
                        src={shengai}
                        alt=""
                        className="molio"
                      />

                      <div className="trns">

                        <h3 className="no-rada">
                           No street record found!
                        </h3>

                        <p className="no-rada-text">
                          Looks like you've invented a new Sheng word
                        </p>


                        

                      </div>

                    </div>

                  )}

                </div>

              )}

            </div>
          ))}

          <div ref={bottomRef} />

        </div>
      </ClickSpark>
    </div>
  );
};

export default Chat;