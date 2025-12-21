import { Alert } from "react-native";

export function confirmDelete({
  title = "Delete?",
  message = "This action cannot be undone.",
  onConfirm,
}: {
  title?: string;
  message?: string;
  onConfirm: () => void;
}) {
  Alert.alert(
    title,
    message,
    [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onConfirm },
    ],
    { cancelable: true }
  );
}
