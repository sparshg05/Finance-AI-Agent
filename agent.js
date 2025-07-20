import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callAgent(){
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: 
                `You are David, a personal finance assistant. Your task is to assist user with their expenses, 
                      balances and financial planning.`,
        },
        {
          role: "user",
          content: "Can you help me in managing my finances?",
        },
      ],
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

        }
      ]
    })
    // .then((chatCompletion) => {
    //   console.log(chatCompletion.choices[0],null,2);
    // });

    console.log(completion.choices[0],null,2);

    const toolCalls = completion.choices[0].message.tool_calls;

    if(!toolCalls){
      console.log(`Assistant: ${completion.choices[0].message.content}`);
      return;
    }

    for( const tool of toolCalls){
      const functionName = tool.function.name;
      const functionArgs = tool.function.arguments;

      let result="";
      if(functionName === "getTotalExpense"){
        result = getTotalExpense(JSON.parse(functionArgs));
      }

      const completion2 = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: 
                  `You are David, a personal finance assistant. Your task is to assist user with their expenses, 
                        balances and financial planning.`,
          },
          {
            role: "user",
            content: "Can you help me in managing my finances?",
          },
          {
            role: "tool",
            content: result,
            tool_call_id: tool.id,
          },
        ],
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

          }
        ]
      })
    }


    
}

callAgent();


function getTotalExpense({from,to}){
  console.log("Inside getTotalExpense function");
  return 10000;
}