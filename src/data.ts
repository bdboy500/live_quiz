export interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Which of the following is the national fruit of Bangladesh?",
    options: ["Mango", "Jackfruit", "Litchi", "Coconut"],
    correctIndex: 1,
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet in our solar system?",
    options: ["Venus", "Mars", "Jupiter", "Mercury"],
    correctIndex: 1,
  },
  {
    id: 3,
    question: "What is the chemical symbol for gold?",
    options: ["Gd", "Ag", "Au", "Fe"],
    correctIndex: 2,
  },
  {
    id: 4,
    question: "Which is the longest river in Bangladesh?",
    options: ["Meghna", "Padma", "Jamuna", "Karnafuli"],
    correctIndex: 0,
  },
  {
    id: 5,
    question: "Which scientist proposed the theory of general relativity?",
    options: ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "Stephen Hawking"],
    correctIndex: 1,
  },
  {
    id: 6,
    question: "What is the capital city of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    correctIndex: 2,
  },
  {
    id: 7,
    question: "Which component of a computer is considered its 'brain'?",
    options: ["RAM", "Hard Drive", "GPU", "CPU"],
    correctIndex: 3,
  },
  {
    id: 8,
    question: "How many bones are there in an adult human body?",
    options: ["106", "206", "306", "406"],
    correctIndex: 1,
  },
  {
    id: 9,
    question: "Which is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Southern Ocean", "Pacific Ocean"],
    correctIndex: 3,
  },
  {
    id: 10,
    question: "In which year did Bangladesh gain its independence?",
    options: ["1952", "1969", "1971", "1975"],
    correctIndex: 2,
  },
  {
    id: 11,
    question: "What is the primary gas that makes up Earth's atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correctIndex: 2,
  },
  {
    id: 12,
    question: "Which country is home to the Kangaroos?",
    options: ["South Africa", "New Zealand", "Australia", "Kenya"],
    correctIndex: 2,
  },
  {
    id: 13,
    question: "Which is the smallest country in the world by land area?",
    options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
    correctIndex: 1,
  },
  {
    id: 14,
    question: "Who wrote the national anthem of Bangladesh?",
    options: ["Kazi Nazrul Islam", "Rabindranath Tagore", "Jashimuddin", "Lalon Shah"],
    correctIndex: 1,
  },
  {
    id: 15,
    question: "What is the speed of light in a vacuum?",
    options: ["~150,000 km/s", "~300,000 km/s", "~450,000 km/s", "~600,000 km/s"],
    correctIndex: 1,
  }
];
