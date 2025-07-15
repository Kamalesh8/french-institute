import { useState, useEffect } from 'react';
import EditVocabulary from './EditVocabulary';
import EditGrammar from './EditGrammar';
import EditQuiz from './EditQuiz';
import { VocabularyItem, GrammarItem, QuizItem } from '@/lib/firebase/courseService';

type LessonContent = {
  vocabulary: VocabularyItem[];
  grammar: GrammarItem[];
  quizzes: QuizItem[];
};

interface EditLessonProps {
  initialContent: LessonContent;
  onSave: (content: LessonContent) => void;
}

export default function EditLesson({ initialContent, onSave }: EditLessonProps) {
  const [content, setContent] = useState<LessonContent>(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSaveVocabulary = (vocabulary: VocabularyItem[]) => {
    setContent({ ...content, vocabulary });
  };

  const handleSaveGrammar = (grammar: GrammarItem[]) => {
    setContent({ ...content, grammar });
  };

  const handleSaveQuizzes = (quizzes: QuizItem[]) => {
    setContent({ ...content, quizzes });
  };

  const handleSaveAll = () => {
    onSave(content);
  };

  return (
    <div className="space-y-8">
      <EditVocabulary 
        vocabulary={content.vocabulary} 
        onSave={handleSaveVocabulary} 
      />
      <EditGrammar 
        grammar={content.grammar} 
        onSave={handleSaveGrammar} 
      />
      <EditQuiz 
        quizzes={content.quizzes} 
        onSave={handleSaveQuizzes} 
      />
      <div className="flex justify-end">
        <button 
          onClick={handleSaveAll}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 text-lg"
        >
          Save All Lesson Content
        </button>
      </div>
    </div>
  );
}
