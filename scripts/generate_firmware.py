#!/usr/bin/env python3
"""
SporeNet Firmware Generator
Generates ESP32 firmware with TensorFlow Lite Micro integration
"""

import argparse
import os
import shutil
from pathlib import Path
import textwrap

def create_esp32_firmware(output_dir, model_path="converted_model.tflite"):
    """Generate ESP32 firmware with TFLite Micro"""
    
    print(f"🛠️  Generating ESP32 firmware in {output_dir}")
    
    # Create directory structure
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(f"{output_dir}/main", exist_ok=True)
    os.makedirs(f"{output_dir}/components", exist_ok=True)
    
    # Generate CMakeLists.txt (main)
    cmakelists_content = '''cmake_minimum_required(VERSION 3.16)

include($ENV{IDF_PATH}/tools/cmake/project.cmake)

project(sporenet)
'''
    
    with open(f"{output_dir}/CMakeLists.txt", "w") as f:
        f.write(cmakelists_content)
    
    # Generate main CMakeLists.txt
    main_cmake_content = '''idf_component_register(
    SRCS "main.cpp" "model_data.cpp"
    INCLUDE_DIRS "."
    REQUIRES esp_timer
)
'''
    
    with open(f"{output_dir}/main/CMakeLists.txt", "w") as f:
        f.write(main_cmake_content)
    
    # Generate main.cpp
    main_cpp_content = '''#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_system.h"
#include "esp_log.h"
#include "esp_timer.h"

// TensorFlow Lite Micro includes
#include "tensorflow/lite/micro/micro_error_reporter.h"
#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/micro/micro_mutable_op_resolver.h"
#include "tensorflow/lite/schema/schema_generated.h"

#include "model_data.h"

static const char *TAG = "SporeNet";

// TensorFlow Lite Micro globals
namespace {
    tflite::ErrorReporter* error_reporter = nullptr;
    const tflite::Model* model = nullptr;
    tflite::MicroInterpreter* interpreter = nullptr;
    TfLiteTensor* input = nullptr;
    TfLiteTensor* output = nullptr;
    
    // Memory arena for model
    constexpr int kTensorArenaSize = 60 * 1024;  // 60KB - adjust as needed
    alignas(16) uint8_t tensor_arena[kTensorArenaSize];
}

void setup_model() {
    // Set up logging
    static tflite::MicroErrorReporter micro_error_reporter;
    error_reporter = &micro_error_reporter;
    
    // Map the model into a usable data structure
    model = tflite::GetModel(sporenet_model_data);
    if (model->version() != TFLITE_SCHEMA_VERSION) {
        ESP_LOGE(TAG, "Model schema version %d not equal to supported version %d",
                 model->version(), TFLITE_SCHEMA_VERSION);
        return;
    }
    
    // Build an interpreter to run the model
    static tflite::MicroMutableOpResolver<10> resolver;
    
    // Add operations that your model uses
    resolver.AddFullyConnected();
    resolver.AddConv2D();
    resolver.AddDepthwiseConv2D();
    resolver.AddReshape();
    resolver.AddSoftmax();
    resolver.AddLogistic();
    resolver.AddRelu();
    resolver.AddMean();
    resolver.AddPad();
    resolver.AddMaxPool2D();
    
    // Build the interpreter
    static tflite::MicroInterpreter static_interpreter(
        model, resolver, tensor_arena, kTensorArenaSize, error_reporter);
    interpreter = &static_interpreter;
    
    // Allocate memory for the model's tensors
    TfLiteStatus allocate_status = interpreter->AllocateTensors();
    if (allocate_status != kTfLiteOk) {
        ESP_LOGE(TAG, "AllocateTensors() failed");
        return;
    }
    
    // Get pointers to the input and output tensors
    input = interpreter->input(0);
    output = interpreter->output(0);
    
    ESP_LOGI(TAG, "Model loaded successfully!");
    ESP_LOGI(TAG, "Input shape: [%d, %d, %d, %d]", 
             input->dims->data[0], input->dims->data[1], 
             input->dims->data[2], input->dims->data[3]);
    ESP_LOGI(TAG, "Output shape: [%d, %d]", 
             output->dims->data[0], output->dims->data[1]);
    ESP_LOGI(TAG, "Arena used: %d bytes", interpreter->arena_used_bytes());
}

void run_inference() {
    if (!interpreter || !input || !output) {
        ESP_LOGE(TAG, "Model not initialized");
        return;
    }
    
    // Fill input tensor with sample data (replace with your sensor data)
    // This is just example code - adapt for your specific model input
    for (int i = 0; i < input->bytes; i++) {
        input->data.int8[i] = (i % 256) - 128;  // Sample data
    }
    
    // Run inference
    int64_t start_time = esp_timer_get_time();
    TfLiteStatus invoke_status = interpreter->Invoke();
    int64_t end_time = esp_timer_get_time();
    
    if (invoke_status != kTfLiteOk) {
        ESP_LOGE(TAG, "Inference failed");
        return;
    }
    
    // Process output
    ESP_LOGI(TAG, "Inference completed in %lld microseconds", end_time - start_time);
    
    // Print output values (adapt based on your model)
    ESP_LOGI(TAG, "Output values:");
    for (int i = 0; i < output->dims->data[1]; i++) {
        float value;
        if (output->type == kTfLiteInt8) {
            value = (output->data.int8[i] - output->params.zero_point) * output->params.scale;
        } else {
            value = output->data.f[i];
        }
        ESP_LOGI(TAG, "  Output[%d]: %.6f", i, value);
    }
}

extern "C" void app_main(void) {
    ESP_LOGI(TAG, "🧬 SporeNet ESP32 Firmware v0.1.0");
    ESP_LOGI(TAG, "Model size: %d bytes", sporenet_model_data_len);
    
    // Initialize the model
    setup_model();
    
    // Main inference loop
    while (1) {
        run_inference();
        vTaskDelay(pdMS_TO_TICKS(5000));  // Run inference every 5 seconds
    }
}
'''
    
    with open(f"{output_dir}/main/main.cpp", "w") as f:
        f.write(main_cpp_content)
    
    # Generate model_data.cpp (will be replaced with actual model)
    model_data_cpp = '''#include "model_data.h"

// Placeholder model data - will be replaced by convert.py
const unsigned char sporenet_model_data[] = {
    0x18, 0x00, 0x00, 0x00, 0x54, 0x46, 0x4c, 0x33  // TFLite header
};

const int sporenet_model_data_len = sizeof(sporenet_model_data);
'''
    
    with open(f"{output_dir}/main/model_data.cpp", "w") as f:
        f.write(model_data_cpp)
    
    # Generate model_data.h
    model_data_h = '''#ifndef MODEL_DATA_H
#define MODEL_DATA_H

#include <stdint.h>

extern const unsigned char sporenet_model_data[];
extern const int sporenet_model_data_len;

#endif  // MODEL_DATA_H
'''
    
    with open(f"{output_dir}/main/model_data.h", "w") as f:
        f.write(model_data_h)
    
    # Generate sdkconfig with TensorFlow Lite optimizations
    sdkconfig_content = '''#
# SporeNet ESP32 Configuration
#

# Compiler optimizations
CONFIG_COMPILER_OPTIMIZATION_SIZE=y
CONFIG_COMPILER_OPTIMIZATION_ASSERTIONS_DISABLE=y

# Memory optimizations
CONFIG_ESP32_SPIRAM_SUPPORT=y
CONFIG_SPIRAM_USE_MALLOC=y
CONFIG_SPIRAM_TYPE_AUTO=y

# FreeRTOS optimizations
CONFIG_FREERTOS_HZ=1000

# Logging
CONFIG_LOG_DEFAULT_LEVEL_INFO=y

# TensorFlow Lite Micro optimizations
CONFIG_TFLM_ESP_KERNERLS=y
'''
    
    with open(f"{output_dir}/sdkconfig", "w") as f:
        f.write(sdkconfig_content)
    
    print("✅ ESP32 firmware structure generated")
    
    # If model exists, integrate it
    if os.path.exists(model_path):
        integrate_model(output_dir, model_path)

