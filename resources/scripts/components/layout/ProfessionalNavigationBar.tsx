import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCog, 
    faSignOutAlt, 
    faHome, 
    faPlus, 
    faUser, 
    faBook, 
    faKey, 
    faHistory, 
    faCreditCard, 
    faCode,
    faSearch,
    faBars,
    faTimes,
    faBell,
    faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import classNames from '@/utils/classNames';

// Constants
const SIDE_NAV_WIDTH = 256;
const SIDE_NAV_COLLAPSED_WIDTH = 80;
const HEADER_HEIGHT = 64;

// Theme styles based on professional template
const LayoutBase = styled.div`
    ${tw`flex flex-auto flex-col min-h-screen`};
    
    .side-nav {
        ${tw`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30`};
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .side-nav-bg {
        ${tw`bg-white`};
    }
    
    .side-nav-expand {
        width: ${SIDE_NAV_WIDTH}px;
        min-width: ${SIDE_NAV_WIDTH}px;
    }
    
    .side-nav-collapsed {
        width: ${SIDE_NAV_COLLAPSED_WIDTH}px;
        min-width: ${SIDE_NAV_COLLAPSED_WIDTH}px;
    }
    
    .side-nav-header {
        ${tw`flex items-center justify-center border-b border-gray-200 px-4`};
        height: ${HEADER_HEIGHT}px;
    }
    
    .side-nav-content {
        ${tw`flex-1 overflow-hidden`};
    }
    
    .header {
        ${tw`bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40`};
        height: ${HEADER_HEIGHT}px;
        margin-left: ${SIDE_NAV_WIDTH}px;
        transition: margin-left 0.3s ease;
    }
    
    .header-collapsed {
        margin-left: ${SIDE_NAV_COLLAPSED_WIDTH}px;
    }
    
    .header-wrapper {
        ${tw`flex items-center justify-between px-6 h-full`};
    }
    
    .header-action {
        ${tw`flex items-center space-x-4`};
    }
    
    .header-action-start {
        ${tw`flex items-center space-x-4`};
    }
    
    .header-action-end {
        ${tw`flex items-center space-x-4`};
    }
`;

const ScrollBar = styled.div`
    ${tw`h-full overflow-y-auto overflow-x-hidden`};
    
    &::-webkit-scrollbar {
        width: 4px;
    }
    
    &::-webkit-scrollbar-track {
        ${tw`bg-gray-100`};
    }
    
    &::-webkit-scrollbar-thumb {
        ${tw`bg-gray-300 rounded-full`};
    }
    
    &::-webkit-scrollbar-thumb:hover {
        ${tw`bg-gray-400`};
    }
`;

const Logo = styled(Link)`
    ${tw`flex items-center no-underline`};
    
    .logo-text {
        ${tw`text-xl font-bold text-gray-900 ml-3`};
    }
    
    .logo-icon {
        ${tw`w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold`};
    }
`;

const SideNavToggle = styled.button`
    ${tw`p-2 rounded-lg hover:bg-gray-100 transition-colors`};
`;

const Search = styled.div`
    ${tw`relative max-w-md w-full`};
    
    .search-input {
        ${tw`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-500`};
    }
    
    .search-icon {
        ${tw`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400`};
    }
`;

const UserProfileDropdown = styled.div`
    ${tw`relative`};
    
    .user-profile-button {
        ${tw`flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer`};
    }
    
    .user-avatar {
        ${tw`w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium`};
    }
    
    .user-info {
        ${tw`flex flex-col`};
    }
    
    .user-name {
        ${tw`text-sm font-medium text-gray-900`};
    }
    
    .user-role {
        ${tw`text-xs text-gray-500`};
    }
`;

