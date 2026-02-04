import CardFlip from './Fearture';
import { Shield,  Database, Search, MessageSquare } from 'lucide-react';

const featureData = [
  {
    title: 'Data Ingestion',
    subtitle: 'Intelligent Data Reform',
    description: 'Connect your local files, Google Drive, or existing databases for seamless AI processing.',
    icon: Database,
    features: ['Local PDF/Doc Upload', 'Google Drive Sync', 'Click-to-Ingest', 'SQL DB Support'],
  },
  {
    title: 'Smart RAG Search',
    subtitle: 'Context-Aware Retrieval',
    description: 'Our vector-based engine finds the exact needle in the haystack across all company documents.',
    icon: Search,
    features: ['Semantic Search', 'Vector Embeddings', 'Hybrid Retrieval', 'Instant Indexing'],
  },
  {
    title: 'AI Conversationalist',
    subtitle: 'Interactive Knowledge',
    description: 'Chat with your data in real-time. Our AI understands context and prevents hallucinations.',
    icon: MessageSquare,
    features: ['Context-Aware Chat', 'Source Citations', 'Multi-file Synthesis', 'Real-time Logic'],
  },
  {
    title: 'Enterprise Security',
    subtitle: 'Privacy First Architecture',
    description: 'Your data is encrypted and isolated. We ensure your company secrets stay yours.',
    icon: Shield,
    features: ['E2E Encryption', 'SOC2 Compliant Infra', 'Tenant Isolation', 'RBAC Permissions'],
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-white dark:bg-black overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header Content */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white mb-6 tracking-tight">
            How it <span className="text-primary">Works</span>
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Transform your static organizational knowledge into a dynamic, 
            intelligent engine with our four-step AI framework.
          </p>
        </div>

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto justify-items-center">
          {featureData.map((item, index) => (
            <CardFlip 
              key={index}
              title={item.title}
              subtitle={item.subtitle}
              description={item.description}
              features={item.features}
              icon={item.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}