import * as fs from 'fs-extra';
import * as path from 'path';
import * as unzipper from 'unzipper';
import { decompress } from '@napi-rs/lzma/xz';
import { extract } from 'tar';
import { ConsoleMessage } from '../utils'; // Import esterno

/**
 * Helper function to move files from a subdirectory to the destination folder
 */
async function moveFilesFromSubdirectory(destDir: string) {
    const extractedFiles = await fs.readdir(destDir);
    
    // Verifica se c'è una singola sottocartella
    if (extractedFiles.length === 1) {
        const subDirPath = path.join(destDir, extractedFiles[0]);

        if (await fs.stat(subDirPath).then(stat => stat.isDirectory())) {
            // Muovi tutto il contenuto della sottocartella alla directory di destinazione
            const files = await fs.readdir(subDirPath);
            for (const file of files) {
                const fromPath = path.join(subDirPath, file);
                const toPath = path.join(destDir, file);
                await fs.move(fromPath, toPath);
            }
            // Rimuovi la sottocartella vuota
            await fs.remove(subDirPath);
        }
    }
}

/**
 * Extracts a ZIP archive.
 */
export async function extractZip(zipFilePath, destDir, force = false) {
    if (fs.existsSync(destDir)) {
        if (force) {
            await fs.remove(destDir);
        } else {
            throw new Error(`The directory ${destDir} already exists. Use the force option to overwrite it.`);
        }
    }

    await fs.ensureDir(destDir);

    return new Promise<void>((resolve, reject) => {
        fs.createReadStream(zipFilePath)
            .pipe(unzipper.Extract({ path: destDir }))
            .on('close', async () => {
                try {
                    // Move files from the subdirectory if needed (for ZIP)
                    await moveFilesFromSubdirectory(destDir);
                    resolve();
                } catch (err) {
                    reject(new Error(`Error after extraction: ${err.message}`));
                }
            })
            .on('error', (err) => reject(new Error(`Error during extraction: ${err.message}`)));
    });
}

/**
 * Extracts a tar.xz archive using the lzma module.
 */
export async function extractTarXz(tarFilePath, destDir, force = false) {
    if (fs.existsSync(destDir)) {
        if (force) {
            await fs.remove(destDir);
        } else {
            throw new Error(`The directory ${destDir} already exists. Use the force option to overwrite it.`);
        }
    }

    await fs.ensureDir(destDir);

    return new Promise<void>(async (resolve, reject) => {
        try {
            const tarXzBuffer = await fs.readFile(tarFilePath);
            
            // Decompression
            const tarBuffer = await decompress(tarXzBuffer);
            
            // Write the decompressed buffer to a temp file
            const tempTarPath = path.join(destDir, 'temp.tar');
            await fs.writeFile(tempTarPath, tarBuffer);

            // Extract the TAR file using the tar library
            await extract({
                file: tempTarPath,
                C: destDir,
            });
            await fs.remove(tempTarPath);

            // Move files from the subdirectory if needed (for TAR.xz)
            await moveFilesFromSubdirectory(destDir);

            resolve();
        } catch (err) {
            await fs.remove(destDir);
            reject(new Error(`Error during extraction: ${err.message}`));
        }
    });
}

/**
 * Main function for extracting a ZIP or TAR.xz file.
 */
export async function extractArchive(archiveFilePath, destDir, force = false) {
    const ext = path.extname(archiveFilePath).toLowerCase();

    if (ext === '.zip') {
        await extractZip(archiveFilePath, destDir, force);
    } else if (ext === '.xz' && archiveFilePath.endsWith('.tar.xz')) {

        await extractTarXz(archiveFilePath, destDir, force);
    } else {
        throw new Error('Unsupported archive type. Supported: .zip, .tar.xz');
    }
}
