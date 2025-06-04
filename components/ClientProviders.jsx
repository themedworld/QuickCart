// components/ClientProviders.jsx (Client Component)
'use client';
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import { Provider } from 'react-redux';
import { store } from '@/Redux/store';

export default function ClientProviders({ children }) {
  return (
    <AppContextProvider>
      <Provider store={store}>
        {children}
        <Toaster />
      </Provider>
    </AppContextProvider>
  );
}