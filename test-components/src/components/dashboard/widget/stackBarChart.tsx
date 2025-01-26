import { BarChart } from '@mui/x-charts/BarChart';
import { DatasetType } from '@mui/x-charts/internals';

  // Define Input interface which defines dataSet and series
  interface inputProps {
    dataSet: DatasetType,
    series: Array<{ dataKey: string; stack: string; color?: string; label: string }>,
    toolTipTrigger:  'item' | 'axis'
  }



const StackBarChart = (props: inputProps) => {
  const {dataSet, series, toolTipTrigger } = props;
  return (
    <div>
        <BarChart
            dataset={dataSet}
            series={series}
            height={150}
            slotProps={{ legend: { hidden: true } }}
            layout="horizontal"
            leftAxis={null}
            bottomAxis={null}
            tooltip={{ trigger: toolTipTrigger }}
        />
    </div>
  );
};

export default StackBarChart;