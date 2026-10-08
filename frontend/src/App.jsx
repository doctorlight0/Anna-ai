import { useState } from "react";
import {
  ArrowRight,
  Check,
  Clipboard,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import "./App.css";

function App() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const generatePlan = async () => {
    if (!idea.trim() || loading) return;

    setLoading(true);
    setResult("");
    setCopied(false);

    try {
      const response = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResult(data.result);
    } catch (error) {
      console.error(error);

      setResult(
        "ERROR\nAnna couldn't generate your plan right now. Please make sure the backend is running and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyPlan = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const resetPlan = () => {
    setResult("");
    setCopied(false);

    setTimeout(() => {
      document.querySelector(".idea-box")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  };

  const useExample = (example) => {
    setIdea(example);
    setResult("");

    setTimeout(() => {
      document.querySelector(".idea-box")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  };

  const parseResult = () => {
    if (!result) return [];

    const sections = result
      .split(/\n(?=[A-Z][A-Z\s]+(?:\n|$))/)
      .map((section) => section.trim())
      .filter(Boolean);

    return sections.map((section) => {
      const lines = section.split("\n");
      const title = lines[0].trim();
      const content = lines.slice(1).join("\n").trim();

      return {
        title,
        content,
      };
    });
  };

  const sections = parseResult();

  const getSectionClass = (title) => {
    return title.toLowerCase().replace(/\s+/g, "-");
  };

  return (
    <div className="app">
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>
      <div className="background-grid"></div>

      <nav className="navbar">
        <div className="logo">
          anna<span>ai</span>
        </div>

        <div className="nav-right">
          <button
            className="ghost-btn"
            onClick={() => setShowHowItWorks(true)}
          >
            How it works
          </button>

          <button
            className="nav-btn"
            onClick={() =>
              document.querySelector(".idea-box")?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              })
            }
          >
            Try Anna
            <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="badge">
            <Sparkles size={14} />
            AI-powered idea planning
          </div>

          <h1>
            Turn your <span>idea</span>
            <br />
            into a real plan.
          </h1>

          <p className="hero-description">
            Stop staring at a blank page. Tell Anna what's on your mind and
            get a practical roadmap to turn it into something real.
          </p>

          <div className="idea-box">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value.slice(0, 2000))}
              placeholder="Tell Anna what you're thinking..."
              disabled={loading}
            />

            <div className="input-bottom">
              <span className="character-count">
                {idea.length}
                <span>/2000</span>
              </span>

              <button
                className="generate-btn"
                onClick={generatePlan}
                disabled={!idea.trim() || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Anna is thinking...
                  </>
                ) : (
                  <>
                    Generate plan
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="examples">
            <span>Try an example</span>

            <button
              onClick={() =>
                useExample(
                  "I want to build a platform where university students can find affordable accommodation."
                )
              }
            >
              Student housing
            </button>

            <button
              onClick={() =>
                useExample(
                  "I want to create an app that helps small businesses manage their customers."
                )
              }
            >
              Business app
            </button>

            <button
              onClick={() =>
                useExample(
                  "I want to start a service that helps students learn programming."
                )
              }
            >
              Learning platform
            </button>
          </div>
        </section>

        {result && (
          <section className="result-section">
            <div className="result-header">
              <div>
                <div className="result-label">
                  <span className="label-dot"></span>
                  YOUR PLAN
                </div>

                <h2>Here's where we start.</h2>
              </div>

              <div className="result-actions">
                <button className="copy-btn" onClick={copyPlan}>
                  {copied ? (
                    <>
                      <Check size={16} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Clipboard size={16} />
                      Copy plan
                    </>
                  )}
                </button>

                <button
                  className="reset-btn"
                  onClick={resetPlan}
                  title="Create a new plan"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            <div className="result-card">
              {sections.map((section, index) => (
                <div
                  className={`plan-section ${getSectionClass(
                    section.title
                  )}`}
                  key={`${section.title}-${index}`}
                >
                  <div className="plan-section-header">
                    <span className="section-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h3>{section.title}</h3>
                  </div>

                  <div className="plan-content">
                    {section.content
                      .split("\n")
                      .filter(Boolean)
                      .map((line, lineIndex) => {
                        const cleaned = line
                          .replace(/^[-•]\s*/, "")
                          .replace(/^\d+[.)]\s*/, "")
                          .trim();

                        if (
                          line.match(/^[-•]\s*/) ||
                          line.match(/^\d+[.)]\s*/)
                        ) {
                          return (
                            <div
                              className="plan-list-item"
                              key={lineIndex}
                            >
                              <span className="list-dot"></span>
                              <span>{cleaned}</span>
                            </div>
                          );
                        }

                        return (
                          <p key={lineIndex}>
                            {cleaned}
                          </p>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>

            <div className="result-footer">
              <span>Ready to turn the plan into reality?</span>

              <button onClick={resetPlan}>
                Start another idea
                <ArrowRight size={14} />
              </button>
            </div>
          </section>
        )}
      </main>

      <footer>
        <span>annaai</span>
        <p>From idea to action.</p>
      </footer>

      {showHowItWorks && (
        <div
          className="modal-overlay"
          onClick={() => setShowHowItWorks(false)}
        >
          <div
            className="how-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowHowItWorks(false)}
            >
              <X size={18} />
            </button>

            <div className="modal-icon">
              <Sparkles size={20} />
            </div>

            <span className="small-label">HOW ANNA WORKS</span>

            <h2>From a rough thought to a clear direction.</h2>

            <div className="how-steps">
              <div className="how-step">
                <span>01</span>

                <div>
                  <h3>Tell Anna your idea</h3>
                  <p>
                    Don't worry about making it perfect. Just explain what's
                    on your mind.
                  </p>
                </div>
              </div>

              <div className="how-step">
                <span>02</span>

                <div>
                  <h3>Anna structures it</h3>
                  <p>
                    Your idea becomes a clear problem, audience, MVP and
                    technical direction.
                  </p>
                </div>
              </div>

              <div className="how-step">
                <span>03</span>

                <div>
                  <h3>Start building</h3>
                  <p>
                    Follow the action plan and take the next concrete step.
                  </p>
                </div>
              </div>
            </div>

            <button
              className="modal-action"
              onClick={() => {
                setShowHowItWorks(false);

                setTimeout(() => {
                  document.querySelector(".idea-box")?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }, 100);
              }}
            >
              Try Anna
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;