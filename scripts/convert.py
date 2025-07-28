#!/usr/bin/env python3
"""
SporeNet Model Converter
Converts and quantizes ML models for ESP32 deployment
"""

import argparse
import os
import sys
import numpy as np
from pathlib import Path
import shutil

def setup_imports():
    """Import required libraries with helpful error messages"""
    global tf, torch, onnx
    
    try:
        import tensorflow as tf
    except ImportError:
        print("❌ TensorFlow not found. Install with: pip install tensorflow")
        sys.exit(1)
    
    # Optional imports
    try:
        import torch
        import torchvision
    except ImportError:
        torch = None
        print("⚠️  PyTorch not found. PyTorch models won't be supported.")
    
    try:
        import onnx
        import onnx2tf
    except ImportError:
        onnx = None
        print("⚠️  ONNX not found. ONNX models won't be supported.")

def convert_tensorflow_model(model_path, output_path, quantize=True):
    """Convert TensorFlow model to TFLite"""
    print(f"🔥 Converting TensorFlow model: {model_path}")
    
    # Load model based on format
    if model_path.endswith('.h5'):
        model = tf.keras.models.load_model(model_path)
    elif model_path.endswith('.pb') or os.path.isdir(model_path):
        # Handle SavedModel format
        model = tf.saved_model.load(model_path)
        # Convert to concrete function
        if hasattr(model, 'signatures'):
            concrete_func = model.signatures[tf.saved_model.DEFAULT_SERVING_SIGNATURE_DEF_KEY]
        else:
            concrete_func = model
        converter = tf.lite.TFLiteConverter.from_concrete_functions([concrete_func])
    else:
        raise ValueError(f"Unsupported TensorFlow model format: {model_path}")
    
    if model_path.endswith('.h5'):
        converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # Configure optimization
    if quantize:
        print("⚖️  Enabling quantization optimizations...")
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        
        # Try to enable integer quantization if representative dataset available
        try:
            # Create a representative dataset (dummy data)
            if hasattr(model, 'input_shape') and model.input_shape:
                input_shape = model.input_shape[1:]  # Remove batch dimension
                
                def representative_dataset():
                    for _ in range(100):
                        # Generate random data matching input shape
                        data = np.random.random((1,) + input_shape).astype(np.float32)
                        yield [data]
                
                converter.representative_dataset = representative_dataset
                converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
                converter.inference_input_type = tf.int8
                converter.inference_output_type = tf.int8
                print("✅ Integer quantization enabled")
        except Exception as e:
            print(f"⚠️  Integer quantization failed, using default: {e}")
    
    # Convert model
    try:
        tflite_model = converter.convert()
        print("✅ Model conversion successful")
    except Exception as e:
        print(f"❌ Conversion failed: {e}")
        # Fallback without quantization
        print("🔄 Retrying without aggressive optimizations...")
        converter.optimizations = []
        tflite_model = converter.convert()
        print("✅ Model converted (without quantization)")
    
    # Save model
    with open(output_path, 'wb') as f:
        f.write(tflite_model)
    
    # Print model info
    interpreter = tf.lite.Interpreter(model_content=tflite_model)
    interpreter.allocate_tensors()
    
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    print(f"📊 Model Info:")
    print(f"   Size: {len(tflite_model)} bytes ({len(tflite_model)/1024:.1f} KB)")
    print(f"   Input shape: {input_details[0]['shape']}")
    print(f"   Output shape: {output_details[0]['shape']}")
    print(f"   Input type: {input_details[0]['dtype']}")
    print(f"   Output type: {output_details[0]['dtype']}")

def convert_pytorch_model(model_path, output_path, quantize=True):
    """Convert PyTorch model to TFLite via ONNX"""
    if torch is None:
        raise ImportError("PyTorch not available")
    
    print(f"🔗 Converting PyTorch model: {model_path}")
    
    # Load PyTorch model
    model = torch.load(model_path, map_location='cpu')
    model.eval()
    
    # Convert to ONNX first
    onnx_path = output_path.replace('.tflite', '.onnx')
    
    # Create dummy input (you may need to adjust this based on your model)
    # This is a common issue - we need to know the input shape
    dummy_input = torch.randn(1, 3, 224, 224)  # Adjust as needed
    
    print("🔄 Converting to ONNX intermediate format...")
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        export_params=True,
        opset_version=11,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output']
    )
    
    # Convert ONNX to TFLite
    convert_onnx_model(onnx_path, output_path, quantize)
    
    # Cleanup intermediate file
    os.remove(onnx_path)

