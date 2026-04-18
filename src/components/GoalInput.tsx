'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface GoalInputProps {
  onSubmit: (goal: string) => void;
  loading: boolean;
}

export function GoalInput({ onSubmit, loading }: GoalInputProps) {
  const [goal, setGoal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim()) {
      onSubmit(goal);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
          Define Your Goal
        </label>
        <Textarea
          id="goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Enter a high-level objective for the AI agent to accomplish..."
          className="w-full h-32"
          disabled={loading}
        />
      </div>
      <Button
        type="submit"
        disabled={loading || !goal.trim()}
        className="bg-[#737CA1] hover:bg-[#5a6478] text-white"
      >
        {loading ? 'Planning...' : 'Start Agent'}
      </Button>
    </form>
  );
}