def integrate_model(firmware_dir, model_path):
    """Integrate the converted model into firmware"""
    print(f"🔗 Integrating model: {model_path}")
    
    # Read the model file
    with open(model_path, 'rb') as f:
        model_data = f.read()
    
    # Generate model_data.cpp with actual model
    model_cpp_content = f'''#include "model_data.h"

// SporeNet model data - auto-generated
// Model size: {len(model_data)} bytes

const unsigned char sporenet_model_data[] = {{
'''
    
    # Add model data as hex array
    for i, byte in enumerate(model_data):
        if i % 16 == 0:
            model_cpp_content += "\n    "
        model_cpp_content += f"0x{byte:02x},"
    
    model_cpp_content += f'''
}};

const int sporenet_model_data_len = {len(model_data)};
'''
    
    # Write the updated model file
    with open(f"{firmware_dir}/main/model_data.cpp", "w") as f:
        f.write(model_cpp_content)
    
    print(f"✅ Model integrated: {len(model_data)} bytes")

def create_build_script(output_dir):
    """Create build script for easy compilation"""
    
    build_script = '''#!/bin/bash
# SporeNet Build Script

echo "🔨 Building SporeNet firmware..."

# Check if ESP-IDF is set up
if [ -z "$IDF_PATH" ]; then
    echo "❌ ESP-IDF not found. Please set up ESP-IDF first:"
    echo "   https://docs.espressif.com/projects/esp-idf/en/latest/esp32/get-started/"
    exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
idf.py clean

# Configure and build
echo "⚙️  Configuring project..."
idf.py menuconfig --defaults sdkconfig

echo "🔨 Building firmware..."
idf.py build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📦 Firmware binary: build/sporenet.bin"
    echo ""
    echo "🔥 Flash to ESP32:"
    echo "   idf.py -p /dev/ttyUSB0 flash monitor"
    echo ""
    echo "   Or use esptool directly:"
    echo "   esptool.py --chip esp32 --port /dev/ttyUSB0 write_flash 0x1000 build/sporenet.bin"
else
    echo "❌ Build failed!"
    exit 1
fi
'''
    
    script_path = f"{output_dir}/build.sh"
    with open(script_path, "w") as f:
        f.write(build_script)
    
    # Make executable
    os.chmod(script_path, 0o755)
    print(f"✅ Build script created: {script_path}")

