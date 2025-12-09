import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { TIME_ENTRY_ENDPOINTS } from '../../api/endpoints';

function TaskTimer({ taskId }) {
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [timeEntries, setTimeEntries] = useState([]);
    const [totalTime, setTotalTime] = useState(0);
    const [activeEntryId, setActiveEntryId] = useState(null);

    useEffect(() => {
        fetchTimeEntries();
    }, [taskId]);

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setElapsedSeconds((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const fetchTimeEntries = async () => {
        try {
            const res = await api.get(
                TIME_ENTRY_ENDPOINTS.GET_BY_TASK.replace(':taskId', taskId)
            );
            setTimeEntries(res.data);
            calculateTotalTime(res.data);
        } catch (error) {
            console.error('Ошибка при загрузке записей времени:', error);
        }
    };

    const calculateTotalTime = (entries) => {
        const total = entries.reduce((sum, entry) => {
            return sum + (entry.durationMinutes || 0);
        }, 0);
        setTotalTime(total);
    };

    const handleStartTimer = async () => {
        try {
            const res = await api.post(TIME_ENTRY_ENDPOINTS.CREATE, {
                taskId: parseInt(taskId),
                startTime: new Date().toISOString(),
            });
            setActiveEntryId(res.data.id);
            setIsRunning(true);
            setElapsedSeconds(0);
        } catch (error) {
            console.error('Ошибка при запуске таймера:', error);
            alert('❌ Ошибка при запуске таймера');
        }
    };

    const handleStopTimer = async () => {
        try {
            await api.post(
                TIME_ENTRY_ENDPOINTS.STOP.replace(':id', activeEntryId),
                {
                    endTime: new Date().toISOString(),
                    durationMinutes: Math.floor(elapsedSeconds / 60),
                }
            );
            setIsRunning(false);
            setActiveEntryId(null);
            setElapsedSeconds(0);
            await fetchTimeEntries();
            alert('✅ Время сохранено');
        } catch (error) {
            console.error('Ошибка при остановке таймера:', error);
            alert('❌ Ошибка при сохранении времени');
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">⏱️ Таймер</h2>

            <div className="text-center mb-6">
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                    {formatTime(elapsedSeconds)}
                </div>
                <button
                    onClick={isRunning ? handleStopTimer : handleStartTimer}
                    className={`px-6 py-3 rounded-lg text-white font-bold transition ${isRunning
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                >
                    {isRunning ? '⏸ Остановить' : '▶ Начать'}
                </button>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
                <p className="text-gray-600 dark:text-gray-400">Всего потрачено времени</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.floor(totalTime / 60)} часов {totalTime % 60} минут
                </p>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    История времени
                </h3>
                {timeEntries.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">Нет записей времени</p>
                ) : (
                    <div className="space-y-2">
                        {timeEntries.map((entry) => (
                            <div
                                key={entry.id}
                                className="flex justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded"
                            >
                                <span className="text-gray-700 dark:text-gray-300">
                                    {new Date(entry.startTime).toLocaleString('ru-RU')}
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {entry.durationMinutes} мин
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TaskTimer;