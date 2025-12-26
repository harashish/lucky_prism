export const colors = {
  text: "#dfdef3",
  background: "#1c1c25",
  card: "#393952ff",
  button: "#393952ff",
  buttonActive: "#c4a7e7",
  inputBorder: "#908bab",
  inputBorderActive: "#c4a7e7",
  deleteButton: "#daa7e7",
  light: "#FFFFF1",
  special: "#8162a7"
};

export const fonts = {
  interRegular: "Inter_400Regular",
  interMedium: "Inter_500Medium",
  interSemiBold: "Inter_600SemiBold",
  interBold: "Inter_700Bold",

  poppinsRegular: "Poppins_400Regular",
  poppinsSemiBold: "Poppins_600SemiBold",

  nunitoRegular: "Nunito_400Regular",
  nunitoBold: "Nunito_700Bold",

  manropeRegular: "Manrope_400Regular",
  manropeSemiBold: "Manrope_600SemiBold",
};


export const spacing = {
  xs: 6,
  s: 6,
  m: 16,
  l: 22,
  xl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
};

export const components = {
  buttonPrimary: {
    backgroundColor: colors.button,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: "center",
  },
  buttonSmall: {
    backgroundColor: colors.button,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    alignItems: "center",
  },
    container: {
    padding: spacing.m,
    marginVertical: spacing.s,
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
  addButton: {
    backgroundColor: "#908bab",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  } as const,
  completeButton: {
    backgroundColor: "#908bab",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: "center",
    alignItems: "center",
  } as const,
};
