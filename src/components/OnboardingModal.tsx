import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Upload, 
  Cpu, 
  Zap, 
  Download,
  ChevronRight,
  ChevronLeft,
  Play,
  ArrowRight
} from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  onStartDemo: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  icon: React.ReactNode;
}

export function OnboardingModal({ open, onClose, onStartDemo }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to SporeNet',
      description: 'Neural Networks → Silicon Reality',
      icon: <Brain className="w-8 h-8" />,
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full gradient-neural flex items-center justify-center quantum-glow">
              <Brain className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-2xl font-bold gradient-neural bg-clip-text text-transparent">
                SporeNet v0.1
              </h3>
              <p className="text-muted-foreground">
                Transform any neural network into optimized embedded firmware
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg gradient-quantum">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm">95% size reduction with minimal accuracy loss</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg gradient-quantum">
              <Cpu className="w-5 h-5 text-accent" />
              <span className="text-sm">Deploy to ESP32, STM32, RISC-V, and more</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg gradient-quantum">
              <Brain className="w-5 h-5 text-primary" />
              <span className="text-sm">Support for TensorFlow, PyTorch, ONNX models</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'upload',
      title: 'Neural Model Upload',
      description: 'Start with your trained neural network',
      icon: <Upload className="w-8 h-8" />,
      content: (
        <div className="space-y-6">
          <div className="p-6 border-2 border-dashed neural-border rounded-lg text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h4 className="font-semibold mb-2">Upload Your Model</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop or click to select your model file
            </p>
            <div className="grid grid-cols-2 gap-2">
              {['.h5', '.pt', '.onnx', '.tflite'].map((ext) => (
                <Badge key={ext} variant="outline" className="neural-border">
                  {ext}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">Framework Detection</p>
                <p className="text-muted-foreground text-xs">Automatically identifies TensorFlow, PyTorch, or ONNX models</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">Architecture Analysis</p>
                <p className="text-muted-foreground text-xs">Deep inspection of layers, parameters, and memory requirements</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'hardware',
      title: 'Silicon Target Selection',
      description: 'Choose your deployment hardware',
      icon: <Cpu className="w-8 h-8" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'ESP32-S3', specs: '240MHz • 512KB', status: 'available' },
              { name: 'ESP32-C3', specs: '160MHz • 400KB', status: 'available' },
              { name: 'STM32H7', specs: '480MHz • 1MB', status: 'coming-soon' },
              { name: 'RISC-V', specs: '1GHz • 2MB', status: 'experimental' }
            ].map((hw) => (
              <div key={hw.name} className="p-3 rounded-lg neural-border space-y-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{hw.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{hw.specs}</p>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    hw.status === 'available' ? 'border-primary/30 text-primary' : 
                    hw.status === 'coming-soon' ? 'border-accent/30 text-accent' :
                    'border-orange-500/30 text-orange-300'
                  }`}
                >
                  {hw.status === 'available' ? 'Ready' : 
                   hw.status === 'coming-soon' ? 'Coming Soon' : 'Experimental'}
                </Badge>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg gradient-quantum">
            <h4 className="font-semibold text-primary mb-2">Automatic Optimization</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantization:</span>
                <span>INT8 with calibration</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Memory Model:</span>
                <span>Static allocation</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inference Engine:</span>
                <span>TensorFlow Lite Micro</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'pipeline',
      title: 'Neural Pipeline Processing',
      description: 'Watch the spore-to-silicon transformation',
      icon: <Zap className="w-8 h-8" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            {[
              { icon: <Brain className="w-5 h-5" />, name: 'Neural Analysis', desc: 'Model architecture parsing' },
              { icon: <Zap className="w-5 h-5" />, name: 'Quantum Optimization', desc: 'Quantization & pruning' },
              { icon: <Cpu className="w-5 h-5" />, name: 'Silicon Compilation', desc: 'Hardware-optimized code' },
              { icon: <Download className="w-5 h-5" />, name: 'Firmware Synthesis', desc: 'Complete binary package' }
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-lg neural-border">
                <div className="p-2 rounded-lg gradient-neural text-primary-foreground">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{step.name}</p>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg gradient-quantum neural-border">
            <h4 className="font-semibold text-primary mb-2">Expected Results</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Size Reduction:</span>
                <span className="ml-2 font-mono text-primary">~95%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Inference Time:</span>
                <span className="ml-2 font-mono">~10-50ms</span>
              </div>
              <div>
                <span className="text-muted-foreground">Accuracy Loss:</span>
                <span className="ml-2 font-mono text-primary">&lt;1%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Power Usage:</span>
                <span className="ml-2 font-mono">~100mW</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-neural text-primary-foreground">
              {currentStepData.icon}
            </div>
            <div>
              <h2 className="text-xl">{currentStepData.title}</h2>
              <p className="text-sm text-muted-foreground font-normal">
                {currentStepData.description}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center gap-2">
            {steps.map((_, idx) => (
              <div key={idx} className="flex items-center gap-2 flex-1">
                <div className={`
                  h-2 rounded-full flex-1 transition-neural
                  ${idx <= currentStep ? 'gradient-neural' : 'bg-muted'}
                `} />
                {idx < steps.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="min-h-[300px]">
            {currentStepData.content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t neural-border">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={isFirstStep}
              className="neural-border transition-neural"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {steps.length}
            </span>

            {isLastStep ? (
              <Button
                onClick={() => {
                  onClose();
                  onStartDemo();
                }}
                className="gradient-neural transition-neural"
              >
                <Play className="w-4 h-4 mr-2" />
                Try Demo
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                className="neural-border transition-neural hover:glow-primary"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}