import * as FileSystemPromises from "fs/promises";
import * as FileSystem from "fs";


import { ConfigType } from "../config";
import { ConsoleMessage } from "../utils";
const axios = require('axios');

async function ReadJSONFile(Path) {
    try {
        await CheckFileExistence(Path)
        
        const RawFile = await FileSystemPromises.readFile(Path, {encoding: 'utf8'})

        return await JSON.parse(RawFile)
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {}; // File does not exist
        }
        throw error;
    }
}

async function WriteJSONFile(Path: string, JSONData) {
    try {
        await FileSystemPromises.writeFile(Path, JSON.stringify(JSONData, null, 2))
        return true
    } catch (error) {
        throw error
    }
}

async function DownloadFile(url, path) {
    return new Promise<void>((resolve, reject) => {
        axios({
            method: 'get',
            url: url,
            responseType: 'stream',
        }).then(function (response) {
            // Pipe the response data directly into the file
            response.data.pipe(FileSystem.createWriteStream(path));
        
            // When the download finishes
            response.data.on('end', () => {
                resolve()
            });
        
            // If there is an error during the download
            response.data.on('error', (err) => {
                reject()
                ConsoleMessage.error('Error downloading the file', err);
            });
        })
        .catch(function (error) {
            reject()
            ConsoleMessage.error('Error fetching the file:', error.message);
        });
    })
}

async function MakeDirectory(dir) {
    try {
        await FileSystemPromises.mkdir(dir, {recursive: true})
        return true
    } catch (error) {
        throw error
    }
}

async function CopyFile(src: string, dest: string) {
    try {
        await FileSystemPromises.copyFile(src,dest)
        return true
    } catch (error) {
        throw error
    }
}

async function CheckFileExistence(File: string): Promise<boolean> {
    try {
        await FileSystemPromises.access(File, FileSystemPromises.constants.R_OK | FileSystemPromises.constants.W_OK);
        return true
    } catch (error) {
        throw error
    }
}

export {
    ReadJSONFile,
    WriteJSONFile,
    CheckFileExistence,
    MakeDirectory,
    CopyFile,
    DownloadFile
}