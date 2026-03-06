const { InternalServerError, BadRequest } = require("http-errors");
const { SentimentManager } = require("node-nlp");
const path = require("path");

const sentiment = new SentimentManager();

// Enhanced simulated emotion detection for images
function detectImageEmotion(imagePath) {
  try {
    // More realistic emotion simulation
    const emotions = {
      happy: Math.random() * 0.4 + 0.3,
      sad: Math.random() * 0.25 + 0.1,
      angry: Math.random() * 0.2 + 0.05,
      surprised: Math.random() * 0.25 + 0.1,
      neutral: Math.random() * 0.3 + 0.2,
    };

    const dominantEmotion = Object.keys(emotions).reduce((a, b) =>
      emotions[a] > emotions[b] ? a : b,
    );

    // More realistic gender simulation
    const genders = ["male", "female"];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const genderProbability = Math.random() * 0.25 + 0.75; // 75-100% confidence

    // More realistic age simulation
    const age = Math.floor(Math.random() * 45 + 18); // Age between 18-63

    return {
      emotion: dominantEmotion,
      confidence: Math.round(emotions[dominantEmotion] * 100),
      allEmotions: emotions,
      gender: gender,
      genderProbability: Math.round(genderProbability * 100),
      age: age,
      message:
        "Simulated emotion detection (Install Visual Studio Build Tools with C++ for real TensorFlow face detection)",
    };
  } catch (error) {
    return {
      emotion: "neutral",
      confidence: 50,
      allEmotions: {
        happy: 0.2,
        sad: 0.2,
        angry: 0.2,
        surprised: 0.2,
        neutral: 0.2,
      },
      gender: "unknown",
      genderProbability: 50,
      age: 25,
      message: "Error processing image",
    };
  }
}

const postSentimentAnalyzer = async (req, res, next) => {
  console.log(req.body);
  if (!req?.body?.phrase) {
    return next(
      new BadRequest(
        "Invalid payload. JSON payload must have 'phrase' property.",
      ),
    );
  }

  const { lang = "en", phrase } = req.body;

  try {
    const result = await sentiment.process(lang, phrase);
    const { score = 0, comparative = 0, vote = "positive", ...meta } = result;
    res.json({
      score: score * 100,
      comparative: comparative * 100,
      vote,
      ...meta,
    });
  } catch (error) {
    return next(new InternalServerError(error.message));
  }
};

const postFaceDetection2 = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new BadRequest("No file uploaded."));
    }

    const imagePath = path.join(req.file.destination, req.file.filename);
    const emotionResult = detectImageEmotion(imagePath);

    res.json({
      success: true,
      data: [
        {
          filename: req.file.originalname,
          emotion: emotionResult.emotion,
          confidence: emotionResult.confidence,
          allEmotions: emotionResult.allEmotions,
          gender: emotionResult.gender,
          genderProbability: emotionResult.genderProbability,
          age: emotionResult.age,
          message: emotionResult.message,
        },
      ],
    });
  } catch (error) {
    return next(new InternalServerError(error.message));
  }
};

module.exports = {
  postFaceDetection2,
  postSentimentAnalyzer,
};
