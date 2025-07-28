import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SporeNetHeader } from "@/components/SporeNetHeader";
import { ModelUpload } from "@/components/ModelUpload";
import { HardwareSelector } from "@/components/HardwareSelector";
import { PipelineVisualization } from "@/components/PipelineVisualization";
import { OnboardingModal } from "@/components/OnboardingModal";
import { Play, Sparkles } from "lucide-react";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [modelFile, setModelFile] = useState(null);
  const [selectedHardware, setSelectedHardware] = useState(null);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding for first-time visitors
    const hasVisited = localStorage.getItem('sporenet-visited');
    if (!hasVisited) {
      setShowOnboarding(true);
      localStorage.setItem('sporenet-visited', 'true');
    }
    setHasSeenOnboarding(!!hasVisited);
  }, []);

  const handleStartDemo = () => {
    // Set up demo model and hardware for demonstration
    setModelFile({
      name: 'mnist_cnn_demo.h5',
      size: 2400000, // 2.4MB
      type: 'application/octet-stream',
      framework: 'TensorFlow'
    });
    
    setSelectedHardware({
      id: 'esp32',
      name: 'ESP32-S3',
      description: 'Dual-core Xtensa with AI acceleration',
      specs: {
        cpu: 'Dual-core 240MHz',
        memory: '512KB SRAM',
        clock: '240MHz',
        power: '~100mW'
      },
      status: 'available',
      icon: null
    });
  };

  const handleStartPipeline = () => {
    setIsPipelineRunning(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SporeNetHeader />
      
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold">
                <span className="gradient-neural bg-clip-text text-transparent">
                  Neural Spores
                </span>
                <br />
                <span className="text-foreground">to Silicon Reality</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Transform any neural network into optimized embedded firmware with 
                <span className="text-primary font-semibold"> 95% size reduction</span> and 
                <span className="text-accent font-semibold"> &lt;1% accuracy loss</span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              {!hasSeenOnboarding && (
                <Button 
                  onClick={() => setShowOnboarding(true)}
                  variant="outline"
                  className="neural-border transition-neural hover:glow-accent"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Quick Tour
                </Button>
              )}
              <Button 
                onClick={handleStartDemo}
                className="gradient-neural transition-neural"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Try Demo Model
              </Button>
            </div>
          </div>

          {/* Main Interface */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <ModelUpload onModelUploaded={setModelFile} />
              <HardwareSelector 
                onHardwareSelected={setSelectedHardware}
                selectedHardware={selectedHardware}
              />
            </div>

            {/* Right Column */}
            <div>
              <PipelineVisualization 
                modelFile={modelFile}
                hardware={selectedHardware}
                onStart={handleStartPipeline}
                isRunning={isPipelineRunning}
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center space-y-4">
            <div className="gradient-quantum p-8 rounded-lg neural-border">
              <h2 className="text-2xl font-bold mb-4 text-primary">
                Kardashev-Class AI Deployment
              </h2>
              <p className="text-muted-foreground max-w-4xl mx-auto">
                SporeNet represents Type-I civilization technology: democratized access to advanced AI deployment. 
                Like spores that adapt to any environment, your neural networks now flourish on any silicon substrate - 
                from humble microcontrollers to quantum processors. This is post-scarcity artificial intelligence.
              </p>
            </div>
          </div>
        </div>
      </main>

      <OnboardingModal 
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onStartDemo={handleStartDemo}
      />
    </div>
  );
};

export default Index;
