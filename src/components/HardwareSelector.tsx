import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, Zap, Clock, MemoryStick } from "lucide-react";

interface HardwareOption {
  id: string;
  name: string;
  description: string;
  specs: {
    cpu: string;
    memory: string;
    clock: string;
    power: string;
  };
  status: 'available' | 'coming-soon' | 'experimental';
  icon: React.ReactNode;
}

interface HardwareSelectorProps {
  onHardwareSelected: (hardware: HardwareOption) => void;
  selectedHardware?: HardwareOption;
}

const hardwareOptions: HardwareOption[] = [
  {
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
    icon: <Cpu className="w-6 h-6" />
  },
  {
    id: 'esp32-c3',
    name: 'ESP32-C3',
    description: 'RISC-V single-core with WiFi/BLE',
    specs: {
      cpu: 'RISC-V 160MHz',
      memory: '400KB SRAM',
      clock: '160MHz',
      power: '~80mW'
    },
    status: 'available',
    icon: <Cpu className="w-6 h-6" />
  },
  {
    id: 'stm32',
    name: 'STM32H7',
    description: 'ARM Cortex-M7 with FPU',
    specs: {
      cpu: 'ARM M7 480MHz',
      memory: '1MB SRAM',
      clock: '480MHz',
      power: '~200mW'
    },
    status: 'coming-soon',
    icon: <Cpu className="w-6 h-6" />
  },
  {
    id: 'riscv',
    name: 'RISC-V Vector',
    description: 'Custom RISC-V with vector extensions',
    specs: {
      cpu: 'RISC-V 1GHz',
      memory: '2MB SRAM',
      clock: '1GHz',
      power: '~500mW'
    },
    status: 'experimental',
    icon: <Zap className="w-6 h-6" />
  }
];

export function HardwareSelector({ onHardwareSelected, selectedHardware }: HardwareSelectorProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'coming-soon':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'experimental':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Ready';
      case 'coming-soon':
        return 'Coming Soon';
      case 'experimental':
        return 'Experimental';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="neural-border transition-neural">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" />
          Silicon Target Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {hardwareOptions.map((hardware) => {
            const isSelected = selectedHardware?.id === hardware.id;
            const isHovered = hoveredCard === hardware.id;
            
            return (
              <div
                key={hardware.id}
                className={`
                  relative p-4 rounded-lg border cursor-pointer transition-neural
                  ${isSelected 
                    ? 'neural-border bg-primary/5 glow-primary' 
                    : 'border-muted hover:border-primary/50'
                  }
                  ${isHovered ? 'shadow-neural' : ''}
                  ${hardware.status !== 'available' ? 'opacity-75' : ''}
                `}
                onMouseEnter={() => setHoveredCard(hardware.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => {
                  if (hardware.status === 'available') {
                    onHardwareSelected(hardware);
                  }
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`
                        p-2 rounded-lg transition-neural
                        ${isSelected ? 'gradient-neural text-primary-foreground' : 'bg-muted/50'}
                      `}>
                        {hardware.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{hardware.name}</h3>
                        <p className="text-sm text-muted-foreground">{hardware.description}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(hardware.status)}>
                      {getStatusText(hardware.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">CPU:</span>
                      <span>{hardware.specs.cpu}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MemoryStick className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">RAM:</span>
                      <span>{hardware.specs.memory}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Clock:</span>
                      <span>{hardware.specs.clock}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Power:</span>
                      <span>{hardware.specs.power}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 p-2 rounded gradient-quantum">
                      <p className="text-xs text-primary font-medium">
                        ✓ Silicon substrate configured for neural deployment
                      </p>
                    </div>
                  )}

                  {hardware.status !== 'available' && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Badge variant="outline" className="neural-border">
                        {getStatusText(hardware.status)}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {selectedHardware && (
          <div className="mt-6 p-4 rounded-lg gradient-quantum neural-border">
            <h4 className="font-semibold text-primary mb-2">Optimization Parameters</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Quantization:</span>
                <span className="ml-2">INT8 with calibration</span>
              </div>
              <div>
                <span className="text-muted-foreground">Memory Model:</span>
                <span className="ml-2">Static allocation</span>
              </div>
              <div>
                <span className="text-muted-foreground">Inference Engine:</span>
                <span className="ml-2">TensorFlow Lite Micro</span>
              </div>
              <div>
                <span className="text-muted-foreground">Optimization:</span>
                <span className="ml-2">Size & Speed balanced</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}