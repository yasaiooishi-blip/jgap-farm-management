import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../common/Card';
import Button from '../common/Button';

interface Task {
  id: string;
  title: string;
  fieldName: string;
  startTime: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
}

export default function TodayTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadTodayTasks();
  }, [currentUser]);

  const loadTodayTasks = async () => {
    if (!currentUser) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const q = query(
        collection(db, 'workRecords'),
        where('userId', '==', currentUser.uid),
        where('date', '>=', today.toISOString()),
        orderBy('date', 'asc'),
        limit(5)
      );

      const snapshot = await getDocs(q);
      const tasksData: Task[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.workType || '作業',
          fieldName: data.fieldName || '未指定',
          startTime: data.startTime || '未定',
          priority: data.priority || 'medium',
          status: data.status || 'pending'
        };
      });

      setTasks(tasksData);
    } catch (error) {
      console.error('タスク読み込みエラー:', error);
      // ダミーデータを表示
      setTasks([
        {
          id: '1',
          title: '水稲田の除草作業',
          fieldName: '第1圃場',
          startTime: '09:00',
          priority: 'high',
          status: 'pending'
        },
        {
          id: '2',
          title: '野菜畑の収穫',
          fieldName: '第2圃場',
          startTime: '13:00',
          priority: 'medium',
          status: 'pending'
        },
        {
          id: '3',
          title: '農薬散布',
          fieldName: '第3圃場',
          startTime: '15:00',
          priority: 'high',
          status: 'pending'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '重要';
      case 'medium':
        return '通常';
      case 'low':
        return '低';
      default:
        return '通常';
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">今日の作業予定</h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/work-records/add')}
          className="flex items-center space-x-1"
        >
          <span className="material-icons text-sm">add</span>
          <span>追加</span>
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <span className="material-icons text-gray-300 text-6xl mb-2">event_available</span>
          <p className="text-gray-500">今日の作業予定はありません</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/work-records/add')}
            className="mt-4"
          >
            作業を追加
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/work-records')}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <span className="material-icons text-sm mr-1">location_on</span>
                    <span>{task.fieldName}</span>
                    <span className="mx-2">•</span>
                    <span className="material-icons text-sm mr-1">schedule</span>
                    <span>{task.startTime}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(task.priority)}`}>
                  {getPriorityLabel(task.priority)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tasks.length > 0 && (
        <div className="mt-4 text-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/work-records')}
            className="w-full"
          >
            すべての作業記録を見る
          </Button>
        </div>
      )}
    </Card>
  );
}
