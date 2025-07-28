import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileType, CheckCircle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ModelUploadProps {
  onModelUploaded: (model: ModelFile) => void;
}

interface ModelFile {
  name: string;
  size: number;
  type: string;
  framework: string;
}

export function ModelUpload({ onModelUploaded }: ModelUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedModel, setUploadedModel] = useState<ModelFile | null>(null);
  const { toast } = useToast();

  const detectFramework = (fileName: string): string => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'h5':
      case 'hdf5':
        return 'TensorFlow';
      case 'pt':
      case 'pth':
        return 'PyTorch';
      case 'onnx':
        return 'ONNX';
      case 'tflite':
        return 'TensorFlow Lite';
      default:
        return 'Unknown';
    }
  };

  const handleFileUpload = useCallback(async (file: File) => {
    const framework = detectFramework(file.name);
    
    if (framework === 'Unknown') {
      toast({
        title: "Unsupported Format",
        description: "Please upload .h5, .pt, .onnx, or .tflite files",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    setTimeout(() => {
      const modelFile: ModelFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        framework
      };

      setUploadedModel(modelFile);
      setIsUploading(false);
      setUploadProgress(100);
      onModelUploaded(modelFile);

      toast({
        title: "Neural Upload Complete",
        description: `${framework} model successfully integrated into SporeNet`,
      });
    }, 2000);
  }, [onModelUploaded, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (uploadedModel) {
    return (
      <Card className="neural-border transition-neural">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Neural Model Uploaded
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg gradient-quantum">
              <div className="flex items-center gap-3">
                <FileType className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">{uploadedModel.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(uploadedModel.size)} • {uploadedModel.framework}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="neural-border">
                Ready for Optimization
              </Badge>
            </div>
            
            <Button 
              onClick={() => {
                setUploadedModel(null);
                setUploadProgress(0);
              }}
              variant="outline" 
              className="w-full neural-border transition-neural hover:glow-primary"
            >
              Upload Different Model
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="neural-border transition-neural">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Neural Model Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-neural
              ${isDragging ? 'border-primary bg-primary/5 glow-primary' : 'border-muted neural-border'}
              ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-primary/50'}
            `}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full gradient-neural flex items-center justify-center quantum-glow">
                <Upload className="w-6 h-6 text-primary-foreground" />
              </div>
              
              <div>
                <p className="text-lg font-medium">
                  {isUploading ? 'Processing Neural Patterns...' : 'Upload Neural Network'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drop your model file here or click to browse
                </p>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    Analyzing neural architecture... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}
            </div>
          </div>

          <input
            id="file-input"
            type="file"
            accept=".h5,.hdf5,.pt,.pth,.onnx,.tflite"
            className="hidden"
            onChange={handleFileInput}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { ext: '.h5', framework: 'TensorFlow', color: 'bg-orange-500/20 text-orange-300' },
              { ext: '.pt', framework: 'PyTorch', color: 'bg-red-500/20 text-red-300' },
              { ext: '.onnx', framework: 'ONNX', color: 'bg-blue-500/20 text-blue-300' },
              { ext: '.tflite', framework: 'TensorFlow Lite', color: 'bg-green-500/20 text-green-300' }
            ].map((format) => (
              <div key={format.ext} className={`p-2 rounded text-center text-xs ${format.color}`}>
                <div className="font-mono font-bold">{format.ext}</div>
                <div className="text-xs opacity-75">{format.framework}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}