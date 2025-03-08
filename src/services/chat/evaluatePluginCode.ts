"use server";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Evaluates a plugin code string and returns a usable tool
 * @param pluginCode The code string from the database
 * @returns A tool that can be used with LangChain
 */
export const evaluatePluginCode = async (pluginCode: string) => {
  try {
    // Create a safe evaluation context with only the necessary dependencies
    const evalContext = {
      tool,
      z,
      console,
    };

    // Create the function wrapper to evaluate the code
    const functionBody = `
      const evaluatedTool = (({ tool, z }) => {
        ${pluginCode}
      })(this);
      return evaluatedTool;
    `;

    /* Example of correctly formatted plugin code:
       tool(
         async ({ num1, num2 }) => {
           return num1 + num2;
         },
         {
           name: "add",
           description: "Add two numbers",
           schema: z.object({
             num1: z.number(),
             num2: z.number(),
           }),
         }
       )
    */

    // Create a function from the string and bind the context
    const evaluateFunction = new Function(functionBody).bind(evalContext);

    // Execute the function to get the tool
    const evaluatedTool = evaluateFunction();

    return evaluatedTool;
  } catch (error) {
    console.error("Error evaluating plugin code:", error);
    console.error("Plugin code that failed:", pluginCode);
    // Return null if evaluation fails
    return null;
  }
};
