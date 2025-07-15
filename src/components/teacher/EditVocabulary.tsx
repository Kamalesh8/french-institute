import { useState } from 'react';

interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  example: string;
}

interface EditVocabularyProps {
  vocabulary: VocabularyItem[];
  onSave: (vocabulary: VocabularyItem[]) => void;
}

export default function EditVocabulary({ vocabulary, onSave }: EditVocabularyProps) {
  const [items, setItems] = useState<VocabularyItem[]>(vocabulary);

  const handleChange = (index: number, field: keyof VocabularyItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), word: '', translation: '', example: '' }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Vocabulary</h3>
      {items.map((item, index) => (
        <div key={item.id} className="border p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <h4 className="font-medium">Item {index + 1}</h4>
            <button 
              onClick={() => removeItem(index)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Word</label>
            <input
              type="text"
              value={item.word}
              onChange={(e) => handleChange(index, 'word', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Translation</label>
            <input
              type="text"
              value={item.translation}
              onChange={(e) => handleChange(index, 'translation', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Example Sentence</label>
            <textarea
              value={item.example}
              onChange={(e) => handleChange(index, 'example', e.target.value)}
              className="w-full p-2 border rounded"
              rows={2}
            />
          </div>
        </div>
      ))}
      <button 
        onClick={addItem}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Vocabulary Item
      </button>
      <div className="flex justify-end">
        <button 
          onClick={() => onSave(items)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Save Vocabulary
        </button>
      </div>
    </div>
  );
}
