import React, { useState, useEffect } from 'react';

const AutoTyping = ({ texts, speed = 100, delay = 1000 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];
    
    if (isDeleting) {
      if (charIndex > 0) {
        setTimeout(() => setCharIndex((prev) => prev - 1), speed / 2);
      } else {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      }
    } else {
      if (charIndex < currentText.length) {
        setTimeout(() => setCharIndex((prev) => prev + 1), speed);
      } else {
        setTimeout(() => setIsDeleting(true), delay);
      }
    }

    setDisplayedText(currentText.substring(0, charIndex));
  }, [charIndex, isDeleting, texts, textIndex, speed, delay]);

  return <span>{displayedText}</span>;
};

export default AutoTyping;
