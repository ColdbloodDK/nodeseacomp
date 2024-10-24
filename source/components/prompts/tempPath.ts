import { platform, tmpdir} from "os";
import path = require("path");
const { Input, BooleanPrompt } = require('enquirer');
const tempPath = path.join(tmpdir(),'nodeseacomp')

async function InputBinTempPath (ConfigTempPath){
    
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

export {
    InputBinTempPath
}