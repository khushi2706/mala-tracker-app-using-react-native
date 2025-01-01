import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { initDatabase, fetchAllMalaForAnalytics } from '../../db'; // Assuming you have a method for fetching data
import { LineChart } from 'react-native-chart-kit';

export default function AnalyticsScreen() {
  const [malaList, setMalaList] = useState([]);
  const [stats, setStats] = useState({ totalMalas: 0, totalJaaps: 0, streak: 0, dailyAverage: 0 });

  useEffect(() => {
    const initialize = async () => {
      await initDatabase();

      const res = await fetchAllMalaForAnalytics();

      if (res.success) {
        const validData = res.data.filter(item => item.malaCount && !isNaN(item.malaCount)); // Filter out invalid data
        setMalaList(validData);
        calculateStats(validData);
      }
    };
    initialize();
  }, []);

  const calculateStats = (data) => {
    const totalMalas = data.reduce((sum, item) => sum + item.malaCount, 0);
    const totalJaaps = totalMalas * 108;
    const streak = calculateStreak(data);
    const dailyAverage = totalMalas / data.length;

    setStats({ totalMalas, totalJaaps, streak, dailyAverage });
  };

  const calculateStreak = (data) => {
    let streak = 0;
    let longestStreak = 0;

    for (let i = 0; i < data.length; i++) {
      if (data[i].malaCount > 0) {
        streak++;
        longestStreak = Math.max(longestStreak, streak);
      } else {
        streak = 0;
      }
    }

    return longestStreak;
  };

  const renderRow = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.date}</Text>
      <Text style={styles.tableCell}>{item.malaCount}</Text>
      <Text style={styles.tableCell}>{item.malaCount * 108}</Text>
    </View>
  );

  const graphData = {
    labels: malaList.map(item => item.date), // Dates as labels
    datasets: [
      {
        data: malaList.map(item => {
          const malaCount = item.malaCount ? item.malaCount : 0; // Default to 0 if invalid
          return parseFloat(malaCount); // Ensure it's a number
        }),
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(255, 112, 67, ${opacity})`, // Orange color
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Analytics</Text>

        <View style={styles.statsOverview}>
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
            <Text style={styles.statLabel}>Longest Streak</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.subHeading}>Daily Average</Text>
          <Text style={styles.statValue}>{stats.dailyAverage.toFixed(1)} Malas</Text>
        </View>

        {/* Malas Over Time Line Chart */}
        <View style={styles.graphContainer}>
          <Text style={styles.subHeading}>Malas Over Time</Text>
          {
            malaList.length && <LineChart
              data={graphData}
              width={340} // width of the chart
              height={220} // height of the chart
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#f7f7f7',
                backgroundGradientTo: '#f7f7f7',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 112, 67, ${opacity})`, // Orange color
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Black color for labels
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
            />
          }
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.headerCell]}>Date</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Malas</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Jaaps</Text>
          </View>
          <FlatList
            data={malaList}
            renderItem={renderRow}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
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
  statsOverview: {
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
  progressSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  subHeading: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  graphContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#ff7043',
    padding: 10,
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
  headerCell: {
    fontWeight: 'bold',
    color: '#fff',
  },
});
