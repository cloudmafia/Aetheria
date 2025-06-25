import React from 'react';
import { Link } from 'react-router-dom';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Zap from 'lucide-react/dist/esm/icons/zap';
import Aurora from 'lucide-react/dist/esm/icons/activity';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const modules: Module[] = [
  {
    id: 'solar-flares',
    title: 'Solar Flares 101',
    description: 'Learn how powerful eruptions release X-rays & energetic particles.',
    icon: Zap,
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    id: 'aurora-science',
    title: 'Aurora Science',
    description: 'Discover how charged particles paint the skies with light.',
    icon: Aurora,
    gradient: 'from-teal-400 to-purple-500',
  },
  {
    id: 'satellite-safety',
    title: 'Satellite Safety',
    description: 'Explore how space weather affects satellites & mitigation tactics.',
    icon: BookOpen,
    gradient: 'from-cyan-400 to-blue-500',
  },
];

const LearnHub: React.FC = () => (
  <div className="min-h-screen bg-background py-10 container mx-auto px-4 space-y-8">
    <h1 className="text-3xl font-display font-bold cosmic-glow mb-2">Aetheria Learn</h1>
    <p className="text-muted-foreground max-w-prose">
      Choose a module below to start a quick interactive lesson. Earn badges by scoring 80% or
      higher!
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map(({ id, title, description, icon: Icon, gradient }) => (
        <Link
          to={`/learn/${id}`}
          key={id}
          className="aetheria-glass p-6 rounded-lg hover:ring-2 hover:ring-cosmic-blue transition-all group"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r ${gradient} text-white mb-4 group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </Link>
      ))}
    </div>
  </div>
);

export default LearnHub;
