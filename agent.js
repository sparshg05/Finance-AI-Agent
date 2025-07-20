import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callAgent(){
    const completion = await groq.chat.completions
    .create({
      messages: [
        {
          role: "system",
          content: 
                `You are David, a personal finance assistant. Your task is to assist user with their expenses, 
                      balances and financial planning.`,
        },
        {
          role: "user",
          content: "Who are you?",
        },
      ],
      model: "llama-3.3-70b-versatile",
    })
    .then((chatCompletion) => {
      console.log(chatCompletion.choices[0]?.message?.content || "");
    });
}

callAgent();