def convert_onnx_model(model_path, output_path, quantize=True):
    """Convert ONNX model to TFLite"""
    if onnx is None:
        raise ImportError("ONNX not available")
    
    print(f"⚡ Converting ONNX model: {model_path}")
    
    try:
        # Convert ONNX to TensorFlow SavedModel first
        tf_model_path = output_path.replace('.tflite', '_tf_model')
        
        # Use onnx-tf or onnx2tf for conversion
        import onnx2tf
        onnx2tf.convert(
            input_onnx_file_path=model_path,
            output_folder_path=tf_model_path
        )
        
        # Now convert TF model to TFLite
        converter = tf.lite.TFLiteConverter.from_saved_model(tf_model_path)
        
        if quantize:
            converter.optimizations = [tf.lite.Optimize.DEFAULT]
        
        tflite_model = converter.convert()
        
        with open(output_path, 'wb') as f:
            f.write(tflite_model)
        
        # Cleanup
        shutil.rmtree(tf_model_path)
        print("✅ ONNX model converted successfully")
        
    except Exception as e:
        print(f"❌ ONNX conversion failed: {e}")
        print("💡 Consider using onnx2tf: pip install onnx2tf")
        raise

def generate_model_header(tflite_path, header_path):
    """Generate C header file with model data"""
    print(f"📄 Generating C header: {header_path}")
    
    with open(tflite_path, 'rb') as f:
        model_data = f.read()
    
    header_content = f"""// Auto-generated model header for SporeNet
// Model size: {len(model_data)} bytes

#ifndef SPORENET_MODEL_H
#define SPORENET_MODEL_H

#include <stdint.h>

// Model data
extern const unsigned char sporenet_model_data[];
extern const int sporenet_model_data_len;

const unsigned char sporenet_model_data[] = {{
"""
    
    # Add model data as hex array
    for i, byte in enumerate(model_data):
        if i % 16 == 0:
            header_content += "\n  "
        header_content += f"0x{byte:02x},"
    
    header_content += f"""
}};

const int sporenet_model_data_len = {len(model_data)};

#endif // SPORENET_MODEL_H
"""
    
    with open(header_path, 'w') as f:
        f.write(header_content)
    
    print(f"✅ Header generated: {len(model_data)} bytes")

def main():
    parser = argparse.ArgumentParser(
        description="Convert ML models to TensorFlow Lite for ESP32 deployment"
    )
    parser.add_argument('--model', '-m', required=True, help='Path to input model')
    parser.add_argument('--framework', '-f', 
                       choices=['tensorflow', 'pytorch', 'onnx'], 
                       required=True, help='Model framework')
    parser.add_argument('--output', '-o', 
                       default='converted_model.tflite', 
                       help='Output TFLite file path')
    parser.add_argument('--quantize', action='store_true', default=True,
                       help='Enable model quantization')
    parser.add_argument('--no-quantize', dest='quantize', action='store_false',
                       help='Disable model quantization')
    parser.add_argument('--generate-header', action='store_true',
                       help='Generate C header file')
    
    args = parser.parse_args()
    
    # Setup imports
    setup_imports()
    
    # Check if input file exists
    if not os.path.exists(args.model):
        print(f"❌ Model file not found: {args.model}")
        sys.exit(1)
    
    print(f"🧬 SporeNet Model Converter v0.1.0")
    print(f"📥 Input: {args.model}")
    print(f"📤 Output: {args.output}")
    print(f"🔧 Framework: {args.framework}")
    print(f"⚖️  Quantization: {'enabled' if args.quantize else 'disabled'}")
    print()
    
    try:
        # Convert based on framework
        if args.framework == 'tensorflow':
            convert_tensorflow_model(args.model, args.output, args.quantize)
        elif args.framework == 'pytorch':
            convert_pytorch_model(args.model, args.output, args.quantize)
        elif args.framework == 'onnx':
            convert_onnx_model(args.model, args.output, args.quantize)
        
        print(f"✅ Model converted successfully: {args.output}")
        
        # Generate C header if requested
        if args.generate_header:
            header_path = args.output.replace('.tflite', '.h')
            generate_model_header(args.output, header_path)
        
        # Provide next steps
        print(f"\n🚀 Next steps:")
        print(f"   1. Model ready: {args.output}")
        print(f"   2. Run: sporenet build (if not already done)")
        print(f"   3. Flash: sporenet flash -p /dev/ttyUSB0")
        
    except Exception as e:
        print(f"❌ Conversion failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()