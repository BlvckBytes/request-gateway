import fs from 'fs';
import path from 'path';
import { ConfigIniParser } from 'config-ini-parser';

export default class Config {
  static parser = new ConfigIniParser();

  // Default settings
  static settings = {
    upgradeUnknownRequests: false,
    letsEncryptDir: '/',
  };

  // Get a string value from ini
  static getStr(section: string, key: string): string {
    const sectCont = this.parser.items(section);
    const value = sectCont.find((entry) => entry[0] === key);
    return value ? value[1] : '';
  }

  // Get a boolean value from ini
  static getBool(section: string, key: string): boolean {
    const val = this.getStr(section, key).toLowerCase();
    return val === 'true' || val === 'yes' || val === '1';
  }

  // Get all sections that have not yet been parsed
  static sections(): string[] {
    const filterList = ['config'];
    return this.parser.sections().filter((it) => !filterList.includes(it));
  }

  // Get all items of a section as string-string tuples
  static items(section: string): [string, string][] {
    return this.parser.items(section).map((entry) => [String(entry[0]), String(entry[1])]);
  }

  static init(file: string) {
    // Parse file from provided path, relative to executing dir
    this.parser.parse(
      String(fs.readFileSync(path.join(__dirname, file))),
    );

    // Load settings and thus override local defaults
    this.settings.upgradeUnknownRequests = this.getBool('settings', 'upgradeUnknownRequest');
    this.settings.letsEncryptDir = this.getStr('settings', 'letsEncryptDir');
  }
}