const VerticalMenuContent = styled.div`
    ${tw`p-4 space-y-6`};
    
    .menu-section {
        ${tw`space-y-2`};
    }
    
    .menu-section-title {
        ${tw`px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3`};
    }
    
    .menu-item {
        ${tw`flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 no-underline`};
        
        &.active {
            ${tw`bg-blue-50 text-blue-700`};
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .menu-icon {
            ${tw`w-5 h-5 mr-3 flex-shrink-0`};
        }
        
        .menu-text {
            ${tw`truncate`};
        }
    }
    
    .menu-item-collapsed {
        ${tw`justify-center px-3 py-3`};
        
        .menu-text {
            ${tw`hidden`};
        }
        
        .menu-icon {
            ${tw`mr-0`};
        }
    }
    
    .sign-out-button {
        ${tw`flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200 w-full text-left bg-transparent border-0 cursor-pointer mt-auto`};
        
        .menu-icon {
            ${tw`w-5 h-5 mr-3 flex-shrink-0`};
        }
    }
`;

const NotificationBell = styled.button`
    ${tw`relative p-2 rounded-lg hover:bg-gray-100 transition-colors`};
    
    .notification-badge {
        ${tw`absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full`};
    }
`;

// Helper function to generate user initials
const getUserInitials = (user: any) => {
    if (user?.username) {
        return user.username.substring(0, 2).toUpperCase();
    }
    return 'U';
};

interface NavigationProps {
    children: React.ReactNode;
}

