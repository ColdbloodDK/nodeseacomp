const { MultiSelect, Input, BooleanPrompt, Confirm } = require('enquirer');
import { tmpdir} from "os";
import * as path from "path";


const tempPath = path.join(tmpdir(),'nodeseacomp')

type Platforms = Map<string, NodeJS.Platform>

type Choice = {
    name: string,
    value: NodeJS.Platform
}

type Choices = Choice[]

const choices: Choices = [
    { name: 'Linux', value: 'linux' },
    { name: 'Windows', value: 'win32' },
    { name: 'MacOS', value: 'darwin' },
]

async function ChoiceValueToNames() {
    const result = {};

    await Promise.all(choices.map(async (choice) => {
        result[choice.value] = choice.name;
    }));

    return result;
}



async function SelectPlatformPromt (preselect?: Array<NodeJS.Platform>){
    return new Promise<Array<NodeJS.Platform>>((resolve, reject) => {
        
        // Value to Name function because enquirer is dumb and don't accept values as initial values
        
        const initial = choices
        .filter((choice) => preselect?.includes(choice.value))
        .map(choice => choice.name);


        const PlatformPrompt = new MultiSelect({
            name: 'value',
            message: 'Targeted platforms',
            hint: "(Press [space] to select, [a] to toggle, [i] to invert)",
            initial: initial || [],
            // Choices values are the same of os.platform
            choices: [
              { name: 'Linux', value: 'linux' },
              { name: 'Windows', value: 'win32' },
              { name: 'MacOS', value: 'darwin' },
            ],
            
            result(names) {
              return names.map(name => this.choices.find(choice => choice.name === name).value);
            },
          
            validate(value) {
              return value.length === 0 ? 'Select at least one option.' : true;
            },
        });

        PlatformPrompt.run().then((platforms: Platforms)  => {

            const platformArray = Array.from(platforms.values());
            resolve(platformArray)
        }).catch(reject);
    })
}

async function BinTempPathInput (ConfigTempPath){
    
    const prompt = new Input({
        message: 'Where do you want to place the other OSes node binaries?',
        initial: ConfigTempPath || tempPath
    });

    return new Promise<string>((resolve, reject) => {
        prompt.run()
        .then(chosenPath =>{
            resolve(chosenPath)
        }).catch(reject);
    })
}

async function BuildPathInput (ConfigBuildPath){
    
    const prompt = new Input({
        message: 'Where do you want to configure the build folder?',
        initial:  ConfigBuildPath || './build/bin'
    });

    return new Promise<string>((resolve, reject) => {
        prompt.run()
        .then(chosenPath =>{
            resolve(chosenPath)
        }).catch(reject);
    })
}
async function NodeJSVersion() {
    
    const prompt = new Input({
        message: 'NodeJS version for binaries to download',
        initial: process.version
    });

    return new Promise<string>((resolve, reject) => {
        prompt.run()
        .then(chosenVersion =>{
            resolve(chosenVersion)
        }).catch(reject);
    })
}

async function MainFilePathInput (MainFilePath): Promise<string> {
    const prompt = new Input({
        message: 'What is the main/index file of your project?',
        initial: MainFilePath
    });

    return new Promise<string>((resolve, reject) => {
        prompt.run()
        .then(chosenPath =>{
            resolve(chosenPath)
        }).catch(reject);
    })
}

async function OutFilePathInput (BlobFilePath): Promise<string> {
    const prompt = new Input({
        message: 'What is the output file of blob generation?',
        initial: BlobFilePath
    });

    return new Promise<string>((resolve, reject) => {
        prompt.run()
        .then(chosenPath =>{
            resolve(chosenPath)
        }).catch(reject);
    })
}

async function RedownloadBinaries(initial) {
    return new Promise<void>((resolve, reject) => {

        const prompt = new BooleanPrompt({
        name: 'answer',
        message: 'Do you want to re-download the binaries?',
        initial: initial || false
        });

        prompt.run()
        .then(resolve)
        .catch(reject);
    })
}

function CreateSEAConfigFilePropmt() {
    return new Promise<boolean>((resolve, reject) => {
        const ConfirmPromt = new Confirm({
            name: 'question',
            message: 'Do you want to automatically create the sea-config.json file?',
            initial: true
        });
        ConfirmPromt.run()
        .then(resolve)
        .catch(reject);
    })
}

export {
    // Types
    Platforms,
    // Functions
    SelectPlatformPromt,
    BinTempPathInput,
    NodeJSVersion,
    MainFilePathInput,
    OutFilePathInput,
    ChoiceValueToNames,
    RedownloadBinaries,
    BuildPathInput,
    CreateSEAConfigFilePropmt

}

