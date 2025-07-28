import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Zap, 
  Cpu, 
  Download, 
  CheckCircle, 
  Clock, 
  Layers,
  Microscope,
  ChevronRight
} from "lucide-react";

interface PipelineStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  details?: string[];
  estimatedTime?: string;
}

interface PipelineVisualizationProps {
  modelFile?: any;
  hardware?: any;
  onStart: () => void;
  isRunning: boolean;
}

export function PipelineVisualization({ modelFile, hardware, onStart, isRunning }: PipelineVisualizationProps) {
  const [steps, setSteps] = useState<PipelineStep[]>([
    {
      id: 'analysis',
      name: 'Neural Analysis',
      description: 'Analyzing model architecture and layer dependencies',
      icon: <Brain className="w-5 h-5" />,
      status: 'pending',
      progress: 0,
      details: ['Parsing model structure', 'Identifying layer types', 'Computing memory requirements'],
      estimatedTime: '~15s'
    },
    {
      id: 'optimization',
      name: 'Quantum Optimization',
      description: 'Applying quantization and pruning algorithms',
      icon: <Zap className="w-5 h-5" />,
      status: 'pending',
      progress: 0,
      details: ['INT8 quantization', 'Weight pruning', 'Layer fusion', 'Dead code elimination'],
      estimatedTime: '~45s'
    },
    {
      id: 'compilation',
      name: 'Silicon Compilation',
      description: 'Generating optimized C++ code for target hardware',
      icon: <Cpu className="w-5 h-5" />,
      status: 'pending',
      progress: 0,
      details: ['TensorFlow Lite conversion', 'Hardware-specific optimization', 'Memory layout optimization'],
      estimatedTime: '~30s'
    },
    {
      id: 'synthesis',
      name: 'Firmware Synthesis',
      description: 'Building complete firmware package',
      icon: <Microscope className="w-5 h-5" />,
      status: 'pending',
      progress: 0,
      details: ['Linking TFLite Micro', 'ESP-IDF integration', 'Binary generation'],
      estimatedTime: '~20s'
    }
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    let stepIndex = 0;
    const processStep = () => {
      if (stepIndex >= steps.length) return;

      setCurrentStepIndex(stepIndex);
      
      // Update step to running
      setSteps(prev => prev.map((step, idx) => 
        idx === stepIndex 
          ? { ...step, status: 'running' as const, progress: 0 }
          : step
      ));

      // Simulate progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;

        setSteps(prev => prev.map((step, idx) => 
          idx === stepIndex 
            ? { ...step, progress }
            : step
        ));

        setOverallProgress((stepIndex * 100 + progress) / steps.length);

        if (progress >= 100) {
          clearInterval(progressInterval);
          
          // Mark as completed
          setSteps(prev => prev.map((step, idx) => 
            idx === stepIndex 
              ? { ...step, status: 'completed' as const, progress: 100 }
              : step
          ));

          stepIndex++;
          setTimeout(processStep, 500);
        }
      }, 200);
    };

    processStep();
  }, [isRunning, steps.length]);

  const canStart = modelFile && hardware;
  const isCompleted = steps.every(step => step.status === 'completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-primary';
      case 'running':
        return 'text-accent';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'running':
        return <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />;
      case 'error':
        return <div className="w-4 h-4 rounded-full bg-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="neural-border transition-neural">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Spore-to-Silicon Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {isCompleted ? 'Pipeline Complete' : isRunning ? 'Processing...' : 'Ready to Deploy'}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Pipeline Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="space-y-3">
                <div className={`
                  flex items-center gap-4 p-4 rounded-lg border transition-neural
                  ${step.status === 'running' ? 'neural-border bg-primary/5' : 'border-muted'}
                  ${step.status === 'completed' ? 'bg-primary/5 border-primary/20' : ''}
                `}>
                  <div className="flex-shrink-0">
                    <div className={`
                      p-2 rounded-lg transition-neural
                      ${step.status === 'completed' ? 'gradient-neural text-primary-foreground' : 
                        step.status === 'running' ? 'bg-accent/20' : 'bg-muted/50'}
                    `}>
                      {step.icon}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold ${getStatusColor(step.status)}`}>
                        {step.name}
                      </h4>
                      {getStatusIcon(step.status)}
                      {step.estimatedTime && step.status === 'pending' && (
                        <Badge variant="outline" className="text-xs">
                          {step.estimatedTime}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>

                    {step.status === 'running' && (
                      <div className="mt-2 space-y-1">
                        <Progress value={step.progress} className="h-1" />
                        <p className="text-xs text-muted-foreground">
                          Processing... {Math.round(step.progress)}%
                        </p>
                      </div>
                    )}

                    {step.details && (step.status === 'running' || step.status === 'completed') && (
                      <div className="mt-2 space-y-1">
                        {step.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <ChevronRight className="w-3 h-3" />
                            <span>{detail}</span>
                            {step.status === 'completed' && (
                              <CheckCircle className="w-3 h-3 text-primary ml-auto" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isRunning && !isCompleted && (
              <Button 
                onClick={onStart}
                disabled={!canStart}
                className="flex-1 neural-border transition-neural hover:glow-primary"
              >
                <Zap className="w-4 h-4 mr-2" />
                {canStart ? 'Initialize Neural Deployment' : 'Configure Model & Hardware First'}
              </Button>
            )}

            {isCompleted && (
              <>
                <Button className="flex-1 gradient-neural transition-neural">
                  <Download className="w-4 h-4 mr-2" />
                  Download Firmware (.bin)
                </Button>
                <Button variant="outline" className="neural-border transition-neural hover:glow-accent">
                  <Cpu className="w-4 h-4 mr-2" />
                  Flash to Device
                </Button>
              </>
            )}
          </div>

          {isCompleted && (
            <div className="mt-4 p-4 rounded-lg gradient-quantum neural-border">
              <h4 className="font-semibold text-primary mb-2">Deployment Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Original Size:</span>
                  <span className="ml-2 font-mono">2.4 MB</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Optimized Size:</span>
                  <span className="ml-2 font-mono text-primary">127 KB</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Compression Ratio:</span>
                  <span className="ml-2 font-mono text-primary">94.7%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Inference Time:</span>
                  <span className="ml-2 font-mono">12ms</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}