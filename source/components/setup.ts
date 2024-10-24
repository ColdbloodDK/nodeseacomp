import * as path from 'path'
import { SelectPlatformPromt, BinTempPathInput, MainFilePathInput, OutFilePathInput, NodeJSVersion, ChoiceValueToNames, RedownloadBinaries, CreateSEAConfigFilePropmt, BuildPathInput } from "./prompts/setup";
import { ConfigType } from '../config'
import { ConsoleMessage } from "../utils";
import { CheckFileExistence, DownloadFile, MakeDirectory, ReadJSONFile, WriteJSONFile } from './files';

import { extractArchive } from './decompress';

const cwd = process.cwd();
const ConfigFilePath = path.join(cwd, 'nodeseacomp.json')
const SEACONFIG_PATH = path.join(cwd, 'sea-config.json')

const PLATFORMS = {
    win32: {
        naming: "node-VERSION-win-x64.zip",
        binName: "node.exe"
    },
    linux: {
        naming: "node-VERSION-linux-x64.tar.xz",
        binName: "node"
    },
    darwin: {
        naming: "node-VERSION-darwin-x64.tar.xz",
        binName: "node"
    }
}

async function Setup() {
    const Config: ConfigType = await ReadJSONFile(ConfigFilePath) || null
    const firstTimeSetup = (Config !== null && typeof Config === 'object' && Object.keys(Config).length === 0)

    try {
        Config.buildPath = await BuildPathInput(Config.buildPath)
        Config.platforms = await SelectPlatformPromt(Config.platforms)
        

        Config.cachePath = await BinTempPathInput(Config.cachePath)
        

        Config.version = await NodeJSVersion()
        

        try {
            await CheckFileExistence(SEACONFIG_PATH);
        } catch (error) {
            if (error.code === 'ENOENT') {
                const PackageJSON = await ReadJSONFile(path.join(cwd, 'package.json'))
                const SEACONFIG: any = {}
                const create = await CreateSEAConfigFilePropmt()
                if (create) {
                    SEACONFIG.main = await MainFilePathInput(PackageJSON.main)
                    

                    SEACONFIG.output = await OutFilePathInput('./intermediate/sea.blob')
                    

                    await WriteJSONFile(SEACONFIG_PATH, SEACONFIG);
                }
                return
            }
        }
        const platformNames = await ChoiceValueToNames()
        const downloadPrompt = firstTimeSetup ? true : await RedownloadBinaries(false);

        for (const platformKeyname of Config.platforms) {
            const platformName = platformNames[platformKeyname]
            const platform = PLATFORMS[platformKeyname]
            const archiveName = platform.naming.replace("VERSION", Config.version)
            const url = `https://nodejs.org/dist/${Config.version}/${archiveName}`
            const downloadDir = path.resolve(Config.cachePath, 'archive', Config.version)
            const downloadPath = path.resolve(downloadDir, archiveName);
            const extractedPath = path.resolve(Config.cachePath, 'extracted',Config.version, platformKeyname)
            await MakeDirectory(downloadDir)
            await MakeDirectory(extractedPath)
            try {
                
                try {
                    await CheckFileExistence(downloadPath)
                    if (downloadPrompt) {
                        await DownloadFile(url, downloadPath)
                        ConsoleMessage.success(`Successfully re-downloaded ${platformName} ${Config.version} NodeJS binary`)
                        

                        try {
                            await extractArchive(downloadPath, extractedPath, true)
                            ConsoleMessage.success(`Successfully decompressed ${platformName} ${Config.version} NodeJS binary`)
                        } catch (error) {
                            ConsoleMessage.error(`Error decompressing ${platformName} ${Config.version} NodeJS binary`, error)
                        }
                        
                    }
                    
                } catch (error) {
                    await DownloadFile(url, downloadPath)
                    ConsoleMessage.success(`Successfully downloaded ${platformName} ${Config.version} NodeJS binary`)
                    
                    try {
                        await extractArchive(downloadPath, extractedPath, true)
                        ConsoleMessage.success(`Successfully decompressed ${platformName} ${Config.version} NodeJS binary`)
                    } catch (error) {
                        ConsoleMessage.error(`Error decompressing ${platformName} ${Config.version} NodeJS binary`, error)
                    }
                    
                }
                

            } catch (error) {
                ConsoleMessage.error(`Error downloading ${platformName} ${Config.version} NodeJS binary`)
                
            }

            
        }
        
        // Setup finished
        await WriteJSONFile(ConfigFilePath, Config)
        
        ConsoleMessage.success("Config updated successfully")
        
    } catch (error) {
        if (error) ConsoleMessage.error("An error occurred during setup:", error);
    }
}
export {
    Setup,
    PLATFORMS
}