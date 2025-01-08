/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  openHandlesTimeout:10*1000, // the timeout to wait operations opens executing
    testTimeout:30*1000 // dice el maximo de tiempo para cada prueba
};