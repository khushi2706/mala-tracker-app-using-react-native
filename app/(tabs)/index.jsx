import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import RNDateTimePicker from '@react-native-community/datetimepicker';

export default function HomeScreen() {
  const [malaCount, setMalaCount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [stats, setStats] = useState({ totalMalas: 0, totalJaaps: 0, streak: 0 });

  useEffect(() => {
    const loadStats = async () => {
      const storedStats = await AsyncStorage.getItem('malaStats');
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    };
    loadStats();
  }, []);

  const saveMala = async () => {
    const newTotalMalas = stats.totalMalas + parseInt(malaCount || 0);
    const newTotalJaaps = newTotalMalas * 108;
    const newStreak = stats.streak + 1;

    const updatedStats = {
      totalMalas: newTotalMalas,
      totalJaaps: newTotalJaaps,
      streak: newStreak,
    };

    await AsyncStorage.setItem('malaStats', JSON.stringify(updatedStats));
    setStats(updatedStats);
    setMalaCount('');
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios'); // Keep picker open for iOS
    setDate(currentDate);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Mala Tracker</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Number of Malas:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter mala count"
            keyboardType="numeric"
            value={malaCount}
            onChangeText={setMalaCount}
          />
          <Text style={styles.label}>Date:</Text>

          <RNDateTimePicker
            value={date}
            mode="date"
            onChange={onChangeDate}
            style={styles.datePicker}
          />

          <TouchableOpacity style={styles.saveButton} onPress={saveMala}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stats}>
          <TouchableOpacity style={styles.statBox}>
            <FontAwesome name="circle" size={30} color="#ff7043" />
            <Text style={styles.statValue}>{stats.totalMalas}</Text>
            <Text style={styles.statLabel}>Total Malas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statBox}>
            <FontAwesome name="calculator" size={30} color="#ff7043" />
            <Text style={styles.statValue}>{stats.totalJaaps}</Text>
            <Text style={styles.statLabel}>Total Jaaps</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statBox}>
            <FontAwesome name="fire" size={30} color="#ff7043" />
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff7043',
    marginBottom: 20,
    textAlign: 'center',
  },
  datePicker: {
    backgroundColor: '#f5d7d5',
    borderWidth: 1,
    borderColor: 'orange',
    borderRadius: 10,
    padding: 2,
    color: "#ff7043"
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
  },
  dateText: {
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#ff7043',
    padding: 12,
    borderRadius: 4,
    borderWidth: 2,
    marginTop: 10,
    borderColor: '#e64a19',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff7043',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
  },
});