def create_readme(output_dir):
    """Create README for the firmware"""
    
    readme_content = '''# SporeNet ESP32 Firmware

Auto-generated firmware for running ML models on ESP32 using TensorFlow Lite Micro.

## Structure

```
firmware/
├── CMakeLists.txt          # Main CMake configuration
├── sdkconfig              # ESP-IDF configuration
├── build.sh               # Build script
├── main/
│   ├── main.cpp           # Main application code
│   ├── model_data.cpp     # Your ML model data
│   ├── model_data.h       # Model header
│   └── CMakeLists.txt     # Component CMake
└── build/                 # Build output (created during build)
    └── sporenet.bin       # Final firmware binary
```

## Building

### Prerequisites
- ESP-IDF v4.4 or later
- ESP32 development board

### Build Steps

1. Set up ESP-IDF environment:
   ```bash
   . $HOME/esp/esp-idf/export.sh
   ```

2. Build the firmware:
   ```bash
   ./build.sh
   ```

3. Flash to ESP32:
   ```bash
   idf.py -p /dev/ttyUSB0 flash monitor
   ```

## Customization

### Adding Sensor Input
Replace the sample data in `main.cpp` with your sensor readings:

```cpp
// In run_inference() function
// Replace this sample data loop:
for (int i = 0; i < input->bytes; i++) {
    input->data.int8[i] = (i % 256) - 128;  // Sample data
}

// With your sensor data:
read_sensor_data(input->data.int8, input->bytes);
```

### Model Operations
If your model uses different operations, update the resolver in `setup_model()`:

```cpp
resolver.AddYourOperation();
```

### Memory Optimization
Adjust `kTensorArenaSize` in `main.cpp` based on your model requirements:

```cpp
constexpr int kTensorArenaSize = 60 * 1024;  // Increase if needed
```

## Monitoring

Connect to serial monitor to see inference results:
```bash
idf.py monitor
```

## Troubleshooting

### Build Errors
- Ensure ESP-IDF is properly installed and sourced
- Check that your model operations are added to the resolver
- Verify memory arena size is sufficient

### Runtime Errors
- Monitor serial output for error messages
- Check model tensor shapes match your input data
- Verify model was converted correctly

## Performance Tips

1. **Quantization**: Use INT8 quantized models for better performance
2. **Memory**: Minimize tensor arena size to reduce RAM usage
3. **Frequency**: Adjust inference frequency based on your use case
4. **Operations**: Only include operations your model actually uses
'''
    
    with open(f"{output_dir}/README.md", "w") as f:
        f.write(readme_content)
    
    print("✅ README generated")

def main():
    parser = argparse.ArgumentParser(
        description="Generate ESP32 firmware for SporeNet"
    )
    parser.add_argument('--target', '-t', 
                       choices=['esp32', 'stm32'], 
                       default='esp32',
                       help='Target hardware platform')
    parser.add_argument('--output', '-o', 
                       default='firmware',
                       help='Output directory for firmware')
    parser.add_argument('--model', '-m',
                       default='converted_model.tflite',
                       help='Path to converted model')
    
    args = parser.parse_args()
    
    print(f"🛠️  SporeNet Firmware Generator v0.1.0")
    print(f"🎯 Target: {args.target}")
    print(f"📁 Output: {args.output}")
    print()
    
    if args.target == 'esp32':
        create_esp32_firmware(args.output, args.model)
        create_build_script(args.output)
        create_readme(args.output)
        
        print(f"\n🎉 ESP32 firmware generated successfully!")
        print(f"📁 Location: {args.output}/")
        print(f"\n🚀 Next steps:")
        print(f"   cd {args.output}")
        print(f"   ./build.sh")
        print(f"   idf.py -p /dev/ttyUSB0 flash monitor")
        
    elif args.target == 'stm32':
        print("🚧 STM32 support coming soon!")
        print("   For now, use ESP32 target")
    
    else:
        print(f"❌ Unsupported target: {args.target}")

if __name__ == '__main__':
    main()