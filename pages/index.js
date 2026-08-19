import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SemiTracker() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [workouts, setWorkouts] = useState({});
  const [activeTab, setActiveTab] = useState('week');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [todaysSuggestion, setTodaysSuggestion] = useState(null);

  const planData = {
    1: { lundi: "7km fractionné (3×2km @ 5:50)", mercredi: "5km récup (6:30)", samedi: "10km long (6:15)", focus: "Remise en volume", km: 27, targetPace: '5:50' },
    2: { lundi: "7.5km fractionné (3×2km @ 5:45)", mercredi: "5km récup (6:30)", samedi: "11km long (6:15)", focus: "Progression lente", km: 28.5, targetPace: '5:45' },
    3: { lundi: "8km fractionné (4×2km @ 5:45)", mercredi: "5.5km récup (6:30)", samedi: "11km long (6:15)", focus: "Progression lente", km: 29.5, targetPace: '5:45' },
    4: { lundi: "6km facile", mercredi: "5km récup (6:30)", samedi: "🔍 TEST 1: 10km @ 5:40/km", focus: "TEST 1", km: 21, targetPace: '5:40', isTest: true },
    5: { lundi: "8km fractionné (3×2km @ 5:40)", mercredi: "5.5km récup (6:30)", samedi: "12km long (6:20)", focus: "Endurance", km: 30.5, targetPace: '5:40' },
    6: { lundi: "8.5km fractionné (3×2.5km @ 5:38)", mercredi: "6km récup (6:30)", samedi: "13km long (6:20)", focus: "Progression", km: 32.5, targetPace: '5:38' },
    7: { lundi: "9km fractionné (3×2.5km @ 5:35)", mercredi: "6km récup (6:30)", samedi: "13km long (6:20)", focus: "Progression", km: 32, targetPace: '5:35' },
    8: { lundi: "6km facile", mercredi: "5.5km récup (6:30)", samedi: "🔍 TEST 2: 15km endurance", focus: "TEST 2", km: 26.5, targetPace: '6:00', isTest: true },
    9: { lundi: "8.5km fractionné (5×1.5km @ 5:30)", mercredi: "6km récup (6:30)", samedi: "14km long (6:20)", focus: "Force", km: 32.5, targetPace: '5:30' },
    10: { lundi: "9km fractionné (3×3km @ 5:38)", mercredi: "6km récup (6:30)", samedi: "15km long (6:20)", focus: "Force", km: 33, targetPace: '5:38' },
    11: { lundi: "8km fractionné (4×2km @ 5:30)", mercredi: "5.5km récup (6:30)", samedi: "16km long (6:20)", focus: "Force", km: 31.5, targetPace: '5:30' },
    12: { lundi: "Repos", mercredi: "Repos", samedi: "🔍 TEST 3: SEMI BLANC 21.1km", focus: "TEST 3", km: 21.1, targetPace: '5:40', isTest: true },
    13: { lundi: "7km fractionné (3×2km @ 5:35)", mercredi: "6km récup (6:30)", samedi: "14km long (6:20)", focus: "Affinement", km: 27, targetPace: '5:35' },
    14: { lundi: "6.5km fractionné (3×1.5km @ 5:35)", mercredi: "5.5km récup (6:30)", samedi: "14km long (6:20)", focus: "Affinement", km: 26, targetPace: '5:35' },
    15: { lundi: "5km facile (6:15)", mercredi: "4km récup (6:30)", samedi: "10km @ 5:40", focus: "Léger", km: 19, targetPace: '5:40' },
    16: { lundi: "Repos", mercredi: "4km très facile (6:30)", samedi: "7km (6:15)", focus: "Décharge", km: 11, targetPace: '6:15' },
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = localStorage.getItem('semi_tracker_data');
        if (stored) setWorkouts(JSON.parse(stored));
      } catch (e) {
        console.log('Pas de données');
      }
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    const today = new Date();
    const dayName = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][today.getDay()];
    
    if (['lundi', 'mercredi', 'samedi'].includes(dayName)) {
      setTodaysSuggestion({ day: dayName, suggestion: planData[currentWeek][dayName], current: currentWeek });
    }
  }, [currentWeek]);

  const saveData = (newWorkouts) => {
    try {
      localStorage.setItem('semi_tracker_data', JSON.stringify(newWorkouts));
    } catch (e) {
      console.log('Erreur sauvegarde');
    }
  };

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const toggleWorkout = (day) => {
    const key = `w${currentWeek}_${day}`;
    const newWorkouts = { ...workouts };
    const isCompleting = !newWorkouts[key]?.done;
    
    newWorkouts[key] = isCompleting ? { done: true, timestamp: new Date().toISOString() } : null;
    setWorkouts(newWorkouts);
    saveData(newWorkouts);

    if (isCompleting) {
      addNotification(`✅ ${day.charAt(0).toUpperCase() + day.slice(1)} complété !`, 'success');
      
      const days = ['lundi', 'mercredi', 'samedi'];
      const completed = days.filter(d => newWorkouts[`w${currentWeek}_${d}`]?.done).length;
      if (completed === 3) {
        addNotification(`🎉 Semaine ${currentWeek} terminée ! ${planData[currentWeek].km}km complétés !`, 'success');
      }
    }
  };

  const updateFeeling = (day, feeling) => {
    const key = `w${currentWeek}_${day}`;
    const newWorkouts = { ...workouts };
    if (!newWorkouts[key]) newWorkouts[key] = {};
    newWorkouts[key].feeling = feeling;
    setWorkouts(newWorkouts);
    saveData(newWorkouts);
  };

  const updateKnee = (day, level) => {
    const key = `w${currentWeek}_${day}`;
    const newWorkouts = { ...workouts };
    if (!newWorkouts[key]) newWorkouts[key] = {};
    newWorkouts[key].knee = level;
    setWorkouts(newWorkouts);
    saveData(newWorkouts);
  };

  const updateTime = (day, timeStr) => {
    const key = `w${currentWeek}_${day}`;
    const newWorkouts = { ...workouts };
    if (!newWorkouts[key]) newWorkouts[key] = {};
    newWorkouts[key].time = timeStr;
    setWorkouts(newWorkouts);
    saveData(newWorkouts);
  };

  const calculatePace = (day, timeStr) => {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return null;
    const minutes = parseInt(parts[0]);
    const seconds = parseInt(parts[1]);
    if (isNaN(minutes) || isNaN(seconds)) return null;

    let distance = 0;
    const description = planData[currentWeek][day];
    const match = description.match(/(\d+(?:\.\d+)?)\s*km/);
    if (match) distance = parseFloat(match[1]);
    if (!distance) return null;

    const totalSeconds = minutes * 60 + seconds;
    const paceSeconds = totalSeconds / distance;
    const paceMins = Math.floor(paceSeconds / 60);
    const paceSecs = Math.round(paceSeconds % 60);
    
    return `${paceMins}:${paceSecs.toString().padStart(2, '0')}`;
  };

  const paceToSeconds = (paceStr) => {
    if (!paceStr) return null;
    const parts = paceStr.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };

  const exportCSV = () => {
    let csv = 'Semaine,Jour,Séance,Temps,Allure,Ressenti,Genou\n';
    
    for (let w = 1; w <= 16; w++) {
      const days = ['lundi', 'mercredi', 'samedi'];
      days.forEach(day => {
        const key = `w${w}_${day}`;
        const workout = workouts[key];
        const time = workout?.time || '-';
        const pace = calculatePace(day, workout?.time) || '-';
        const feeling = workout?.feeling || '-';
        const knee = workout?.knee || '-';
        csv += `${w},${day},"${planData[w][day]}",${time},${pace},${feeling},${knee}\n`;
      });
    }
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'semi_marathon_tracking.csv';
    a.click();
  };

  const week = planData[currentWeek];
  const days = ['lundi', 'mercredi', 'samedi'];
  const dayNames = { lundi: 'Lundi', mercredi: 'Mercredi', samedi: 'Samedi' };

  const completedDays = days.filter((d) => workouts[`w${currentWeek}_${d}`]?.done).length;
  const avgKnee = days.length > 0 ? Math.round(
    days.reduce((sum, d) => sum + (workouts[`w${currentWeek}_${d}`]?.knee || 0), 0) / days.length
  ) : 0;

  const getAvgPace = () => {
    const paces = days
      .filter(d => workouts[`w${currentWeek}_${d}`]?.time)
      .map(d => calculatePace(d, workouts[`w${currentWeek}_${d}`]?.time))
      .filter(p => p !== null)
      .map(p => paceToSeconds(p));
    
    if (paces.length === 0) return null;
    
    const avgSeconds = Math.round(paces.reduce((sum, p) => sum + p, 0) / paces.length);
    const mins = Math.floor(avgSeconds / 60);
    const secs = avgSeconds % 60;
    
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="p-4 text-center">Chargement...</div>;

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen p-4 font-sans max-w-4xl mx-auto pb-20">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50 max-w-sm">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`p-3 rounded-lg shadow-lg text-sm font-semibold animate-pulse ${
              notif.type === 'success' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
            }`}
          >
            {notif.message}
          </div>
        ))}
      </div>

      {/* Suggestion du jour */}
      {todaysSuggestion && (
        <div className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-4">
          <p className="text-xs font-bold text-purple-700 uppercase">📅 Aujourd'hui</p>
          <p className="text-lg font-bold text-purple-900 mt-2">{todaysSuggestion.suggestion}</p>
          <p className="text-xs text-purple-700 mt-1">Semaine {todaysSuggestion.current}</p>
        </div>
      )}

      {/* Alerte semaine test */}
      {planData[currentWeek].isTest && (
        <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4 animate-pulse">
          <p className="text-red-900 font-bold text-center">⚠️ SEMAINE DE TEST — Bien noter ressenti & genou</p>
        </div>
      )}

      {/* En-tête */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-blue-900">Semi-Marathon</h1>
        <p className="text-gray-600 text-sm">Février 2027 — 2h00 (5:40/km)</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 overflow-x-auto">
        {[
          { id: 'week', label: '📋 Semaine' },
          { id: 'progress', label: '📈 Progression' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded font-semibold text-sm whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: SEMAINE */}
      {activeTab === 'week' && (
        <>
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                disabled={currentWeek === 1}
                className="p-2 rounded-lg bg-blue-100 text-blue-900 disabled:opacity-50"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="text-center flex-1">
                <h2 className="text-2xl font-bold text-blue-900">Sem. {currentWeek}</h2>
                <p className="text-xs text-gray-600">{week.focus}</p>
              </div>
              <button
                onClick={() => setCurrentWeek(Math.min(16, currentWeek + 1))}
                disabled={currentWeek === 16}
                className="p-2 rounded-lg bg-blue-100 text-blue-900 disabled:opacity-50"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${(currentWeek / 16) * 100}%` }}></div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {days.map((day) => {
              const key = `w${currentWeek}_${day}`;
              const isDone = workouts[key]?.done;
              const feeling = workouts[key]?.feeling;
              const knee = workouts[key]?.knee ?? 0;

              return (
                <div key={day} className={`rounded-lg p-4 border-2 transition-all ${isDone ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-2">
                      <h3 className="text-lg font-bold text-gray-900">{dayNames[day]}</h3>
                      <p className="text-sm text-gray-700 mt-1">{week[day]}</p>
                    </div>
                    <button onClick={() => toggleWorkout(day)} className="flex-shrink-0">
                      {isDone ? (
                        <CheckCircle2 size={32} className="text-green-500" />
                      ) : (
                        <Circle size={32} className="text-gray-300" />
                      )}
                    </button>
                  </div>

                  {isDone && (
                    <div className="space-y-3 border-t border-gray-200 pt-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-2">Temps (mm:ss)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="58:15"
                            value={workouts[key]?.time || ''}
                            onChange={(e) => updateTime(day, e.target.value)}
                            className="flex-1 px-2 py-2 border-2 border-gray-300 rounded text-sm font-mono focus:border-blue-500"
                          />
                          {calculatePace(day, workouts[key]?.time) && (
                            <div className="px-3 py-2 bg-blue-100 rounded text-sm font-bold text-blue-600">
                              {calculatePace(day, workouts[key]?.time)}/km
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-2">Ressenti</label>
                        <div className="flex gap-2">
                          {['facile', 'moyen', 'difficile'].map((f) => (
                            <button
                              key={f}
                              onClick={() => updateFeeling(day, f)}
                              className={`px-3 py-1 rounded text-xs font-semibold ${
                                feeling === f ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-semibold text-gray-600">Genou (0-10)</label>
                          <span className="text-sm font-bold text-blue-600">{knee}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={knee}
                          onChange={(e) => updateKnee(day, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg accent-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-900 mb-3">📊 Résumé</h3>
            <div className="grid grid-cols-2 gap-3 text-center mb-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Séances</p>
                <p className="text-2xl font-bold text-blue-600">{completedDays}/3</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Volume</p>
                <p className="text-2xl font-bold text-blue-600">{week.km}km</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center border-t border-blue-300 pt-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Allure moy.</p>
                <p className="text-lg font-bold text-blue-600">{getAvgPace() || '-'}/km</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Genou</p>
                <p className="text-lg font-bold text-blue-600">{avgKnee}/10</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB: PROGRESSION */}
      {activeTab === 'progress' && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Progression</h2>
          <p className="text-gray-600 text-center py-8">Graphique disponible après quelques séances complétées</p>
        </div>
      )}

      {/* Export */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={exportCSV}
          className="bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Download size={24} />
        </button>
      </div>

      <div className="text-center text-xs text-gray-500 mt-8">
        <p>Les données sont sauvegardées automatiquement</p>
      </div>
    </div>
  );
}
