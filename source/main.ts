#!/usr/bin/env node
import { Compile } from "./components/compiler";
import { Setup } from "./components/setup";

const args = process.argv;

async function main() {
  switch (args[2]) {
    case 'init':
      await Setup();

      process.exit(0);
    case 'build':
      await Compile()
      
      process.exit(0);
    default:
      help()
      break;
  }
}

function help() {
  console.log(`nodeseacomp - A CLI tool for NodeJS to compile SEA executables\n`);
  console.log(`Commands:\n  build     Builds the project\n  init      Initializes a new project \n  help      Display help information\n`)
  console.log(`Usage:  nodeseacomp [command]`)
}
main()