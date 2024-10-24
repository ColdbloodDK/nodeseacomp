// Define the interface for the configuration
interface ConfigType {
    platforms?: Array<NodeJS.Platform>;
    cachePath?: string;
    version?: string;
    buildPath?: string;
}

export {
    ConfigType
}
