import { TreeViewBaseItem } from "@mui/x-tree-view";

// this file stores Side bar menu configuration for my products. 
export const sideBarMenu: MenuConfig = {
    menuVersion: "1.0",
    createdBy:"testUser",
    createdDate:"2025-01-06",
    lastUpdatedTimeStamp:"2025-01-06T12:00:00Z",
    menuItems : [
        {
            id: "OVERVIEW", // this should be defined in some enum
            label: "Overview",
            discription: "This section provides an overview of products and categories",
            navUrl: "/overview/{$productId}",
            associatedPageId: "overviewPageId",
            permissionMap: {
                "WORKFLOW_STAGE_1" : {
                    "USER_PERSONA_1" : {
                        visible: true,
                        locked: true,
                        readonly: false
                    },
                    "USER_PERSONA_2" : {
                        visible: true,
                        locked: true,
                        readonly: true
                    }
                },
                "WORKFLOW_STAGE_2" : {
                    "USER_PERSONA_1" : {
                        visible: false,
                        locked: false,
                        readonly: false
                    },
                    "USER_PERSONA_2" : {
                        visible: true,
                        locked: false,
                        readonly: true
                    }
                }
            }
        },
        {
            id: "productInfo", // this should be defined in some enum
            label: "Product Information",
            discription: "This section provides information about the product",
            children: [
                {
                    id: "productInfo-technical", // this should be defined in some enum
                    label: "Technical Information",
                    discription: "This section provides technical Information of selected product",
                    navUrl: "/productInfo/technical/{$productId}",
                    associatedPageId: "productTechnicalPageId",
                    permissionMap: {
                        "WORKFLOW_STAGE_1" : {
                            "USER_PERSONA_1" : {
                                visible: true,
                                locked: false,
                                readonly: false
                            },
                            "USER_PERSONA_2" : {
                                visible: true,
                                locked: false,
                                readonly: false
                            }
                        },
                        "WORKFLOW_STAGE_2" : {
                            "USER_PERSONA_1" : {
                                visible: true,
                                locked: true,
                                readonly: true
                            },
                            "USER_PERSONA_2" : {
                                visible: true,
                                locked: true,
                                readonly: true
                            }
                        }
                    }
                },
                {
                    id: "productInfo-price", // this should be defined in some enum
                    label: "Pricing Information",
                    discription: "This section provides pricing Information of selected product",
                    navUrl: "/productInfo/pricing/{$productId}",
                    associatedPageId: "productPricingInfoPageId",
                    permissionMap: {
                        "WORKFLOW_STAGE_1" : {
                            "USER_PERSONA_1" : {
                                visible: true,
                                locked: false,
                                readonly: false
                            },
                            "USER_PERSONA_2" : {
                                visible: true,
                                locked: false,
                                readonly: false
                            }
                        },
                        "WORKFLOW_STAGE_2" : {
                            "USER_PERSONA_1" : {
                                visible: true,
                                locked: false,
                                readonly: false
                            },
                            "USER_PERSONA_2" : {
                                visible: true,
                                locked: false,
                                readonly: false
                            }
                        }
                    }
                }
            ],
            permissionMap: {
                "WORKFLOW_STAGE_1" : {
                    "USER_PERSONA_1" : {
                        visible: true,
                        locked: false,
                        readonly: false,
                        defaultExpanded:true
                    },
                    "USER_PERSONA_2" : {
                        visible: true,
                        locked: false,
                        readonly: false,
                        defaultExpanded:true
                    }
                },
                "WORKFLOW_STAGE_2" : {
                    "USER_PERSONA_1" : {
                        visible: true,
                        locked: false,
                        readonly: false,
                        defaultExpanded:false
                    },
                    "USER_PERSONA_2" : {
                        visible: true,
                        locked: false,
                        readonly: false,
                        defaultExpanded:false
                    }
                }
            }
        }
    ]
}

interface Permission {
    visible?: boolean;
    locked?: boolean;
    readonly?: boolean;
    defaultExpanded?: boolean;
}

interface WorkflowStage {
    [key: string]: Permission;
}

interface permissionMap {
    [key: string]: WorkflowStage;
}

interface MenuItems {
    id : string;
    label: string;
    discription: string;
    navUrl?: string;
    associatedPageId?: string;
    permissionMap: permissionMap;
    children?: MenuItems[];
}

interface MenuConfig {
    menuItems: MenuItems[];
    menuVersion: string,
    createdBy: string,
    createdDate: string,
    lastUpdatedTimeStamp: string,
}

export interface MenuItemsUI {
    discription: string;
    navUrl: string;
    associatedPageId?: string;
    permission: Permission;
    children?: MenuItemsUI[];
}

export const transformMenuConfig = (menuItems: MenuItems[], workflowStage: string, userPersona: string): TreeViewBaseItem<MenuItemsUI>[] => {
    const transformedMenuItems: MenuItemsUI[] = menuItems.map(menuItem => {
        const permission = menuItem.permissionMap[workflowStage][userPersona];
        return {
            id: menuItem.id,
            label: menuItem.label,
            discription: menuItem.discription,
            navUrl: menuItem.navUrl || '',
            associatedPageId: menuItem.associatedPageId,
            permission: permission,
            children: menuItem.children ? transformMenuConfig(menuItem.children, workflowStage, userPersona) : undefined
        };
    });
    return transformedMenuItems;
}

