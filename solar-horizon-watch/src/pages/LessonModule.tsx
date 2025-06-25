import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Lottie from 'react-lottie-player';
import confettiJson from '@/assets/lottie/confetti.json';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';

interface Question {
  q: string;
  options: string[];
  correct: number; // index of correct answer
}

const lessons: Record<string, { title: string; content: string[]; questions: Question[] }> = {
  'solar-flares': {
    title: 'Solar Flares 101',
    content: [
      'Solar flares are intense bursts of radiation from the release of magnetic energy on the Sun.',
      'They are our solar system\'s largest explosive events and can impact radio communications on Earth.',
    ],
    questions: [
      {
        q: 'What triggers a solar flare?',
        options: ['Magnetic energy release', 'Asteroid impact', 'Solar wind', 'Cosmic rays'],
        correct: 0,
      },
      {
        q: 'Which class represents the most powerful flares?',
        options: ['C', 'M', 'X', 'B'],
        correct: 2,
      },
    ],
  },
  'aurora-science': {
    title: 'Aurora Science',
    content: [
      'Auroras occur when charged particles collide with atoms in Earth\'s upper atmosphere.',
      'These collisions excite the atoms, causing them to light up.',
    ],
    questions: [
      {
        q: 'Auroras are most commonly seen near which region?',
        options: ['Equator', 'Poles', 'Tropics', 'Deserts'],
        correct: 1,
      },
    ],
  },
  'satellite-safety': {
    title: 'Satellite Safety',
    content: [
      'Space weather can cause satellite drag and damage electronics.',
      'Engineers use shielding and safe-mode protocols to mitigate risks.',
    ],
    questions: [
      {
        q: 'What effect does increased solar activity have on low-Earth satellites?',
        options: ['Less atmospheric drag', 'Increased drag', 'No change', 'They speed up'],
        correct: 1,
      },
    ],
  },
};

const LessonModule: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const lesson = lessons[id ?? ''];
  const [step, setStep] = useState(0); // content pages then questions
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!lesson) return;
    document.title = `${lesson.title} • Aetheria Learn`;
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <BookOpen className="h-8 w-8 mb-2" />
        <p className="mb-4">Lesson not found.</p>
        <Link to="/learn" className="text-cosmic-blue underline">Back to Learn Hub</Link>
      </div>
    );
  }

  const totalSteps = lesson.content.length + lesson.questions.length;

  const handleAnswer = (idx: number, correct: boolean) => {
    if (correct) setScore((s) => s + 1);
    setStep((s) => s + 1);
  };

  const finished = step >= totalSteps;

  useEffect(() => {
    if (finished) {
      const pct = (score / lesson.questions.length) * 100;
      if (pct >= 80) {
        // save badge
        const badges = JSON.parse(localStorage.getItem('aetheria_badges') ?? '[]');
        if (!badges.includes(id)) {
          localStorage.setItem('aetheria_badges', JSON.stringify([...badges, id]));
        }
      }
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(t);
    }
  }, [finished, score, id, lesson.questions.length]);

  return (
    <div className="min-h-screen bg-background py-10 container mx-auto px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-display font-bold cosmic-glow">{lesson.title}</h1>
        {!finished ? (
          step < lesson.content.length ? (
            <div className="aetheria-glass p-6">
              <p className="text-lg mb-4">{lesson.content[step]}</p>
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-4 py-2 rounded-md bg-cosmic-blue hover:bg-cosmic-blue/80 text-white"
              >
                Continue
              </button>
            </div>
          ) : (
            // question
            <div className="aetheria-glass p-6 space-y-4">
              {(() => {
                const qIdx = step - lesson.content.length;
                const q = lesson.questions[qIdx];
                return (
                  <>
                    <p className="text-lg font-semibold">{q.q}</p>
                    {q.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i, i === q.correct)}
                        className="block w-full text-left aetheria-glass px-4 py-2 hover:bg-white/10"
                      >
                        {opt}
                      </button>
                    ))}
                  </>
                );
              })()}
            </div>
          )
        ) : (
          <div className="aetheria-glass p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Lesson complete!</h2>
            <p className="mb-4">Your score: {score}/{lesson.questions.length}</p>
            <Link to="/learn" className="px-4 py-2 rounded-md bg-cosmic-blue text-white hover:bg-cosmic-blue/80">
              Back to Learn Hub
            </Link>
          </div>
        )}

        {showConfetti && (
          <Lottie loop play animationData={confettiJson} style={{ width: 300, margin: '0 auto' }} />
        )}
      </div>
    </div>
  );
};

export default LessonModule;
