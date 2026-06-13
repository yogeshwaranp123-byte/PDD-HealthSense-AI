import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHospitalStore, Hospital } from '../../store/hospitalStore';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/SkeletonLoader';
import { theme, Typography, Spacing, Radius } from '../../utils/theme';

const { height } = Dimensions.get('window');
const HERO_H = height * 0.30;

export const HospitalsScreen = () => {
  const { 
    hospitals, 
    isLoading: loading, 
    error: storeError, 
    getNearbyHospitals 
  } = useHospitalStore();

  const [locationError, setLocationError] = useState('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const insets = useSafeAreaInsets();

  const fetchHospitals = async (forceRefresh = false) => {
    setLocationError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied. Please enable it in Settings.');
        return;
      }
      
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      setUserCoords({ lat: latitude, lng: longitude });

      let addressStr = '';
      try {
        const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geo && geo.length > 0) {
          const first = geo[0];
          const parts = [
            first.streetNumber,
            first.street,
            first.district,
            first.city,
            first.region,
            first.postalCode
          ].filter(Boolean);
          addressStr = parts.join(', ');
        }
      } catch (geoErr) {
        console.log('Error reverse geocoding location:', geoErr);
      }

      await getNearbyHospitals(latitude, longitude, addressStr, forceRefresh);
    } catch (e: any) {
      setLocationError(e?.message ?? 'Could not retrieve location.');
    }
  };

  useEffect(() => {
    fetchHospitals(false); // Do not force refresh by default, serving cached results if stationary
  }, []);

  const handleCall = (phone: string) => {
    const url = `tel:${phone.replace(/\s/g, '')}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open phone dialer.'));
  };

  const handleOpenMap = (mapLink?: string, name?: string, address?: string) => {
    const fallbackQuery = `${name || ''} ${address || ''}`.trim();
    const url = mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackQuery)}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open map directions.'));
  };

  const handleOpenWebsite = (website: string) => {
    let url = website.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open website URL.'));
  };

  const distKm = (lat: number, lng: number): string => {
    if (!userCoords) return '';
    const R = 6371;
    const dLat = ((lat - userCoords.lat) * Math.PI) / 180;
    const dLng = ((lng - userCoords.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((userCoords.lat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return `${d.toFixed(1)} km`;
  };

  const activeError = locationError || storeError;

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Hero */}
      <View style={[styles.hero, { height: HERO_H + insets.top }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=1200&q=80' }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient
          colors={['transparent', theme.background.primary]}
          locations={[0.2, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Refresh top-right */}
        <TouchableOpacity
          style={[styles.refreshBtn, { top: insets.top + 16 }]}
          onPress={() => fetchHospitals(true)}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Feather name="refresh-cw" size={14} color={theme.text.accent} />
          <Text style={styles.refreshText}>{loading ? 'Locating' : 'Refresh'}</Text>
        </TouchableOpacity>

        <View style={[styles.heroContent, { paddingBottom: Spacing.xl }]}>
          <Text style={styles.heroCategory}>NEARBY</Text>
          <Text style={styles.heroHeadline}>Hospitals{'\n'}& Clinics</Text>
        </View>
      </View>

      {/* Error state */}
      {activeError ? (
        <View style={styles.errorBox}>
          <View style={styles.errorIconWrap}>
            <Feather name="alert-circle" size={28} color={theme.semantic.danger} />
          </View>
          <Text style={styles.errorTitle}>Location Error</Text>
          <Text style={styles.errorText}>{activeError}</Text>
          <Button
            label="Try Again"
            onPress={() => fetchHospitals(true)}
            size="sm"
            style={{ marginTop: Spacing.lg }}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Skeletons while loading */}
          {loading && hospitals.length === 0 && (
            <>
              <View style={styles.loadingBanner}>
                <Feather name="map-pin" size={14} color={theme.text.accent} />
                <Text style={styles.loadingText}>Detecting your location...</Text>
              </View>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {/* Empty state */}
          {hospitals.length === 0 && !loading && (
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <Feather name="map" size={40} color={theme.text.tertiary} />
              </View>
              <Text style={styles.emptyTitle}>No hospitals found</Text>
              <Text style={styles.emptySubtitle}>No facilities found within 5 km of your location.</Text>
            </View>
          )}

          {/* Hospital cards */}
          {hospitals.map((h, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(i * 60).springify()}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.hospitalIconWrap}>
                    <Feather name="plus-circle" size={16} color={theme.text.accent} />
                  </View>
                  <View style={styles.cardHeaderContent}>
                    <Text style={styles.hospitalName} numberOfLines={2}>{h.name}</Text>
                    {userCoords && h.lat && h.lng && (
                      <View style={styles.distRow}>
                        <Feather name="map-pin" size={10} color={theme.text.accent} />
                        <Text style={styles.distText}>{distKm(h.lat, h.lng)} away</Text>
                      </View>
                    )}
                  </View>
                </View>

                {h.address ? (
                  <Text style={styles.hospitalAddress}>
                    {h.address}
                  </Text>
                ) : null}

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionBtnMap}
                    onPress={() => handleOpenMap(h.map_link, h.name, h.address)}
                    activeOpacity={0.7}
                  >
                    <Feather name="navigation" size={12} color={theme.text.accent} />
                    <Text style={styles.actionBtnTextMap}>Directions</Text>
                  </TouchableOpacity>

                  {h.phone ? (
                    <TouchableOpacity
                      style={styles.actionBtnCall}
                      onPress={() => handleCall(h.phone!)}
                      activeOpacity={0.7}
                    >
                      <Feather name="phone" size={12} color={theme.semantic.success} />
                      <Text style={styles.actionBtnTextCall}>Call</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.actionBtnCallDisabled}>
                      <Feather name="phone-off" size={12} color={theme.text.tertiary} />
                      <Text style={styles.actionBtnTextCallDisabled}>No Phone</Text>
                    </View>
                  )}

                  {h.website ? (
                    <TouchableOpacity
                      style={styles.actionBtnWeb}
                      onPress={() => handleOpenWebsite(h.website!)}
                      activeOpacity={0.7}
                    >
                      <Feather name="globe" size={12} color={theme.text.primary} />
                      <Text style={styles.actionBtnTextWeb}>Website</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background.primary },

  hero: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroContent: {
    paddingHorizontal: Spacing.lg,
  },
  heroCategory: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.accent,
    letterSpacing: 3,
    marginBottom: 8,
  },
  heroHeadline: {
    fontFamily: Typography.fontFamily.displayLight,
    fontSize: Typography.fontSize.xxxl,
    color: theme.text.primary,
    letterSpacing: -1,
    lineHeight: Typography.fontSize.xxxl * 1.2,
  },
  refreshBtn: {
    position: 'absolute',
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.surface.highlight,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: theme.border.default,
  },
  refreshText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.accent,
    letterSpacing: 0.5,
  },

  // Error
  errorBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  errorIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.semantic.danger + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  errorTitle: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.xl,
    color: theme.text.secondary,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    color: theme.text.tertiary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.sm * 1.65,
  },

  // Content
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.surface.highlight,
    borderRadius: Radius.lg,
    padding: 12,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  loadingText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.accent,
    letterSpacing: 0.5,
  },

  // Hospital cards
  card: {
    backgroundColor: theme.background.secondary,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    marginBottom: 12,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardHeaderContent: {
    flex: 1,
  },
  hospitalIconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: theme.surface.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  hospitalName: {
    fontFamily: Typography.fontFamily.label,
    fontSize: Typography.fontSize.base,
    color: theme.text.primary,
    marginBottom: 4,
    lineHeight: Typography.fontSize.base * 1.3,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    color: theme.text.accent,
    letterSpacing: 0.5,
  },
  hospitalAddress: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    color: theme.text.secondary,
    lineHeight: Typography.fontSize.sm * 1.45,
    paddingLeft: 2,
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  actionBtnMap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.surface.highlight,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.border.default,
  },
  actionBtnTextMap: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.accent,
    letterSpacing: 0.5,
  },
  actionBtnCall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.semantic.success + '15',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.semantic.success + '40',
  },
  actionBtnTextCall: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.semantic.success,
    letterSpacing: 0.5,
  },
  actionBtnCallDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.background.tertiary,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  actionBtnTextCallDisabled: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
  },
  actionBtnWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.surface.glass,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  actionBtnTextWeb: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.primary,
    letterSpacing: 0.5,
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.xl,
    color: theme.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    color: theme.text.tertiary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.sm * 1.65,
  },
});
