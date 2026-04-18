'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';

interface ProgressDashboardProps {
  plan?: string;
  steps?: string[];
  results?: string[];
  currentStep?: number;
}

export function ProgressDashboard({ plan, steps = [], results = [], currentStep = 0 }: ProgressDashboardProps) {
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {plan && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[#737CA1]">Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{plan}</p>
          </CardContent>
        </Card>

      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-[#737CA1]">Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-600 mt-2">
            Step {currentStep + 1} of {steps.length}
          </p>
        </CardContent>
      </Card>

      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[#737CA1]">Steps & Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="border-l-4 border-[#8661C1] pl-4">
                  <h4 className="font-medium">Step {index + 1}: {step}</h4>
                  {results[index] && (
                    <p className="text-sm text-gray-600 mt-1">{results[index]}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}