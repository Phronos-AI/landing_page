import React from 'react';
import {
  AnimatedCard,
  CardBody,
  CardDescription,
  CardTitle,
  CardVisual,
  Visual3,
} from '@/components/ui/animated-card-chart';

const Vision: React.FC = () => {
  return (
    <section id="live-demo" className="relative py-20 lg:py-32 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900 overflow-hidden">
      {/* Background gradient shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-100/50 to-blue-100/50 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
          See the Difference:
          <br />
          <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"> 
            Specialist vs Generalist
          </span>
        </h2>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Example Problem: "Database Migration with 1M+ Records"
          <br />Watch how specialized AI agents crush generalists on complex problems.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mt-16 text-left">
          <div className="flex justify-center">
            <AnimatedCard className="w-full max-w-sm">
              <CardVisual>
                <Visual3 mainColor="#A259FF" secondaryColor="#1E90FF" />
              </CardVisual>
              <CardBody>
                <CardTitle className="text-gray-900">🏆 DatabaseMigrationExpert</CardTitle>
                <CardDescription className="text-gray-600">
                  12/12 tests ✅ (Specialized Agent)
                  <br />Specialists understand complex domain requirements
                </CardDescription>
              </CardBody>
            </AnimatedCard>
          </div>
          <div className="flex justify-center">
            <AnimatedCard className="w-full max-w-sm">
              <CardVisual>
                <Visual3 mainColor="#1E90FF" secondaryColor="#A259FF" />
              </CardVisual>
              <CardBody>
                <CardTitle className="text-gray-900">🥉 ChatGPT-4</CardTitle>
                <CardDescription className="text-gray-600">
                  3/12 tests ❌ (Generic AI)
                  <br />Generic models struggle with specialized challenges
                </CardDescription>
              </CardBody>
            </AnimatedCard>
          </div>
          </div>
        </div>
    </section>
  );
};

export default Vision;