import client from "../config/openai.js";

// CATEGORY DETECTION
export const detectCategoryAI =
  async (title, description) => {

    const prompt = `
Choose only one category:

- Road
- Electricity
- Water
- Sanitation
- Traffic
- Other

Complaint:
${title}

${description}

Return only category name.
`;

    const response =
      await client.chat.completions.create({

        model:
          "llama-3.1-8b-instant",

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    return response
      .choices[0]
      .message
      .content
      .trim();
  };

// DUPLICATE DETECTION
export const checkDuplicateAI =
  async (
    oldComplaint,
    newComplaint
  ) => {

    const prompt = `
Are these two complaints describing the same civic issue?

Complaint 1:
${oldComplaint}

Complaint 2:
${newComplaint}

Reply ONLY:
YES or NO
`;

    const response =
      await client.chat.completions.create({

        model:
          "llama-3.1-8b-instant",

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    return response
      .choices[0]
      .message
      .content
      .trim()
      .toUpperCase() === "YES";
  };