export default function ProfessionalNavigationBar({ children }: NavigationProps) {
    const [sideNavCollapsed, setSideNavCollapsed] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const user = useStoreState((state: ApplicationStore) => state.user.data);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            localStorage.removeItem('auth_token');
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    const toggleSideNav = () => {
        setSideNavCollapsed(!sideNavCollapsed);
    };

    return (
        <LayoutBase>
            <SpinnerOverlay visible={isLoggingOut} />
            
            {/* Side Navigation */}
            <div className={classNames(
                'side-nav side-nav-bg',
                sideNavCollapsed ? 'side-nav-collapsed' : 'side-nav-expand'
            )}>
                {/* Logo */}
                <div className="side-nav-header">
                    <Logo to="/">
                        <div className="logo-icon">
                            {sideNavCollapsed ? 'P' : <FontAwesomeIcon icon={faHome} />}
                        </div>
                        {!sideNavCollapsed && <div className="logo-text">{name}</div>}
                    </Logo>
                </div>
                
                {/* Navigation Content */}
                <div className="side-nav-content">
                    <ScrollBar>
                        <VerticalMenuContent>
                            {/* MAIN Section */}
                            <div className="menu-section">
                                {!sideNavCollapsed && <div className="menu-section-title">MAIN</div>}
                                <NavLink 
                                    to="/" 
                                    exact 
                                    className={classNames(
                                        'menu-item',
                                        sideNavCollapsed && 'menu-item-collapsed'
                                    )}
                                >
                                    <FontAwesomeIcon icon={faHome} className="menu-icon" />
                                    <span className="menu-text">Dashboard</span>
                                </NavLink>
                                <NavLink 
                                    to="/account/billing/create" 
                                    className={classNames(
                                        'menu-item',
                                        sideNavCollapsed && 'menu-item-collapsed'
                                    )}
                                >
                                    <FontAwesomeIcon icon={faPlus} className="menu-icon" />
                                    <span className="menu-text">Create New</span>
                                </NavLink>
                            </div>

                            {/* SERVICES Section */}
                            <div className="menu-section">
                                {!sideNavCollapsed && <div className="menu-section-title">SERVICES</div>}
                                <NavLink 
                                    to="/account" 
                                    exact 
                                    className={classNames(
                                        'menu-item',
                                        sideNavCollapsed && 'menu-item-collapsed'
                                    )}
                                >
                                    <FontAwesomeIcon icon={faUser} className="menu-icon" />
                                    <span className="menu-text">Account</span>
                                </NavLink>
                                <NavLink 
                                    to="/account/ssh" 
                                    className={classNames(
                                        'menu-item',
                                        sideNavCollapsed && 'menu-item-collapsed'
                                    )}
                                >
                                    <FontAwesomeIcon icon={faKey} className="menu-icon" />
                                    <span className="menu-text">SSH Keys</span>
                                </NavLink>
                                <NavLink 
                                    to="/account/activity" 
                                    className={classNames(
                                        'menu-item',
                                        sideNavCollapsed && 'menu-item-collapsed'
                                    )}
                                >
                                    <FontAwesomeIcon icon={faHistory} className="menu-icon" />
                                    <span className="menu-text">Activity</span>
                                </NavLink>
                                <NavLink 
                                    to="/account/billing" 
                                    className={classNames(
                                        'menu-item',
                                        sideNavCollapsed && 'menu-item-collapsed'
                                    )}
                                >
                                    <FontAwesomeIcon icon={faCreditCard} className="menu-icon" />
                                    <span className="menu-text">Billing</span>
                                </NavLink>
                            </div>

                            {/* API Section */}
                            <div className="menu-section">
                                {!sideNavCollapsed && <div className="menu-section-title">API</div>}
                                <NavLink 
                                    to="/account/api" 
                                    className={classNames(
                                        'menu-item',
                                        sideNavCollapsed && 'menu-item-collapsed'
                                    )}
                                >
                                    <FontAwesomeIcon icon={faCode} className="menu-icon" />
                                    <span className="menu-text">API Credentials</span>
                                </NavLink>
                                <NavLink 
                                    to="/account/api" 
                                    exact 
                                    className={classNames(
                                        'menu-item',
                                        sideNavCollapsed && 'menu-item-collapsed'
                                    )}
                                >
                                    <FontAwesomeIcon icon={faBook} className="menu-icon" />
                                    <span className="menu-text">API Reference</span>
                                </NavLink>
                            </div>

                            {/* Sign Out */}
                            <div className="menu-section mt-auto">
                                <button
                                    onClick={onTriggerLogout}
                                    className={classNames(
                                        'sign-out-button',
                                        sideNavCollapsed && 'menu-item-collapsed'
                                    )}
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} className="menu-icon" />
                                    <span className="menu-text">Sign Out</span>
                                </button>
                            </div>
                        </VerticalMenuContent>
                    </ScrollBar>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={classNames(
                'header',
                sideNavCollapsed && 'header-collapsed'
            )}>
                <div className="header-wrapper">
                    <div className="header-action-start">
                        <SideNavToggle onClick={toggleSideNav}>
                            <FontAwesomeIcon icon={sideNavCollapsed ? faBars : faTimes} />
                        </SideNavToggle>
                        
                        <Search>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="search-input"
                            />
                            <div className="search-icon">
                                <FontAwesomeIcon icon={faSearch} />
                            </div>
                        </Search>
                    </div>
                    
                    <div className="header-action-end">
                        <NotificationBell>
                            <FontAwesomeIcon icon={faBell} />
                            {/* <div className="notification-badge"></div> */}
                        </NotificationBell>
                        
                        {rootAdmin && (
                            <a href="/admin" rel="noreferrer" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <FontAwesomeIcon icon={faCog} />
                            </a>
                        )}
                        
                        <UserProfileDropdown>
                            <div className="user-profile-button">
                                <div className="user-avatar">
                                    {getUserInitials(user)}
                                </div>
                                <div className="user-info">
                                    <div className="user-name">{user?.username || 'User'}</div>
                                    <div className="user-role">{user?.email || ''}</div>
                                </div>
                                <FontAwesomeIcon icon={faChevronDown} className="text-gray-400" />
                            </div>
                        </UserProfileDropdown>
                    </div>
                </div>
            </div>

            {/* Page Content */}
            <div 
                className="flex flex-col flex-auto min-h-screen transition-all duration-300"
                style={{ 
                    marginLeft: sideNavCollapsed ? SIDE_NAV_COLLAPSED_WIDTH : SIDE_NAV_WIDTH,
                    paddingTop: 0
                }}
            >
                <div className="h-full flex flex-auto flex-col bg-gray-50">
                    {children}
                </div>
            </div>
        </LayoutBase>
    );
}
