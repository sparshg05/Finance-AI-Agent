import readline from "node:readline/promises"; 
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const expenseDB = [];

async function callAgent(){

    const rl = readline.createInterface({input: process.stdin, output: process.stdout});

    const messages = [{
          role: "system",
          content: 
                `You are David, a personal finance assistant. Your task is to assist user with their expenses, 
                      balances and financial planning.`,
        }];

    //User loop
    while(true){

        const question = await rl.question("User: ");

        if(question === "bye") break;

        messages.push({
          role: "user",
          content: question,
        });

        //Agent loop
        while(true){
          const completion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            tools: [
              {
                type: "function",
                function: {
                  name: "getTotalExpense",
                  description: "Get total expenses between two dates",
                  parameters: {
                    type: "object",
                    properties: {
                      from: {
                        type: "string",
                        descripton: "From date to get the expense",
                      },
                      to: {
                        type: "string",
                        description: "To date to get the expense",
                      }
                    }
                  }
                }

              },
              {
                type: "function",
                function: {
                  name: "addExpense",
                  description: "Add new expense entry to expense database",
                  parameters: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        descripton: "Name of the expense",
                      },
                      amount: {
                        type: "string",
                        description: "Amount of the expense",
                      }
                    }
                  }
                }

              },
            ]
          })

          // console.log(completion.choices[0],null,2);

          messages.push(completion.choices[0].message);

          const toolCalls = completion.choices[0].message.tool_calls;

          if(!toolCalls){
            console.log(`Assistant: ${completion.choices[0].message.content}`);
            break;
          }

          for( const tool of toolCalls){
            const functionName = tool.function.name;
            const functionArgs = tool.function.arguments;

            let result="";
            if(functionName === "getTotalExpense"){
              result = getTotalExpense(JSON.parse(functionArgs));
            }
            else if(functionName === "addExpense"){
              result = addExpense(JSON.parse(functionArgs));
            }

            messages.push(
              {
                  role: "tool",
                  content: result,
                  tool_call_id: tool.id,
              });

            // console.log(JSON.stringify(completion2.choices[0],null,2));
          }

          // console.log("========================");
          // console.log("MESSAGES: ", messages);
        }
    }
    
    rl.close();
}

callAgent();


function getTotalExpense({from,to}){
  // console.log("Inside getTotalExpense function");
  const expense = expenseDB.reduce((acc,item) => {
    return acc + item.amount;
  },0);
  return `${expense} INR`;
}

function addExpense({name,amount}){
  // console.log(`Adding expense: ${name} with amount: ${amount}`);
  expenseDB.push({name,amount});
  return "Added to the database";
}