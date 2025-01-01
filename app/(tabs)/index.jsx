import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, SafeAreaView, FlatList, Keyboard } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { initDatabase, insertMala, fetchAllMalas, updateMala } from '../../db';

export default function HomeScreen() {
  const [malaCount, setMalaCount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [malaList, setMalaList] = useState([]);
  const [editingId, setEditingId] = useState(null); // Track which entry is being edited

  const [stats, setStats] = useState({ totalMalas: 0, totalJaaps: 0, streak: 0 });

  useEffect(() => {
    const initialize = async () => {
      await initDatabase();
      loadMalas();
    };
    initialize();
  }, []);

  const loadMalas = async () => {
    const res = await fetchAllMalas();
    if (res.success) {
      setMalaList(res.data);

      let totalJaaps = 0
      let totalMalas = 0
      let streak = res.data?.length

      res.data.forEach(data => {
        totalMalas += data.malaCount
      });
      totalJaaps = totalMalas * 108

      setStats({
        totalJaaps, totalMalas, streak
      })
    }
  };

  const saveMala = async () => {
    if (malaCount.trim() === '') {
      alert('Please enter a mala count.');
      return;
    }

    if (editingId) {
      await updateMala(editingId, parseInt(malaCount), date.toISOString().split('T')[0]);
      setEditingId(null); // Reset editing state
    } else {
      await insertMala(parseInt(malaCount), date.toISOString().split('T')[0]);
    }
    Keyboard.dismiss();

    setMalaCount(''); // Clear input
    setDate(new Date()); // Reset date
    loadMalas(); // Reload data
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios'); // Keep picker open for iOS
    setDate(currentDate);
  };

  const handleEdit = (mala) => {
    setEditingId(mala.id);
    setMalaCount(mala.malaCount.toString());
    setDate(new Date(mala.date));
  };

  const renderRow = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.malaCount}</Text>
      <Text style={styles.tableCell}>{item.date}</Text>
      <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

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
            <Text style={styles.saveButtonText}>{editingId ? 'Update' : 'Save'}</Text>
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

        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.headerCell]}>Malas</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Date</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Action</Text>
        </View>

        <FlatList
          data={malaList}
          renderItem={renderRow}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }} // Adjust padding to fit your tab bar
          style={{ flex: 1 }} // Ensure FlatList takes the remaining space
        />
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
  datePicker: {
    backgroundColor: '#f5d7d5',
    borderWidth: 1,
    borderColor: 'orange',
    borderRadius: 10,
    padding: 2,
    color: "#ff7043",
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
  tableHeader: {
    marginTop: 40,
    flexDirection: 'row',
    backgroundColor: '#ff7043',
    padding: 10,
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
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  editButton: {
    backgroundColor: '#ff7043',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
