import API from "./api";
import { handleAction } from "./handlers";
import { currentInstancesStatus } from "./initializer";
import generatePassword from "./keygen";
import { init } from "./mmkv/init";
import { ACCESSIBLE, MODES, options, stringToHex } from "./utils";

export default class Loader {
  constructor() {
    this.options = {
      instanceID: "default",
      initWithEncryption: false,
      secureKeyStorage: false,
      accessibleMode: ACCESSIBLE.WHEN_UNLOCKED,
      processingMode: MODES.SINGLE_PROCESS,
      aliasPrefix: "com.MMKV.",
      alias: null,
      key: null,
      serviceName: null,
      initialized: false,
    };
  }

  withInstanceID(id) {
    this.options.instanceID = id;

    return this;
  }

  withEncryption() {
    this.options.initWithEncryption = true;
    this.options.key = generatePassword();
    this.options.alias = stringToHex(
      this.options.aliasPrefix + this.options.instanceID
    );
    this.options.secureKeyStorage = true;
    return this;
  }

  withServiceName(serviceName) {
    this.options.serviceName = serviceName;
    return this;
  }

  setAccessibleIOS(accessible) {
    this.options.accessibleMode = accessible;
    return this;
  }

  encryptWithCustomKey(key, secureKeyStorage, alias) {
    this.options.key = key;
    this.options.secureKeyStorage = false;
    if (secureKeyStorage) {
      this.options.secureKeyStorage = true;
      if (alias) {
        this.options.alias = stringToHex(this.options.aliasPrefix + alias);
      } else {
        this.options.alias = stringToHex(
          this.options.aliasPrefix + this.options.instanceID
        );
      }
    }

    return this;
  }

  setProcessingMode(mode) {
    this.options.processingMode = mode;

    return this;
  }

  initialize() {
    if (!init()) throw new Error("MMKVNative bindings not installed");
    currentInstancesStatus[this.options.instanceID] = false;
    options[this.options.instanceID] = this.options;
    let instance = new API(this.options.instanceID);
    handleAction(null, this.options.instanceID);
    return instance;
  }

  generateKey() {
    this.options.key = generatePassword();
    return this;
  }
}
