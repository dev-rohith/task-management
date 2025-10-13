export default {
  testEnvironment: 'node',               
  roots: ['<rootDir>/src', '<rootDir>/tests'], 
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],                                     
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'], 
  testTimeout: 20000,                  
};
