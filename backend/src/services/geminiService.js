import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

export const detectCategoryAI =
  async (title, description) => {

    try {

      const prompt = `
You are an AI complaint classifier.

Choose ONLY ONE category from:
- Sanitation
- Roads
- Water
- Electricity
- Safety
- Other

Complaint:
Title: ${title}

Description:
${description}

Return ONLY category name.
`;

      const result =
        await model.generateContent(
          prompt
        );

      const response =
        await result.response;

      const category =
        response
          .text()
          .trim()
          .replace(
            /Category:/gi,
            ""
          )
          .trim();

      const validCategories = [
        "Sanitation",
        "Roads",
        "Water",
        "Electricity",
        "Safety",
        "Other",
      ];

      if (
        validCategories.includes(
          category
        )
      ) {
        return category;
      }

      return "Other";

    } catch (error) {

      console.log(
        "GEMINI ERROR:",
        error.message
      );

      return "Other";
    }
  };