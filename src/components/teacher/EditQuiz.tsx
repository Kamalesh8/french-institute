import { useState } from 'react';

interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface EditQuizProps {
  quizzes: QuizItem[];
  onSave: (quizzes: QuizItem[]) => void;
}

export default function EditQuiz({ quizzes, onSave }: EditQuizProps) {
  const [items, setItems] = useState<QuizItem[]>(quizzes);

  const handleChange = (index: number, field: keyof QuizItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleOptionChange = (index: number, optionIndex: number, value: string) => {
    const newItems = [...items];
    const newOptions = [...newItems[index].options];
    newOptions[optionIndex] = value;
    newItems[index] = { ...newItems[index], options: newOptions };
    setItems(newItems);
  };

  const addOption = (index: number) => {
    const newItems = [...items];
    newItems[index].options.push('');
    setItems(newItems);
  };

  const removeOption = (index: number, optionIndex: number) => {
    const newItems = [...items];
    newItems[index].options = newItems[index].options.filter((_, i) => i !== optionIndex);
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), question: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Quizzes</h3>
      {items.map((item, index) => (
        <div key={item.id} className="border p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <h4 className="font-medium">Question {index + 1}</h4>
            <button 
              onClick={() => removeItem(index)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Question</label>
            <input
              type="text"
              value={item.question}
              onChange={(e) => handleChange(index, 'question', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Options</label>
            {item.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center mb-2">
                <input
                  type="radio"
                  name={`correctAnswer-${index}`}
                  checked={item.correctAnswer === option}
                  onChange={() => handleChange(index, 'correctAnswer', option)}
                  className="mr-2"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button 
                  onClick={() => removeOption(index, optionIndex)}
                  className="ml-2 text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
            <button 
              onClick={() => addOption(index)}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              + Add Option
            </button>
          </div>
        </div>
      ))}
      <button 
        onClick={addItem}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Quiz Question
      </button>
      <div className="flex justify-end">
        <button 
          onClick={() => onSave(items)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Save Quizzes
        </button>
      </div>
    </div>
  );
}
