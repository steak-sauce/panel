import { createGlobalStyle } from 'styled-components/macro';
import tw from 'twin.macro';

export const ProfessionalGlobalStyles = createGlobalStyle`
    :root {
        --primary-50: #fafbfc;
        --primary-100: #f4f6f8;
        --primary-500: #6c757d;
        --primary-600: #495057;
        --primary-700: #343a40;
        --primary-800: #212529;
    }

    body {
        ${tw`bg-gray-50 text-gray-900`};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    }

    .professional-layout {
        ${tw`min-h-screen bg-gray-50`};
    }

    .professional-nav {
        ${tw`bg-white border-r border-gray-200 shadow-sm`};
    }

    .professional-content {
        ${tw`flex-1 p-6 bg-gray-50`};
    }

    .professional-card {
        ${tw`bg-white rounded-lg shadow-sm border border-gray-200 p-6`};
    }

    .professional-button {
        ${tw`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200`};
    }

    .professional-button-secondary {
        ${tw`bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200`};
    }

    /* Override any existing dark theme styles */
    .pterodactyl-theme-dark {
        display: none !important;
    }

    /* Ensure white backgrounds for all professional elements */
    .bg-neutral-700,
    .bg-neutral-800,
    .bg-neutral-900 {
        ${tw`bg-white`};
    }

    .text-neutral-300,
    .text-neutral-400 {
        ${tw`text-gray-600`};
    }
`;
