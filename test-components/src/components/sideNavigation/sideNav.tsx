/*
    React Functional Component which will render Side navigation
    using material UI RichTreeView
*/
import Box from '@mui/material/Box';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { MenuItemsUI } from '../../configs/menuConfig/myProductMenuConfig';
import { TreeViewBaseItem } from '@mui/x-tree-view';
import React from 'react';

interface SideNavigationProps {
    menuItems: TreeViewBaseItem<MenuItemsUI>[]
}

export default function SideNavigation(props: SideNavigationProps) {
    const { menuItems } = props;

    // use callback
    const isItemDisabled = React.useCallback((item: TreeViewBaseItem<MenuItemsUI>) : boolean => {
        return !!item.permission.locked;
    }, []);

  return (
    <RichTreeView items={menuItems} isItemDisabled={isItemDisabled} />
  );
}