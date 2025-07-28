#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ASCII Art Banner
const banner = `
🧬 ███████╗██████╗  ██████╗ ██████╗ ███████╗███╗   ██║███████╗████████╗
   ██╔════╝██╔══██╗██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔════╝╚══██╔══╝
   ███████╗██████╔╝██║   ██║██████╔╝█████╗  ██╔██╗ ██║█████╗     ██║   
   ╚════██║██╔═══╝ ██║   ██║██╔══██╗██╔══╝  ██║╚██╗██║██╔══╝     ██║   
   ███████║██║     ╚██████╔╝██║  ██║███████╗██║ ╚████║███████╗   ██║   
   ╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚══════╝   ╚═╝   
                                                                        
   🔬 Convert ML models to ESP32-ready binaries v0.1.0
`;

program
  .name('sporenet')
  .description('🧠 Convert ML models to ESP32-ready binaries')
  .version('0.1.0');

program
  .command('build')
  .description('Upload and optimize a model for ESP32')
  .option('-m, --model <path>', 'Path to model file')
  .option('-f, --framework <type>', 'Model framework (tensorflow, onnx, pytorch)')
  .option('-t, --target <hardware>', 'Target hardware (esp32)')
  .option('--quantize', 'Enable model quantization (default: true)')
  .action(async (options) => {
    console.log(chalk.cyan(banner));
    console.log(chalk.green('\n🚀 Welcome to SporeNet CLI\n'));

    let answers = {};

    // Interactive prompts if not provided via CLI args
    if (!options.model || !options.framework || !options.target) {
      answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'framework',
          message: '🤖 What format is your model in?',
          choices: [
            { name: '🔥 TensorFlow (.h5, .pb, SavedModel)', value: 'tensorflow' },
            { name: '⚡ ONNX (.onnx)', value: 'onnx' },
            { name: '🔗 PyTorch (.pt, .pth)', value: 'pytorch' }
          ],
          when: !options.framework
        },
        {
          type: 'input',
          name: 'modelPath',
          message: '📁 Enter path to your model:',
          validate: (input) => {
            if (!fs.existsSync(input)) {
              return 'File does not exist. Please provide a valid path.';
            }
            return true;
          },
          when: !options.model
        },
        {
          type: 'list',
          name: 'hardware',
          message: '🔧 Target hardware?',
          choices: [
            { name: '📱 ESP32 (WiFi + Bluetooth)', value: 'esp32' },
            { name: '🚧 STM32 (coming soon)', value: 'stm32', disabled: true },
            { name: '🚧 Jetson Nano (coming soon)', value: 'jetson', disabled: true }
          ],
          when: !options.target
        },
        {
          type: 'confirm',
          name: 'quantize',
          message: '⚖️  Enable model quantization for better performance?',
          default: true,
          when: options.quantize === undefined
        }
      ]);
    }

    // Merge CLI options with interactive answers
    const config = {
      framework: options.framework || answers.framework,
      modelPath: options.model || answers.modelPath,
      hardware: options.target || answers.hardware,
      quantize: options.quantize !== undefined ? options.quantize : answers.quantize
    };

    console.log(chalk.blue('\n📊 Configuration:'));
    console.log(`   Framework: ${config.framework}`);
    console.log(`   Model: ${config.modelPath}`);
    console.log(`   Hardware: ${config.hardware}`);
    console.log(`   Quantization: ${config.quantize ? 'enabled' : 'disabled'}`);

    try {
      // Step 1: Convert and quantize model
      console.log(chalk.yellow('\n🔄 Step 1: Converting and quantizing model...'));
      const convertCmd = `python3 ${path.join(__dirname, '..', 'scripts', 'convert.py')} --model "${config.modelPath}" --framework ${config.framework} ${config.quantize ? '--quantize' : ''}`;
      execSync(convertCmd, { stdio: 'inherit' });

      // Step 2: Generate firmware
      console.log(chalk.yellow('\n🛠️  Step 2: Generating ESP32 firmware...'));
      const firmwareCmd = `python3 ${path.join(__dirname, '..', 'scripts', 'generate_firmware.py')} --target ${config.hardware}`;
      execSync(firmwareCmd, { stdio: 'inherit' });

      // Step 3: Compile firmware
      console.log(chalk.yellow('\n⚙️  Step 3: Compiling firmware binary...'));
      const firmwareDir = path.join(__dirname, '..', 'output', 'firmware');
      const buildCmd = config.hardware === 'esp32' ? 
        `cd ${firmwareDir} && idf.py build` :
        `make -C ${firmwareDir}`;
      execSync(buildCmd, { stdio: 'inherit' });

      console.log(chalk.green('\n✅ Success! Your model has been compiled to firmware.'));
      console.log(chalk.cyan('\n📦 Generated files:'));
      console.log(`   📄 Model: ${path.join(__dirname, '..', 'output', 'models', 'converted_model.tflite')}`);
      console.log(`   💾 Firmware: ${path.join(__dirname, '..', 'output', 'firmware', 'build', 'sporenet.bin')}`);
      
      console.log(chalk.magenta('\n🔥 Flash to ESP32:'));
      console.log(chalk.gray(`   sporenet flash -p /dev/ttyUSB0`));

    } catch (error) {
      console.error(chalk.red('\n❌ Build failed:'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('flash')
  .description('Flash compiled firmware to ESP32')
  .option('-p, --port <port>', 'Serial port (e.g., /dev/ttyUSB0, COM3)', '/dev/ttyUSB0')
  .option('-b, --baud <rate>', 'Baud rate', '115200')
  .action(async (options) => {
    console.log(chalk.cyan(banner));
    console.log(chalk.yellow('\n🔌 Flashing firmware to ESP32...\n'));

    const firmwarePath = path.join(__dirname, '..', 'output', 'firmware', 'build', 'sporenet.bin');
    
    if (!fs.existsSync(firmwarePath)) {
      console.error(chalk.red('❌ Firmware binary not found. Run `sporenet build` first.'));
      process.exit(1);
    }

    try {
      const flashCmd = `esptool.py --chip esp32 --port ${options.port} --baud ${options.baud} write_flash -z 0x1000 ${firmwarePath}`;
      execSync(flashCmd, { stdio: 'inherit' });
      console.log(chalk.green('\n✅ Firmware flashed successfully!'));
      console.log(chalk.cyan('🔗 Connect to serial monitor to see your model running.'));
    } catch (error) {
      console.error(chalk.red('\n❌ Flash failed:'));
      console.error(chalk.red('Make sure ESP32 is connected and esptool.py is installed.'));
      console.error(chalk.gray(`Error: ${error.message}`));
    }
  });

program
  .command('monitor')
  .description('Monitor ESP32 serial output')
  .option('-p, --port <port>', 'Serial port', '/dev/ttyUSB0')
  .option('-b, --baud <rate>', 'Baud rate', '115200')
  .action((options) => {
    console.log(chalk.cyan(banner));
    console.log(chalk.yellow(`\n📺 Monitoring ${options.port} at ${options.baud} baud...\n`));
    console.log(chalk.gray('Press Ctrl+C to exit\n'));

    try {
      const monitorCmd = `idf.py -p ${options.port} monitor`;
      execSync(monitorCmd, { stdio: 'inherit' });
    } catch (error) {
      // Fallback to basic serial monitor
      try {
        const fallbackCmd = `python3 -m serial.tools.miniterm ${options.port} ${options.baud}`;
        execSync(fallbackCmd, { stdio: 'inherit' });
      } catch (fallbackError) {
        console.error(chalk.red('❌ Could not start serial monitor.'));
        console.error(chalk.gray('Install pyserial: pip install pyserial'));
      }
    }
  });

program
  .command('init')
  .description('Initialize a new SporeNet project')
  .argument('<project-name>', 'Name of the project')
  .action((projectName) => {
    console.log(chalk.cyan(banner));
    console.log(chalk.green(`\n🌱 Initializing SporeNet project: ${projectName}\n`));

    const projectPath = path.join(process.cwd(), projectName);
    
    if (fs.existsSync(projectPath)) {
      console.error(chalk.red(`❌ Directory ${projectName} already exists.`));
      process.exit(1);
    }

    // Create project structure
    fs.mkdirSync(projectPath);
    fs.mkdirSync(path.join(projectPath, 'models'));
    fs.mkdirSync(path.join(projectPath, 'data'));
    
    // Create basic config file
    const config = {
      name: projectName,
      version: "1.0.0",
      target: "esp32",
      quantization: true,
      models: []
    };
    
    fs.writeFileSync(
      path.join(projectPath, 'sporenet.config.json'),
      JSON.stringify(config, null, 2)
    );

    // Create README
    const readme = `# ${projectName}

SporeNet project for converting ML models to ESP32 firmware.

## Usage

\`\`\`bash
# Place your model in ./models/
# Run conversion
sporenet build -m models/your_model.h5 -f tensorflow -t esp32

# Flash to device
sporenet flash -p /dev/ttyUSB0
\`\`\`
`;
    
    fs.writeFileSync(path.join(projectPath, 'README.md'), readme);

    console.log(chalk.green('✅ Project initialized successfully!'));
    console.log(chalk.cyan('\n📁 Created:'));
    console.log(`   ${projectName}/`);
    console.log(`   ├── models/          # Place your ML models here`);
    console.log(`   ├── data/            # Training/test data`);
    console.log(`   ├── sporenet.config.json`);
    console.log(`   └── README.md`);
    console.log(chalk.yellow(`\n🚀 Next steps:`));
    console.log(`   cd ${projectName}`);
    console.log(`   # Add your model to ./models/`);
    console.log(`   sporenet build`);
  });

program.parse();