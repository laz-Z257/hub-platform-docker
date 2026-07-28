import "@testing-library/react-native/extend-expect";

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Stack: {
    Screen: () => null,
  },
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("expo-constants", () => ({
  expoConfig: {
    version: "1.0.0",
  },
}));

jest.mock("expo-device", () => ({
  modelName: "Test Device",
  osVersion: "14.0",
}));