import React, { useCallback, useState } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { colors } from "../../constants/theme";
import AppText from "../../components/AppText";
import FloatingButton from "../../components/FloatingButton";
import SobrietyItem from "../../features/sobriety/SobrietyItem";
import { useSobrietyStore } from "../stores/useSobrietyStore";

export default function SobrietyScreen() {
  const router = useRouter();
  const { sobrietyList, loading, loadSobriety } = useSobrietyStore();

  const [expandedId, setExpandedId] = useState<number | null>(null);

    useFocusEffect(
    useCallback(() => {
      loadSobriety(true); // silent
    }, [])
  );

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: colors.background }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.buttonActive} />
        </View>
      ) : sobrietyList.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <AppText style={{ color: "#777" }}>
            no sobriety trackers yet
          </AppText>
        </View>
      ) : (
        <FlatList
          data={sobrietyList}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 140 }}
          renderItem={({ item }) => (
            <SobrietyItem
              item={item}
              isExpanded={expandedId === item.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === item.id ? null : item.id)
              }
              onEdit={() => router.push(`/editSobriety/${item.id}`)}
            />
          )}
        />
      )}

      <FloatingButton onPress={() => router.push("/addSobriety")} />
    </View>
  );
}