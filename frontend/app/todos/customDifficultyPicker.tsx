import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Modal, ScrollView, Alert } from "react-native";
import AppText from "../../components/AppText";
import { colors } from "../../constants/theme";
import { api } from "../api/apiClient";
import { useRouter } from "expo-router";

/**
 * Ten ekran działa jak pół–popup: otwiera się jako mały modal.
 * Możesz go otwierać z quick-add: router.push("/todos/customDifficultyPicker")
 */
export default function CustomDifficultyPicker({ onSelect, onClose }) {
  const [difficulties, setDifficulties] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await api.get("/common/difficulties/");
      setDifficulties(res.data);
    })();
  }, []);

  return (
    <Modal transparent animationType="fade" visible>
      <View style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
      }}>
        
        <View style={{
          width: "80%",
          maxHeight: "60%",
          backgroundColor: colors.card,
          borderRadius: 14,
          padding: 16
        }}>
          <AppText style={{ marginBottom: 12, fontWeight: "bold", fontSize: 18 }}>
            Wybierz trudność
          </AppText>

          <ScrollView>
            {difficulties.map(d => (
              <TouchableOpacity
                key={d.id}
                onPress={() => onSelect(d.id)}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                  backgroundColor: "#FFFFF1",
                }}
              >
                <AppText>{d.name} ({d.xp_value} XP)</AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 10,
              backgroundColor: colors.buttonActive,
              alignItems: "center",
            }}
          >
            <AppText style={{ color: "#fff" }}>Zamknij</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
