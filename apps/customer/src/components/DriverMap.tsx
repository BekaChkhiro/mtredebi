import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { Bike, MapPin } from "lucide-react-native";

interface Location {
  lat: number;
  lng: number;
}

interface DriverMapProps {
  driverLocation?: Location | null;
  deliveryAddress: string;
  restaurantLocation?: Location;
  deliveryLocation?: Location;
}

export function DriverMap({
  driverLocation,
  deliveryAddress,
  restaurantLocation,
  deliveryLocation,
}: DriverMapProps) {
  const mapRef = useRef<MapView>(null);

  // Default to Samtredia location
  const defaultRegion: Region = {
    latitude: 42.1548,
    longitude: 42.3448,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  useEffect(() => {
    if (driverLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: driverLocation.lat,
          longitude: driverLocation.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  }, [driverLocation]);

  if (!driverLocation) {
    return (
      <View className="bg-white rounded-2xl p-4 mb-4">
        <View className="flex-row items-center mb-3">
          <MapPin size={16} color="#10b981" strokeWidth={2} />
          <Text className="text-sm text-gray-500 ml-2">მძღოლის ლოკაცია</Text>
        </View>
        <View className="bg-gray-100 rounded-xl h-40 items-center justify-center">
          <Bike size={32} color="#9CA3AF" strokeWidth={1.5} />
          <Text className="text-gray-400 text-sm mt-2">
            ლოკაცია მალე გამოჩნდება
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl overflow-hidden mb-4">
      <View className="flex-row items-center p-4 pb-2">
        <MapPin size={16} color="#10b981" strokeWidth={2} />
        <Text className="text-sm text-gray-500 ml-2">მძღოლის ლოკაცია</Text>
      </View>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          initialRegion={{
            latitude: driverLocation.lat,
            longitude: driverLocation.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {/* Driver Marker */}
          <Marker
            coordinate={{
              latitude: driverLocation.lat,
              longitude: driverLocation.lng,
            }}
            title="მძღოლი"
          >
            <View style={styles.driverMarker}>
              <Bike size={18} color="#ffffff" strokeWidth={2} />
            </View>
          </Marker>

          {/* Delivery Location Marker */}
          {deliveryLocation && (
            <Marker
              coordinate={{
                latitude: deliveryLocation.lat,
                longitude: deliveryLocation.lng,
              }}
              title="მიტანის ადგილი"
            >
              <View style={styles.deliveryMarker}>
                <MapPin size={18} color="#ffffff" strokeWidth={2} />
              </View>
            </Marker>
          )}

          {/* Restaurant Marker */}
          {restaurantLocation && (
            <Marker
              coordinate={{
                latitude: restaurantLocation.lat,
                longitude: restaurantLocation.lng,
              }}
              title="რესტორანი"
            >
              <View style={styles.restaurantMarker}>
                <View style={styles.restaurantIcon} />
              </View>
            </Marker>
          )}
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 200,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  driverMarker: {
    backgroundColor: "#10b981",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deliveryMarker: {
    backgroundColor: "#3B82F6",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  restaurantMarker: {
    backgroundColor: "#F97316",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  restaurantIcon: {
    width: 12,
    height: 12,
    backgroundColor: "#ffffff",
    borderRadius: 6,
  },
});
