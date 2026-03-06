import "./App.css";
import React, { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [file, setFile] = useState();
  const [sentiment, setSentiment] = useState({});
  const [feacExpression, setFaceExpression] = useState([]);
  const [image, setImage] = useState({ data: "" });
  const [isAnalyzingText, setIsAnalyzingText] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(URL.createObjectURL(e.target.files[0]));
    const img = {
      data: e.target.files[0],
    };
    setImage(img);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAnalyzingImage(true);
    let formData = new FormData();
    formData.append("file", image.data);
    await fetch("http://localhost:5002/api/test", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((json) => {
        console.log(json);
        setFaceExpression(json.data);
      })
      .finally(() => {
        setIsAnalyzingImage(false);
      });
  };

  const postData = async (url = "", data = {}) => {
    const response = await fetch(url, {
      method: "POST",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(data),
    });
    return response.json();
  };

  const handleSentimentalAnalysis = async (e) => {
    setIsAnalyzingText(true);
    const reqBody = {
      lang: "en",
      phrase: text,
    };
    try {
      const response = await postData(
        "http://localhost:5002/api/sentiment",
        reqBody,
      );
      setSentiment(response);
    } catch (error) {
    } finally {
      setIsAnalyzingText(false);
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: "#10b981",
      sad: "#3b82f6",
      angry: "#ef4444",
      surprised: "#f59e0b",
      neutral: "#6b7280",
    };
    return colors[emotion] || "#6b7280";
  };

  const getSentimentIcon = (score) => {
    if (score > 40) {
      return "positive";
    } else if (score > 20 && score <= 40) {
      return "neutral";
    } else {
      return "negative";
    }
  };

  return (
    <>
      <h1>🧠 EmotiScan - AI Emotion Analysis</h1>
      <div className="App">
        <div className="analysis-container">
          <div className="analysis-section">
            <h4>Text Sentiment Analysis</h4>
            <textarea
              name="textInput"
              placeholder="Share your feelings and thoughts..."
              value={text}
              onChange={handleTextChange}
              disabled={isAnalyzingText}
            />
            <div className="button-group">
              <button
                type="submit"
                onClick={handleSentimentalAnalysis}
                className="btn btn-primary"
                disabled={isAnalyzingText || !text.trim()}
              >
                {isAnalyzingText ? (
                  <>
                    <div className="loading-spinner"></div>
                    Analyzing...
                  </>
                ) : (
                  <>Analyze Sentiment</>
                )}
              </button>
              <input
                type="reset"
                onClick={() => setText("")}
                className="btn btn-secondary"
                value="Clear"
                disabled={isAnalyzingText}
              />
            </div>
            {sentiment.score && (
              <div className="sentiment-result">
                <span className="result-label">Overall sentiment:</span>
                <div
                  className={`sentiment-indicator ${getSentimentIcon(sentiment.score)}`}
                >
                  <div className="sentiment-dot"></div>
                </div>
                <div className="sentiment-details">
                  <span className="result-value">{sentiment.vote}</span>
                  <span className="result-score">{sentiment.score}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="analysis-section">
            <h4>Face & Emotion Detection</h4>
            <div className="image-upload-section">
              <div className="image-container">
                <img
                  alt="emotion"
                  id="uploadedImage"
                  src={file || "th.jpeg"}
                  className="image-preview"
                />
                {!file && (
                  <div className="image-placeholder">
                    <div className="placeholder-icon"></div>
                    <div className="placeholder-text">
                      Upload an image to analyze emotions
                    </div>
                  </div>
                )}
              </div>
              <input
                type="file"
                id="imageInput"
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/jpg"
                disabled={isAnalyzingImage}
                className="file-input"
              />
              <button
                type="submit"
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={isAnalyzingImage || !image.data}
              >
                {isAnalyzingImage ? (
                  <>
                    <div className="loading-spinner"></div>
                    Analyzing...
                  </>
                ) : (
                  <>Analyze Emotions</>
                )}
              </button>
            </div>

            {feacExpression.length > 0 && (
              <div className="results-section">
                <h4>Analysis Results</h4>
                {feacExpression.map((face, index) => (
                  <div key={index} className="result-card">
                    <div className="result-header">
                      <div className="result-item">
                        <span className="result-label">Emotion:</span>
                        <span
                          className="emotion-badge"
                          style={{
                            background: `linear-gradient(135deg, ${getEmotionColor(face.emotion || "neutral")}, ${getEmotionColor(face.emotion || "neutral")}dd)`,
                            color: "white",
                          }}
                        >
                          {face.emotion || "N/A"}
                        </span>
                      </div>
                      <div className="result-item">
                        <span className="result-label">Confidence:</span>
                        <span className="result-value">
                          {face.confidence || 0}%
                        </span>
                      </div>
                    </div>

                    <div className="result-details">
                      <div className="result-item">
                        <span className="result-label">Gender:</span>
                        <span className="result-value">
                          {face.gender || "N/A"} ({face.genderProbability || 0}%
                          confidence)
                        </span>
                      </div>
                      <div className="result-item">
                        <span className="result-label">Age:</span>
                        <span className="result-value">
                          {face.age || "N/A"} years
                        </span>
                      </div>
                    </div>

                    <div className="emotions-section">
                      <h5
                        style={{
                          color: "#4a5568",
                          marginBottom: "1rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        All Emotions Breakdown:
                      </h5>
                      <div className="emotions-grid">
                        {Object.entries(face.allEmotions || {})
                          .sort(([, a], [, b]) => b - a) // Sort by percentage descending
                          .map(([emotion, value]) => (
                            <div key={emotion} className="emotion-item">
                              <div className="emotion-percentage">
                                {(value * 100).toFixed(1)}%
                              </div>
                              <div className="emotion-name">{emotion}</div>
                              <div className="confidence-bar">
                                <div
                                  className="confidence-fill"
                                  style={{
                                    width: `${value * 100}%`,
                                    background: `linear-gradient(90deg, ${getEmotionColor(emotion)}, ${getEmotionColor(emotion)}dd)`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {feacExpression.length === 0 && image.data && !isAnalyzingImage && (
              <div className="empty-state">
                <div className="empty-icon"></div>
                <div className="empty-text">
                  Click "Analyze Emotions" to see the results
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
