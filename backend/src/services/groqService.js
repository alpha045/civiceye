import Groq from "groq-sdk";

// Initialize the Groq SDK with your environment variable key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// =========================================================
// 🎯 PIPELINE 1: TEXT-BASED CATEGORY AUTO-DETECTION
// =========================================================
export const detectCategoryAI = async (title, description) => {
  try {
    // Ensuring code doesn't crash if key is accidentally missing
    if (!process.env.GROQ_API_KEY) {
      console.log("[GROQ WARNING]: API Key missing, falling back to basic setup.");
      return "Other";
    }

    console.log("[GROQ AI]: Analyzing complaint text templates...");

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-specdec", 
      messages: [
        {
          role: "system",
          content: `You are an AI data dispatcher for CivicEye municipal portal. 
          Analyze the user's grievance title and description and classify it into EXACTLY ONE of the following tags:
          - "Road" (for potholes, broken patches, street craters, pavement damage)
          - "Water" (for water leaks, sewage blocks, drainage overflow, water shortage)
          - "Electricity" (for streetlights down, sparking transformers, power cuts, loose dangling wires)
          - "Sanitation" (for garbage piles, trash accumulation, dirty public spots)
          - "Other" (if the complaint doesn't cleanly fit any above categories)

          CRITICAL RULE: Return ONLY the raw category single-word text ("Road", "Water", "Electricity", "Sanitation", or "Other"). Do not include full sentences, spaces, or formatting marks.`
        },
        {
          role: "user",
          content: `Title: ${title}\nDescription: ${description}`
        }
      ],
      temperature: 0.1, 
      max_tokens: 10
    });

    const aiResult = response.choices[0]?.message?.content?.trim();
    console.log(`[GROQ SUCCESS]: Engine classified as -> "${aiResult}"`);
    return aiResult || "Other";

  } catch (err) {
    console.error("[GROQ ERROR]: Logic runtime exception:", err.message);
    return "Other"; 
  }
};

// =========================================================
// 🎯 PIPELINE 2: VISION-BASED IMAGE DUPLICATE DETECTOR
// =========================================================
export const checkDuplicateVisionAI = async (newImageUrl, existingComplaints) => {
  try {
    // 1. Core safety checks: Guard from empty clusters
    if (!process.env.GROQ_API_KEY || !newImageUrl || existingComplaints.length === 0) {
      return false; 
    }

    // 2. Filter out complaints jisme Cloudinary/S3 image paths valid hon
    const complaintsWithImages = existingComplaints.filter(c => c.image && c.image.trim() !== "");
    if (complaintsWithImages.length === 0) {
      console.log("[GROQ VISION]: No existing cluster images found to compare with.");
      return false;
    }

    // 3. Sabse recent/latest image uthao current verification cycle ke liye
    const latestExistingImage = complaintsWithImages[0].image;

    console.log("[GROQ VISION AI]: Comparing incoming image with database image patterns...");
    console.log(`-> Incoming New Image: ${newImageUrl}`);
    console.log(`-> Existing DB Image: ${latestExistingImage}`);

    // 4. Fire Llama Multimodal Vision request on Groq cloud routing
    const response = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview", // Specially engineered for image processing tasks
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an AI civic infrastructure auditor. Analyze these two images taken from a municipal complaint system.
              Image 1 is a new incoming complaint photo.
              Image 2 is an already registered complaint photo inside the database.

              TASK: Check if both images show the EXACT SAME civic problem spot or physical issue (e.g., the exact same pothole structure, the identical water leak location, or the same garbage dump pile). Weather/lighting might differ slightly, but the object footprint must match.

              CRITICAL RULE: Return ONLY the exact raw word "true" if it's a duplicate match, or "false" if they are different spots/issues. Do not include spaces, markdown formatting, or sentences.`
            },
            {
              type: "image_url",
              image_url: { url: newImageUrl }
            },
            {
              type: "image_url",
              image_url: { url: latestExistingImage }
            }
          ]
        }
      ],
      temperature: 0.1, // Absolute low to prevent hallucination flags
      max_tokens: 10
    });

    const resultText = response.choices[0]?.message?.content?.trim().toLowerCase();
    console.log(`[GROQ VISION LOG]: Is Image Match Duplicate? -> "${resultText}"`);
    
    // Safety handling against weird AI punctuation wrappers
    return resultText.includes("true");

  } catch (err) {
    console.error("[GROQ VISION CRASH]: Processing aborted, bypassing:", err.message);
    return false; // Safely allow layout to pass as non-duplicate if AI drops out
  }
};