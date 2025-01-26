import { useState, useEffect } from 'react';
import axios from 'axios';
import StackBarChart from '../widget/stackBarChart';

// define interface
interface ChartData {
  pastDue: number;
  completed: number;
  inProgress: number;
  notStarted: number;
}
 //interface for input props
 interface TaskListProgressProps {
  apiUrl: string;
}

// mock array of ChartData
 export const mockChartData: ChartData[] = [
  {
    pastDue: 5,
    completed: 20,
    inProgress: 15,
    notStarted: 10
  }
];

// create a series based on ChartData
export const taskProgressSeries = [
    { dataKey: 'pastDue', stack: 'total', color: 'red', label:'Past Due' },
    { dataKey: 'inProgress', stack: 'total' , label:'In Progress'},
    { dataKey: 'completed', stack: 'total' , label:'Completed'},
    { dataKey: 'notStarted', stack: 'total', label:'Not Started' }
  ]


const TaskListProgress = (inputProps : TaskListProgressProps) => {
    // local state of type Array of ChartData
    const [chartData, setChartData] = useState<ChartData[] | null>(mockChartData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(inputProps.apiUrl);
        setChartData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [inputProps.apiUrl]);

  if (!chartData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Task List Progress</h2>
      <StackBarChart
        dataSet={chartData}
        series={taskProgressSeries}
        toolTipTrigger={'item'}
       />
    </div>
  );
};

export default TaskListProgress;