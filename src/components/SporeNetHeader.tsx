import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Zap, Cpu, Brain, Layers } from "lucide-react";

export function SporeNetHeader() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <header className="border-b neural-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg gradient-neural flex items-center justify-center quantum-glow">
                  <Brain className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  SporeNet CLI
                </h1>
                <p className="text-sm text-muted-foreground">Neural Network to Silicon Pipeline</p>
              </div>
            </div>
            <Badge variant="secondary" className="gradient-quantum border-0">
              v0.1 Kardashev-I
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Dialog open={showInfo} onOpenChange={setShowInfo}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="neural-border transition-neural hover:glow-primary">
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl gradient-neural bg-clip-text text-transparent">
                    SporeNet: From Neural Spores to Silicon Reality
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 text-sm">
                  <div className="gradient-quantum p-6 rounded-lg neural-border">
                    <h3 className="text-lg font-semibold mb-3 text-primary">🧬 Project Vision</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      SporeNet represents the next evolution in democratizing embedded AI. Like spores that can survive in any environment 
                      and grow into complex organisms, your neural networks can now adapt and flourish on any silicon substrate - 
                      from ESP32 microcontrollers to quantum processors.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border neural-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold">Quantum Optimization</h4>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Advanced quantization algorithms reduce model size by 95% while maintaining 99%+ accuracy
                      </p>
                    </div>

                    <div className="p-4 rounded-lg border neural-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-5 h-5 text-accent" />
                        <h4 className="font-semibold">Universal Hardware</h4>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Deploy to ESP32, STM32, RISC-V, or any embedded platform with automatic optimization
                      </p>
                    </div>

                    <div className="p-4 rounded-lg border neural-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold">Neural Architecture</h4>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Support for TensorFlow, PyTorch, ONNX models with intelligent layer fusion and pruning
                      </p>
                    </div>

                    <div className="p-4 rounded-lg border neural-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-5 h-5 text-accent" />
                        <h4 className="font-semibold">Kardashev Intelligence</h4>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Type-I civilization technology stack for post-scarcity AI deployment patterns
                      </p>
                    </div>
                  </div>

                  <div className="neural-border p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-accent">🚀 How It Works</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">1</span>
                        </div>
                        <div>
                          <p className="font-medium">Neural Upload</p>
                          <p className="text-muted-foreground text-xs">Upload your trained model (TensorFlow .h5, PyTorch .pt, or ONNX)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">2</span>
                        </div>
                        <div>
                          <p className="font-medium">Quantum Optimization</p>
                          <p className="text-muted-foreground text-xs">Advanced quantization, pruning, and architecture optimization for target hardware</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">3</span>
                        </div>
                        <div>
                          <p className="font-medium">Silicon Synthesis</p>
                          <p className="text-muted-foreground text-xs">Generate optimized firmware with TensorFlow Lite Micro integration</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-accent">4</span>
                        </div>
                        <div>
                          <p className="font-medium">Deployment Ready</p>
                          <p className="text-muted-foreground text-xs">Flash directly to hardware or download compiled .bin files</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="neural-border p-6 rounded-lg gradient-quantum">
                    <h3 className="text-lg font-semibold mb-3 text-primary">🌌 The Kardashev Scale Vision</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Named after the Kardashev Scale that measures civilization advancement by energy usage, SporeNet embodies 
                      Type-I civilization principles: abundant, accessible, and democratized artificial intelligence. 
                      Just as Type-I civilizations harness their planet's energy, we harness the full computational potential 
                      of every silicon substrate, from the humblest microcontroller to quantum processors.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </header>
  );
}