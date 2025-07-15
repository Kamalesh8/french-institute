import { useState } from 'react';

interface GrammarItem {
  id: string;
  title: string;
  explanation: string;
  examples: string[];
}

interface EditGrammarProps {
  grammar: GrammarItem[];
  onSave: (grammar: GrammarItem[]) => void;
}

export default function EditGrammar({ grammar, onSave }: EditGrammarProps) {
  const [items, setItems] = useState<GrammarItem[]>(grammar);

  const handleChange = (index: number, field: keyof GrammarItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleExampleChange = (index: number, exampleIndex: number, value: string) => {
    const newItems = [...items];
    const newExamples = [...newItems[index].examples];
    newExamples[exampleIndex] = value;
    newItems[index] = { ...newItems[index], examples: newExamples };
    setItems(newItems);
  };

  const addExample = (index: number) => {
    const newItems = [...items];
    newItems[index].examples.push('');
    setItems(newItems);
  };

  const removeExample = (index: number, exampleIndex: number) => {
    const newItems = [...items];
    newItems[index].examples = newItems[index].examples.filter((_, i) => i !== exampleIndex);
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), title: '', explanation: '', examples: [''] }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Grammar</h3>
      {items.map((item, index) => (
        <div key={item.id} className="border p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <h4 className="font-medium">Grammar Point {index + 1}</h4>
            <button 
              onClick={() => removeItem(index)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => handleChange(index, 'title', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Explanation</label>
            <textarea
              value={item.explanation}
              onChange={(e) => handleChange(index, 'explanation', e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Examples</label>
            {item.examples.map((example, exampleIndex) => (
              <div key={exampleIndex} className="flex items-center mb-2">
                <input
                  type="text"
                  value={example}
                  onChange={(e) => handleExampleChange(index, exampleIndex, e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button 
                  onClick={() => removeExample(index, exampleIndex)}
                  className="ml-2 text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
            <button 
              onClick={() => addExample(index)}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              + Add Example
            </button>
          </div>
        </div>
      ))}
      <button 
        onClick={addItem}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Grammar Point
      </button>
      <div className="flex justify-end">
        <button 
          onClick={() => onSave(items)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Save Grammar
        </button>
      </div>
    </div>
  );
}
