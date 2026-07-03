import "dotenv/config";
import {
  detectCategoryAI,
} from "./src/services/openaiService.js";

const run = async () => {

  try {

    const result =
      await detectCategoryAI(

        "Street light issue",

        "Street light not working near school"
      );

    console.log(result);

  } catch (error) {

    console.log(error.message);
  }
};

run();