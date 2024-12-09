import NaomisConfig from "@nhcarrigan/eslint-config";

export default [
  ...NaomisConfig,
  {
    rules: {
      "no-console": "off"
    }
  }
];
