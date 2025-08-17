import { Suspense, lazy } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';

import ProfessionalNavigationBar from '@/components/layout/ProfessionalNavigationBar';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import Spinner from '@/components/elements/Spinner';
import SubNavigation from '@/components/elements/SubNavigation';
import routes from '@/routers/routes';
import { ProfessionalGlobalStyles } from '@/styles/ProfessionalGlobalStyles';
import { ServerContext } from '@/state/server';
import styled from 'styled-components/macro';
import tw from 'twin.macro';

const ServerRouter = lazy(() => import('@/routers/ServerRouter'));

const PageContent = styled.div`
    ${tw`flex-1 p-6 bg-gray-50 min-h-screen`};
`;

const PageContainer = styled.div`
    ${tw`max-w-7xl mx-auto`};
`;

function DashboardRouter() {
    const location = useLocation();
    
    // Add visible test indicator
    console.log('🎯 PROFESSIONAL THEME - DashboardRouter is running!');

    return (
        <>
            <ProfessionalGlobalStyles />
            {/* Temporary test indicator */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                background: 'red',
                color: 'white',
                padding: '10px',
                zIndex: 9999,
                fontSize: '12px'
            }}>
                PROFESSIONAL THEME ACTIVE
            </div>
            <ProfessionalNavigationBar>
                <PageContent>
                    <PageContainer>
                        {location.pathname.startsWith('/account') && (
                            <SubNavigation>
                                <div>
                                    {routes.account
                                        .filter(route => route.path !== undefined)
                                        .map(({ path, name, end = false }) => (
                                            <NavLink key={path} to={`/account/${path ?? ''}`.replace(/\/$/, '')} end={end}>
                                                {name}
                                            </NavLink>
                                        ))}
                                </div>
                            </SubNavigation>
                        )}

                        <Suspense fallback={<Spinner centered />}>
                            <Routes>
                                <Route path="" element={<DashboardContainer />} />

                                {/* Server routes - wrap in ServerContext */}
                                <Route path="server/:id/*" element={
                                    <ServerContext.Provider>
                                        <ServerRouter />
                                    </ServerContext.Provider>
                                } />

                                {routes.account.map(({ route, component: Component }) => (
                                    <Route key={route} path={`account/${route}`.replace(/\/$/, '')} element={<Component />} />
                                ))}

                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Suspense>
                    </PageContainer>
                </PageContent>
            </ProfessionalNavigationBar>
        </>
    );
}

export default DashboardRouter;
