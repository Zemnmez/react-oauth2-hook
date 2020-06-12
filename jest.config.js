module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  coverageDirectory: '../coverage',
  coverageThreshold: {
    "global": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    
    "./src/**/*.ts": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};