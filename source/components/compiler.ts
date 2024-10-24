import * as path from "path";
import { CheckFileExistence, CopyFile, DownloadFile, MakeDirectory, ReadJSONFile } from "./files";import { ConsoleMessage } from "../utils";
import { exec } from "child_process";
import { ConfigType } from "../config";
import { PLATFORMS } from "./setup";
import { mkdir } from "fs";
import { PromisifiedSpawn } from "./exec";
import { ChoiceValueToNames } from "./prompts/setup";

async function Compile () {
    const cwd = process.cwd();
    try {
        await CheckFileExistence(path.join(cwd, 'sea-config.json'));
        
        await CheckFileExistence(path.join(cwd, 'nodeseacomp.json'));
        const Config: ConfigType = await ReadJSONFile(path.join(cwd, 'nodeseacomp.json'))
        const SeaConfig = await ReadJSONFile(path.join(cwd, 'sea-config.json'))
        await MakeDirectory(path.dirname(SeaConfig.output))
        try {
            ConsoleMessage.normal('Creating blob file')
            await PromisifiedSpawn("node --experimental-sea-config sea-config.json")
            ConsoleMessage.success(`Wrote single executable preparation blob to ${SeaConfig.output}`)

            const platfroms = Config.platforms
            for (const platform of platfroms) {
                const platformNames = await ChoiceValueToNames()
                const platformName = platformNames[platform]
                const platformBinName = PLATFORMS[platform].binName
                let extractedBinPath = path.resolve(Config.cachePath, 'extracted', Config.version, platform, 'bin', platformBinName)
                if (platform == 'win32') {
                    extractedBinPath = path.resolve(Config.cachePath, 'extracted', Config.version, platform, platformBinName)
                }
                const extension = path.extname(extractedBinPath)
                await MakeDirectory(Config.buildPath)
                const fileName = path.resolve(Config.buildPath, `node-${platform}${extension}`)
                await CopyFile(extractedBinPath, fileName)
                ConsoleMessage.success(`${platformName} binary successfully copied in build directory`)
                await PromisifiedSpawn(`npx postject ${fileName} NODE_SEA_BLOB ${SeaConfig.output} --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`)
                ConsoleMessage.success(`Successfully compiled ${platformName} binary`)
            }
        } catch (error) {
            console.log(error)
        }
        

    } catch (error) {
        ConsoleMessage.error('Make the init procedure before build');
    }
    
}

export {
    Compile
}