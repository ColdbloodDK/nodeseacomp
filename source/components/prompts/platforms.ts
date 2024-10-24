const { MultiSelect } = require('enquirer');

type Platforms = Map<string, NodeJS.Platform>

type Choice = {
    name: string,
    value: NodeJS.Platform
}

type Choices = Choice[]

async function SelectPlatformPromt (preselect?: Array<NodeJS.Platform>){
    return new Promise<Array<NodeJS.Platform>>((resolve, reject) => {
        const choices: Choices = [
            { name: 'Linux', value: 'linux' },
            { name: 'Windows', value: 'win32' },
            { name: 'MacOS', value: 'darwin' },
        ]
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

export {
    // Types
    Platforms,
    // Functions
    SelectPlatformPromt
}