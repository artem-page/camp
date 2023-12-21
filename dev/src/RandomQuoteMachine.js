import React, { useState, useEffect } from 'react';

const App = () => {

    const [quoteIndex, setQuoteIndex] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    const wisdomQuotes = [
        { quote: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
        { quote: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
        { quote: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
        { quote: "Wisdom is not a product of schooling but of the lifelong attempt to acquire it.", author: "Albert Einstein" },
        { quote: "The fool doth think he is wise, but the wise man knows himself to be a fool.", author: "William Shakespeare" },
        { quote: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
        { quote: "To conquer oneself is a greater victory than to conquer thousands in a battle.", author: "Dalai Lama" },
        { quote: "The more I learn, the more I realize how much I don't know.", author: "Albert Einstein" },
        { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { quote: "In three words I can sum up everything I've learned about life: it goes on.", author: "Robert Frost" },
        { quote: "You have within you right now, everything you need to deal with whatever the world can throw at you.", author: "Brian Tracy" },
        { quote: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston S. Churchill" },
        { quote: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
        { quote: "The more I live, the more I learn. The more I learn, the more I realize, the less I know.", author: "Michel Legrand" },
        { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { quote: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
        { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
        { quote: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
        { quote: "Don't count the days, make the days count.", author: "Muhammad Ali" },
        { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    ];

    useEffect(() => {
        setQuoteIndex(getRandomIndex());
    }, []);
  
    const getRandomIndex = () => {
      return Math.floor(Math.random() * wisdomQuotes.length);
    };
  
    const getQuote = () => {
        setFadeOut(true); // Add state to trigger the fade-out class
        setQuoteIndex(getRandomIndex());
        setFadeOut(false); // Reset the state
    };
  
    const tweetQuote = () => {
      const currentQuote = wisdomQuotes[quoteIndex];
      const tweetUrl = `https://twitter.com/intent/tweet?text="${currentQuote.quote}" - ${currentQuote.author}`;
      window.open(tweetUrl, '_blank');
    };
  
    return (
      <div id="quote-box" >
        <div className={`quote-container ${fadeOut ? 'fade-out' : ''}`}>
            <div id="text">{wisdomQuotes[quoteIndex].quote}</div>
            <div id="author">- {wisdomQuotes[quoteIndex].author}</div>
        </div>
        <div>
        <button id="new-quote" onClick={getQuote} >
          New Quote
        </button>
        <a id="tweet-quote" href="#" onClick={tweetQuote}>
          Tweet Quote
        </a>
        </div>
      </div>
    );

};

export default App;