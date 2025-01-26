import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import { useEffect, useState } from 'react';
import { MenuItemsUI, sideBarMenu, transformMenuConfig } from '../../configs/menuConfig/myProductMenuConfig';
import { TreeViewBaseItem } from '@mui/x-tree-view';
import SideNavigation from '../sideNavigation/sideNav';
import { Paper } from '@mui/material';
import TaskListProgress from '../dashboard/widgetComponent/taskProgressGraph';


const Product = () => {
    const [sideNavMenu, setSideNavMenu] = useState<TreeViewBaseItem<MenuItemsUI>[]>([]);

    useEffect(() => {
        // we will get thsi from API
        // API will be aware of workflow Stage and user context and user role
        setSideNavMenu(transformMenuConfig(sideBarMenu.menuItems, "WORKFLOW_STAGE_1", "USER_PERSONA_1"));
    }, []);


  return (
    <Box sx={{ 
        flexGrow: 1,
        height: '100%',
        backgroundColor: '#e7e2e2',
        color: '#000',
        }}>
      <Grid sx={{
        height:'100%'
      }} container spacing={2}>
        <Grid size={3}>
            <Paper elevation={3} sx={{height:'100%'}}>
                <SideNavigation menuItems={sideNavMenu} />
            </Paper>
        </Grid>
        <Grid size={9}>
          <TaskListProgress apiUrl='http://www.testApi.com/myTaskList' />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Product;