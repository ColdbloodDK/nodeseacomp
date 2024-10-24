#!/usr/bin/env node
import { Compile } from "./components/compiler";
import { Setup } from "./components/setup";
import { ConsoleMessage } from "./utils";

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
      break;
  }
}
main()