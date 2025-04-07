// import { lazyModule } from "webpack";

// export const StyleSheet = lazyModule("compose", "absoluteFillObject") as typeof import("react-native").StyleSheet;
export const StyleSheet = {
  create: ((styles: any): any => styles) as typeof import("react-native").StyleSheet.create,
};

// export const { View } = lazyModule("View", "Text", "Image") as typeof import("react-native");
