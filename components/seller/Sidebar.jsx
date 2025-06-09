import React from 'react';
import Link from 'next/link';
import { assets } from '../../assets/assets';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ProtectedRoute from "@/components/ProtectedPage";

const SideBar = () => {
    const pathname = usePathname()
    const menuItems = [
        { name: 'Add Product', path: '/seller', icon: assets.add_icon },
        { name: 'Product List', path: '/seller/product-list', icon: assets.product_list_icon },
        { name: 'Orders', path: '/seller/orders', icon: assets.order_icon },
        { name: 'Profit', path: '/seller/profits', icon: assets.order_icon },
    ];

    return (
        <ProtectedRoute allowedRoles={['shop_manager']}>
            {/* Desktop Sidebar */}
            <div className='md:w-64 w-16 border-r min-h-screen text-base border-gray-200 dark:border-gray-700 py-2 flex flex-col bg-white dark:bg-gray-800 transition-all duration-200 ease-in-out'>
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;

                    return (
                        <Link href={item.path} key={item.name} passHref>
                            <div
                                className={`group flex items-center py-3 px-2 md:px-4 gap-3 transition-colors duration-150 ease-in-out rounded-r-lg mx-2
                                ${isActive
                                        ? "border-r-4 md:border-r-[6px] bg-orange-100/20 dark:bg-orange-900/30 border-orange-500 text-orange-600 dark:text-orange-400"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent"
                                    }`}
                            >
                                <div className={`p-1 rounded-lg ${isActive ? 'bg-orange-500/10 dark:bg-orange-500/20' : ''}`}>
                                    <Image
                                        src={item.icon}
                                        alt={`${item.name.toLowerCase()}_icon`}
                                        className="w-6 h-6 min-w-6 mx-auto"
                                        width={24}
                                        height={24}
                                    />
                                </div>
                                <p className='md:block hidden text-sm font-medium whitespace-nowrap'>
                                    {item.name}
                                </p>
                                {/* Tooltip for mobile */}
                                <span className="md:hidden absolute left-20 ml-2 px-2 py-1 bg-orange-500 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                    {item.name}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Mobile Bottom Navigation - Modern Orange Theme */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around py-2 px-1 shadow-lg">
                {menuItems.slice(0, 4).map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link href={item.path} key={`mobile-${item.name}`} passHref>
                            <div className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${isActive ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-300 hover:text-orange-500'}`}>
                                <div className={`p-2 rounded-full ${isActive ? 'bg-orange-500/10' : ''}`}>
                                    <Image
                                        src={item.icon}
                                        alt={item.name}
                                        className="w-5 h-5"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                                <span className="text-xs mt-1 font-medium">{item.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </ProtectedRoute>
    );
};

export default SideBar;
