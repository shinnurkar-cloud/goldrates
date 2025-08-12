import { defineFlow } from 'genkit';
import { z } from 'zod';
import { ai } from '../genkit';

export const forgotPasswordFlow = defineFlow(
  {
    name: 'forgotPasswordFlow',
    inputSchema: z.object({
      userQuery: z.string(),
    }),
    outputSchema: z.object({
      shouldOfferMasterPassword: z.boolean(),
      response: z.string(),
    }),
  },
  async ({ userQuery }) => {
    const prompt = `A user of the GoldenEye app is interacting with a password reset assistant. Their input is: "${userQuery}".

Analyze the user's intent. Your task is to determine if the user has forgotten their password and needs to reset it.

- If the intent is clearly a password reset request (e.g., they mention "forgot", "lost", "reset", "can't remember password"), you MUST respond with JSON where "shouldOfferMasterPassword" is true. The "response" should be a confirmation like: "It looks like you've forgotten your password. You can use the master password to reset it."

- For any other intent (e.g., asking about gold price, general greetings, gibberish), you MUST respond with JSON where "shouldOfferMasterPassword" is false. The "response" should be a polite message guiding them, like: "I can help with password resets. If you've forgotten your password, please say so."

Your response MUST be a valid JSON object matching the specified schema.`;

    try {
      const llmResponse = await ai.generate({
        prompt,
        model: 'googleai/gemini-1.5-flash-latest',
        output: {
          format: 'json',
          schema: z.object({
            shouldOfferMasterPassword: z.boolean(),
            response: z.string(),
          }),
        },
        config: {
          temperature: 0.1,
        },
      });

      const output = llmResponse.output();
      if (output) {
        return output;
      }
    } catch (e) {
      console.error('Error with AI model:', e);
    }


    // Fallback in case of LLM failure
    return {
      shouldOfferMasterPassword: false,
      response: "I'm having trouble connecting. Please try again in a moment.",
    };
  }
);
